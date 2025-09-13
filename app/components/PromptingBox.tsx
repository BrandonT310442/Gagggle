'use client';

import { useState } from 'react';

// TypeScript interfaces
interface DropdownProps {
  value: string;
  options: { value: string; label: string; icon?: boolean }[];
  onChange: (value: string) => void;
  placeholder?: string;
}

interface PromptingBoxProps {
  onSubmit?: (data: {
    provider: string;
    ideaCount: string;
    prompt: string;
  }) => void;
}

// SVG Icons as React components - matching Figma design exactly
const CohereIcon = () => {
  const img = "http://localhost:3845/assets/5893bd7ed4010f2c8e54d9e5221aba3a3a316ef2.svg";
  const img1 = "http://localhost:3845/assets/3cb6c3cff6be564cca614b5434e00958972334af.svg";

  return (
    <div className="relative w-4 h-4" data-name="cohere">
      <div className="absolute aspect-[47.6509/48.8571] left-0 right-0 top-1/2 translate-y-[-50%]" data-name="cohere">
        <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[0px] mask-size-[47.651px_48.857px]" data-name="Group" style={{ maskImage: `url('${img}')` }}>
          <img alt="" className="block max-w-none size-full" src={img1} />
        </div>
      </div>
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
          {selectedOption?.icon && <CohereIcon />}
          <div className='font-sans text-xs font-normal leading-4 text-black whitespace-nowrap'>
            {selectedOption?.label || placeholder}
          </div>
        </div>
        <ExpandMoreIcon />
      </button>

      {isOpen && (
        <div
          className='absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 min-w-full'
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
              aria-selected={value === option.value}
            >
              {option.icon && <CohereIcon />}
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
export default function PromptingBox({ onSubmit }: PromptingBoxProps) {
  const [llmProvider, setLlmProvider] = useState('cohere');
  const [ideaCount, setIdeaCount] = useState('3');
  const [prompt, setPrompt] = useState('');

  const llmProviders = [{ value: 'cohere', label: 'Cohere', icon: true }];

  const ideaCounts = [
    { value: '1', label: '1 idea' },
    { value: '2', label: '2 ideas' },
    { value: '3', label: '3 ideas' },
    { value: '5', label: '5 ideas' },
  ];

  const handleSubmit = () => {
    if (prompt.trim() && onSubmit) {
      onSubmit({
        provider: llmProvider,
        ideaCount,
        prompt: prompt.trim(),
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

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

        {/* Prompt Input */}
        <div className='min-w-full relative shrink-0'>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Write a prompt to start ideating....'
            className='w-full min-h-[60px] p-0 border-0 bg-transparent resize-none focus:outline-none font-syne text-base font-semibold leading-6 text-slate-500 placeholder:text-slate-500'
            style={{
              fontFamily: 'Syne, sans-serif',
              width: 'min-content',
              minWidth: '100%',
            }}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className='flex gap-2.5 items-center justify-end relative shrink-0 w-full'>
        <button
          type='button'
          onClick={handleSubmit}
          disabled={!prompt.trim()}
          className='bg-black box-border flex gap-6 h-10 items-center justify-end p-2 relative shrink-0 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
          aria-label='Submit prompt'
        >
          <ArrowForwardIcon />
        </button>
      </div>
    </div>
  );
}
