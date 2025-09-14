'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { IdeaNode, IdeaGraphState, GenerateIdeasRequest } from '../types/idea';
import { ideaGenerationService } from '../services/ideaGeneration';

interface IdeaGraphContextType {
  state: IdeaGraphState;
  generateIdeas: (request: Omit<GenerateIdeasRequest, 'parentNode'> & { parentNodeId?: string }) => Promise<void>;
  selectNode: (nodeId: string | undefined) => void;
  clearGraph: () => void;
  isLoading: boolean;
  error: string | null;
  setSocket: (socket: Socket | null) => void;
  setUserId: (userId: string) => void;
}

const IdeaGraphContext = createContext<IdeaGraphContextType | undefined>(undefined);

export function IdeaGraphProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [state, setState] = useState<IdeaGraphState>({
    nodes: new Map(),
    rootNodes: [],
    selectedNodeId: undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userId, setUserId] = useState<string>('');

  // Set up socket event listeners for idea synchronization
  useEffect(() => {
    if (!socket) return;

    const handleSyncIdeas = (data: { userId: string; ideas: any[]; parentNodeId?: string }) => {
      console.log('[IdeaGraphContext] Received sync-ideas from user:', data.userId, 'ideas:', data.ideas.length);
      console.log('[IdeaGraphContext] Received ideas:', data.ideas.map(idea => ({ id: idea.id, content: idea.content.substring(0, 50) })));
      
      // Update local state with received ideas
      setState(prevState => {
        const newNodes = new Map(prevState.nodes);
        const newRootNodes = [...prevState.rootNodes];

        // Add received ideas to local state
        data.ideas.forEach(idea => {
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
    };

    const handleSyncGraphState = (data: { userId: string; graphState: any }) => {
      console.log('IdeaGraphContext: Received sync-graph-state from user:', data.userId);
      // Graph state sync handler - currently not implemented as we sync individual ideas instead
    };

    socket.on('sync-ideas', handleSyncIdeas);
    socket.on('sync-graph-state', handleSyncGraphState);

    return () => {
      socket.off('sync-ideas', handleSyncIdeas);
      socket.off('sync-graph-state', handleSyncGraphState);
    };
  }, [socket]);

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
    console.log('[IdeaGraphContext] generateIdeas called with request:', request);
    console.log('[IdeaGraphContext] Current socket:', !!socket, 'userId:', userId);
    setIsLoading(true);
    setError(null);

    const parentNode = request.parentNodeId ? state.nodes.get(request.parentNodeId) : undefined;

    // Create placeholder nodes immediately
    const placeholderNodes: IdeaNode[] = [];
    const placeholderIds: string[] = [];

    for (let i = 0; i < request.count; i++) {
      const placeholderId = `placeholder-${Date.now()}-${i}`;
      placeholderIds.push(placeholderId);

      const placeholderNode: IdeaNode = {
        id: placeholderId,
        content: '', // Empty content for loading state
        parentId: parentNode?.id,
        childIds: [],
        metadata: {
          isLoading: true,
          generatedBy: 'ai',
          modelProvider: request.modelConfig?.provider,
          modelName: request.modelConfig?.model,
          modelLabel: request.modelConfig?.modelLabel,
        },
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      placeholderNodes.push(placeholderNode);
    }

    // Add placeholder nodes to state immediately
    setState(prevState => {
      const newNodes = new Map(prevState.nodes);
      const newRootNodes = [...prevState.rootNodes];

      placeholderNodes.forEach(node => {
        newNodes.set(node.id, node);

        if (!node.parentId) {
          newRootNodes.push(node.id);
        } else {
          const parent = newNodes.get(node.parentId);
          if (parent) {
            parent.childIds = [...parent.childIds, node.id];
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

    try {
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

          // Remove placeholder nodes
          placeholderIds.forEach(placeholderId => {
            newNodes.delete(placeholderId);
            const rootIndex = newRootNodes.indexOf(placeholderId);
            if (rootIndex > -1) {
              newRootNodes.splice(rootIndex, 1);
            }

            // Remove from parent's childIds
            if (parentNode) {
              const parent = newNodes.get(parentNode.id);
              if (parent) {
                parent.childIds = parent.childIds.filter(id => id !== placeholderId);
                newNodes.set(parent.id, parent);
              }
            }
          });

          // Add real nodes
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

        // Emit sync event to other users after successfully adding ideas
        console.log('[IdeaGraphContext] About to emit sync-ideas. Socket exists:', !!socket, 'UserId exists:', !!userId);
        if (socket && userId) {
          console.log('[IdeaGraphContext] Emitting sync-ideas for', response.ideas.length, 'ideas to other users');
          console.log('[IdeaGraphContext] Ideas being synced:', response.ideas.map(idea => ({ id: idea.id, content: idea.content.substring(0, 50) })));
          socket.emit('sync-ideas', { 
            userId, 
            ideas: response.ideas,
            parentNodeId: parentNode?.id || null 
          });
          console.log('[IdeaGraphContext] sync-ideas event emitted successfully');
        } else {
          console.warn('[IdeaGraphContext] Cannot emit sync-ideas - socket:', !!socket, 'userId:', !!userId);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate ideas';
      setError(errorMessage);
      console.error('Error in generateIdeas:', err);

      // Remove placeholder nodes on error
      setState(prevState => {
        const newNodes = new Map(prevState.nodes);
        const newRootNodes = [...prevState.rootNodes];

        placeholderIds.forEach(placeholderId => {
          newNodes.delete(placeholderId);
          const rootIndex = newRootNodes.indexOf(placeholderId);
          if (rootIndex > -1) {
            newRootNodes.splice(rootIndex, 1);
          }

          // Remove from parent's childIds
          if (parentNode) {
            const parent = newNodes.get(parentNode.id);
            if (parent) {
              parent.childIds = parent.childIds.filter(id => id !== placeholderId);
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
    } finally {
      setIsLoading(false);
    }
  }, [state.nodes, calculateNodePositions, socket, userId]);

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
      setSocket,
      setUserId,
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