'use client';

import { useState, useEffect } from 'react';
import { useIdeaGraph } from '../contexts/IdeaGraphContext';
import IdeaNode from './IdeaNode';
import Lottie from 'lottie-react';
import loadingAnimation from '../../public/gagggleLoading.json';

interface NodeGraphProps {
  onNodeGenerate?: (nodeId: string) => void;
}

export default function NodeGraph({
  onNodeGenerate,
}: Readonly<NodeGraphProps>) {
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
      <div className='flex items-center justify-center h-96 text-gray-400'>
        <div className='text-center'>
          <p className='text-lg mb-2'>No ideas generated yet</p>
          <p className='text-sm'>
            Use the prompt box above to start generating ideas
          </p>
        </div>
      </div>
    );
  }

  const nodes = Array.from(state.nodes.values());

  return (
    <div className='w-full bg-gray-50 border border-gray-200 rounded-lg p-4 min-h-96 relative'>
      {error && (
        <div className='mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
          {error}
        </div>
      )}

      {isLoading && state.nodes.size === 0 && (
        <div className='absolute inset-0 flex items-center justify-center'>
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

      <div className='flex items-start justify-start flex-wrap gap-4'>
        {nodes.map((node) => (
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
