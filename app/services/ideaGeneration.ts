import { apiClient } from './api';
import { GenerateIdeasRequest, GenerateIdeasResponse } from '../types/idea';

export class IdeaGenerationService {
  async generateIdeas(request: GenerateIdeasRequest): Promise<GenerateIdeasResponse> {
    try {
      const response = await apiClient.post<GenerateIdeasResponse>(
        '/api/generate',
        request
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to generate ideas');
      }
      
      return response;
    } catch (error) {
      console.error('Error generating ideas:', error);
      throw error;
    }
  }

  async getAvailableModels(provider?: string) {
    const endpoint = provider 
      ? `/api/models?provider=${provider}`
      : '/api/models';
    
    return apiClient.get(endpoint);
  }
}

export const ideaGenerationService = new IdeaGenerationService();