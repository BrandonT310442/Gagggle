'use client';

import { useCallback, useState } from 'react';
import { useIdeaGraph } from '../contexts/IdeaGraphContext';
import IdeaNode from './IdeaNode';
import NodeConnections from './NodeConnections';

interface NodeGraphProps {
  onNodeGenerate?: (nodeId: string) => void;
}

export default function NodeGraph({ onNodeGenerate }: NodeGraphProps) {
  const { state, selectNode, isLoading, error } = useIdeaGraph();
  const [viewOffset, setViewOffset] = useState({ x: 400, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewOffset.x, y: e.clientY - viewOffset.y });
    }
  }, [viewOffset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setViewOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  if (state.nodes.size === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-400">
        <div className="text-center">
          <p className="text-lg mb-2">No ideas generated yet</p>
          <p className="text-sm">Use the prompt box above to start generating ideas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="absolute top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded z-50">
          Generating ideas...
        </div>
      )}

      <div
        className="relative w-full h-full cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        <div
          className="absolute"
          style={{
            transform: `translate(${viewOffset.x}px, ${viewOffset.y}px)`,
            transition: isDragging ? 'none' : 'transform 0.1s',
          }}
        >
          <NodeConnections nodes={state.nodes} />
          
          {Array.from(state.nodes.values()).map(node => (
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

      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        Drag to pan • Click nodes to select • Generate ideas from any node
      </div>
    </div>
  );
}