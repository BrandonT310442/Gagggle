'use client';

import { useRef } from 'react';
import { IdeaNode } from '../types/idea';
import Draggable from 'react-draggable';
import { useXarrow } from 'react-xarrows';

interface PromptNodeProps {
  node: IdeaNode;
  isSelected?: boolean;
  onSelect?: () => void;
}

const CohereIcon = () => {
  const img = '/cohere-icon-mask.svg';
  const img1 = '/cohere-icon.svg';

  return (
    <div className='relative w-4 h-4' data-name='cohere'>
      <div
        className='absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px] mask-size-[47.651px_48.857px]'
        data-name='Group'
        style={{ maskImage: `url('${img}')` }}
      >
        <img alt='Cohere' className='block max-w-none size-full' src={img1} />
      </div>
    </div>
  );
};

const MetaIcon = () => {
  const imgImage1 = '/meta-icon.png';

  return (
    <div
      className='w-4 h-4 bg-center bg-cover bg-no-repeat'
      data-name='image 1'
      style={{ backgroundImage: `url('${imgImage1}')` }}
    />
  );
};

const OpenAIIcon = () => {
  const img = '/openai-icon.svg';

  return (
    <div className='relative w-4 h-4' data-name='Vector'>
      <img alt='OpenAI' className='block max-w-none size-full' src={img} />
    </div>
  );
};

export default function PromptNode({
  node,
  isSelected = false,
  onSelect,
}: Readonly<PromptNodeProps>) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const updateXarrow = useXarrow();
  
  const getModelIcon = (modelName?: string) => {
    if (!modelName) return <MetaIcon />;

    // Check model name for appropriate icon
    if (modelName.includes('llama')) {
      return <MetaIcon />;
    }
    if (modelName.includes('openai') || modelName.includes('gpt')) {
      return <OpenAIIcon />;
    }
    if (modelName.includes('command-r')) {
      return <CohereIcon />;
    }

    // Default to Meta icon for unknown models
    return <MetaIcon />;
  };

  const formatModelName = (modelName?: string, modelLabel?: string) => {
    if (modelLabel) return modelLabel;
    if (!modelName) return 'Unknown Model';

    if (modelName.includes('llama-3.1-8b')) return 'Llama 3.1 8B';
    if (modelName.includes('llama-3.3-70b')) return 'Llama 3.3 70B';
    if (modelName.includes('llama3-groq-70b')) return 'Llama 3 70B Tool Use';
    if (modelName.includes('llama-guard-4')) return 'Llama Guard 4';
    if (modelName.includes('gpt-oss-120b')) return 'GPT OSS 120B';
    if (modelName.includes('gpt-oss-20b')) return 'GPT OSS 20B';
    if (modelName.includes('command-r-plus')) return 'Command R+';
    if (modelName.includes('command-r')) return 'Command R';

    return modelName;
  };

  return (
    <Draggable 
      nodeRef={nodeRef}
      onDrag={updateXarrow}
      onStop={updateXarrow}
    >
      <div
        id={node.id}
        ref={nodeRef}
        className={`
          bg-slate-50 box-border flex flex-col gap-6 items-start justify-start p-6 relative
          cursor-pointer transition-all duration-200
          border border-dashed border-slate-400
          ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'shadow-sm'}
          hover:shadow-md
        `}
        onClick={onSelect}
        style={{
        width: 'fit-content',
        minWidth: '300px',
        maxWidth: '450px',
      }}
    >
      <div className='flex flex-col gap-2 items-start justify-start relative shrink-0 w-full'>
        {/* Model info section */}
        <div className='box-border flex gap-2 items-center justify-start px-0 py-2 relative shrink-0'>
          <div className='flex gap-1 items-center justify-start relative shrink-0'>
            {getModelIcon(node.metadata?.modelName)}
            <div className="font-['Inter'] text-xs font-normal leading-4 text-black whitespace-nowrap">
              {formatModelName(
                node.metadata?.modelName,
                node.metadata?.modelLabel
              )}
            </div>
          </div>
        </div>

        {/* Prompt content section */}
        <div
          className="font-['Syne'] text-base font-semibold leading-6 text-black"
          style={{
            fontFamily: 'Syne, sans-serif',
            width: 'min-content',
            minWidth: '100%',
          }}
        >
          {node.content}
        </div>
      </div>
    </div>
    </Draggable>
  );
}
