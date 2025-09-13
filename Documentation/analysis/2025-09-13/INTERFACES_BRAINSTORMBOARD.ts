// TypeScript Interfaces for BrainstormBoard Backend

// Core domain models
export interface IdeaNode {
  id: string;
  boardId: string;
  content: string;
  position: {
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
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Board {
  id: string;
  name: string;
  ownerId: string;
  nodes: IdeaNode[];
  initialPrompt?: string;
  collaborators: string[];
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
  nodeIds: string[]; // IDs of nodes to merge (2-5 nodes)
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
  getTokenCount(text: string): number;
}

export interface LLMGenerationParams {
  prompt: string;
  count: number;
  maxTokensPerIdea?: number;
  temperature?: number;
  systemPrompt?: string;
}

export interface LLMMergeParams {
  ideas: string[];
  mergeInstruction?: string;
  strategy: 'synthesize' | 'combine' | 'abstract' | 'contrast';
  maxTokens?: number;
  temperature?: number;
}

// Service interfaces
export interface IdeaGenerationService {
  generate(request: GenerateIdeasRequest): Promise<GenerateIdeasResponse>;
  expand(parentNode: IdeaNode, prompt: string, count: number): Promise<IdeaNode[]>;
}

export interface IdeaMergingService {
  merge(request: MergeIdeasRequest): Promise<MergeIdeasResponse>;
  suggestMergeStrategy(nodes: IdeaNode[]): Promise<string>;
}

// Repository interfaces
export interface IdeaRepository {
  create(idea: Omit<IdeaNode, 'id'>): Promise<IdeaNode>;
  findById(id: string): Promise<IdeaNode | null>;
  findByBoardId(boardId: string): Promise<IdeaNode[]>;
  update(id: string, updates: Partial<IdeaNode>): Promise<IdeaNode>;
  delete(id: string): Promise<boolean>;
  findByIds(ids: string[]): Promise<IdeaNode[]>;
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

// Configuration types
export interface AppConfig {
  port: number;
  env: 'development' | 'production' | 'test';
  llm: {
    provider: 'openai' | 'anthropic' | 'mock';
    apiKey: string;
    model: string;
    maxRetries: number;
    timeout: number;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
}