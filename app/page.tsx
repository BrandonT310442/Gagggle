'use client';

import { useState } from 'react';
import PromptingBox from './components/PromptingBox';
import FileName from './components/FileName';
import CursorSharing from './components/CursorSharing';
import ShareBar from './components/ShareBar';
import ToolBar from './components/ToolBar';

export default function HomePage() {
  const [fileName, setFileName] = useState('Untitled Document');

  const handlePromptSubmit = (data: {
    provider: string;
    ideaCount: string;
    prompt: string;
  }) => {
    console.log('Prompt submitted:', data);
    // TODO: Integrate with backend API
  };

  const handleFileNameChange = (newName: string) => {
    setFileName(newName);
  };

  const handleExport = () => {
    console.log('Exporting...');
    // TODO: Implement export functionality
  };

  return (
    <CursorSharing>
      {({ connectedUsers, currentUser, isConnected }) => (
        <div className='min-h-screen bg-gray-50 relative'>
          <div className='absolute top-4 left-4 w-fit'>
            <FileName fileName={fileName} onFileNameChange={handleFileNameChange} />
          </div>
          <div className='absolute top-4 right-4 w-fit'>
            <ShareBar
              connectedUsers={connectedUsers}
              currentUser={currentUser}
              onExport={handleExport}
            />
          </div>
          <div className='flex items-center justify-center p-4 min-h-screen'>
            <div className='w-full max-w-2xl'>
              <PromptingBox onSubmit={handlePromptSubmit} />
            </div>
          </div>
          <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2'>
            <ToolBar />
          </div>
        </div>
      )}
    </CursorSharing>
  );
}
