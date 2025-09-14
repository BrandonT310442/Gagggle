'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import Cursor from './Cursor';

interface CursorData {
  userId: string;
  x: number;
  y: number;
  color: string;
}

interface ConnectedUser {
  userId: string;
  color: string;
}

interface TypingUser {
  userId: string;
  text: string;
  timestamp: number;
}

interface CursorSharingProps {
  children: (data: {
    connectedUsers: ConnectedUser[];
    currentUser: ConnectedUser;
    isConnected: boolean;
    socket: Socket | null;
    typingUsers: Map<string, TypingUser>;
    emitTyping: (text: string) => void;
    stopTyping: () => void;
    emitIdeaGenerationStart: () => void;
    emitIdeaGenerationComplete: () => void;
    emitIdeaGenerationError: () => void;
    emitSyncIdeas: (ideas: any[]) => void;
    emitSyncGraphState: (graphState: any) => void;
  }) => React.ReactNode;
}

export default function CursorSharing({ children }: Readonly<CursorSharingProps>) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cursors, setCursors] = useState<Record<string, CursorData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [userId] = useState(() => Math.random().toString(36).substring(2, 8));
  const [userColor] = useState(() => `hsl(${Math.random() * 360}, 70%, 50%)`);
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomFromUrl = urlParams.get('room');

      if (roomFromUrl) {
        setRoomId(roomFromUrl);
      } else {
        const newRoom = Math.random().toString(36).substring(2, 8);
        const newUrl = `${window.location.pathname}?room=${newRoom}`;
        window.history.replaceState({}, '', newUrl);
        setRoomId(newRoom);
      }
    }
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const newSocket = io('http://localhost:3001', {
      query: { roomId, userId },
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('[CursorSharing] Connected to room:', roomId, 'with userId:', userId);
    });

    newSocket.on('disconnect', () => setIsConnected(false));

    newSocket.on('cursor-move', (data: CursorData) => {
      setCursors((prev) => ({ ...prev, [data.userId]: data }));
    });

    newSocket.on('user-left', (leftUserId: string) => {
      setCursors((prev) => {
        const { [leftUserId]: _, ...rest } = prev;
        return rest;
      });
      // Also remove from typing users
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(leftUserId);
        return newMap;
      });
    });

    // Typing collaboration events
    newSocket.on('user-typing', (data: { userId: string; text: string }) => {
      console.log('CursorSharing: Received typing event from userId:', data.userId, 'text:', data.text.substring(0, 30));
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        
        if (data.text.trim() === '') {
          // If the text is empty, remove the user from the map
          console.log('CursorSharing: Removing user from typingUsers (empty text):', data.userId);
          newMap.delete(data.userId);
        } else {
          // If there's text, add/update the user
          newMap.set(data.userId, {
            userId: data.userId,
            text: data.text,
            timestamp: Date.now()
          });
        }
        
        console.log('CursorSharing: Updated typingUsers map size:', newMap.size);
        return newMap;
      });
    });

    newSocket.on('user-stop-typing', (data: { userId: string }) => {
      console.log('CursorSharing: Received stop typing event from userId:', data.userId);
      // Don't remove the user from typingUsers on stop-typing
      // They should only be removed when their text becomes empty
      // This way their text persists even when they pause typing
    });

    // Handle idea generation status events
    newSocket.on('idea-generation-start', (data: { userId: string }) => {
      console.log('CursorSharing: Another user started idea generation:', data.userId);
      // Could show a loading indicator for other users
    });

    newSocket.on('idea-generation-complete', (data: { userId: string }) => {
      console.log('CursorSharing: Another user completed idea generation:', data.userId);
    });

    newSocket.on('idea-generation-error', (data: { userId: string }) => {
      console.log('CursorSharing: Another user had idea generation error:', data.userId);
    });

    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, [roomId, userId]);

  // Use global mouse move listener instead of onMouseMove prop to avoid interfering with child components
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      setMyPosition({ x, y });

      if (socket && isConnected) {
        const data = {
          userId,
          x,
          y,
          color: userColor,
        };
        socket.emit('cursor-move', data);
      }
    };

    if (isClient) {
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
      return () => document.removeEventListener('mousemove', handleGlobalMouseMove);
    }
  }, [isClient, socket, isConnected, userId, userColor]);

  // Emit functions for collaboration
  const emitTyping = (text: string) => {
    if (socket && isConnected) {
      console.log('CursorSharing: Emitting typing:', text.substring(0, 30), 'userId:', userId);
      socket.emit('user-typing', { userId, text });
    } else {
      console.log('CursorSharing: Cannot emit typing - socket:', !!socket, 'connected:', isConnected);
    }
  };

  const stopTyping = () => {
    if (socket && isConnected) {
      console.log('Emitting stop typing');
      socket.emit('user-stop-typing', { userId });
    }
  };

  const emitIdeaGenerationStart = () => {
    if (socket && isConnected) {
      socket.emit('idea-generation-start', { userId });
    }
  };

  const emitIdeaGenerationComplete = () => {
    if (socket && isConnected) {
      socket.emit('idea-generation-complete', { userId });
    }
  };

  const emitIdeaGenerationError = () => {
    if (socket && isConnected) {
      socket.emit('idea-generation-error', { userId });
    }
  };

  const emitSyncIdeas = (ideas: any[]) => {
    if (socket && isConnected) {
      console.log('CursorSharing: Emitting sync-ideas:', ideas.length, 'ideas');
      socket.emit('sync-ideas', { userId, ideas });
    }
  };

  const emitSyncGraphState = (graphState: any) => {
    if (socket && isConnected) {
      console.log('CursorSharing: Emitting sync-graph-state');
      socket.emit('sync-graph-state', { userId, graphState });
    }
  };


  if (!isClient) {
    return (
      <div className='h-screen w-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-gray-500'>Loading...</div>
      </div>
    );
  }

  return (
    <div
      className='relative cursor-none'
      role='application'
    >
      {/* <RoomInfo
        isConnected={isConnected}
        roomId={roomId}
        cursorCount={Object.keys(cursors).length + 1}
        onShareRoom={handleShareRoom}
      /> */}

      <Cursor
        x={myPosition.x}
        y={myPosition.y}
        color={userColor}
        userId={userId}
        isOwn={true}
      />

      {Object.values(cursors).map((cursor) => (
        <Cursor
          key={cursor.userId}
          x={cursor.x}
          y={cursor.y}
          color={cursor.color}
          userId={cursor.userId}
        />
      ))}

      {!isConnected && (
        <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
          <div className='text-center text-gray-500'>
            <div className='text-lg mb-2'>Move your mouse around</div>
            <div className='text-sm'>
              Share the link to see other cursors in real-time
            </div>
            <div className='text-red-500 mt-2'>Connecting...</div>
          </div>
        </div>
      )}

      {children({
        connectedUsers: Object.values(cursors).map(cursor => ({
          userId: cursor.userId,
          color: cursor.color
        })),
        currentUser: {
          userId,
          color: userColor
        },
        isConnected,
        socket,
        typingUsers,
        emitTyping,
        stopTyping,
        emitIdeaGenerationStart,
        emitIdeaGenerationComplete,
        emitIdeaGenerationError,
        emitSyncIdeas,
        emitSyncGraphState
      })}
    </div>
  );
}
