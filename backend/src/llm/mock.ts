import { BaseLLMProvider } from './provider';
import { LLMGenerationParams, LLMMergeParams, LLMTitleParams } from '../types';

export class MockLLMProvider extends BaseLLMProvider {
  async generateIdeas(params: LLMGenerationParams): Promise<string[]> {
    const { count, parentContext } = params;
    const ideas: string[] = [];
    
    const baseIdeas = [
      'Implement user authentication system',
      'Add real-time collaboration features',
      'Create mobile-responsive design',
      'Integrate third-party analytics',
      'Build automated testing pipeline',
      'Optimize database queries for performance',
      'Add dark mode support',
      'Implement caching strategy',
      'Create API documentation',
      'Add internationalization support'
    ];
    
    // If there's parent context, generate related ideas
    if (parentContext) {
      for (let i = 0; i < count; i++) {
        ideas.push(`Sub-idea ${i + 1} for: ${parentContext.substring(0, 50)}...`);
      }
    } else {
      // Return random ideas from base set
      for (let i = 0; i < Math.min(count, baseIdeas.length); i++) {
        ideas.push(baseIdeas[i]);
      }
    }
    
    return ideas;
  }
  
  async mergeIdeas(params: LLMMergeParams): Promise<string> {
    // Mock implementation - just return a simple merged idea
    const { prompt } = params;
    
    // Extract some context from the prompt if possible
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('synthesize')) {
      return 'Synthesis: A unified approach combining the best aspects of all ideas';
    } else if (lowerPrompt.includes('combine')) {
      return 'Combination: All ideas working together in parallel';
    } else if (lowerPrompt.includes('abstract')) {
      return 'Abstraction: High-level concept derived from the core ideas';
    } else if (lowerPrompt.includes('contrast')) {
      return 'Contrast: Exploring the differences and tensions between the ideas';
    } else {
      return 'Merged ideas into a cohesive concept that incorporates all key elements';
    }
  }

  async generateTitle(params: LLMTitleParams): Promise<string> {
    // Mock implementation - generate a simple title based on the prompt
    const { prompt } = params;
    
    // Extract some keywords from the prompt for a mock title
    const words = prompt.toLowerCase().split(/\s+/);
    const keywords = ['app', 'system', 'platform', 'service', 'tool', 'project', 'solution'];
    
    // Find a keyword in the prompt or use a default
    const foundKeyword = keywords.find(k => words.includes(k)) || 'Project';
    
    // Generate mock titles
    const mockTitles = [
      `Innovative ${foundKeyword} Ideas`,
      `${foundKeyword} Brainstorming Session`,
      `Creative ${foundKeyword} Solutions`,
      `${foundKeyword} Development Planning`,
      `Next-Gen ${foundKeyword} Concepts`
    ];
    
    // Return a random mock title
    return mockTitles[Math.floor(Math.random() * mockTitles.length)];
  }
}