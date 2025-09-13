import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { generateIdeas } from './generation/generate';
import { mergeIdeas } from './merge/merge';
import { validateRequest, generateIdeasSchema, mergeIdeasSchema } from './utils/validation';
import { APIError, LLMProviderType } from './types';
import { getAvailableModels, AVAILABLE_MODELS } from './llm/provider';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
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
  app.listen(PORT, () => {
    console.log(`🚀 BrainstormBoard Backend Server running on port ${PORT}`);
    console.log(`🤖 Using LLM Provider: ${process.env.LLM_PROVIDER || 'mock'}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`📍 Generate ideas: POST http://localhost:${PORT}/api/generate`);
    console.log(`📍 Merge ideas: POST http://localhost:${PORT}/api/merge`);
  });
}

export default app;