import { LLMProvider, LLMGenerationParams, LLMMergeParams } from '../types';

// Abstract LLM Provider interface
export abstract class BaseLLMProvider implements LLMProvider {
  abstract generateIdeas(params: LLMGenerationParams): Promise<string[]>;
  abstract mergeIdeas(params: LLMMergeParams): Promise<string>;
  
  getTokenCount?(text: string): number {
    // Simple approximation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}

// Factory to get the appropriate LLM provider
export function getLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER || 'mock';
  
  switch (provider) {
    case 'mock':
      // Dynamically import to avoid circular dependencies
      const { MockLLMProvider } = require('./mock');
      return new MockLLMProvider();
    case 'groq':
      // To be implemented later
      throw new Error('Groq provider not yet implemented');
    default:
      throw new Error(`Unknown LLM provider: ${provider}`);
  }
}