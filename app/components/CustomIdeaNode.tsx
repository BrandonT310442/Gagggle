'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { useState } from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../public/gagggleLoading.json';

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

export default function CustomIdeaNode({ data, selected }: NodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const node = data.node;

  const getModelIcon = (modelName?: string) => {
    if (!modelName) return <MetaIcon />;

    if (modelName.includes('llama')) {
      return <MetaIcon />;
    }
    if (modelName.includes('openai') || modelName.includes('gpt')) {
      return <OpenAIIcon />;
    }
    if (modelName.includes('command-r')) {
      return <CohereIcon />;
    }

    return <MetaIcon />;
  };

  const formatModelName = (modelName?: string, modelLabel?: string) => {
    if (modelLabel) return modelLabel;
    if (!modelName) return 'Unknown Model';

    if (modelName.includes('llama-3.1-8b')) return 'Llama 3.1 8B';
    if (modelName.includes('llama-3.3-70b')) return 'Llama 3.3 70B';
    if (modelName.includes('llama-guard-4')) return 'Llama Guard 4';
    if (modelName.includes('gpt-oss-120b')) return 'GPT OSS 120B';
    if (modelName.includes('gpt-oss-20b')) return 'GPT OSS 20B';
    if (modelName.includes('command-r-plus')) return 'Command R+';
    if (modelName.includes('command-r')) return 'Command R';

    return modelName;
  };

  const hasChildren = node.childIds && node.childIds.length > 0;

  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />
      <div
        className={`
          bg-white box-border flex flex-col gap-6 items-start justify-start p-6 relative
          cursor-pointer transition-all duration-200
          ${selected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
          ${isHovered ? 'shadow-xl' : 'shadow-md'}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: '28rem',
          maxWidth: '32rem',
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

          {/* Content section */}
          <div
            className="font-['Syne'] text-base font-normal leading-6 text-black"
            style={{
              fontFamily: 'Syne, sans-serif',
              width: 'min-content',
              minWidth: '100%',
            }}
          >
            {node.metadata?.isLoading ? (
              <div className='flex flex-col items-center justify-center py-4'>
                <Lottie
                  animationData={loadingAnimation}
                  style={{ width: 120, height: 90 }}
                  loop={true}
                />
                <p className='text-xs text-gray-500 mt-2'>Generating idea...</p>
              </div>
            ) : (
              node.content
            )}
          </div>
        </div>
      </div>
      {hasChildren && (
        <Handle
          type='source'
          position={Position.Bottom}
          className='opacity-0'
        />
      )}
    </>
  );
}
