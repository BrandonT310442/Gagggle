'use client';

import { useState, useRef, useEffect } from 'react';
import { IdeaNode as IdeaNodeType } from '../types/idea';
import Lottie from 'lottie-react';
import loadingAnimation from '../../public/gagggleLoading.json';

interface IdeaNodeProps {
  node: IdeaNodeType;
  isSelected?: boolean;
  onSelect?: () => void;
  onGenerateChildren?: () => void;
  onUpdateContent?: (nodeId: string, content: string) => void;
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

const ManualIcon = () => {
  return (
    <div className='relative w-4 h-4 flex items-center justify-center'>
      <div className='text-gray-600 text-xs font-bold'>M</div>
    </div>
  );
};

export default function IdeaNode({
  node,
  isSelected = false,
  onSelect,
  onGenerateChildren,
  onUpdateContent,
}: Readonly<IdeaNodeProps>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isManualNote = node.metadata?.isManualNote;

  // Update edit content when node content changes
  useEffect(() => {
    setEditContent(node.content);
  }, [node.content]);

  // Auto-focus and start editing for new manual notes
  useEffect(() => {
    if (isManualNote && !node.content && isSelected) {
      setIsEditing(true);
    }
  }, [isManualNote, node.content, isSelected]);

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    if (isManualNote) {
      e.stopPropagation();
      setIsEditing(true);
      setEditContent(node.content);
    }
  };

  const handleKeyDownStartEdit = (e: React.KeyboardEvent) => {
    if (isManualNote && (e.key === 'Enter' || e.key === ' ')) {
      e.stopPropagation();
      setIsEditing(true);
      setEditContent(node.content);
    }
  };

  const handleSaveEdit = () => {
    if (onUpdateContent && editContent !== node.content) {
      onUpdateContent(node.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(node.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  const getModelIcon = (modelName?: string, isManualNote?: boolean) => {
    if (isManualNote) return <ManualIcon />;
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

  const formatModelName = (modelName?: string, modelLabel?: string, isManualNote?: boolean) => {
    if (isManualNote) return 'Manual Input';
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

  return (
    <div
      className={`
        bg-white box-border flex flex-col gap-6 items-start justify-start p-6 relative
        cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
        ${isHovered ? 'shadow-xl' : 'shadow-md'}
      `}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect?.();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Idea node: ${node.content.substring(0, 50)}${node.content.length > 50 ? '...' : ''}`}
      style={{
        width: 'fit-content',
        minWidth: '28rem',
        maxWidth: '32rem',
      }}
    >
      <div className='flex flex-col gap-2 items-start justify-start relative shrink-0 w-full'>
        {/* Model info section */}
        <div className='box-border flex gap-2 items-center justify-start px-0 py-2 relative shrink-0'>
          <div className='flex gap-1 items-center justify-start relative shrink-0'>
            {getModelIcon(node.metadata?.modelName, isManualNote)}
            <div className="font-['Inter'] text-xs font-normal leading-4 text-black whitespace-nowrap">
              {formatModelName(
                node.metadata?.modelName,
                node.metadata?.modelLabel,
                isManualNote
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
          {node.metadata?.isLoading && (
            <div className='flex flex-col items-center justify-center py-4'>
              <Lottie
                animationData={loadingAnimation}
                style={{ width: 120, height: 90 }}
                loop={true}
              />
              <p className='text-xs text-gray-500 mt-2'>Generating idea...</p>
            </div>
          )}
          {!node.metadata?.isLoading && isEditing && (
            <div className='w-full'>
              <textarea
                ref={textareaRef}
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveEdit}
                className="font-['Syne'] text-base font-normal leading-6 text-black w-full resize-none border-none outline-none bg-transparent placeholder-gray-500"
                style={{
                  fontFamily: 'Syne, sans-serif',
                  minHeight: '2.5rem',
                }}
                placeholder="Enter your idea..."
              />
              <div className='flex justify-between items-center mt-2 text-xs text-gray-500'>
                <span>Enter to save, Esc to cancel</span>
                <div className='flex gap-2'>
                  <button
                    onClick={handleSaveEdit}
                    className='px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600'
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className='px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          {!node.metadata?.isLoading && !isEditing && isManualNote && (
            <button
              onClick={handleStartEdit}
              onKeyDown={handleKeyDownStartEdit}
              className="cursor-text hover:bg-gray-50 p-2 -m-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-left"
              type="button"
            >
              {node.content || 'Click to add your idea...'}
            </button>
          )}
          {!node.metadata?.isLoading && !isEditing && !isManualNote && (
            <div>
              {node.content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
