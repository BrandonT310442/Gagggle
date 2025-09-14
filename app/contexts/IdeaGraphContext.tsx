'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Socket } from 'socket.io-client';
import { IdeaNode, IdeaGraphState, GenerateIdeasRequest } from '../types/idea';
import { ideaGenerationService } from '../services/ideaGeneration';
import { mergeNodes } from '../services/api';

interface IdeaGraphContextType {
  state: IdeaGraphState;
  generateIdeas: (request: Omit<GenerateIdeasRequest, 'parentNode'> & { 
    parentNodeId?: string; 
    createPromptNode?: boolean;
    position?: { x: number; y: number };
  }) => Promise<void>;
  createEmptyNote: () => void;
  createComment: () => void;
  createPromptToolNode: () => void;
  createChildNote: (parentNodeId: string) => void;
  createChildPrompt: (parentNodeId: string) => void;
  addPromptNode: (promptNode: IdeaNode) => Promise<void>;
  removeNode: (nodeId: string) => void;
  updateNodeContent: (nodeId: string, content: string) => void;
  updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
  selectNode: (nodeId: string | undefined) => void;
  clearGraph: () => void;
  toggleMergeMode: () => void;
  toggleNodeSelection: (nodeId: string) => void;
  clearMergeSelection: () => void;
  mergeSelectedNodes: (mergePrompt?: string) => Promise<void>;
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
    isMergeMode: false,
    selectedNodeIds: new Set(),
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
            // Only add to root nodes if it doesn't already exist
            if (!newRootNodes.includes(idea.id)) {
              newRootNodes.push(idea.id);
            }
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

    const handleRemoveNode = (data: { userId: string; nodeId: string }) => {
      console.log('[IdeaGraphContext] Received remove-node from user:', data.userId, 'nodeId:', data.nodeId);
      
      // Don't process our own removal events
      if (data.userId === userId) return;
      
      setState(prevState => {
        const newNodes = new Map(prevState.nodes);
        const newRootNodes = [...prevState.rootNodes];
        
        // Remove the node
        newNodes.delete(data.nodeId);
        
        // Remove from root nodes if present
        const rootIndex = newRootNodes.indexOf(data.nodeId);
        if (rootIndex > -1) {
          newRootNodes.splice(rootIndex, 1);
        }
        
        // Remove from any parent's childIds
        newNodes.forEach(node => {
          if (node.childIds.includes(data.nodeId)) {
            node.childIds = node.childIds.filter(id => id !== data.nodeId);
          }
        });
        
        return {
          ...prevState,
          nodes: newNodes,
          rootNodes: newRootNodes,
          selectedNodeId: prevState.selectedNodeId === data.nodeId ? undefined : prevState.selectedNodeId,
        };
      });
    };

    socket.on('sync-ideas', handleSyncIdeas);
    socket.on('sync-graph-state', handleSyncGraphState);
    socket.on('remove-node', handleRemoveNode);

    return () => {
      socket.off('sync-ideas', handleSyncIdeas);
      socket.off('sync-graph-state', handleSyncGraphState);
      socket.off('remove-node', handleRemoveNode);
    };
  }, [socket]);

  // Deterministic positioning for manual notes to ensure consistency across collaborators
  const getNextManualNotePosition = useCallback((existingNodes: Map<string, IdeaNode>) => {
    // Count existing manual notes to determine position index
    const manualNotes = Array.from(existingNodes.values())
      .filter(node => node.metadata?.isManualNote)
      .sort((a, b) => {
        // Safe date comparison - handle both Date objects and strings
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return dateA - dateB;
      }); // Sort by creation time for consistency

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

  // Deterministic positioning for comments to ensure consistency across collaborators
  const getNextCommentPosition = useCallback((existingNodes: Map<string, IdeaNode>) => {
    // Count existing comments to determine position index
    const comments = Array.from(existingNodes.values())
      .filter(node => node.metadata?.isComment)
      .sort((a, b) => {
        // Safe date comparison - handle both Date objects and strings
        const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return dateA - dateB;
      }); // Sort by creation time for consistency

    const commentIndex = comments.length;
    
    // Define a simple grid pattern for comments - separate from manual notes
    const gridCols = 4;
    const cellWidth = 350;
    const cellHeight = 200;
    const startX = 100;
    const startY = 500; // Position comments below manual notes
    
    // Calculate position based on index
    const col = commentIndex % gridCols;
    const row = Math.floor(commentIndex / gridCols);
    
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
    displayPrompt?: string;
  }) => {
    console.log('[IdeaGraphContext] generateIdeas called with request:', request);
    console.log('[IdeaGraphContext] Current socket:', !!socket, 'userId:', userId);
    setIsLoading(true);
    setError(null);

    const parentNode = request.parentNodeId ? state.nodes.get(request.parentNodeId) : undefined;

    // Create placeholder nodes immediately
    const placeholderNodes: IdeaNode[] = [];
    const placeholderIds: string[] = [];

    // Store prompt placeholder ID for reference
    let promptPlaceholderId: string | undefined;
    
    // If creating a prompt node, add a placeholder for it too
    if (request.createPromptNode && request.position) {
      promptPlaceholderId = `placeholder-prompt-${Date.now()}`;
      placeholderIds.push(promptPlaceholderId);
      
      const promptPlaceholder: IdeaNode = {
        id: promptPlaceholderId,
        content: request.displayPrompt || request.prompt, // Use displayPrompt if available (clean prompt without context)
        parentId: request.parentNodeId || undefined, // Set parent ID if provided
        childIds: [],
        metadata: {
          isPrompt: true,
          isLoading: true,
          generatedBy: 'ai',
          modelProvider: request.modelConfig?.provider,
          modelName: request.modelConfig?.model,
          modelLabel: request.modelConfig?.modelLabel,
        },
        createdBy: 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        position: request.position,
      };
      
      placeholderNodes.push(promptPlaceholder);
    }

    // Determine parent ID for idea placeholders
    const ideaParentId = promptPlaceholderId || parentNode?.id;

    for (let i = 0; i < request.count; i++) {
      const placeholderId = `placeholder-${Date.now()}-${i}`;
      placeholderIds.push(placeholderId);

      // Calculate position for placeholder based on request position
      let placeholderPosition;
      if (request.position) {
        const spacing = 500; // Node width is 448px, add 52px gap between nodes
        const startX = request.position.x - ((request.count - 1) * spacing / 2);
        placeholderPosition = {
          x: startX + (i * spacing),
          y: request.position.y + 250 // Position below the prompt node with more gap
        };
      }

      const placeholderNode: IdeaNode = {
        id: placeholderId,
        content: '', // Empty content for loading state
        parentId: ideaParentId,
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
        position: placeholderPosition, // Add position if available
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
        displayPrompt: request.displayPrompt, // Pass displayPrompt if provided
        count: request.count,
        modelConfig: request.modelConfig,
        // Use explicit createPromptNode if provided, otherwise check if we have a parent
        createPromptNode: request.createPromptNode !== undefined ? request.createPromptNode : !parentNode,
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
          // First, separate prompt nodes from idea nodes
          const promptNode = response.ideas.find(idea => idea.metadata?.isPrompt);
          const ideaNodes = response.ideas.filter(idea => !idea.metadata?.isPrompt);
          
          // Position the prompt node if it exists
          if (promptNode && request.position) {
            promptNode.position = request.position;
            // Ensure prompt node has correct parent ID if provided
            if (request.parentNodeId) {
              promptNode.parentId = request.parentNodeId;
            }
            newNodes.set(promptNode.id, promptNode);
            
            // If prompt has a parent, update parent's childIds
            if (promptNode.parentId) {
              const parent = newNodes.get(promptNode.parentId);
              if (parent && !parent.childIds.includes(promptNode.id)) {
                parent.childIds = [...parent.childIds, promptNode.id];
                newNodes.set(parent.id, parent);
              }
            }
          }
          
          // Position child idea nodes
          ideaNodes.forEach((idea, index) => {
            if (request.position) {
              // Position child nodes relative to the parent position
              const spacing = 500; // Node width is 448px, add 52px gap between nodes - MUST match placeholder spacing
              const startX = request.position.x - ((ideaNodes.length - 1) * spacing / 2);
              idea.position = {
                x: startX + (index * spacing),
                y: request.position.y + 250 // MUST match placeholder y offset
              };
            }
            
            newNodes.set(idea.id, idea);

            if (!idea.parentId) {
              // Only add to root nodes if not already present
              if (!newRootNodes.includes(idea.id)) {
                newRootNodes.push(idea.id);
              }
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
          
          // Handle prompt node's root status
          if (promptNode && !promptNode.parentId) {
            if (!newRootNodes.includes(promptNode.id)) {
              newRootNodes.push(promptNode.id);
            }
          }

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
          // All nodes from the response are already included (both prompt and idea nodes)
          const nodesToSync = [...response.ideas];
          
          console.log('[IdeaGraphContext] Emitting sync-ideas for', nodesToSync.length, 'nodes to other users');
          console.log('[IdeaGraphContext] Nodes being synced:', nodesToSync.map(node => ({ id: node.id, content: node.content.substring(0, 50), isPrompt: node.metadata?.isPrompt })));
          socket.emit('sync-ideas', { 
            userId, 
            ideas: nodesToSync,
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
    const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Find the next position in the deterministic grid
    const position = getNextManualNotePosition(state.nodes);
    
    // Create the empty note node as a draft (not shared until saved)
    const emptyNote: IdeaNode = {
      id: noteId,
      content: '', // Empty content for manual editing
      parentId: undefined, // Manual notes are root-level
      childIds: [],
      metadata: {
        generatedBy: 'user',
        isManualNote: true,
        isDraft: true, // Mark as draft - won't be shared until saved
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

    // Note: Draft nodes are not synced immediately. They will be synced when saved.
  }, [state.nodes, getNextManualNotePosition, socket, userId]);

  const createComment = useCallback(() => {
    console.log('[IdeaGraphContext] createComment called');
    
    // Generate unique ID for the new comment
    const commentId = `comment-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    
    // Find the next position in the deterministic grid
    const position = getNextCommentPosition(state.nodes);
    
    // Create the empty comment node as a draft (not shared until saved)
    const emptyComment: IdeaNode = {
      id: commentId,
      content: '', // Empty content for manual editing
      parentId: undefined, // Comments are root-level
      childIds: [],
      metadata: {
        generatedBy: 'user',
        isComment: true,
        isDraft: true, // Mark as draft - won't be shared until saved
        createdAt: new Date().toISOString(),
      },
      createdBy: userId || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      position: position,
    };

    // Add the comment to the state
    setState(prevState => {
      const newNodes = new Map(prevState.nodes);
      const newRootNodes = [...prevState.rootNodes];

      newNodes.set(emptyComment.id, emptyComment);
      newRootNodes.push(emptyComment.id);

      return {
        ...prevState,
        nodes: newNodes,
        rootNodes: newRootNodes,
        selectedNodeId: emptyComment.id, // Auto-select the new comment
      };
    });

    // Note: Draft nodes are not synced immediately. They will be synced when saved.
  }, [state.nodes, getNextCommentPosition, socket, userId]);

  const createChildPrompt = useCallback((parentNodeId: string) => {
    console.log('[IdeaGraphContext] createChildPrompt called for parent:', parentNodeId);
    
    // Generate unique ID for the new prompt tool
    const promptToolId = `prompt-tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get parent node to calculate position
    const parentNode = state.nodes.get(parentNodeId);
    if (!parentNode) {
      console.error('Parent node not found:', parentNodeId);
      return;
    }
    
    // Calculate position below parent
    const position = {
      x: parentNode.position?.x || 0,
      y: (parentNode.position?.y || 0) + 200, // Position below parent with gap
    };
    
    // Create the child prompt tool node
    const childPromptTool: IdeaNode = {
      id: promptToolId,
      content: '', // Empty content for prompt input
      parentId: parentNodeId,
      childIds: [],
      metadata: {
        generatedBy: 'user',
        isPromptTool: true,
        parentContext: parentNode.content, // Store parent's content as context
        createdAt: new Date().toISOString(),
      },
      createdBy: userId || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      position: position,
    };

    // Add the prompt tool to the state
    setState(prevState => {
      const newNodes = new Map(prevState.nodes);
      
      // Add the new child prompt tool
      newNodes.set(childPromptTool.id, childPromptTool);
      
      // Update parent node's childIds
      const parent = newNodes.get(parentNodeId);
      if (parent) {
        parent.childIds = [...parent.childIds, childPromptTool.id];
        newNodes.set(parentNodeId, parent);
      }

      return {
        ...prevState,
        nodes: newNodes,
        selectedNodeId: childPromptTool.id, // Auto-select the new prompt tool
      };
    });

    // Sync with other users
    if (socket && userId) {
      console.log('[IdeaGraphContext] Emitting sync-ideas for new child prompt tool');
      socket.emit('sync-ideas', {
        userId,
        ideas: [childPromptTool],
        parentNodeId: parentNodeId
      });
    }
  }, [state.nodes, socket, userId]);

  const createChildNote = useCallback((parentNodeId: string) => {
    console.log('[IdeaGraphContext] createChildNote called for parent:', parentNodeId);
    
    // Generate unique ID for the new note
    const noteId = `child-note-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get parent node to calculate position
    const parentNode = state.nodes.get(parentNodeId);
    if (!parentNode) {
      console.error('Parent node not found:', parentNodeId);
      return;
    }
    
    // Calculate position below parent
    const position = {
      x: parentNode.position?.x || 0,
      y: (parentNode.position?.y || 0) + 250, // Position below parent with gap
    };
    
    // Create the child note node
    const childNote: IdeaNode = {
      id: noteId,
      content: '', // Empty content for manual editing
      parentId: parentNodeId,
      childIds: [],
      metadata: {
        generatedBy: 'user',
        isManualNote: true,
        parentContext: parentNode.content, // Store parent's content as context
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
      
      // Add the new child node
      newNodes.set(childNote.id, childNote);
      
      // Update parent node's childIds
      const parent = newNodes.get(parentNodeId);
      if (parent) {
        parent.childIds = [...parent.childIds, childNote.id];
        newNodes.set(parentNodeId, parent);
      }

      return {
        ...prevState,
        nodes: newNodes,
        selectedNodeId: childNote.id, // Auto-select the new note
      };
    });

    // Sync with other users
    if (socket && userId) {
      console.log('[IdeaGraphContext] Emitting sync-ideas for new child note');
      socket.emit('sync-ideas', {
        userId,
        ideas: [childNote],
        parentNodeId: parentNodeId
      });
    }
  }, [state.nodes, socket, userId]);

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

  const addPromptNode = useCallback((promptNode: IdeaNode): Promise<void> => {
    console.log('[IdeaGraphContext] addPromptNode called for node:', promptNode.id);
    
    return new Promise((resolve) => {
      setState(prevState => {
        const newNodes = new Map(prevState.nodes);
        const newRootNodes = [...prevState.rootNodes];
        
        // Add the prompt node
        newNodes.set(promptNode.id, promptNode);
        
        // If it has no parent, add to root nodes
        if (!promptNode.parentId) {
          newRootNodes.push(promptNode.id);
        } else {
          // Update parent's childIds
          const parent = newNodes.get(promptNode.parentId);
          if (parent) {
            if (!parent.childIds.includes(promptNode.id)) {
              parent.childIds = [...parent.childIds, promptNode.id];
              newNodes.set(parent.id, parent);
            }
          }
        }
        
        // Sync with other users
        if (socket && userId) {
          console.log('[IdeaGraphContext] Emitting sync-ideas for new prompt node');
          socket.emit('sync-ideas', {
            userId,
            ideas: [promptNode],
            parentNodeId: promptNode.parentId || null
          });
        }
        
        // Resolve the promise after state update
        setTimeout(() => resolve(), 0);
        
        return {
          ...prevState,
          nodes: newNodes,
          rootNodes: newRootNodes,
          selectedNodeId: promptNode.id,
        };
      });
    });
  }, [socket, userId]);

  const removeNode = useCallback((nodeId: string) => {
    console.log('[IdeaGraphContext] removeNode called for node:', nodeId);
    
    setState(prevState => {
      const newNodes = new Map(prevState.nodes);
      const newRootNodes = [...prevState.rootNodes];
      
      // Get the node before removing it (for sync purposes)
      const nodeToRemove = newNodes.get(nodeId);
      
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

      // Sync node removal with other users (but not for draft nodes)
      if (socket && userId && nodeToRemove && !nodeToRemove.metadata?.isDraft) {
        console.log('[IdeaGraphContext] Emitting node removal to other users');
        socket.emit('remove-node', {
          userId,
          nodeId: nodeId
        });
      }
      
      return {
        ...prevState,
        nodes: newNodes,
        rootNodes: newRootNodes,
        selectedNodeId: prevState.selectedNodeId === nodeId ? undefined : prevState.selectedNodeId,
      };
    });
  }, [socket, userId]);

  const updateNodeContent = useCallback((nodeId: string, content: string) => {
    console.log('[IdeaGraphContext] updateNodeContent called for node:', nodeId, 'content:', content);
    
    setState(prevState => {
      const newNodes = new Map(prevState.nodes);
      const node = newNodes.get(nodeId);
      
      if (node) {
        const wasDraft = node.metadata?.isDraft;
        const updatedNode = {
          ...node,
          content,
          updatedAt: new Date(),
          metadata: {
            ...node.metadata,
            isDraft: false, // When content is saved, it's no longer a draft
          },
        };
        newNodes.set(nodeId, updatedNode);

        // Sync with other users only if it's not a draft or was a draft that's now being published
        if (socket && userId && (!wasDraft || (wasDraft && content.trim()))) {
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

        // Sync position update with other users (but not for draft nodes)
        if (socket && userId && !updatedNode.metadata?.isDraft) {
          console.log('[IdeaGraphContext] Emitting sync-ideas for position update');
          socket.emit('sync-ideas', {
            userId,
            ideas: [updatedNode],
            parentNodeId: updatedNode.parentId
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
      isMergeMode: false,
      selectedNodeIds: new Set(),
    });
    setError(null);
  }, []);

  const toggleMergeMode = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMergeMode: !prev.isMergeMode,
      selectedNodeIds: prev.isMergeMode ? new Set() : prev.selectedNodeIds, // Clear selection when exiting merge mode
    }));
  }, []);

  const toggleNodeSelection = useCallback((nodeId: string) => {
    setState(prev => {
      if (!prev.isMergeMode) return prev;
      
      // Only allow selecting idea nodes (not prompts, comments, or prompt tools)
      const node = prev.nodes.get(nodeId);
      if (!node || node.metadata?.isPrompt || node.metadata?.isPromptTool || node.metadata?.isComment) {
        return prev;
      }
      
      const newSelectedIds = new Set(prev.selectedNodeIds);
      if (newSelectedIds.has(nodeId)) {
        newSelectedIds.delete(nodeId);
      } else {
        newSelectedIds.add(nodeId);
      }
      
      return {
        ...prev,
        selectedNodeIds: newSelectedIds,
      };
    });
  }, []);

  const clearMergeSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedNodeIds: new Set(),
    }));
  }, []);

  const mergeSelectedNodes = useCallback(async (mergePrompt?: string) => {
    const selectedIds = Array.from(state.selectedNodeIds || []);
    if (selectedIds.length < 2) {
      setError('Please select at least 2 nodes to merge');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Declare merged node variable outside try block for error handling access
    let mergedNode: IdeaNode;

    try {
      // Prepare nodes for merge
      const nodesToMerge = selectedIds
        .map(id => state.nodes.get(id))
        .filter((node): node is IdeaNode => node !== undefined);

      if (nodesToMerge.length < 2) {
        setError('Could not find selected nodes');
        return;
      }

      // Calculate position for merged node (center of selected nodes)
      const avgX = nodesToMerge.reduce((sum, node) => sum + (node.position?.x || 0), 0) / nodesToMerge.length;
      const maxY = Math.max(...nodesToMerge.map(node => node.position?.y || 0));
      const mergedNodePosition = { x: avgX, y: maxY + 200 };

      // Create a placeholder merged node
      mergedNode = {
        id: `merged-${Date.now()}`,
        content: 'Merging...',
        parentId: undefined, // Merged nodes don't have a single parent
        childIds: [],
        metadata: {
          generatedBy: 'ai',
          isMerged: true,
          mergedFrom: selectedIds,
          isLoading: true,
        },
        createdBy: userId || 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
        position: mergedNodePosition,
      };

      // Add merged node and update parent nodes to include it as a child
      setState(prev => {
        const newNodes = new Map(prev.nodes);

        // Add the merged node
        newNodes.set(mergedNode.id, mergedNode);

        // Update each parent node to include the merged node as a child
        selectedIds.forEach(parentId => {
          const parent = newNodes.get(parentId);
          if (parent) {
            parent.childIds = [...parent.childIds, mergedNode.id];
            newNodes.set(parentId, parent);
          }
        });

        return {
          ...prev,
          nodes: newNodes,
          isMergeMode: false,
          selectedNodeIds: new Set(),
        };
      });

      // Call the merge API endpoint
      console.log('[IdeaGraphContext] Calling merge API with nodes:', nodesToMerge.map(n => ({
        id: n.id,
        content: n.content
      })));

      // Define model config to use for both API call and metadata
      const modelConfig = {
        provider: 'groq' as const, // Default to groq for now
        model: 'llama-3.3-70b-versatile',
      };

      // Helper function to get model label (matching PromptingBox pattern)
      const getModelLabel = (model: string) => {
        switch (model) {
          case 'llama-3.1-8b-instant':
            return 'Llama 3.1 8B Instant';
          case 'llama-3.3-70b-versatile':
            return 'Llama 3.3 70B';
          case 'openai/gpt-oss-120b':
            return 'GPT OSS 120B';
          case 'openai/gpt-oss-20b':
            return 'GPT OSS 20B';
          case 'command-r':
            return 'Command R';
          case 'command-r-plus':
            return 'Command R+';
          default:
            return 'Llama 3.3 70B'; // Default fallback
        }
      };

      const mergeResponse = await mergeNodes({
        nodes: nodesToMerge.map(node => ({
          id: node.id,
          content: node.content,
          metadata: node.metadata,
        })),
        mergePrompt,
        modelConfig,
      });
      
      console.log('[IdeaGraphContext] Merge API response:', mergeResponse);

      if (mergeResponse.success && mergeResponse.mergedIdea) {
        // Update the placeholder merged node with actual content
        setState(prev => {
          const newNodes = new Map(prev.nodes);
          const placeholderNode = newNodes.get(mergedNode.id);

          if (placeholderNode) {
            // Update the placeholder with actual merged content and model info
            placeholderNode.content = mergeResponse.mergedIdea.content;
            placeholderNode.metadata = {
              ...placeholderNode.metadata,
              ...mergeResponse.mergedIdea.metadata,
              isLoading: false,
              generationTime: mergeResponse.generationTime,
              // Add model info from the merge request for proper icon display
              modelProvider: modelConfig.provider,
              modelName: modelConfig.model,
              modelLabel: getModelLabel(modelConfig.model),
            };
            newNodes.set(mergedNode.id, placeholderNode);
          }

          return {
            ...prev,
            nodes: newNodes,
          };
        });

        // Sync with other users
        if (socket && userId) {
          // Get the updated node from the new state
          setState(currentState => {
            const updatedMergedNode = currentState.nodes.get(mergedNode.id);
            if (updatedMergedNode) {
              socket.emit('sync-ideas', {
                userId,
                ideas: [updatedMergedNode],
                parentNodeId: null, // Merged nodes have multiple parents
              });
            }
            return currentState; // Return state unchanged
          });
        }
      } else {
        // Remove the placeholder on error
        setState(prev => {
          const newNodes = new Map(prev.nodes);
          newNodes.delete(mergedNode.id);
          
          // Remove from parent childIds
          selectedIds.forEach(parentId => {
            const parent = newNodes.get(parentId);
            if (parent) {
              parent.childIds = parent.childIds.filter(id => id !== mergedNode.id);
              newNodes.set(parentId, parent);
            }
          });
          
          return {
            ...prev,
            nodes: newNodes,
          };
        });
        
        throw new Error('Failed to merge nodes');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to merge nodes';
      setError(errorMessage);
      console.error('[IdeaGraphContext] Error merging nodes:', err);
      
      // Log full error details
      if (err instanceof Error) {
        console.error('[IdeaGraphContext] Error stack:', err.stack);
      }
      
      // Remove the placeholder on error
      setState(prev => {
        const newNodes = new Map(prev.nodes);
        newNodes.delete(mergedNode.id);
        
        // Remove from parent childIds
        selectedIds.forEach(parentId => {
          const parent = newNodes.get(parentId);
          if (parent) {
            parent.childIds = parent.childIds.filter(id => id !== mergedNode.id);
            newNodes.set(parentId, parent);
          }
        });
        
        return {
          ...prev,
          nodes: newNodes,
          isMergeMode: false,
          selectedNodeIds: new Set(),
        };
      });
    } finally {
      setIsLoading(false);
    }
  }, [state.selectedNodeIds, state.nodes, userId]);

  return (
    <IdeaGraphContext.Provider value={{
      state,
      generateIdeas,
      createEmptyNote,
      createComment,
      createPromptToolNode,
      createChildNote,
      createChildPrompt,
      addPromptNode,
      removeNode,
      updateNodeContent,
      updateNodePosition,
      selectNode,
      clearGraph,
      toggleMergeMode,
      toggleNodeSelection,
      clearMergeSelection,
      mergeSelectedNodes,
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