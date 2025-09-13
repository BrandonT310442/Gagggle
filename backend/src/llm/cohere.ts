import { CohereClientV2 } from 'cohere-ai';
import { BaseLLMProvider } from './provider';
import { LLMGenerationParams, LLMMergeParams, LLMError } from '../types';

export class CohereLLMProvider extends BaseLLMProvider {
  private readonly client: CohereClientV2;
  private model: string;

  constructor(model: string = 'command-r') {
    super();
    const apiKey = process.env.COHERE_API_KEY;
    
    if (!apiKey) {
      throw new LLMError('COHERE_API_KEY not found in environment variables', 'cohere');
    }

    this.client = new CohereClientV2({ token: apiKey });
    this.model = model;
  }

  async generateIdeas(params: LLMGenerationParams): Promise<string[]> {
    const { prompt, maxTokensPerIdea = 150, temperature = 0.7 } = params;

    try {
      // Just pass the prompt directly - it's already fully rendered from generate.ts
      const response = await this.client.chat({
        model: this.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        maxTokens: maxTokensPerIdea * params.count + 200,
        temperature,
      });

      const content = response.message?.content?.[0];
      const generatedText = (content && 'text' in content) ? content.text : '';
      
      // Return raw response for parsing in generate.ts
      return [generatedText];
    } catch (error) {
      console.error('Cohere generation error:', error);
      throw new LLMError(`Failed to generate ideas: ${error instanceof Error ? error.message : 'Unknown error'}`, 'cohere');
    }
  }

  async mergeIdeas(params: LLMMergeParams): Promise<string> {
    const { prompt, maxTokens = 300, temperature = 0.7 } = params;

    try {
      // Just pass the prompt directly - it's already fully rendered from merge.ts
      const response = await this.client.chat({
        model: this.model,
        messages: [
          { role: 'user', content: prompt }
        ],
        maxTokens: maxTokens,
        temperature,
      });

      const content = response.message?.content?.[0];
      const mergedIdea = ((content && 'text' in content) ? content.text : '') || 'Failed to merge ideas';
      
      return mergedIdea;
    } catch (error) {
      console.error('Cohere merge error:', error);
      throw new LLMError(`Failed to merge ideas: ${error instanceof Error ? error.message : 'Unknown error'}`, 'cohere');
    }
  }


  setModel(model: string) {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }
}
