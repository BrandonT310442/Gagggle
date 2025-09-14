const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Merge API types
export interface MergeNodesRequest {
  nodes: Array<{
    id: string;
    content: string;
    metadata?: Record<string, any>;
  }>;
  mergePrompt?: string;
  modelConfig?: {
    provider: 'groq' | 'cohere' | 'mock';
    model?: string;
  };
}

export interface MergeNodesResponse {
  success: boolean;
  mergedIdea: {
    id: string;
    content: string;
    metadata?: Record<string, any>;
  };
  sourceNodeIds: string[];
  generationTime?: number;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

export const apiClient = new ApiClient();

export interface CategorizeRequest {
  nodes: Array<{
    id: string;
    content: string;
  }>;
  modelConfig?: {
    provider: string;
    model?: string;
  };
}

export interface CategorizeResponse {
  success: boolean;
  category: string;
  nodeIds: string[];
  generationTime: number;
}

export async function categorizeNodes(request: CategorizeRequest): Promise<CategorizeResponse> {
  return apiClient.post<CategorizeResponse>('/api/categorize', request);
}

export interface ExportResponse {
  success: boolean;
  content: string;
}

export async function exportGraph(): Promise<ExportResponse> {
  return apiClient.get<ExportResponse>('/api/export');
}

export async function mergeNodes(request: MergeNodesRequest): Promise<MergeNodesResponse> {
  return apiClient.post<MergeNodesResponse>('/api/merge', request);
}