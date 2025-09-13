import { ChatGroq } from '@langchain/groq';
import { ChatCohere } from '@langchain/cohere';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { NodeConfig } from './types';

// Get the appropriate LangChain model based on configuration
export function getLangChainModel(config: NodeConfig): any {
  switch (config.modelProvider) {
    case 'groq':
      return new ChatGroq({
        model: config.modelName,
        temperature: config.temperature ?? 0.7,
        apiKey: process.env.GROQ_API_KEY,
        maxRetries: config.maxRetries ?? 2,
      });
    
    case 'cohere':
      return new ChatCohere({
        model: config.modelName,
        temperature: config.temperature ?? 0.7,
        apiKey: process.env.COHERE_API_KEY,
      });
    
    case 'mock':
      // Return a mock model for testing
      return {
        async invoke(messages: any[]) {
          const lastMessage = messages[messages.length - 1];
          const content = typeof lastMessage === 'string' ? lastMessage : lastMessage.content;
          
          // Mock response based on the request
          if (content.includes('different approaches')) {
            return {
              content: JSON.stringify([
                {
                  id: 'mock-1',
                  approach: 'First mock approach',
                  reasoning: 'This is a mock reasoning for testing'
                },
                {
                  id: 'mock-2',
                  approach: 'Second mock approach',
                  reasoning: 'Another mock reasoning'
                },
                {
                  id: 'mock-3',
                  approach: 'Third mock approach',
                  reasoning: 'Final mock reasoning'
                }
              ])
            };
          }
          
          return {
            content: 'This is a mock generated content response for testing purposes. It simulates the full expansion of an idea into a complete response.'
          };
        }
      } as any;
    
    default:
      throw new Error(`Unsupported model provider: ${config.modelProvider}`);
  }
}

// Generate a unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Parse JSON from LLM response
export function parseJSON<T>(text: string): T | null {
  try {
    // Remove markdown code blocks if present
    const cleaned = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    
    // Try to extract JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    
    return null;
  }
}

// Format messages for LLM
export function formatMessages(systemPrompt: string, userPrompt: string) {
  return [
    new SystemMessage(systemPrompt),
    new HumanMessage(userPrompt)
  ];
}

// Retry logic wrapper
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError;
}