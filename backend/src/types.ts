// Core domain models
export interface IdeaNode {
  id: string;
  boardId: string;
  content: string;
  position?: {
    x: number;
    y: number;
  };
  parentId?: string;
  childIds: string[];
  metadata: {
    tags?: string[];
    category?: string;
    confidence?: number;
    generatedBy: 'ai' | 'user';
    generationPrompt?: string;
    mergedFrom?: string[];
    mergeStrategy?: string;
    style?: string;
    domain?: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Request/Response interfaces

// Idea Generation
export interface GenerateIdeasRequest {
  prompt: string;
  count: number; // Number of ideas to generate (1-10)
  boardId: string;
  parentNode?: {
    id: string;
    content: string;
    metadata?: Record<string, any>;
  };
  constraints?: {
    maxLength?: number;
    style?: 'brief' | 'detailed' | 'creative';
    domain?: string; // e.g., "technical", "marketing", "design"
  };
}

export interface GenerateIdeasResponse {
  success: boolean;
  ideas: IdeaNode[];
  promptUsed: string;
  tokensUsed?: number;
  generationTime: number; // milliseconds
}

// Idea Merging
export interface MergeIdeasRequest {
  boardId: string;
  nodes: Array<{
    id: string;
    content: string;
    metadata?: Record<string, any>;
  }>;
  mergePrompt?: string; // Optional user-provided merge instruction
  mergeStrategy?: 'synthesize' | 'combine' | 'abstract' | 'contrast';
}

export interface MergeIdeasResponse {
  success: boolean;
  mergedIdea: IdeaNode;
  sourceNodeIds: string[];
  mergeStrategy: string;
  tokensUsed?: number;
  generationTime: number;
}

// LLM Provider interfaces
export interface LLMProvider {
  generateIdeas(params: LLMGenerationParams): Promise<string[]>;
  mergeIdeas(params: LLMMergeParams): Promise<string>;
  getTokenCount?(text: string): number;
}

export interface LLMGenerationParams {
  prompt: string;
  count: number;
  maxTokensPerIdea?: number;
  temperature?: number;
  systemPrompt?: string;
  parentContext?: string;
}

export interface LLMMergeParams {
  ideas: string[];
  mergeInstruction?: string;
  strategy: 'synthesize' | 'combine' | 'abstract' | 'contrast';
  maxTokens?: number;
  temperature?: number;
}

// Error types
export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public fields?: Record<string, string>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class LLMError extends APIError {
  constructor(message: string, public provider?: string) {
    super(message, 503, 'LLM_ERROR');
    this.name = 'LLMError';
  }
}