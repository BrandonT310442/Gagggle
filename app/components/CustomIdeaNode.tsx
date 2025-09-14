'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { useState, useRef, useEffect } from 'react';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(data.node.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const node = data.node;

  const isManualNote = node.metadata?.isManualNote;
  const isEmptyManualNote = isManualNote && !node.content.trim();
  const isReadOnlyManualNote = isManualNote && node.content.trim();

  const isComment = node.metadata?.isComment;
  const isEmptyComment = isComment && !node.content.trim();
  const isReadOnlyComment = isComment && node.content.trim();

  // Get user color for comments from other collaborators
  const getUserColor = (userId: string) => {
    if (data.currentUser?.userId === userId) {
      return data.currentUser.color;
    }
    const user = data.connectedUsers?.find((u: { userId: string; color: string }) => u.userId === userId);
    return user?.color || '#6B7280'; // Default gray if user not found
  };

  const userColor = isComment ? getUserColor(node.createdBy) : undefined;

  // Debug logging
  useEffect(() => {
    if (isManualNote) {
      console.log('CustomIdeaNode MANUAL NOTE render state:', { 
        nodeId: node.id, 
        isManualNote, 
        isEditing, 
        selected, 
        content: node.content,
        editContent,
        shouldShowTextarea: !node.metadata?.isLoading && isEditing,
        shouldShowClickable: !node.metadata?.isLoading && !isEditing && isManualNote
      });
    }
  });

  // Update edit content when node content changes
  useEffect(() => {
    setEditContent(node.content);
  }, [node.content]);

  // Auto-focus and start editing for new manual notes and comments (only empty ones)
  useEffect(() => {
    console.log('Auto-edit useEffect', { isManualNote, isComment, hasContent: !!node.content, selected, isEmptyManualNote, isEmptyComment });
    if ((isEmptyManualNote || isEmptyComment) && selected) {
      console.log('Starting auto-edit for new empty note/comment');
      setIsEditing(true);
    }
  }, [isEmptyManualNote, isEmptyComment, selected]);

  // Auto-focus textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      // Use setTimeout to ensure the textarea is fully rendered
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        }
      }, 10);
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    console.log('handleStartEdit called', { isManualNote, isComment, nodeId: node.id, isReadOnlyManualNote, isReadOnlyComment });
    // Only allow editing if it's an empty manual note or comment (not read-only)
    if (isEmptyManualNote || isEmptyComment) {
      e.stopPropagation();
      e.preventDefault();
      setIsEditing(true);
      setEditContent(node.content);
    }
  };

  const handleKeyDownStartEdit = (e: React.KeyboardEvent) => {
    // Only allow keyboard editing if it's an empty manual note or comment (not read-only)
    if ((isEmptyManualNote || isEmptyComment) && (e.key === 'Enter' || e.key === ' ')) {
      e.stopPropagation();
      setIsEditing(true);
      setEditContent(node.content);
    }
  };

  const handleSaveEdit = () => {
    console.log('handleSaveEdit called', { editContent, nodeContent: node.content, hasCallback: !!data.onUpdateContent });
    if (data.onUpdateContent && editContent !== node.content) {
      data.onUpdateContent(node.id, editContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    console.log('handleCancelEdit called - resetting edit mode', { 
      beforeEdit: isEditing, 
      nodeContent: node.content,
      editContent: editContent.trim(),
      isEmptyManualNote,
      isEmptyComment
    });
    
    // If the manual note or comment is empty (no original content), delete it entirely
    if (isEmptyManualNote || isEmptyComment) {
      console.log('Deleting empty note/comment');
      if (data.onRemoveNode) {
        data.onRemoveNode(node.id);
      }
      return;
    }
    
    // Otherwise just reset editing state
    setEditContent(node.content);
    setIsEditing(false);
    
    // Force blur to remove focus from any active element
    if (textareaRef.current) {
      textareaRef.current.blur();
    }
    
    console.log('handleCancelEdit - should now be false');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    console.log('handleKeyDown called with key:', e.key);
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleCancelEdit();
    }
  };

  const ManualIcon = () => {
    return (
      <div className='relative w-4 h-4 flex items-center justify-center'>
        <div className='text-gray-600 text-xs font-bold'>M</div>
      </div>
    );
  };

  const CommentIcon = () => {
    return (
      <div className='relative w-4 h-4 flex items-center justify-center'>
        <div className='text-gray-600 text-xs font-bold'>💬</div>
      </div>
    );
  };

  const getModelIcon = (modelName?: string, isManualNote?: boolean, isComment?: boolean) => {
    if (isComment) return <CommentIcon />;
    if (isManualNote) return <ManualIcon />;
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

  const formatModelName = (modelName?: string, modelLabel?: string, isManualNote?: boolean, isComment?: boolean) => {
    if (isComment) return 'Comment';
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

  const hasChildren = node.childIds && node.childIds.length > 0;

  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />
      <div
        className={`
          ${isComment ? 'bg-gray-50' : 'bg-white'} box-border flex flex-col gap-6 items-start justify-start p-6 relative
          cursor-pointer transition-all duration-200
          ${selected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
          ${isHovered ? 'shadow-xl' : 'shadow-md'}
          ${isComment ? 'border-l-4' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: isComment ? '26rem' : '28rem',
          maxWidth: isComment ? '30rem' : '32rem',
          borderLeftColor: isComment ? userColor : undefined,
        }}
      >
        <div className='flex flex-col gap-2 items-start justify-start relative shrink-0 w-full'>
          {/* Model info section */}
          <div className='box-border flex gap-2 items-center justify-start px-0 py-2 relative shrink-0'>
            <div className='flex gap-1 items-center justify-start relative shrink-0'>
              {getModelIcon(node.metadata?.modelName, node.metadata?.isManualNote, node.metadata?.isComment)}
              <div className="font-['Inter'] text-xs font-normal leading-4 text-black whitespace-nowrap">
                {formatModelName(
                  node.metadata?.modelName,
                  node.metadata?.modelLabel,
                  node.metadata?.isManualNote,
                  node.metadata?.isComment
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
            ) : isEditing ? (
              <div className='w-full'>
                <textarea
                  ref={textareaRef}
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={(e) => {
                    // Prevent auto-save on blur for better UX
                    if (!e.relatedTarget || !e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                      handleSaveEdit();
                    }
                  }}
                  className="font-['Syne'] text-base font-normal leading-6 text-black w-full resize-none border-none outline-none bg-transparent placeholder-gray-500"
                  style={{
                    fontFamily: 'Syne, sans-serif',
                    minHeight: '2.5rem',
                  }}
                  placeholder={isComment ? 'Enter your comment...' : 'Enter your idea...'}
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
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleCancelEdit();
                      }}
                      className='px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600'
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : isEmptyManualNote || isEmptyComment ? (
              <button
                onClick={handleStartEdit}
                onKeyDown={handleKeyDownStartEdit}
                className='cursor-text hover:bg-gray-50 p-2 -m-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-left'
                type='button'
              >
                {node.content || (isComment ? 'Click to add your comment...' : 'Click to add your idea...')}
              </button>
            ) : isReadOnlyManualNote || isReadOnlyComment ? (
              <div className='w-full p-2 -m-2 text-left'>
                {node.content}
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
