import { LLMProvider, LLMGenerationParams, LLMMergeParams, LLMTitleParams, LLMProviderType, ModelConfig } from '../types';

// Abstract LLM Provider interface
export abstract class BaseLLMProvider implements LLMProvider {
  abstract generateIdeas(params: LLMGenerationParams): Promise<string[]>;
  abstract mergeIdeas(params: LLMMergeParams): Promise<string>;
  abstract generateTitle(params: LLMTitleParams): Promise<string>;
  
  getTokenCount?(text: string): number {
    // Simple approximation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  setModel?(model: string): void {
    // Default implementation - can be overridden
  }

  getModel?(): string {
    return 'default';
  }
}

// Available models for each provider
export const AVAILABLE_MODELS = {
  groq: [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'llama3-groq-8b-8192-tool-use-preview',
    'llama3-groq-70b-8192-tool-use-preview',
    'meta-llama/llama-guard-4-12b',
    'openai/gpt-oss-120b',
    'openai/gpt-oss-20b',
    'gemma2-9b-it'
  ],
  cohere: [
    'command',
    'command-light',
    'command-r',
    'command-r-plus'
  ],
  mock: ['mock-model']
} as const;

// Factory to get the appropriate LLM provider
export function getLLMProvider(config?: ModelConfig): LLMProvider {
  const providerType = config?.provider || (process.env.LLM_PROVIDER as LLMProviderType) || 'mock';
  const model = config?.model;
  
  switch (providerType) {
    case 'mock': {
      const { MockLLMProvider } = require('./mock');
      return new MockLLMProvider();
    }
    case 'groq': {
      const { GroqLLMProvider } = require('./groq');
      return new GroqLLMProvider(model);
    }
    case 'cohere': {
      const { CohereLLMProvider } = require('./cohere');
      return new CohereLLMProvider(model);
    }
    default:
      throw new Error(`Unknown LLM provider: ${providerType}`);
  }
}

// Helper function to get available models for a provider
export function getAvailableModels(provider: LLMProviderType): string[] {
  return [...(AVAILABLE_MODELS[provider] || [])];
}