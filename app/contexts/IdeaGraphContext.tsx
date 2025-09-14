'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { IdeaNode, IdeaGraphState, GenerateIdeasRequest } from '../types/idea';
import { ideaGenerationService } from '../services/ideaGeneration';

interface IdeaGraphContextType {
  state: IdeaGraphState;
  generateIdeas: (request: Omit<GenerateIdeasRequest, 'parentNode'> & { 
    parentNodeId?: string; 
    createPromptNode?: boolean;
    position?: { x: number; y: number };
  }) => Promise<void>;
  createEmptyNote: () => void;
  createPromptToolNode: () => void;
  removeNode: (nodeId: string) => void;
  updateNodeContent: (nodeId: string, content: string) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
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
              // Only add child ID if it doesn't already exist
              if (!parent.childIds.includes(idea.id)) {
                parent.childIds = [...parent.childIds, idea.id];
                newNodes.set(parent.id, parent);
              }
            }
          }
        });

        return {
          ...prevState,
          nodes: newNodes,
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

  // Deterministic positioning for manual notes to ensure consistency across collaborators
  const getNextManualNotePosition = useCallback((existingNodes: Map<string, IdeaNode>) => {
    // Count existing manual notes to determine position index
    const manualNotes = Array.from(existingNodes.values())
      .filter(node => node.metadata?.isManualNote)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()); // Sort by creation time for consistency

    const noteIndex = manualNotes.length;
    
    // Define a simple grid pattern for manual notes - more predictable
    const gridCols = 3;
    const cellWidth = 400;
    const cellHeight = 250;
    const startX = 200;
    const startY = 200;
    
    // Calculate position based on index
    const col = noteIndex % gridCols;
    const row = Math.floor(noteIndex / gridCols);
    
    const x = startX + (col * cellWidth);
    const y = startY + (row * cellHeight);
    
    return { x, y };
  }, []);

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

  const generateIdeas = useCallback(async (request: Omit<GenerateIdeasRequest, 'parentNode'> & { 
    parentNodeId?: string;
    createPromptNode?: boolean;
    position?: { x: number; y: number };
  }) => {
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
            // Only add child ID if it doesn't already exist
            if (!parent.childIds.includes(node.id)) {
              parent.childIds = [...parent.childIds, node.id];
              newNodes.set(parent.id, parent);
            }
          }
        }
      });

      // Don't recalculate positions if we're using custom positioning
      const finalNodes = request.position ? newNodes : calculateNodePositions(newNodes, newRootNodes);

      return {
        ...prevState,
        nodes: finalNodes,
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

          // Add real nodes with positioning
          response.ideas.forEach((idea) => {
            // If position is provided and this is a prompt node, use the provided position
            if (request.position && idea.metadata?.isPrompt) {
              idea.position = request.position;
            } else if (request.position && idea.parentId) {
              // Position child nodes relative to the parent position
              const parentNode = response.ideas.find(n => n.id === idea.parentId) || newNodes.get(idea.parentId);
              if (parentNode) {
                const childIndex = response.ideas.filter(n => n.parentId === idea.parentId).indexOf(idea);
                const childCount = response.ideas.filter(n => n.parentId === idea.parentId).length;
                const spacing = 300;
                const startX = (request.position.x || 0) - ((childCount - 1) * spacing / 2);
                idea.position = {
                  x: startX + (childIndex * spacing),
                  y: (request.position.y || 0) + 200
                };
              }
            }
            
            newNodes.set(idea.id, idea);

            if (!idea.parentId) {
              newRootNodes.push(idea.id);
            } else {
              const parent = newNodes.get(idea.parentId);
              if (parent) {
                // Only add child ID if it doesn't already exist
                if (!parent.childIds.includes(idea.id)) {
                  parent.childIds = [...parent.childIds, idea.id];
                  newNodes.set(parent.id, parent);
                }
              }
            }
          });

          // Only recalculate positions if no position was provided
          const positionedNodes = request.position ? newNodes : calculateNodePositions(newNodes, newRootNodes);

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

        // Don't recalculate positions on error
        return {
          ...prevState,
          nodes: newNodes,
          rootNodes: newRootNodes,
        };
      });
    } finally {
      setIsLoading(false);
    }
  }, [state.nodes, calculateNodePositions, socket, userId]);

  const createEmptyNote = useCallback(() => {
    console.log('[IdeaGraphContext] createEmptyNote called');
    
    // Generate unique ID for the new note
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Find the next position in the deterministic grid
    const position = getNextManualNotePosition(state.nodes);
    
    // Create the empty note node
    const emptyNote: IdeaNode = {
      id: noteId,
      content: '', // Empty content for manual editing
      parentId: undefined, // Manual notes are root-level
      childIds: [],
      metadata: {
        generatedBy: 'user',
        isManualNote: true,
        createdAt: new Date().toISOString(),
      },
      createdBy: userId || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      position: position,
    };

    // Add the note to the state
    setState(prevState => {
      const newNodes = new Map(prevState.nodes);
      const newRootNodes = [...prevState.rootNodes];

      newNodes.set(emptyNote.id, emptyNote);
      newRootNodes.push(emptyNote.id);

      return {
        ...prevState,
        nodes: newNodes,
        rootNodes: newRootNodes,
        selectedNodeId: emptyNote.id, // Auto-select the new note
      };
    });

    // Sync with other users
    if (socket && userId) {
      console.log('[IdeaGraphContext] Emitting sync-ideas for new manual note');
      socket.emit('sync-ideas', {
        userId,
        ideas: [emptyNote],
        parentNodeId: null
      });
    }
  }, [state.nodes, getNextManualNotePosition, socket, userId]);

  const createPromptToolNode = useCallback(() => {
    console.log('[IdeaGraphContext] createPromptToolNode called');
    
    // Generate unique ID for the new prompt tool node
    const toolId = `prompt-tool-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Find the next position in the deterministic grid
    const position = getNextManualNotePosition(state.nodes);
    
    // Create the prompt tool node
    const promptToolNode: IdeaNode = {
      id: toolId,
      content: '', // Empty content for prompt tool
      parentId: undefined, // Prompt tools are root-level
      childIds: [],
      metadata: {
        generatedBy: 'user',
        isPromptTool: true,
        createdAt: new Date().toISOString(),
      },
      createdBy: userId || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      position: position,
    };

    // Add the node to the state
    setState(prevState => {
      const newNodes = new Map(prevState.nodes);
      const newRootNodes = [...prevState.rootNodes];

      newNodes.set(promptToolNode.id, promptToolNode);
      newRootNodes.push(promptToolNode.id);

      return {
        ...prevState,
        nodes: newNodes,
        rootNodes: newRootNodes,
        selectedNodeId: promptToolNode.id, // Auto-select the new prompt tool
      };
    });

    // Sync with other users
    if (socket && userId) {
      console.log('[IdeaGraphContext] Emitting sync-ideas for new prompt tool node');
      socket.emit('sync-ideas', {
        userId,
        ideas: [promptToolNode],
        parentNodeId: null
      });
    }
  }, [state.nodes, getNextManualNotePosition, socket, userId]);

  const removeNode = useCallback((nodeId: string) => {
    console.log('[IdeaGraphContext] removeNode called for node:', nodeId);
    
    setState(prevState => {
      const newNodes = new Map(prevState.nodes);
      const newRootNodes = [...prevState.rootNodes];
      
      // Remove the node
      newNodes.delete(nodeId);
      
      // Remove from root nodes if present
      const rootIndex = newRootNodes.indexOf(nodeId);
      if (rootIndex > -1) {
        newRootNodes.splice(rootIndex, 1);
      }
      
      // Remove from any parent's childIds
      newNodes.forEach(node => {
        if (node.childIds.includes(nodeId)) {
          node.childIds = node.childIds.filter(id => id !== nodeId);
        }
      });
      
      return {
        ...prevState,
        nodes: newNodes,
        rootNodes: newRootNodes,
        selectedNodeId: prevState.selectedNodeId === nodeId ? undefined : prevState.selectedNodeId,
      };
    });
  }, []);

  const updateNodeContent = useCallback((nodeId: string, content: string) => {
    console.log('[IdeaGraphContext] updateNodeContent called for node:', nodeId, 'content:', content);
    
    setState(prevState => {
      const newNodes = new Map(prevState.nodes);
      const node = newNodes.get(nodeId);
      
      if (node) {
        const updatedNode = {
          ...node,
          content,
          updatedAt: new Date(),
        };
        newNodes.set(nodeId, updatedNode);

        // Sync with other users
        if (socket && userId) {
          console.log('[IdeaGraphContext] Emitting sync-ideas for updated content');
          socket.emit('sync-ideas', {
            userId,
            ideas: [updatedNode],
            parentNodeId: updatedNode.parentId || null
          });
        }

        return {
          ...prevState,
          nodes: newNodes,
        };
      }
      
      return prevState;
    });
  }, [socket, userId]);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setState(prevState => {
      const newNodes = new Map(prevState.nodes);
      const node = newNodes.get(nodeId);
      
      if (node) {
        const updatedNode = {
          ...node,
          position,
          updatedAt: new Date(),
        };
        newNodes.set(nodeId, updatedNode);

        return {
          ...prevState,
          nodes: newNodes,
        };
      }
      
      return prevState;
    });
  }, []);

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
      createEmptyNote,
      createPromptToolNode,
      removeNode,
      updateNodeContent,
      updateNodePosition,
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