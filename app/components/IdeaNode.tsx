'use client';

import { useState, useRef, useEffect } from 'react';
import { IdeaNode as IdeaNodeType } from '../types/idea';
import Lottie from 'lottie-react';
import loadingAnimation from '../../public/gagggleLoading.json';
import Draggable from 'react-draggable';
import { useXarrow } from 'react-xarrows';

interface IdeaNodeProps {
  node: IdeaNodeType;
  isSelected?: boolean;
  onSelect?: () => void;
  onGenerateChildren?: () => void;
  onAddManualChild?: () => void;
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
  onAddManualChild,
  onUpdateContent,
}: Readonly<IdeaNodeProps>) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(node.content);
  const [showLeafPopup, setShowLeafPopup] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const updateXarrow = useXarrow();

  const isManualNote = node.metadata?.isManualNote;
  const isLeafNode = !node.childIds || node.childIds.length === 0;

  // Update edit content when node content changes
  useEffect(() => {
    setEditContent(node.content);
  }, [node.content]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showLeafPopup &&
        nodeRef.current &&
        !nodeRef.current.contains(event.target as Node) &&
        popupRef.current &&
        !popupRef.current.contains(event.target as Node)
      ) {
        setShowLeafPopup(false);
      }
    };

    if (showLeafPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showLeafPopup]);

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

  const handlePlusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowLeafPopup(!showLeafPopup);
  };

  const handleAddPrompt = () => {
    setShowLeafPopup(false);
    onGenerateChildren?.();
  };

  const handleAddIdea = () => {
    setShowLeafPopup(false);
    onAddManualChild?.();
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

  const formatModelName = (
    modelName?: string,
    modelLabel?: string,
    isManualNote?: boolean
  ) => {
    if (isManualNote) return 'Manual Mode';
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
    <Draggable nodeRef={nodeRef} onDrag={updateXarrow} onStop={updateXarrow}>
      <div
        id={node.id}
        ref={nodeRef}
        className={`
          relative bg-white box-border flex flex-col gap-6 items-start justify-start p-6
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
        role='button'
        aria-label={`Idea node: ${node.content.substring(0, 50)}${
          node.content.length > 50 ? '...' : ''
        }`}
        style={{
          width: 'fit-content',
          minWidth: '28rem',
          maxWidth: '32rem',
          overflow: 'visible',
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
                  placeholder='Enter your idea...'
                />
                <div className='flex justify-between items-center mt-2 text-xs text-gray-500'>
                  <span>Enter to save, Esc to cancel</span>
                  <div className='flex gap-2'>
                    <button
                      onClick={handleSaveEdit}
                      className='px-3 py-1 bg-black text-white rounded text-xs hover:bg-gray-800'
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className='px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600'
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
                className='cursor-text hover:bg-gray-50 p-2 -m-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-left'
                type='button'
              >
                {node.content || 'Click to add your idea...'}
              </button>
            )}
            {!node.metadata?.isLoading && !isEditing && !isManualNote && (
              <div>{node.content}</div>
            )}
          </div>
          
          {/* Plus button as regular element for testing */}
          <div className='w-full flex justify-end mt-4'>
            <button
              onClick={handlePlusClick}
              className='w-12 h-12 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-all shadow-xl border-2 border-white'
              aria-label='Add child node'
            >
              <span className='text-2xl font-bold'>+</span>
            </button>
          </div>
        </div>

        {/* Popup Menu */}
        {showLeafPopup && isLeafNode && !isManualNote && (
          <div
            ref={popupRef}
            className='absolute bottom-20 right-4 flex flex-col gap-3 p-4 bg-white rounded-lg shadow-2xl border border-gray-200'
            style={{
              minWidth: '240px',
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Arrow pointing down to the plus button */}
            <div
              className='absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-200 rotate-45'
              style={{ zIndex: 9998 }}
            />
            
            <button
              onClick={handleAddPrompt}
              className='flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-gray-700 font-medium'
            >
              <span className='text-lg'>+</span>
              <span>Add a Prompt</span>
            </button>
            
            <button
              onClick={handleAddIdea}
              className='flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-gray-700 font-medium'
            >
              <span className='text-lg'>💡</span>
              <span>Add Your Idea</span>
            </button>
          </div>
        )}
      </div>
    </Draggable>
  );
}
