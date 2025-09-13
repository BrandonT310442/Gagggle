import React, { useState, useRef, useEffect } from 'react';
import GaggleLogo from './GaggleLogo';

const imgVector = "http://localhost:3845/assets/ddd27e130c83998242cda61a147ba7d4c91708a7.svg";
const img = "http://localhost:3845/assets/41343ec3fef30e45c0a9c9d82b8e156a651c6e0c.svg";

function ExpandMoreRounded() {
  return (
    <div className="relative size-full">
      <div className="absolute inset-[37.49%_26.7%_35.07%_26.74%]">
        <img alt="" className="block max-w-none size-full" src={imgVector} />
      </div>
    </div>
  );
}

interface FileNameProps {
  readonly fileName?: string;
  readonly onFileNameChange?: (newName: string) => void;
}

export default function FileName({ fileName = "Untitled Document", onFileNameChange }: FileNameProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(fileName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(fileName);
  }, [fileName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== fileName) {
      onFileNameChange?.(trimmedValue);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(fileName);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  return (
    <div className="bg-white box-border content-stretch flex gap-4 items-center justify-start px-6 py-2 relative size-full">
      <div className="h-6 relative shrink-0 w-[20.855px]">
        <GaggleLogo />
      </div>
      <div className="flex flex-col font-medium justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-black text-nowrap">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            className="leading-[20px] bg-transparent border-none outline-none font-medium text-[14px] text-black min-w-0 px-0"
            style={{ width: `${Math.max(editValue.length * 8, 100)}px` }}
          />
        ) : (
          <p
            className="leading-[20px] whitespace-pre cursor-text select-none"
            onDoubleClick={handleDoubleClick}
          >
            {fileName}
          </p>
        )}
      </div>
      <button
        className="overflow-clip relative shrink-0 size-6 cursor-pointer hover:opacity-70 transition-opacity"
        onClick={handleDoubleClick}
        aria-label="Rename file"
      >
        <ExpandMoreRounded />
      </button>
    </div>
  );
}