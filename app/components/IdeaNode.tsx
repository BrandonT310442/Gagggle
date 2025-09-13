'use client';

import { useState } from 'react';
import { IdeaNode as IdeaNodeType } from '../types/idea';

interface IdeaNodeProps {
  node: IdeaNodeType;
  isSelected?: boolean;
  onSelect?: () => void;
  onGenerateChildren?: () => void;
}

export default function IdeaNode({ 
  node, 
  isSelected = false, 
  onSelect,
  onGenerateChildren 
}: IdeaNodeProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const isPromptNode = node.metadata?.isPrompt;
  const isAIGenerated = node.metadata?.generatedBy === 'ai';

  return (
    <div
      className={`
        absolute transform -translate-x-1/2 -translate-y-1/2
        bg-white rounded-lg shadow-md p-4 cursor-pointer
        transition-all duration-200 min-w-[200px] max-w-[300px]
        ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''}
        ${isHovered ? 'shadow-xl scale-105' : ''}
        ${isPromptNode ? 'bg-slate-100 border-2 border-slate-400' : ''}
        ${isAIGenerated ? 'border border-gray-200' : 'border border-gray-300'}
      `}
      style={{
        left: `${node.position?.x || 0}px`,
        top: `${node.position?.y || 0}px`,
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col gap-2">
        {isPromptNode && (
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Prompt
          </div>
        )}
        
        <div className="text-sm text-gray-800 line-clamp-3">
          {node.content}
        </div>

        {node.metadata?.ideaText && (
          <div className="text-xs text-gray-500 italic mt-1">
            {node.metadata.ideaText}
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-400">
            {node.childIds.length > 0 && `${node.childIds.length} children`}
          </div>
          
          {onGenerateChildren && !isPromptNode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onGenerateChildren();
              }}
              className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
            >
              Generate Ideas
            </button>
          )}
        </div>
      </div>
    </div>
  );
}