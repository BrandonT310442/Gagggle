'use client';

import { useState } from 'react';

const img = '/cursor-tool.svg';
const img1 = '/pan-tool.svg';
const img2 = '/comment-tool.svg';
const img3 = '/divider.svg';
const img4 = '/note-tool.svg';
const img5 = '/prompt-tool.svg';
const img6 = '/merge-tool.svg';

interface ToolBarProps {
  onPanModeChange?: (isPanMode: boolean) => void;
  onNoteToolClick?: () => void;
  onCommentToolClick?: () => void;
  onPromptToolClick?: () => void;
  onMergeToolClick?: () => void;
  isMergeMode?: boolean;
}

export default function ToolBar({
  onPanModeChange,
  onNoteToolClick,
  onCommentToolClick,
  onPromptToolClick,
  onMergeToolClick,
  isMergeMode = false,
}: Readonly<ToolBarProps>) {
  const [activeToolIndex, setActiveToolIndex] = useState(0); // 0: cursor, 1: pan, 2: comment, etc.

  const handleToolClick = (toolIndex: number) => {
    // Handle comment tool click - single click action, don't keep it active
    if (toolIndex === 2 && onCommentToolClick) {
      // Comment tool is index 2
      onCommentToolClick();
      // Don't change activeToolIndex for comment tool - keep cursor as active
      return;
    }

    // Handle note tool click - single click action, don't keep it active
    if (toolIndex === 3 && onNoteToolClick) {
      // Note tool is index 3
      onNoteToolClick();
      // Don't change activeToolIndex for note tool - keep cursor as active
      return;
    }

    // Handle prompt tool click - single click action, don't keep it active
    if (toolIndex === 4 && onPromptToolClick) {
      // Prompt tool is index 4
      onPromptToolClick();
      // Don't change activeToolIndex for prompt tool - keep cursor as active
      return;
    }

    // Handle merge tool click - toggles merge mode
    if (toolIndex === 5 && onMergeToolClick) {
      // Merge tool is index 5
      onMergeToolClick();
      // Keep merge tool highlighted when in merge mode
      setActiveToolIndex(isMergeMode ? 0 : 5);
      return;
    }

    setActiveToolIndex(toolIndex);
    if (onPanModeChange) {
      onPanModeChange(toolIndex === 1); // Pan tool is index 1
    }
  };

  const getToolStyle = (index: number) => {
    // Special handling for merge tool
    if (index === 5 && isMergeMode) {
      return { backgroundColor: '#45556C' };
    }
    return {
      backgroundColor: activeToolIndex === index ? '#45556C' : 'transparent',
    };
  };

  return (
    <div className='bg-white box-border flex gap-6 items-center justify-start px-6 py-2 border-gray-200 cursor-pointer'>
      {/* Cursor Tool */}
      <button
        className='overflow-clip relative shrink-0 size-6 cursor-pointer transition-colors hover:bg-gray-100'
        style={getToolStyle(0)}
        onClick={() => handleToolClick(0)}
        title='Select tool'
      >
        <div className='absolute inset-[16.09%_16.07%_14.41%_14.41%]'>
          <img
            alt='Cursor tool'
            className={`block max-w-none size-full ${
              activeToolIndex === 0 ? 'brightness-0 invert' : ''
            }`}
            src={img}
          />
        </div>
      </button>

      {/* Pan Tool */}
      <button
        className='overflow-clip relative shrink-0 size-6 cursor-pointer transition-colors hover:bg-gray-100'
        style={getToolStyle(1)}
        onClick={() => handleToolClick(1)}
        title='Pan tool'
      >
        <div className='absolute inset-[12.5%_15.29%_12.5%_17.95%]'>
          <img
            alt='Pan tool'
            className={`block max-w-none size-full ${
              activeToolIndex === 1 ? 'brightness-0 invert' : ''
            }`}
            src={img1}
          />
        </div>
      </button>

      {/* Comment Tool */}
      <button
        className='overflow-clip relative shrink-0 size-6 cursor-pointer transition-colors hover:bg-gray-100'
        style={getToolStyle(2)}
        onClick={() => handleToolClick(2)}
        title='Comment tool'
      >
        <div className='absolute inset-[8.333%]'>
          <img
            alt='Comment tool'
            className={`block max-w-none size-full ${
              activeToolIndex === 2 ? 'brightness-0 invert' : ''
            }`}
            src={img2}
          />
        </div>
      </button>

      {/* Divider */}
      <div className='h-6 relative shrink-0 w-0'>
        <div className='absolute bottom-0 left-[-0.5px] right-[-0.5px] top-0'>
          <img
            alt='Divider'
            className='block max-w-none size-full'
            src={img3}
          />
        </div>
      </div>

      {/* Note Tool */}
      <button
        className='overflow-clip relative shrink-0 size-6 cursor-pointer transition-colors hover:bg-gray-100'
        style={getToolStyle(3)}
        onClick={() => handleToolClick(3)}
        title='Note tool'
      >
        <div className='absolute inset-[16.67%_8.33%]'>
          <img
            alt='Note tool'
            className={`block max-w-none size-full ${
              activeToolIndex === 3 ? 'brightness-0 invert' : ''
            }`}
            src={img4}
          />
        </div>
      </button>

      {/* Prompt Tool */}
      <button
        className='overflow-clip relative shrink-0 size-6 cursor-pointer transition-colors hover:bg-gray-100'
        style={getToolStyle(4)}
        onClick={() => handleToolClick(4)}
        title='Prompt tool'
      >
        <div className='absolute h-[22.118px] left-0 top-0 w-[25.067px]'>
          <img
            alt='Prompt tool'
            className={`block max-w-none size-full ${
              activeToolIndex === 4 ? 'brightness-0 invert' : ''
            }`}
            src={img5}
          />
        </div>
      </button>

      {/* Merge Tool */}
      <button
        className='overflow-clip relative shrink-0 size-6 cursor-pointer transition-colors hover:bg-gray-100'
        style={getToolStyle(5)}
        onClick={() => handleToolClick(5)}
        title='Merge tool'
      >
        <div className='absolute flex inset-[14.24%_22.57%] items-center justify-center'>
          <div className='flex-none h-[17.165px] scale-y-[-100%] w-[13.165px]'>
            <div className='relative size-full'>
              <img
                alt='Merge tool'
                className={`block max-w-none size-full ${
                  (activeToolIndex === 5 || isMergeMode) ? 'brightness-0 invert' : ''
                }`}
                src={img6}
              />
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
