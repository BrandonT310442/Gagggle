'use client';

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { Socket } from 'socket.io-client';
import PromptingBox from './components/PromptingBox';
import FileName from './components/FileName';
import CursorSharing from './components/CursorSharing';
import ShareBar from './components/ShareBar';
import ToolBar from './components/ToolBar';
import NodeGraphFlow from './components/NodeGraphFlow';
import { IdeaGraphProvider, useIdeaGraph } from './contexts/IdeaGraphContext';
import Lottie from 'lottie-react';
import loadingAnimation from '../public/gagggleLoading.json';
import openingAnimation from '../public/gagggleAnimation.json';
import { categorizeNodes, exportGraph } from './services/api';

function HomePageContent() {
  const [fileName, setFileName] = useState('Untitled Document');
  const [isPanMode, setIsPanMode] = useState(false);
  const {
    generateIdeas,
    createEmptyNote,
    createPromptToolNode,
    state,
    isLoading,
    setSocket,
    setUserId,
  } = useIdeaGraph();
  const [currentSocket, setCurrentSocket] = useState<Socket | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string>('');

  // Opening animation state
  const [showOpeningAnimation, setShowOpeningAnimation] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  // Connect socket to IdeaGraphContext when it changes
  useEffect(() => {
    console.log(
      '[HomePage] Socket changed, passing to IdeaGraphContext:',
      !!currentSocket
    );
    if (currentSocket !== null) {
      setSocket(currentSocket);
    }
  }, [currentSocket, setSocket]);

  // Update user ID when it changes
  useEffect(() => {
    console.log(
      '[HomePage] UserId changed, passing to IdeaGraphContext:',
      currentUserId
    );
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, [currentUserId, setUserId]);

  // Handle opening animation and cache clearing
  useEffect(() => {
    // Clear cache on page load
    if ('caches' in window) {
      caches.keys().then((names) => {
        names.forEach((name) => {
          caches.delete(name);
        });
      });
    }

    // Start fade out after animation completes (1.5 seconds at 100fps = 150 frames)
    const animationTimer = setTimeout(() => {
      setFadeOut(true);

      // Remove opening animation after fade out completes
      const fadeTimer = setTimeout(() => {
        setShowOpeningAnimation(false);
      }, 800); // 800ms fade duration

      return () => clearTimeout(fadeTimer);
    }, 1500); // Animation duration

    return () => clearTimeout(animationTimer);
  }, []);

  const handlePromptSubmit = useCallback(
    async (
      data: {
        provider: string;
        model?: string;
        ideaCount: string;
        prompt: string;
      },
      emitIdeaGenerationStart?: () => void,
      emitIdeaGenerationComplete?: () => void,
      emitIdeaGenerationError?: () => void
    ) => {
      const isFirstPrompt = state.nodes.size === 0;

      try {
        // Notify other users that idea generation is starting
        if (emitIdeaGenerationStart) {
          emitIdeaGenerationStart();
        }

        await generateIdeas({
          prompt: data.prompt,
          count: parseInt(data.ideaCount),
          modelConfig: {
            provider: data.provider as 'groq' | 'cohere' | 'mock',
            model: data.model,
          },
          // Center the initial prompt
          position: isFirstPrompt ? { x: 400, y: 100 } : undefined,
        });

        // Notify other users that idea generation completed successfully
        if (emitIdeaGenerationComplete) {
          emitIdeaGenerationComplete();
        }

        // If this was the first prompt, categorize it to generate a title
        if (isFirstPrompt) {
          try {
            const response = await categorizeNodes({
              nodes: [
                {
                  id: 'initial-prompt',
                  content: data.prompt,
                },
              ],
              modelConfig: {
                provider: data.provider,
                model: data.model,
              },
            });

            if (response.success && response.category) {
              setFileName(response.category);
            }
          } catch (error) {
            console.error('Failed to categorize prompt for title:', error);
          }
        }
      } catch (error) {
        console.error('Idea generation failed:', error);
        // Notify other users that idea generation failed
        if (emitIdeaGenerationError) {
          emitIdeaGenerationError();
        }
      }
    },
    [generateIdeas, state.nodes]
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

  const handleExport = async () => {
    try {
      const response = await exportGraph();
      if (response.success && response.content) {
        // Create a blob from the markdown content
        const blob = new Blob([response.content], { type: 'text/markdown' });

        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.md`;

        // Trigger the download
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('Export completed successfully');
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const hasNodes = state.nodes.size > 0;

  // Calculate animation tiling layout
  const animationLayout = useMemo(() => {
    const animationAspectRatio = 1512 / 982; // Original animation dimensions
    const screenWidth =
      typeof window !== 'undefined' ? window.innerWidth : 1920;
    const screenHeight =
      typeof window !== 'undefined' ? window.innerHeight : 1080;

    // Calculate tile size to fit screen width perfectly
    const tileWidth = screenWidth;
    const tileHeight = tileWidth / animationAspectRatio;

    // Center the main animation
    const centerY = screenHeight / 2;
    const mainAnimationTop = centerY - tileHeight / 2;

    // Calculate how many tiles we need above and below
    const tilesAbove = Math.ceil(mainAnimationTop / tileHeight);
    const tilesBelow = Math.ceil(
      (screenHeight - (mainAnimationTop + tileHeight)) / tileHeight
    );

    return {
      tileWidth,
      tileHeight,
      centerY,
      mainAnimationTop,
      tilesAbove,
      tilesBelow,
      totalHeight: (tilesAbove + 1 + tilesBelow) * tileHeight,
    };
  }, []);

  return (
    <CursorSharing>
      {({
        connectedUsers,
        currentUser,
        isConnected,
        socket,
        typingUsers,
        emitTyping,
        stopTyping,
        emitIdeaGenerationStart,
        emitIdeaGenerationComplete,
        emitIdeaGenerationError,
      }) => {
        // Update refs during render (safe) and trigger updates
        if (socketRef.current !== socket) {
          console.log(
            '[HomePage] Socket ref updated, scheduling state update:',
            !!socket
          );
          socketRef.current = socket;
          setTimeout(() => setCurrentSocket(socket), 0);
        }

        if (userIdRef.current !== currentUser.userId) {
          console.log(
            '[HomePage] UserId ref updated, scheduling state update:',
            currentUser.userId
          );
          userIdRef.current = currentUser.userId;
          setTimeout(() => setCurrentUserId(currentUser.userId), 0);
        }

        return (
          <>
            {/* Opening Animation Overlay */}
            {showOpeningAnimation && (
              <div
                className={`fixed inset-0 z-50 bg-white transition-opacity duration-800 overflow-hidden ${
                  fadeOut ? 'opacity-0' : 'opacity-100'
                }`}
              >
                <div className='relative w-full h-screen'>
                  {/* Reflected animations above the center */}
                  {Array.from(
                    { length: animationLayout.tilesAbove },
                    (_, index) => {
                      const reverseIndex =
                        animationLayout.tilesAbove - 1 - index;
                      const isReflected = reverseIndex % 2 === 0;
                      return (
                        <div
                          key={`above-${index}`}
                          className='absolute w-full'
                          style={{
                            top: `${
                              animationLayout.mainAnimationTop -
                              (index + 1) * animationLayout.tileHeight
                            }px`,
                            height: `${animationLayout.tileHeight}px`,
                            transform: isReflected ? 'scaleY(-1)' : 'none',
                          }}
                        >
                          <Lottie
                            animationData={openingAnimation}
                            style={{
                              width: `${animationLayout.tileWidth}px`,
                              height: `${animationLayout.tileHeight}px`,
                            }}
                            loop={false}
                            autoplay={true}
                          />
                        </div>
                      );
                    }
                  )}

                  {/* Main centered animation (normal) */}
                  <div
                    className='absolute w-full'
                    style={{
                      top: `${animationLayout.mainAnimationTop}px`,
                      height: `${animationLayout.tileHeight}px`,
                    }}
                  >
                    <Lottie
                      animationData={openingAnimation}
                      style={{
                        width: `${animationLayout.tileWidth}px`,
                        height: `${animationLayout.tileHeight}px`,
                      }}
                      loop={false}
                      autoplay={true}
                    />
                  </div>

                  {/* Reflected animations below the center */}
                  {Array.from(
                    { length: animationLayout.tilesBelow },
                    (_, index) => {
                      const isReflected = index % 2 === 0;
                      return (
                        <div
                          key={`below-${index}`}
                          className='absolute w-full'
                          style={{
                            top: `${
                              animationLayout.mainAnimationTop +
                              (index + 1) * animationLayout.tileHeight
                            }px`,
                            height: `${animationLayout.tileHeight}px`,
                            transform: isReflected ? 'scaleY(-1)' : 'none',
                          }}
                        >
                          <Lottie
                            animationData={openingAnimation}
                            style={{
                              width: `${animationLayout.tileWidth}px`,
                              height: `${animationLayout.tileHeight}px`,
                            }}
                            loop={false}
                            autoplay={true}
                          />
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* Main Application */}
            <div
              className={`h-screen w-screen relative overflow-hidden transition-opacity duration-300 ${
                showOpeningAnimation && !fadeOut ? 'opacity-0' : 'opacity-100'
              }`}
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
                <ToolBar
                  onPanModeChange={setIsPanMode}
                  onNoteToolClick={createEmptyNote}
                  onPromptToolClick={createPromptToolNode}
                />
              </div>

              {/* Initial Centered Prompting Box */}
              {!hasNodes && (
                <div className='absolute inset-0 flex items-center justify-center z-10 pointer-events-none'>
                  <div className='w-full max-w-2xl px-4 pointer-events-auto'>
                    <PromptingBox
                      onSubmit={(data) =>
                        handlePromptSubmit(
                          data,
                          emitIdeaGenerationStart,
                          emitIdeaGenerationComplete,
                          emitIdeaGenerationError
                        )
                      }
                      isLoading={isLoading}
                      typingUsers={typingUsers}
                      currentUserId={currentUser.userId}
                      onTyping={emitTyping}
                      onStopTyping={stopTyping}
                      connectedUsers={connectedUsers}
                    />
                  </div>
                </div>
              )}

              {/* Always render NodeGraph for panning, even without nodes */}
              <NodeGraphFlow
                onNodeGenerate={handleNodeGenerate}
                isPanMode={isPanMode}
              />

              {/* Loading state for initial generation */}
              {isLoading && !hasNodes && (
                <div className='absolute inset-0 flex items-center justify-center z-10 pointer-events-none'>
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
          </>
        );
      }}
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
