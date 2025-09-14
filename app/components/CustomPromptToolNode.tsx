'use client';

import { Handle, Position, NodeProps } from 'reactflow';
import { useState, useCallback, useEffect, useRef } from 'react';
import { useIdeaGraph } from '../contexts/IdeaGraphContext';

// Icons exactly from PromptingBox
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

// Dropdown Component exactly from PromptingBox
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

export default function CustomPromptToolNode({ data, selected }: NodeProps) {
  const { generateIdeas, removeNode } = useIdeaGraph();
  const [prompt, setPrompt] = useState('');
  const [llmProvider, setLlmProvider] = useState('groq');
  const [ideaCount, setIdeaCount] = useState('3');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const llmProviders: DropdownOption[] = [
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

  // Auto-focus on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const selectedProvider = llmProviders.find(p => p.value === llmProvider);

    try {
      // If this prompt tool has a parent, we need to create a prompt node manually
      const parentNodeId = data.node.parentId;
      
      if (parentNodeId) {
        // Include context in the generation prompt (for the LLM)
        const contextPrompt = data.node.metadata?.parentContext 
          ? `Context from previous idea: "${data.node.metadata.parentContext}"\n\nUser prompt: ${prompt.trim()}`
          : prompt.trim();
        
        // Generate ideas with a prompt node as intermediate
        // Pass the display prompt separately so backend creates a clean prompt node
        await generateIdeas({
          prompt: contextPrompt, // Send context-enriched prompt to LLM
          displayPrompt: prompt.trim(), // This will be shown in the prompt node
          count: parseInt(ideaCount),
          modelConfig: {
            provider: (selectedProvider?.provider || 'groq') as 'groq' | 'cohere' | 'mock',
            model: selectedProvider?.model,
            modelLabel: selectedProvider?.label,
          },
          createPromptNode: true, // Create a prompt node (will use displayPrompt for content)
          parentNodeId: parentNodeId, // Connect to parent
          position: { 
            x: data.node.position.x,
            y: data.node.position.y + 200 
          },
        });
      } else {
        // No parent - standard flow (toolbar usage)
        await generateIdeas({
          prompt: prompt.trim(),
          count: parseInt(ideaCount),
          modelConfig: {
            provider: (selectedProvider?.provider || 'groq') as 'groq' | 'cohere' | 'mock',
            model: selectedProvider?.model,
            modelLabel: selectedProvider?.label,
          },
          createPromptNode: true,
          position: data.node.position,
        });
      }

      // Remove this tool node after successful submission
      // Small delay to ensure the prompt node is fully rendered first
      if (removeNode) {
        setTimeout(() => {
          removeNode(data.node.id);
        }, 100);
      }
    } catch (error) {
      console.error('Failed to generate ideas:', error);
      setIsSubmitting(false);
    }
  }, [prompt, llmProvider, ideaCount, generateIdeas, removeNode, data.node, llmProviders]);

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

  return (
    <div 
      className='bg-slate-50 box-border flex flex-col gap-4 items-start justify-start p-4 relative w-[400px] border border-dashed border-slate-400'
      style={{ minWidth: '400px' }}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      
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

        {/* Prompt Input */}
        <div className='min-w-full relative shrink-0'>
          <textarea
            ref={inputRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Write a prompt to start ideating....'
            className='w-full min-h-[50px] p-0 border-0 bg-transparent resize-none focus:outline-none font-syne text-base font-semibold leading-6 text-black placeholder:text-slate-500'
            style={{
              fontFamily: 'Syne, sans-serif',
              width: 'min-content',
              minWidth: '100%',
            }}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className='flex gap-2.5 items-center justify-end relative shrink-0 w-full'>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={!prompt.trim() || isSubmitting}
          className='bg-black box-border flex gap-6 h-10 items-center justify-end p-2 relative shrink-0 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
          aria-label='Submit prompt'
        >
          <ArrowForwardIcon />
        </button>
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}