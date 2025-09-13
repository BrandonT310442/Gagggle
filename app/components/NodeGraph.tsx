'use client';

import { useState, useEffect } from 'react';
import { useIdeaGraph } from '../contexts/IdeaGraphContext';
import IdeaNode from './IdeaNode';

interface NodeGraphProps {
  onNodeGenerate?: (nodeId: string) => void;
}

export default function NodeGraph({ onNodeGenerate }: Readonly<NodeGraphProps>) {
  const { state, selectNode, isLoading, error } = useIdeaGraph();
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  const nodes = Array.from(state.nodes.values());

  return (
    <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-4">
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="mb-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded">
          Generating ideas...
        </div>
      )}

      <div className="flex items-start justify-start flex-wrap gap-4">
        {nodes.map(node => (
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
  );
}