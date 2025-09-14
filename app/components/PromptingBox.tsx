'use client';

import { useState, useEffect } from 'react';

// TypeScript interfaces
interface DropdownOption {
  value: string;
  label: string;
  provider?: string;
  model?: string;
}

interface DropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
}

interface TypingUser {
  userId: string;
  text: string;
  timestamp: number;
}

interface PromptingBoxProps {
  onSubmit?: (data: {
    provider: string;
    model?: string;
    modelLabel?: string;
    ideaCount: string;
    prompt: string;
  }) => void;
  isLoading?: boolean;
  // Real-time collaboration props
  typingUsers?: Map<string, TypingUser>;
  currentUserId?: string;
  onTyping?: (text: string) => void;
  onStopTyping?: () => void;
  connectedUsers?: { userId: string; color: string }[];
}

// SVG Icons as React components - matching Figma design exactly
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

const ExpandMoreIcon = () => (
  <svg
    className='w-4 h-4 text-gray-600'
    width='16'
    height='16'
    viewBox='0 0 16 16'
    fill='none'
  >
    <path
      d='M4 6L8 10L12 6'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

const ArrowForwardIcon = () => (
  <svg
    className='w-6 h-6 text-white'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
  >
    <path
      d='M5 12H19M19 12L12 5M19 12L12 19'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
  </svg>
);

// Reusable Dropdown Component matching Figma specs
function Dropdown({ value, options, onChange, placeholder }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  const getModelIcon = (optionValue: string, provider?: string) => {
    if (optionValue.includes('openai') || optionValue.includes('gpt')) {
      return <OpenAIIcon />;
    }
    if (
      optionValue.includes('meta') ||
      optionValue.includes('llama') ||
      provider === 'groq'
    ) {
      return <MetaIcon />;
    }
    if (provider === 'cohere') {
      return <CohereIcon />;
    }
    return null;
  };

  return (
    <div className='relative'>
      <button
        type='button'
        className='bg-white box-border flex gap-2 items-center justify-start p-2 relative shrink-0 border border-transparent hover:border-gray-200 focus:outline-none focus:border-blue-400'
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup='listbox'
      >
        <div className='flex gap-1 items-center justify-start relative shrink-0'>
          {selectedOption &&
            getModelIcon(selectedOption.value, selectedOption.provider)}
          <div className='font-sans text-xs font-normal leading-4 text-black whitespace-nowrap'>
            {selectedOption?.label || placeholder}
          </div>
        </div>
        <ExpandMoreIcon />
      </button>

      {isOpen && (
        <div
          className='absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-full max-h-32 overflow-y-auto'
          role='listbox'
        >
          {options.map((option) => (
            <button
              key={option.value}
              type='button'
              className='w-full px-2 py-2 text-left text-xs hover:bg-gray-50 focus:bg-gray-50 focus:outline-none flex items-center gap-1'
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {getModelIcon(option.value, option.provider)}
              <span className='font-sans text-xs font-normal leading-4 text-black'>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Main PromptingBox Component matching Figma design exactly
export default function PromptingBox({
  onSubmit,
  isLoading = false,
  typingUsers = new Map(),
  currentUserId = '',
  onTyping,
  onStopTyping,
  connectedUsers = [],
}: PromptingBoxProps) {
  const [llmProvider, setLlmProvider] = useState('groq');
  const [ideaCount, setIdeaCount] = useState('3');
  const [prompt, setPrompt] = useState('');
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [collaborativeText, setCollaborativeText] = useState('');

  const llmProviders = [
    {
      value: 'groq-instant',
      label: 'Llama 3.1 8B Instant',
      provider: 'groq',
      model: 'llama-3.1-8b-instant',
    },
    {
      value: 'groq',
      label: 'Llama 3.3 70B',
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
    },
    {
      value: 'openai-120b',
      label: 'GPT OSS 120B',
      provider: 'groq',
      model: 'openai/gpt-oss-120b',
    },
    {
      value: 'openai-20b',
      label: 'GPT OSS 20B',
      provider: 'groq',
      model: 'openai/gpt-oss-20b',
    },
    {
      value: 'cohere-r',
      label: 'Command R',
      provider: 'cohere',
      model: 'command-r',
    },
    {
      value: 'cohere-r-plus',
      label: 'Command R+',
      provider: 'cohere',
      model: 'command-r-plus',
    },
  ];

  const ideaCounts = [
    { value: '1', label: '1 idea' },
    { value: '2', label: '2 ideas' },
    { value: '3', label: '3 ideas' },
    { value: '5', label: '5 ideas' },
  ];

  const handleSubmit = () => {
    if (prompt.trim() && onSubmit && !isLoading) {
      const selectedProvider = llmProviders.find(
        (p) => p.value === llmProvider
      );
      onSubmit({
        provider: selectedProvider?.provider || 'mock',
        model: selectedProvider?.model,
        modelLabel: selectedProvider?.label,
        ideaCount,
        prompt: prompt.trim(),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        // Allow newline for Shift+Enter or Cmd/Ctrl+Enter
        return;
      } else {
        // Submit on plain Enter
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleTyping = (newText: string) => {
    setPrompt(newText);
    
    // Emit typing event for real-time collaboration
    if (onTyping) {
      console.log('Emitting typing event:', newText.substring(0, 30));
      onTyping(newText);
    }

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout to stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      if (onStopTyping) {
        console.log('Emitting stop typing event');
        onStopTyping();
      }
    }, 3000);

    setTypingTimeout(timeout);
  };

  // Sync collaborative text from other users
  useEffect(() => {
    console.log('PromptingBox: typingUsers updated:', typingUsers.size, 'currentUserId:', currentUserId);
    
    // Get all other users (not current user) with text
    const otherUsers = Array.from(typingUsers.values()).filter(
      user => user.userId !== currentUserId
    );
    
    console.log('PromptingBox: other users with text:', otherUsers.length);
    
    if (otherUsers.length > 0) {
      // Use the most recent text from another user
      const mostRecent = otherUsers.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest, otherUsers[0]
      );
      console.log('PromptingBox: setting collaborative text:', mostRecent.text.substring(0, 30));
      setCollaborativeText(mostRecent.text);
    } else {
      // No other users with text - clear collaborative text
      console.log('PromptingBox: no other users with text, clearing collaborative text');
      setCollaborativeText('');
    }
  }, [typingUsers, currentUserId]);

  // Get the color for the collaborating user
  const getCollaboratorColor = () => {
    const otherUsers = Array.from(typingUsers.values()).filter(
      user => user.userId !== currentUserId
    );
    
    if (otherUsers.length > 0) {
      const mostRecent = otherUsers.reduce((latest, current) => 
        current.timestamp > latest.timestamp ? current : latest, otherUsers[0]
      );
      
      // Find the connected user's color
      const connectedUser = connectedUsers.find(user => user.userId === mostRecent.userId);
      return connectedUser?.color || '#3B82F6'; // Default to blue if color not found
    }
    
    return '#3B82F6';
  };

  const collaboratorColor = getCollaboratorColor();

  // Get the display text - show own prompt, with collaborative preview overlay
  const displayText = prompt;

  // Note: otherTypingUsers removed as it's no longer needed with the new UI

  return (
    <div className='bg-slate-50 box-border flex flex-col gap-6 items-start justify-start p-6 relative w-full border border-dashed border-slate-400'>
      {/* Content container */}
      <div className='flex flex-col gap-2 items-start justify-start relative shrink-0 w-full'>
        {/* Dropdowns Row */}
        <div className='flex gap-2 items-start justify-start relative shrink-0'>
          <Dropdown
            value={llmProvider}
            options={llmProviders}
            onChange={setLlmProvider}
            placeholder='Select LLM'
          />
          <Dropdown
            value={ideaCount}
            options={ideaCounts}
            onChange={setIdeaCount}
            placeholder='Select count'
          />
        </div>

        {/* Prompt Input Container */}
        <div className='min-w-full relative shrink-0'>
          {/* User's own text input - Top Row */}
          <div className='mb-2'>
            <textarea
              value={displayText}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder='Write a prompt to start ideating....'
              className='w-full min-h-[60px] p-0 border-0 bg-transparent resize-none focus:outline-none font-syne text-base font-semibold leading-6 text-black placeholder:text-slate-500'
              style={{
                fontFamily: 'Syne, sans-serif',
                width: 'min-content',
                minWidth: '100%',
              }}
            />
          </div>
          
          {/* Collaborator's text - Bottom Row (highlighted in their color) */}
          {collaborativeText && collaborativeText !== prompt && (
            <div 
              className='p-3 rounded border-l-4 mb-2'
              style={{
                backgroundColor: `${collaboratorColor}10`, // Very light background
                borderLeftColor: collaboratorColor,
                borderLeftWidth: '4px',
              }}
            >
              <div className='flex items-center gap-2 mb-1'>
                <div 
                  className='w-2 h-2 rounded-full animate-pulse'
                  style={{ backgroundColor: collaboratorColor }}
                />
                <span 
                  className='text-xs font-medium opacity-75'
                  style={{ color: collaboratorColor }}
                >
                  Collaborator is typing:
                </span>
              </div>
              <div 
                className='font-syne text-base font-semibold leading-6'
                style={{
                  fontFamily: 'Syne, sans-serif',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  color: collaboratorColor,
                  opacity: 0.9,
                }}
              >
                {collaborativeText}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className='flex gap-2.5 items-center justify-end relative shrink-0 w-full'>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={!prompt.trim() || isLoading}
          className='bg-black box-border flex gap-6 h-10 items-center justify-end p-2 relative shrink-0 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
          aria-label='Submit prompt'
        >
          <ArrowForwardIcon />
        </button>
      </div>
    </div>
  );
}