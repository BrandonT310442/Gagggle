import { z } from 'zod';

// Simplified Idea structure
export interface Idea {
  id: string;
  text: string;
}

export interface GeneratedContent {
  ideaId: string;
  ideaText: string;
  content: string;
  metadata?: Record<string, any>;
}

// Graph state interface
export interface GenerationState {
  // Input parameters
  input: {
    prompt: string;
    count: number;
    boardId: string;
    constraints?: {
      style?: 'brief' | 'detailed' | 'creative';
      domain?: string;
      maxLength?: number;
    };
    parentNode?: {
      id: string;
      content: string;
      metadata?: Record<string, any>;
    };
    modelConfig: {
      provider: 'groq' | 'cohere' | 'mock';
      model?: string;
    };
  };
  
  // Extracted ideas from first node
  ideas: Idea[];
  
  // Generated full responses from parallel nodes
  responses: GeneratedContent[];
  
  // Error tracking
  errors: Array<{
    nodeId: string;
    error: string;
    timestamp: Date;
  }>;
  
  // Execution metadata
  metadata: {
    startTime: number;
    endTime?: number;
    nodeExecutions: Record<string, {
      startTime: number;
      endTime: number;
      success: boolean;
    }>;
  };
}

// Node configuration
export interface NodeConfig {
  modelProvider: 'groq' | 'cohere' | 'mock';
  modelName: string;
  temperature?: number;
  maxRetries?: number;
  timeout?: number;
}

// Node execution context
export interface NodeContext {
  config: NodeConfig;
  state: GenerationState;
}