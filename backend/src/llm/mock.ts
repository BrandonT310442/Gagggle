import { BaseLLMProvider } from './provider';
import { LLMGenerationParams, LLMMergeParams } from '../types';

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
    const { ideas, mergeInstruction, strategy } = params;
    
    if (mergeInstruction) {
      return `Merged based on "${mergeInstruction}": Combined concepts from ${ideas.length} ideas`;
    }
    
    switch (strategy) {
      case 'synthesize':
        return `Synthesis: A unified approach combining the best aspects of all ${ideas.length} ideas`;
      case 'combine':
        return `Combination: All ${ideas.length} ideas working together in parallel`;
      case 'abstract':
        return `Abstraction: High-level concept derived from the ${ideas.length} core ideas`;
      case 'contrast':
        return `Contrast: Exploring the differences and tensions between the ${ideas.length} ideas`;
      default:
        return `Merged ${ideas.length} ideas into a cohesive concept`;
    }
  }
}