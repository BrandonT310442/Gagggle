export interface IdeaNode {
  id: string;
  content: string;
  parentId?: string;
  childIds: string[];
  metadata?: {
    generatedBy?: 'user' | 'ai';
    generationPrompt?: string;
    ideaText?: string;
    isPrompt?: boolean;
    isLoading?: boolean;
    createdAt?: string;
    modelProvider?: string;
    modelName?: string;
    modelLabel?: string;
    isManualNote?: boolean;
    isComment?: boolean;
    isDraft?: boolean;
    [key: string]: any;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  position?: {
    x: number;
    y: number;
  };
}

export interface GenerateIdeasRequest {
  prompt: string;
  displayPrompt?: string; // Optional: what to show in the prompt node (if different from prompt)
  count: number;
  parentNode?: {
    id: string;
    content: string;
  };
  modelConfig?: {
    provider: 'groq' | 'cohere' | 'mock';
    model?: string;
    modelLabel?: string;
  };
  createPromptNode?: boolean;
}

export interface GenerateIdeasResponse {
  success: boolean;
  ideas: IdeaNode[];
  promptUsed: string;
  generationTime: number;
  error?: string;
}

export interface IdeaGraphState {
  nodes: Map<string, IdeaNode>;
  rootNodes: string[];
  selectedNodeId?: string;
  isMergeMode?: boolean;
  selectedNodeIds?: Set<string>;
}

export interface NodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}