import Groq from 'groq-sdk';
import { BaseLLMProvider } from './provider';
import { LLMGenerationParams, LLMMergeParams, LLMError } from '../types';

export class GroqLLMProvider extends BaseLLMProvider {
  private readonly client: Groq;
  private model: string;

  constructor(model: string = 'llama-3.1-8b-instant') {
    super();
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      throw new LLMError('GROQ_API_KEY not found in environment variables', 'groq');
    }

    this.client = new Groq({ apiKey });
    this.model = model;
  }

  async generateIdeas(params: LLMGenerationParams): Promise<string[]> {
    const { prompt, maxTokensPerIdea = 150, temperature = 0.7 } = params;

    try {
      // Just pass the prompt directly - it's already fully rendered from generate.ts
      const completion = await this.client.chat.completions.create({
        messages: [
          { role: 'user', content: prompt }
        ],
        model: this.model,
        max_tokens: maxTokensPerIdea * params.count + 200, // Buffer for formatting
        temperature,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Return raw response for parsing in generate.ts
      return [response];
    } catch (error) {
      console.error('GROQ generation error:', error);
      throw new LLMError(`Failed to generate ideas: ${error instanceof Error ? error.message : 'Unknown error'}`, 'groq');
    }
  }

  async mergeIdeas(params: LLMMergeParams): Promise<string> {
    const { prompt, maxTokens = 300, temperature = 0.7 } = params;

    try {
      // Just pass the prompt directly - it's already fully rendered from merge.ts
      const completion = await this.client.chat.completions.create({
        messages: [
          { role: 'user', content: prompt }
        ],
        model: this.model,
        max_tokens: maxTokens,
        temperature,
      });

      const response = completion.choices[0]?.message?.content?.trim() || 'Failed to merge ideas';
      
      return response;
    } catch (error) {
      console.error('GROQ merge error:', error);
      throw new LLMError(`Failed to merge ideas: ${error instanceof Error ? error.message : 'Unknown error'}`, 'groq');
    }
  }


  setModel(model: string) {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }
}
