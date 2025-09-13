'use client';

import { useState, useCallback } from 'react';
import PromptingBox from './components/PromptingBox';
import FileName from './components/FileName';
import CursorSharing from './components/CursorSharing';
import ShareBar from './components/ShareBar';
import ToolBar from './components/ToolBar';
import NodeGraph from './components/NodeGraph';
import { IdeaGraphProvider, useIdeaGraph } from './contexts/IdeaGraphContext';
import Lottie from 'lottie-react';
import loadingAnimation from '../public/gagggleLoading.json';

function HomePageContent() {
  const [fileName, setFileName] = useState('Untitled Document');
  const [isPanMode, setIsPanMode] = useState(false);
  const { generateIdeas, state, isLoading } = useIdeaGraph();

  const handlePromptSubmit = useCallback(
    async (data: {
      provider: string;
      model?: string;
      modelLabel?: string;
      ideaCount: string;
      prompt: string;
    }) => {
      await generateIdeas({
        prompt: data.prompt,
        count: parseInt(data.ideaCount),
        modelConfig: {
          provider: data.provider as 'groq' | 'cohere' | 'mock',
          model: data.model,
          modelLabel: data.modelLabel,
        },
      });
    },
    [generateIdeas]
  );

  const handleNodeGenerate = useCallback(
    async (nodeId: string) => {
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
    },
    [generateIdeas, state.nodes]
  );

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
        <div
          className='h-screen w-screen relative overflow-hidden'
          style={{
            backgroundColor: '#F8FAFC',
            backgroundImage: 'url(/gagggle-background-spaced.svg)',
            backgroundRepeat: 'repeat',
          }}
        >
          {/* Top UI Elements */}
          <div className='absolute top-4 left-4 w-fit z-20'>
            <FileName
              fileName={fileName}
              onFileNameChange={handleFileNameChange}
            />
          </div>
          <div className='absolute top-4 right-4 w-fit z-20'>
            <ShareBar
              connectedUsers={connectedUsers}
              currentUser={currentUser}
              onExport={handleExport}
            />
          </div>

          {/* ToolBar - Bottom center */}
          <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20'>
            <ToolBar onPanModeChange={setIsPanMode} />
          </div>

          {/* Initial Centered Prompting Box */}
          {!hasNodes && (
            <div className='absolute inset-0 flex items-center justify-center z-10'>
              <div className='w-full max-w-2xl px-4'>
                <PromptingBox
                  onSubmit={handlePromptSubmit}
                  isLoading={isLoading}
                />
              </div>
            </div>
          )}

          {/* Whiteboard with NodeGraph */}
          {hasNodes && (
            <NodeGraph
              onNodeGenerate={handleNodeGenerate}
              isPanMode={isPanMode}
            />
          )}

          {/* Loading state for initial generation */}
          {isLoading && !hasNodes && (
            <div className='absolute inset-0 flex items-center justify-center z-10'>
              <div className='flex flex-col items-center justify-center'>
                <Lottie
                  animationData={loadingAnimation}
                  style={{ width: 200, height: 150 }}
                  loop={true}
                />
                <p className='mt-4 text-gray-600 text-sm'>
                  Generating ideas...
                </p>
              </div>
            </div>
          )}
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
