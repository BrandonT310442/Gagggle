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
    const { prompt, count, maxTokensPerIdea = 150, temperature = 0.7, systemPrompt, parentContext } = params;

    try {
      const systemMessage = systemPrompt || `You are an AI assistant that generates creative and practical ideas. Generate exactly ${count} distinct ideas based on the user's prompt. Each idea should be concise but detailed enough to be actionable. Do not use emojis or special characters in your response.`;
      
      let fullPrompt;
      if (parentContext) {
        fullPrompt = `Context: ${parentContext}\n\nPrompt: ${prompt}\n\nGenerate ${count} related ideas:`;
      } else {
        fullPrompt = `${prompt}\n\nGenerate ${count} ideas:`;
      }

      const completion = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: fullPrompt }
        ],
        model: this.model,
        max_tokens: maxTokensPerIdea * count + 200, // Buffer for formatting
        temperature,
      });

      const response = completion.choices[0]?.message?.content || '';
      
      // Parse response into individual ideas
      const ideas = this.parseIdeasFromResponse(response, count);
      
      return ideas;
    } catch (error) {
      console.error('GROQ generation error:', error);
      throw new LLMError(`Failed to generate ideas: ${error instanceof Error ? error.message : 'Unknown error'}`, 'groq');
    }
  }

  async mergeIdeas(params: LLMMergeParams): Promise<string> {
    const { ideas, mergeInstruction, strategy, maxTokens = 300, temperature = 0.7 } = params;

    try {
      const systemMessage = `You are an AI assistant that merges and synthesizes ideas. Your task is to create a cohesive, innovative concept by combining the provided ideas using the specified strategy. Do not use emojis or special characters in your response.`;
      
      let prompt = `Ideas to merge:\n${ideas.map((idea, i) => `${i + 1}. ${idea}`).join('\n')}\n\n`;
      
      if (mergeInstruction) {
        prompt += `Merge instruction: ${mergeInstruction}\n\n`;
      }

      switch (strategy) {
        case 'synthesize':
          prompt += 'Create a unified concept that synthesizes the best aspects of all ideas into something new and innovative.';
          break;
        case 'combine':
          prompt += 'Combine all ideas into a comprehensive solution that incorporates each idea as a component.';
          break;
        case 'abstract':
          prompt += 'Extract the core principles from these ideas and create a high-level, abstract concept.';
          break;
        case 'contrast':
          prompt += 'Explore the differences and tensions between these ideas to create something that addresses the contrasts.';
          break;
      }

      const completion = await this.client.chat.completions.create({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        model: this.model,
        max_tokens: maxTokens,
        temperature,
      });

      const mergedIdea = completion.choices[0]?.message?.content?.trim() || 'Failed to merge ideas';
      
      return mergedIdea;
    } catch (error) {
      console.error('GROQ merge error:', error);
      throw new LLMError(`Failed to merge ideas: ${error instanceof Error ? error.message : 'Unknown error'}`, 'groq');
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
