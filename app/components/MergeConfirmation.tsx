'use client';

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
  const handleMerge = () => {
    onMerge(undefined);
  };

  return (
    <button
      onClick={handleMerge}
      className='bg-black text-white px-6 py-3 rounded-md flex items-center gap-3 hover:bg-gray-900 transition-colors shadow-lg'
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <path 
          d="M12 18L12 10M12 18L7 13M12 18L17 13M7 6L12 11L17 6" 
          stroke="white" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
      <span className='text-base font-medium'>Merge Ideas</span>
    </button>
  );
}