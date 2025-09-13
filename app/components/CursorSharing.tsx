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

interface CursorSharingProps {
  children: (data: {
    connectedUsers: ConnectedUser[];
    currentUser: ConnectedUser;
    isConnected: boolean;
  }) => React.ReactNode;
}

export default function CursorSharing({ children }: CursorSharingProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cursors, setCursors] = useState<Record<string, CursorData>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [userId] = useState(() => Math.random().toString(36).substring(2, 8));
  const [userColor] = useState(() => `hsl(${Math.random() * 360}, 70%, 50%)`);
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

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
      console.log('Connected to room:', roomId);
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
    });

    setSocket(newSocket);
    return () => {
      newSocket.close();
    };
  }, [roomId, userId]);

  const handleMouseMove = (e: React.MouseEvent) => {
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
      onMouseMove={handleMouseMove}
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
        isConnected
      })}
    </div>
  );
}
