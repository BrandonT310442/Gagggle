'use client';

import { useState, useCallback } from 'react';
import PromptingBox from './components/PromptingBox';
import FileName from './components/FileName';
import CursorSharing from './components/CursorSharing';
import ShareBar from './components/ShareBar';
import ToolBar from './components/ToolBar';
import NodeGraph from './components/NodeGraph';
import { IdeaGraphProvider, useIdeaGraph } from './contexts/IdeaGraphContext';

function HomePageContent() {
  const [fileName, setFileName] = useState('Untitled Document');
  const { generateIdeas, state } = useIdeaGraph();

  const handlePromptSubmit = useCallback(async (data: {
    provider: string;
    model?: string;
    ideaCount: string;
    prompt: string;
  }) => {
    await generateIdeas({
      prompt: data.prompt,
      count: parseInt(data.ideaCount),
      modelConfig: {
        provider: data.provider as 'groq' | 'cohere' | 'mock',
        model: data.model,
      },
    });
  }, [generateIdeas]);

  const handleNodeGenerate = useCallback(async (nodeId: string) => {
    const node = state.nodes.get(nodeId);
    if (node) {
      const prompt = `Generate related ideas based on: ${node.content}`;
      await generateIdeas({
        prompt,
        count: 3,
        parentNodeId: nodeId,
        modelConfig: {
          provider: 'groq',
          model: 'llama-3.3-70b-versatile',
        },
      });
    }
  }, [generateIdeas, state.nodes]);

  const handleFileNameChange = (newName: string) => {
    setFileName(newName);
  };

  const handleExport = () => {
    console.log('Exporting...');
    // TODO: Implement export functionality
  };

  const hasNodes = state.nodes.size > 0;

  return (
    <CursorSharing>
      {({ connectedUsers, currentUser, isConnected }) => (
        <div className='min-h-screen bg-gray-50 relative'>
          <div className='absolute top-4 left-4 w-fit z-10'>
            <FileName fileName={fileName} onFileNameChange={handleFileNameChange} />
          </div>
          <div className='absolute top-4 right-4 w-fit z-10'>
            <ShareBar
              connectedUsers={connectedUsers}
              currentUser={currentUser}
              onExport={handleExport}
            />
          </div>
          
          <div className='flex flex-col items-center justify-start p-4 min-h-screen pt-20'>
            {!hasNodes && (
              <div className='w-full max-w-2xl mb-8'>
                <PromptingBox onSubmit={handlePromptSubmit} />
              </div>
            )}
            
            {hasNodes && (
              <>
                <div className='w-full max-w-4xl mb-4'>
                  <PromptingBox onSubmit={handlePromptSubmit} />
                </div>
                <div className='w-full max-w-6xl'>
                  <NodeGraph onNodeGenerate={handleNodeGenerate} />
                </div>
              </>
            )}
          </div>
          
          <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10'>
            <ToolBar />
          </div>
        </div>
      )}
    </CursorSharing>
  );
}

export default function HomePage() {
  return (
    <IdeaGraphProvider>
      <HomePageContent />
    </IdeaGraphProvider>
  );
}
