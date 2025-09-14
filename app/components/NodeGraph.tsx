'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useIdeaGraph } from '../contexts/IdeaGraphContext';
import IdeaNode from './IdeaNode';
import PromptNode from './PromptNode';
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
  const { state, selectNode, updateNodeContent, isLoading, error } = useIdeaGraph();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const updateXarrow = useXarrow();

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();


    // Always zoom with scroll, no modifier needed - reduced sensitivity
    const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05; // Much gentler zoom changes
    setZoom(prevZoom => Math.min(Math.max(prevZoom * zoomFactor, 0.01), 10)); // Much lower zoom out limit (0.01 = 1%)
  }, []);

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
      role="application"
      aria-label="Idea graph canvas"
      tabIndex={0}
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

              {/* All Idea Nodes - Positioned based on type */}
              <div className='relative'>
                {/* Generated Ideas - Horizontal row */}
                {Array.from(state.nodes.values())
                  .filter(node => !node.metadata?.isPrompt && !node.metadata?.isManualNote)
                  .length > 0 && (
                  <div className='flex justify-center'>
                    <div
                      className='flex items-start gap-6'
                      style={{ minWidth: 'fit-content' }}
                    >
                      {Array.from(state.nodes.values())
                        .filter(node => !node.metadata?.isPrompt && !node.metadata?.isManualNote)
                        .map((node) => (
                          <IdeaNode
                            key={node.id}
                            node={node}
                            isSelected={state.selectedNodeId === node.id}
                            onSelect={() => selectNode(node.id)}
                            onGenerateChildren={() => onNodeGenerate?.(node.id)}
                            onUpdateContent={updateNodeContent}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Manual Notes - Absolutely positioned */}
                {Array.from(state.nodes.values())
                  .filter(node => node.metadata?.isManualNote)
                  .map((node) => (
                    <div
                      key={node.id}
                      className='absolute'
                      style={{
                        left: node.position?.x || 0,
                        top: node.position?.y || 0,
                      }}
                    >
                      <IdeaNode
                        node={node}
                        isSelected={state.selectedNodeId === node.id}
                        onSelect={() => selectNode(node.id)}
                        onGenerateChildren={() => onNodeGenerate?.(node.id)}
                        onUpdateContent={updateNodeContent}
                      />
                    </div>
                  ))}
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