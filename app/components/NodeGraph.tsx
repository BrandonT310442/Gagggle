'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useIdeaGraph } from '../contexts/IdeaGraphContext';
import IdeaNode from './IdeaNode';
import PromptNode from './PromptNode';
import { IdeaNode as IdeaNodeType } from '../types/idea';
import Lottie from 'lottie-react';
import loadingAnimation from '../../public/gagggleLoading.json';
import Xarrow, { Xwrapper, useXarrow } from 'react-xarrows';

interface NodeGraphProps {
  onNodeGenerate?: (nodeId: string) => void;
  isPanMode?: boolean;
}

export default function NodeGraph({
  onNodeGenerate,
  isPanMode = false,
}: Readonly<NodeGraphProps>) {
  const { state, selectNode, isLoading, error } = useIdeaGraph();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const updateXarrow = useXarrow();

  // Group nodes by generation level (same parent or root nodes)
  const groupNodesByLevel = useCallback(() => {
    const nodes = Array.from(state.nodes.values());
    const levels: { promptNodes: IdeaNodeType[], ideaNodes: IdeaNodeType[] }[] = [];

    // Group by prompt nodes and their related ideas
    const promptNodes = nodes.filter(node => node.metadata?.isPrompt);
    const ideaNodes = nodes.filter(node => !node.metadata?.isPrompt);

    // For each prompt node, find its related ideas (root level ideas without parents)
    promptNodes.forEach(promptNode => {
      const relatedIdeas = ideaNodes.filter(node => !node.parentId);
      levels.push({
        promptNodes: [promptNode],
        ideaNodes: relatedIdeas
      });
    });

    // If there are ideas without prompt nodes (shouldn't happen but safety)
    if (promptNodes.length === 0 && ideaNodes.length > 0) {
      const rootIdeas = ideaNodes.filter(node => !node.parentId);
      levels.push({
        promptNodes: [],
        ideaNodes: rootIdeas
      });
    }

    // Additional levels: group child nodes by their parent
    const processedParents = new Set();
    const remainingNodes = ideaNodes.filter(node => node.parentId && !processedParents.has(node.parentId));

    while (remainingNodes.length > 0) {
      const currentLevelNodes: IdeaNodeType[] = [];
      const parentsInThisLevel = new Set<string>();

      remainingNodes.forEach(node => {
        if (node.parentId && !processedParents.has(node.parentId)) {
          parentsInThisLevel.add(node.parentId);
        }
      });

      parentsInThisLevel.forEach(parentId => {
        const childNodes = remainingNodes.filter(node => node.parentId === parentId);
        currentLevelNodes.push(...childNodes);
        processedParents.add(parentId);
      });

      if (currentLevelNodes.length > 0) {
        levels.push({
          promptNodes: [],
          ideaNodes: currentLevelNodes
        });
        remainingNodes.splice(0, remainingNodes.length, ...remainingNodes.filter(node =>
          !currentLevelNodes.some(levelNode => levelNode.id === node.id)
        ));
      } else {
        break;
      }
    }

    return levels;
  }, [state.nodes]);

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    // Always zoom with scroll, no modifier needed
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prevZoom => Math.min(Math.max(prevZoom * zoomFactor, 0.1), 3));
    
    // Update arrows after zoom
    setTimeout(() => updateXarrow(), 0);
  }, [updateXarrow]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const shouldPan = isPanMode || e.ctrlKey || e.metaKey;
    
    console.log('NodeGraph mouseDown:', {
      isPanMode,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shouldPan,
      target: e.target
    });

    if (shouldPan) {
      console.log('Starting pan mode');
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
      setPanStart(pan);
      e.preventDefault();
      e.stopPropagation();
    }
  }, [isPanMode, pan]);

  // Global mouse move handler for dragging
  const handleGlobalMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      setPan({
        x: panStart.x + deltaX,
        y: panStart.y + deltaY
      });
      
      // Update arrows after pan
      updateXarrow();
    }
  }, [isDragging, dragStart, panStart, updateXarrow]);

  // Global mouse up handler
  const handleGlobalMouseUp = useCallback(() => {
    if (isDragging) {
      console.log('Ending pan mode');
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Add global mouse event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isDragging, handleGlobalMouseMove, handleGlobalMouseUp]);

  // Always render the canvas for panning, even if no nodes
  const hasNodes = state.nodes.size > 0;

  // Calculate cursor style
  const getCursorStyle = () => {
    if (isDragging) return 'grabbing';
    if (isPanMode) return 'grab';
    return 'auto';
  };

  return (
    // Interactive canvas container for panning and zooming functionality
    <div
      ref={containerRef}
      className='absolute inset-0 overflow-hidden'
      style={{ 
        cursor: getCursorStyle()
      }}
      onMouseDown={handleMouseDown}
    >
      {error && (
        <div className='absolute top-20 left-8 right-8 z-10 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {isLoading && state.nodes.size === 0 && (
        <div className='absolute inset-0 flex items-center justify-center z-10'>
          <div className='flex flex-col items-center justify-center'>
            <Lottie
              animationData={loadingAnimation}
              style={{ width: 200, height: 150 }}
              loop={true}
            />
            <p className='mt-4 text-gray-600 text-sm'>Generating ideas...</p>
          </div>
        </div>
      )}

      <div
        ref={canvasRef}
        className='relative p-8'
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          minWidth: '100vw',
          minHeight: '100vh'
        }}
      >
        {/* Only show nodes if they exist */}
        {hasNodes && (
          <Xwrapper>
            <div className='mb-12'>
              {/* All Prompt Nodes - Centered */}
              {Array.from(state.nodes.values())
                .filter(node => node.metadata?.isPrompt)
                .map((promptNode) => (
                  <div key={promptNode.id} className='flex justify-center mb-8'>
                    <PromptNode
                      node={promptNode}
                      isSelected={state.selectedNodeId === promptNode.id}
                      onSelect={() => selectNode(promptNode.id)}
                    />
                  </div>
                ))}

              {/* All Idea Nodes - Horizontal row */}
              <div className='flex justify-center'>
                <div
                  className='flex items-start gap-6'
                  style={{ minWidth: 'fit-content' }}
                >
                  {Array.from(state.nodes.values())
                    .filter(node => !node.metadata?.isPrompt)
                    .map((node) => (
                      <IdeaNode
                        key={node.id}
                        node={node}
                        isSelected={state.selectedNodeId === node.id}
                        onSelect={() => selectNode(node.id)}
                        onGenerateChildren={() => onNodeGenerate?.(node.id)}
                      />
                    ))}
                </div>
              </div>
              
              {/* Render arrows for parent-child relationships */}
              {Array.from(state.nodes.values()).map((parentNode, parentIndex) => 
                parentNode.childIds && parentNode.childIds.length > 0 && 
                parentNode.childIds.map((childId, childIndex) => (
                  <Xarrow
                    key={`arrow-${parentIndex}-${childIndex}-${parentNode.id}-${childId}`}
                    start={parentNode.id}
                    end={childId}
                    color="#94a3b8"
                    strokeWidth={1.5}
                    path="smooth"
                    curveness={0.4}
                    startAnchor="bottom"
                    endAnchor="top"
                    headShape="arrow1"
                    headSize={3}
                    dashness={false}
                  />
                ))
              )}
            </div>
          </Xwrapper>
        )}
      </div>
    </div>
  );
}
