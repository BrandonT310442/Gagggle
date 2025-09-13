'use client';

import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

// Super minimal cursor sharing - easy to delete later
interface Cursor {
  userId: string;
  x: number;
  y: number;
  color: string;
}

export default function CursorDemo() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [cursors, setCursors] = useState<Record<string, Cursor>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState<string>('');
  const [userId] = useState(() => Math.random().toString(36).substring(2, 8));
  const [userColor] = useState(() => `hsl(${Math.random() * 360}, 70%, 50%)`);
  const [myPosition, setMyPosition] = useState({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState(false);

  // Fix hydration by handling room ID on client side only
  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const roomFromUrl = urlParams.get('room');
      
      if (roomFromUrl) {
        setRoomId(roomFromUrl);
      } else {
        const newRoom = Math.random().toString(36).substring(2, 8);
        // Use replaceState to update URL without page reload
        const newUrl = `${window.location.pathname}?room=${newRoom}`;
        window.history.replaceState({}, '', newUrl);
        setRoomId(newRoom);
      }
    }
  }, []);

  useEffect(() => {
    if (!roomId) return; // Wait for roomId to be set
    
    const newSocket = io('http://localhost:3001', {
      query: { roomId, userId }
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to room:', roomId);
    });
    
    newSocket.on('disconnect', () => setIsConnected(false));
    
    newSocket.on('cursor-move', (data: Cursor) => {
      console.log('Received cursor data:', data);
      setCursors(prev => ({ ...prev, [data.userId]: data }));
    });

    newSocket.on('user-left', (leftUserId: string) => {
      console.log('User left:', leftUserId);
      setCursors(prev => {
        const { [leftUserId]: removed, ...rest } = prev;
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
    
    // Update my position for local display
    setMyPosition({ x, y });
    
    // Send to other users
    if (socket && isConnected) {
      const data = {
        userId,
        x,
        y,
        color: userColor
      };
      console.log('Sending cursor data:', data);
      socket.emit('cursor-move', data);
    }
  };

  const copyRoomLink = () => {
    const url = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(url);
    alert('Room link copied! Open in another tab to see cursors sync.');
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return <div className="h-screen w-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>;
  }

  return (
    <div 
      className="h-screen w-screen bg-gray-50 relative overflow-hidden cursor-none"
      onMouseMove={handleMouseMove}
      role="application"
    >
      {/* Minimal header - easy to delete */}
      <div className="absolute top-4 left-4 bg-white rounded p-3 shadow-lg z-10">
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-mono text-xs">Room: {roomId}</span>
          </div>
          <div className="text-xs text-gray-500">
            Cursors: {Object.keys(cursors).length + 1}
          </div>
          <button 
            onClick={copyRoomLink}
            className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
          >
            Share
          </button>
        </div>
      </div>

      {/* My cursor */}
      <div
        className="absolute pointer-events-none z-30 transform -translate-x-1 -translate-y-1"
        style={{
          left: myPosition.x,
          top: myPosition.y,
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" className="drop-shadow-md">
          <path
            d="M3 3 L17 10 L10 12 L7 17 Z"
            fill={userColor}
            stroke="white"
            strokeWidth="1"
          />
        </svg>
        <div 
          className="absolute left-5 top-0 text-xs bg-black text-white px-1 rounded whitespace-nowrap"
          style={{ color: 'white', backgroundColor: userColor }}
        >
          You ({userId})
        </div>
      </div>

      {/* Other users' cursors */}
      {Object.values(cursors).map((cursor) => (
        <div
          key={cursor.userId}
          className="absolute pointer-events-none z-20 transform -translate-x-1 -translate-y-1"
          style={{
            left: cursor.x,
            top: cursor.y,
          }}
        >
          {/* Simple cursor icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" className="drop-shadow-md">
            <path
              d="M3 3 L17 10 L10 12 L7 17 Z"
              fill={cursor.color}
              stroke="white"
              strokeWidth="1"
            />
          </svg>
          {/* User label */}
          <div 
            className="absolute left-5 top-0 text-xs bg-black text-white px-1 rounded whitespace-nowrap"
            style={{ color: 'white', backgroundColor: cursor.color }}
          >
            {cursor.userId}
          </div>
        </div>
      ))}

      {/* Instructions */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center text-gray-500">
          <div className="text-lg mb-2">Move your mouse around</div>
          <div className="text-sm">Share the link to see other cursors in real-time</div>
          {!isConnected && (
            <div className="text-red-500 mt-2">Connecting...</div>
          )}
        </div>
      </div>
    </div>
  );
}
