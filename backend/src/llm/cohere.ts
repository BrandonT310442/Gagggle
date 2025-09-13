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
    const { prompt, count, maxTokensPerIdea = 150, temperature = 0.7, systemPrompt, parentContext } = params;

    try {
      const preamble = systemPrompt || `You are an AI assistant that generates creative and practical ideas. Generate exactly ${count} distinct ideas based on the user's prompt. Each idea should be concise but detailed enough to be actionable. Do not use emojis or special characters in your response.`;
      
      let fullPrompt;
      if (parentContext) {
        fullPrompt = `Context: ${parentContext}\n\nPrompt: ${prompt}\n\nGenerate ${count} related ideas, each on a new line starting with a number:`;
      } else {
        fullPrompt = `${prompt}\n\nGenerate ${count} ideas, each on a new line starting with a number:`;
      }

      const response = await this.client.chat({
        model: this.model,
        messages: [
          { role: 'system', content: preamble },
          { role: 'user', content: fullPrompt }
        ],
        maxTokens: maxTokensPerIdea * count + 200,
        temperature,
      });

      const content = response.message?.content?.[0];
      const generatedText = (content && 'text' in content) ? content.text : '';
      
      // Parse response into individual ideas
      const ideas = this.parseIdeasFromResponse(generatedText, count);
      
      return ideas;
    } catch (error) {
      console.error('Cohere generation error:', error);
      throw new LLMError(`Failed to generate ideas: ${error instanceof Error ? error.message : 'Unknown error'}`, 'cohere');
    }
  }

  async mergeIdeas(params: LLMMergeParams): Promise<string> {
    const { ideas, mergeInstruction, strategy, maxTokens = 300, temperature = 0.7 } = params;

    try {
      const preamble = `You are an AI assistant that merges and synthesizes ideas. Your task is to create a cohesive, innovative concept by combining the provided ideas using the specified strategy. Do not use emojis or special characters in your response.`;
      
      let prompt = `Ideas to merge:\n${ideas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}\n\n`;
      
      if (mergeInstruction) {
        prompt += `Merge instruction: ${mergeInstruction}\n\n`;
      }

      switch (strategy) {
        case 'synthesize':
          prompt += 'Create a unified concept that synthesizes the best aspects of all ideas into something new and innovative:';
          break;
        case 'combine':
          prompt += 'Combine all ideas into a comprehensive solution that incorporates each idea as a component:';
          break;
        case 'abstract':
          prompt += 'Extract the core principles from these ideas and create a high-level, abstract concept:';
          break;
        case 'contrast':
          prompt += 'Explore the differences and tensions between these ideas to create something that addresses the contrasts:';
          break;
      }

      const response = await this.client.chat({
        model: this.model,
        messages: [
          { role: 'system', content: preamble },
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

  private parseIdeasFromResponse(response: string, expectedCount: number): string[] {
    // Split by common delimiters and clean up
    const lines = response.split(/\n+/).filter(line => line.trim());
    const ideas: string[] = [];

    for (const line of lines) {
      const cleaned = line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').trim();
      if (cleaned && cleaned.length > 10) { // Filter out very short lines
        ideas.push(cleaned);
      }
    }

    // If we didn't get enough ideas, try different parsing
    if (ideas.length < expectedCount) {
      const fallbackIdeas = response.split(/[.!?]+/).filter(sentence => 
        sentence.trim().length > 20
      ).map(s => s.trim());
      
      ideas.push(...fallbackIdeas.slice(0, expectedCount - ideas.length));
    }

    // Ensure we return exactly the expected count
    return ideas.slice(0, expectedCount);
  }

  setModel(model: string) {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }
}
