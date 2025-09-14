import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { generateIdeas } from './generation/generate';
import { generateTitle } from './title/title';
import { mergeIdeas } from './merge/merge';
import { categorizeNodes } from './categorize/categorize';
import { exportGraphToMarkdown, getGraphDebugInfo } from './export/export.service';
import { graphStore } from './graph/graphStore';
import { validateRequest, generateIdeasSchema, mergeIdeasSchema, categorizeNodesSchema, generateTitleSchema } from './utils/validation';
import { APIError, LLMProviderType } from './types';
import { getAvailableModels, AVAILABLE_MODELS } from './llm/provider';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      /^http:\/\/192\.168\.\d+\.\d+:3000$/,  // Allow local network IPs
      /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,   // Allow 10.x.x.x network
      /^http:\/\/172\.\d+\.\d+\.\d+:3000$/   // Allow 172.x.x.x network
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Enhanced room management for cursor sharing
interface UserCursor {
  userId: string;
  x: number;
  y: number;
  color: string;
  lastSeen: number;
}

interface Room {
  users: Set<string>;
  cursors: Map<string, UserCursor>;
}

const rooms = new Map<string, Room>();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    /^http:\/\/192\.168\.\d+\.\d+:3000$/,  // Allow local network IPs
    /^http:\/\/10\.\d+\.\d+\.\d+:3000$/,   // Allow 10.x.x.x network
    /^http:\/\/172\.\d+\.\d+\.\d+:3000$/   // Allow 172.x.x.x network
  ],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    provider: process.env.LLM_PROVIDER || 'mock'
  });
});

// Available models endpoint
app.get('/api/models', (req, res) => {
  try {
    const { provider } = req.query;
    
    if (provider && typeof provider === 'string') {
      // Get models for specific provider
      const providerType = provider as LLMProviderType;
      if (!Object.keys(AVAILABLE_MODELS).includes(providerType)) {
        return res.status(400).json({
          success: false,
          error: `Unknown provider: ${provider}. Available providers: ${Object.keys(AVAILABLE_MODELS).join(', ')}`
        });
      }
      
      res.json({
        success: true,
        provider: providerType,
        models: getAvailableModels(providerType)
      });
    } else {
      // Get all available models
      res.json({
        success: true,
        providers: AVAILABLE_MODELS,
        usage: {
          generateEndpoint: '/api/generate',
          mergeEndpoint: '/api/merge',
          modelConfig: {
            provider: 'groq | cohere | mock',
            model: 'specific_model_name (optional)'
          }
        }
      });
    }
  } catch (error) {
    console.error('Models endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve available models'
    });
  }
});

// Generate ideas endpoint
app.post('/api/generate', 
  validateRequest(generateIdeasSchema),
  async (req, res) => {
    try {
      const result = await generateIdeas(req.body);
      res.json(result);
    } catch (error) {
      console.error('Generation error:', error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error during generation'
        });
      }
    }
  }
);

// Merge ideas endpoint
app.post('/api/merge',
  validateRequest(mergeIdeasSchema),
  async (req, res) => {
    try {
      const result = await mergeIdeas(req.body);
      res.json(result);
    } catch (error) {
      console.error('Merge error:', error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error during merge'
        });
      }
    }
  }
);

// Categorize nodes endpoint
app.post('/api/categorize',
  validateRequest(categorizeNodesSchema),
  async (req, res) => {
    try {
      const result = await categorizeNodes(req.body);
      res.json(result);
    } catch (error) {
      console.error('Categorization error:', error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code
        });
      } else {
        res.status(500).json({ 
          success: false, 
          error: 'Internal server error during categorization' 
        });
      }
    }
  }
);

// Generate title endpoint
app.post('/api/title',
  validateRequest(generateTitleSchema),
  async (req, res) => {
    try {
      const result = await generateTitle(req.body);
      res.json(result);
    } catch (error) {
      console.error('Title generation error:', error);
      if (error instanceof APIError) {
        res.status(error.statusCode).json({
          success: false,
          error: error.message,
          code: error.code
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Internal server error during title generation'
        });
      }
    }
  }
);

// Export endpoints
app.get('/api/export', (req, res) => {
  try {
    const markdown = exportGraphToMarkdown();
    res.json({
      success: true,
      content: markdown
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Export failed'
    });
  }
});

// Debug endpoint to see graph structure
app.get('/api/graph/debug', (req, res) => {
  res.json(getGraphDebugInfo());
});

// Clear graph endpoint (useful for testing)
app.post('/api/graph/clear', (req, res) => {
  graphStore.clear();
  res.json({ success: true, message: 'Graph cleared' });
});

// Enhanced cursor sharing WebSocket handler
io.on('connection', (socket) => {
  const { roomId, userId } = socket.handshake.query;
  
  if (!roomId || !userId) {
    socket.disconnect();
    return;
  }

  console.log(`[Backend] User ${userId} joined room ${roomId}`);
  
  // Join room
  socket.join(roomId as string);
  
  // Initialize room if it doesn't exist
  if (!rooms.has(roomId as string)) {
    rooms.set(roomId as string, {
      users: new Set(),
      cursors: new Map()
    });
  }
  
  const room = rooms.get(roomId as string)!;
  room.users.add(userId as string);
  console.log(`[Backend] Room ${roomId} now has ${room.users.size} users:`, Array.from(room.users));

  // Send existing cursor positions to the new user
  const existingCursors = Array.from(room.cursors.values());
  if (existingCursors.length > 0) {
    console.log(`Sending ${existingCursors.length} existing cursors to new user ${userId}`);
    existingCursors.forEach(cursor => {
      socket.emit('cursor-move', cursor);
    });
  }

  // Handle cursor movement
  socket.on('cursor-move', (data) => {
    // Store/update cursor position in room state
    room.cursors.set(userId as string, {
      ...data,
      lastSeen: Date.now()
    });
    
    // Broadcast to all other users in the room
    socket.to(roomId as string).emit('cursor-move', data);
  });

  // Handle typing events
  socket.on('user-typing', (data) => {
    console.log(`User ${userId} is typing in room ${roomId}:`, data.text.substring(0, 30));
    // Broadcast typing event to all other users in the room
    socket.to(roomId as string).emit('user-typing', data);
  });

  socket.on('user-stop-typing', (data) => {
    console.log(`User ${userId} stopped typing in room ${roomId}`);
    // Broadcast stop typing event to all other users in the room
    socket.to(roomId as string).emit('user-stop-typing', data);
  });

  // Handle idea generation events
  socket.on('idea-generation-start', (data) => {
    console.log(`User ${userId} started idea generation in room ${roomId}`);
    socket.to(roomId as string).emit('idea-generation-start', data);
  });

  socket.on('idea-generation-complete', (data) => {
    console.log(`User ${userId} completed idea generation in room ${roomId}`);
    socket.to(roomId as string).emit('idea-generation-complete', data);
  });

  socket.on('idea-generation-error', (data) => {
    console.log(`User ${userId} had idea generation error in room ${roomId}`);
    socket.to(roomId as string).emit('idea-generation-error', data);
  });

  // Handle idea synchronization - when ideas are generated, sync them to all users
  socket.on('sync-ideas', (data) => {
    console.log(`[Backend] User ${userId} syncing ideas in room ${roomId}:`, data.ideas?.length || 0, 'ideas');
    console.log(`[Backend] Ideas being synced:`, data.ideas?.map((idea: any) => ({ id: idea.id, content: idea.content?.substring(0, 50) })) || []);
    console.log(`[Backend] Broadcasting to room ${roomId}, excluding sender ${userId}`);
    socket.to(roomId as string).emit('sync-ideas', data);
    console.log(`[Backend] sync-ideas broadcast completed`);
  });

  socket.on('sync-graph-state', (data) => {
    console.log(`User ${userId} syncing full graph state in room ${roomId}`);
    socket.to(roomId as string).emit('sync-graph-state', data);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${userId} left room ${roomId}`);
    
    const room = rooms.get(roomId as string);
    if (room) {
      room.users.delete(userId as string);
      room.cursors.delete(userId as string);
      
      if (room.users.size === 0) {
        rooms.delete(roomId as string);
        console.log(`Room ${roomId} deleted (empty)`);
      } else {
        // Notify others that user left
        socket.to(roomId as string).emit('user-left', userId);
      }
    }
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
if (require.main === module) {
  httpServer.listen(PORT, () => {
    console.log(`🚀 BrainstormBoard Backend Server running on all interfaces port ${PORT}`);
    console.log(`🤖 Using LLM Provider: ${process.env.LLM_PROVIDER || 'mock'}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Generate ideas: POST http://localhost:${PORT}/api/generate`);
    console.log(`📍 Merge ideas: POST http://localhost:${PORT}/api/merge`);
    console.log(`🖱️  Real-time cursor sharing enabled`);
    console.log(`🌐 Backend accessible on local network - run 'chmod +x scripts/get-local-ip.sh && ./scripts/get-local-ip.sh' to get your IP`);
  });
}

export default app;