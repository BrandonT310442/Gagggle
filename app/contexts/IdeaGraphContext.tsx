'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { IdeaNode, IdeaGraphState, GenerateIdeasRequest } from '../types/idea';
import { ideaGenerationService } from '../services/ideaGeneration';

interface IdeaGraphContextType {
  state: IdeaGraphState;
  generateIdeas: (request: Omit<GenerateIdeasRequest, 'parentNode'> & { parentNodeId?: string }) => Promise<void>;
  selectNode: (nodeId: string | undefined) => void;
  clearGraph: () => void;
  isLoading: boolean;
  error: string | null;
}

const IdeaGraphContext = createContext<IdeaGraphContextType | undefined>(undefined);

export function IdeaGraphProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<IdeaGraphState>({
    nodes: new Map(),
    rootNodes: [],
    selectedNodeId: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateNodePositions = useCallback((nodes: Map<string, IdeaNode>, rootNodes: string[]) => {
    const updatedNodes = new Map(nodes);
    const levelWidth = 300;
    const levelHeight = 150;
    const nodeSpacing = 120;

    const positionSubtree = (nodeId: string, x: number, y: number, visitedNodes = new Set<string>()): number => {
      if (visitedNodes.has(nodeId)) return 0;
      visitedNodes.add(nodeId);

      const node = updatedNodes.get(nodeId);
      if (!node) return 0;

      node.position = { x, y };
      updatedNodes.set(nodeId, node);

      const children = node.childIds.filter(id => !visitedNodes.has(id));
      if (children.length === 0) return 1;

      let totalWidth = 0;
      const childY = y + levelHeight;

      children.forEach((childId, index) => {
        const childX = x + (index * nodeSpacing) - ((children.length - 1) * nodeSpacing) / 2;
        const childWidth = positionSubtree(childId, childX, childY, visitedNodes);
        totalWidth += childWidth;
      });

      return Math.max(1, totalWidth);
    };

    rootNodes.forEach((rootId, index) => {
      const x = index * levelWidth;
      positionSubtree(rootId, x, 0);
    });

    return updatedNodes;
  }, []);

  const generateIdeas = useCallback(async (request: Omit<GenerateIdeasRequest, 'parentNode'> & { parentNodeId?: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const parentNode = request.parentNodeId ? state.nodes.get(request.parentNodeId) : undefined;
      
      const apiRequest: GenerateIdeasRequest = {
        prompt: request.prompt,
        count: request.count,
        modelConfig: request.modelConfig,
        createPromptNode: !parentNode,
        ...(parentNode && {
          parentNode: {
            id: parentNode.id,
            content: parentNode.content,
          },
        }),
      };

      const response = await ideaGenerationService.generateIdeas(apiRequest);

      if (response.success && response.ideas.length > 0) {
        setState(prevState => {
          const newNodes = new Map(prevState.nodes);
          const newRootNodes = [...prevState.rootNodes];

          response.ideas.forEach(idea => {
            newNodes.set(idea.id, idea);
            
            if (!idea.parentId) {
              newRootNodes.push(idea.id);
            } else {
              const parent = newNodes.get(idea.parentId);
              if (parent) {
                parent.childIds = [...parent.childIds, idea.id];
                newNodes.set(parent.id, parent);
              }
            }
          });

          const positionedNodes = calculateNodePositions(newNodes, newRootNodes);

          return {
            ...prevState,
            nodes: positionedNodes,
            rootNodes: newRootNodes,
          };
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate ideas';
      setError(errorMessage);
      console.error('Error in generateIdeas:', err);
    } finally {
      setIsLoading(false);
    }
  }, [state.nodes, calculateNodePositions]);

  const selectNode = useCallback((nodeId: string | undefined) => {
    setState(prev => ({
      ...prev,
      selectedNodeId: nodeId,
    }));
  }, []);

  const clearGraph = useCallback(() => {
    setState({
      nodes: new Map(),
      rootNodes: [],
      selectedNodeId: undefined,
    });
    setError(null);
  }, []);

  return (
    <IdeaGraphContext.Provider value={{
      state,
      generateIdeas,
      selectNode,
      clearGraph,
      isLoading,
      error,
    }}>
      {children}
    </IdeaGraphContext.Provider>
  );
}

export function useIdeaGraph() {
  const context = useContext(IdeaGraphContext);
  if (!context) {
    throw new Error('useIdeaGraph must be used within an IdeaGraphProvider');
  }
  return context;
}