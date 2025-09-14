'use client';

import { useState } from 'react';

interface MergeConfirmationProps {
  selectedCount: number;
  onMerge: (mergePrompt?: string) => void;
  onCancel: () => void;
}

export default function MergeConfirmation({
  selectedCount,
  onMerge,
  onCancel,
}: MergeConfirmationProps) {
  const [mergePrompt, setMergePrompt] = useState('');

  const handleMerge = () => {
    onMerge(mergePrompt.trim() || undefined);
  };

  return (
    <div className='bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex flex-col gap-3'>
      <div className='flex items-center justify-between'>
        <div className='text-sm font-medium text-gray-700'>
          {selectedCount} nodes selected for merge
        </div>
        <button
          onClick={onCancel}
          className='text-gray-500 hover:text-gray-700 text-sm'
          aria-label='Cancel merge'
        >
          ✕
        </button>
      </div>
      
      <input
        type='text'
        value={mergePrompt}
        onChange={(e) => setMergePrompt(e.target.value)}
        placeholder='Optional: Add merge instructions...'
        className='px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-blue-400'
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleMerge();
          }
        }}
      />
      
      <div className='flex gap-2 justify-end'>
        <button
          onClick={onCancel}
          className='px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors'
        >
          Cancel
        </button>
        <button
          onClick={handleMerge}
          className='px-4 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors'
        >
          Merge Selected
        </button>
      </div>
    </div>
  );
}