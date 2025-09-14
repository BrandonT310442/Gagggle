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

export default function CustomIdeaNode({ data, selected, draggable }: NodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(data.node.content);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const node = data.node;
  
  const isMergeMode = data.isMergeMode || false;
  const isSelectedForMerge = data.isSelectedForMerge || false;
  const onToggleSelection = data.onToggleSelection;

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

  // Get username for comments
  const getUsername = (userId: string) => {
    if (data.currentUser?.userId === userId) {
      return 'You';
    }
    // For now, we'll use a shortened version of the userId since we don't have usernames
    // You could extend this to use actual usernames if they're available
    return `User ${userId.substring(0, 8)}`;
  };

  // Format timestamp for comments
  const formatTimestamp = (date: Date | string) => {
    const now = new Date();
    const dateObj = date instanceof Date ? date : new Date(date);
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return dateObj.toLocaleDateString();
  };

  // User avatar component for comments
  const UserAvatar = ({ color, size = 16 }: { color: string; size?: number }) => {
    return (
      <div 
        className='rounded-full flex items-center justify-center text-white text-xs font-bold'
        style={{ 
          backgroundColor: color, 
          width: size, 
          height: size,
          fontSize: size * 0.5
        }}
      >
        {node.createdBy.substring(0, 1).toUpperCase()}
      </div>
    );
  };

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
    if (isComment) {
      // For comments, we'll handle the display differently in the JSX
      return null;
    }
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
  const isLeafNode = !hasChildren;
  
  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showOptionsMenu) {
        // Check if click is outside the menu and the plus button
        const target = event.target as Node;
        const isMenuClick = menuRef.current && menuRef.current.contains(target);
        const isPlusButton = (event.target as HTMLElement)?.getAttribute?.('aria-label') === 'Add child node';
        
        if (!isMenuClick && !isPlusButton) {
          setShowOptionsMenu(false);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showOptionsMenu) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      // Use capture phase to catch events before they're stopped
      document.addEventListener('mousedown', handleClickOutside, true);
      document.addEventListener('click', handleClickOutside, true);
      document.addEventListener('keydown', handleEscape);
      
      // Also close on any drag/pan start
      const handleDragStart = () => {
        if (showOptionsMenu) {
          setShowOptionsMenu(false);
        }
      };
      
      document.addEventListener('dragstart', handleDragStart);
      document.addEventListener('wheel', handleDragStart);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside, true);
        document.removeEventListener('click', handleClickOutside, true);
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('dragstart', handleDragStart);
        document.removeEventListener('wheel', handleDragStart);
      };
    }
  }, [showOptionsMenu]);
  
  const handleAddPrompt = () => {
    setShowOptionsMenu(false);
    if (data.onGenerateChildren) {
      data.onGenerateChildren(node.id);
    }
  };
  
  const handleAddIdea = () => {
    setShowOptionsMenu(false);
    if (data.onAddManualChild) {
      data.onAddManualChild(node.id);
    }
  };

  return (
    <>
      <Handle type='target' position={Position.Top} className='opacity-0' />
      <div
        className={`
          ${isComment ? 'bg-gray-50' : 'bg-white'} box-border flex flex-col gap-6 items-start justify-start p-6 relative
          cursor-pointer transition-all duration-200
          ${selected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
          ${isSelectedForMerge ? 'ring-2 ring-purple-500 shadow-lg' : ''}
          ${isHovered ? 'shadow-xl' : 'shadow-md'}
          ${isComment ? 'border-l-4' : ''}
          ${isMergeMode ? 'hover:ring-2 hover:ring-purple-300' : ''}
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: isComment ? '26rem' : '28rem',
          maxWidth: isComment ? '30rem' : '32rem',
          borderLeftColor: isComment ? userColor : undefined,
          cursor: isMergeMode ? 'pointer' : 'move',
        }}
      >
        <div className='flex flex-col gap-2 items-start justify-start relative shrink-0 w-full'>
          {/* Model info section */}
          <div className='box-border flex gap-2 items-center justify-start px-0 py-2 relative shrink-0'>
            {isComment ? (
              /* Comment header with user info */
              <div className='flex gap-2 items-center justify-start relative shrink-0'>
                <UserAvatar color={userColor || '#6B7280'} size={16} />
                <div className="font-['Inter'] text-xs font-normal leading-4 text-gray-700">
                  {getUsername(node.createdBy)}
                </div>
                <div className="font-['Inter'] text-xs font-normal leading-4 text-gray-500">
                  {formatTimestamp(node.createdAt)}
                </div>
              </div>
            ) : (
              /* Regular model info for ideas and manual notes */
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
            )}
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
        
        {/* Plus button for leaf nodes */}
        {isLeafNode && !isManualNote && !isComment && !node.metadata?.isLoading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowOptionsMenu(!showOptionsMenu);
            }}
            className='absolute bottom-3 right-3 w-7 h-7 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors shadow-md'
            aria-label='Add child node'
          >
            <span className='text-sm'>+</span>
          </button>
        )}
        
        {/* Options Menu for Leaf Nodes */}
        {showOptionsMenu && isLeafNode && !isManualNote && !isComment && (
          <div
            ref={menuRef}
            className='absolute bottom-12 right-2 flex flex-col gap-1 p-1 rounded-md shadow-xl bg-gray-700'
            style={{
              minWidth: '160px',
              zIndex: 9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Arrow pointing down to the plus button */}
            <div
              className='absolute -bottom-1 right-3 w-2 h-2 rotate-45 bg-gray-700'
              style={{ zIndex: -1 }}
            />
            
            <button
              onClick={handleAddPrompt}
              className='flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-600 transition-colors text-white text-sm'
            >
              <span>✨</span>
              <span>Add a Prompt</span>
            </button>
            
            <button
              onClick={handleAddIdea}
              className='flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-600 transition-colors text-white text-sm'
            >
              <span>📄</span>
              <span>Add Your Idea</span>
            </button>
          </div>
        )}
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
