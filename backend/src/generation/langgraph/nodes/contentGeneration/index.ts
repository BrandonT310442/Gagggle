import { GenerationState, Idea, GeneratedContent, NodeConfig } from '../../types';
import { getLangChainModel, withRetry } from '../../utils';
import * as fs from 'fs';
import * as path from 'path';

export class ContentGenerationNode {
  private config: NodeConfig;
  private promptTemplate: string;
  
  constructor(config: NodeConfig) {
    this.config = config;
    // Load prompt template
    this.promptTemplate = fs.readFileSync(
      path.join(__dirname, 'prompt.md'),
      'utf-8'
    );
  }
  
  async execute(idea: Idea, state: GenerationState): Promise<GeneratedContent> {
    const startTime = Date.now();
    const nodeId = `content-generation-${idea.id}`;
    
    try {
      console.log(`[ContentGenerationNode] Generating content for idea: ${idea.text.substring(0, 50)}...`);
      
      // Get the LangChain model
      const model = getLangChainModel(this.config);
      
      // Render the prompt
      const prompt = this.renderPrompt(idea, state);
      
      // Execute with retry logic
      const content = await withRetry(async () => {
        const response = await model.invoke([
          {
            role: 'user',
            content: prompt
          }
        ]);
        
        const responseContent = typeof response.content === 'string' 
          ? response.content 
          : response.content.toString();
        
        // Clean up any potential formatting
        return responseContent.trim();
      }, this.config.maxRetries ?? 3);
      
      const endTime = Date.now();
      
      console.log(`[ContentGenerationNode] Generated content for ${idea.id} in ${endTime - startTime}ms`);
      
      // Return the generated content
      return {
        ideaId: idea.id,
        ideaText: idea.text,
        content,
        metadata: {
          generationTime: endTime - startTime,
          modelProvider: this.config.modelProvider,
          modelName: this.config.modelName
        }
      };
      
    } catch (error) {
      console.error(`[ContentGenerationNode] Error for idea ${idea.id}:`, error);
      
      // Return a fallback response
      return {
        ideaId: idea.id,
        ideaText: idea.text,
        content: `Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          error: true
        }
      };
    }
  }
  
  private renderPrompt(idea: Idea, state: GenerationState): string {
    const { parentNode } = state.input;
    
    // Prepare template data
    const data: Record<string, any> = {
      // Idea details
      ideaText: idea.text,
      
      // Original context
      originalPrompt: state.input.prompt,
      
      // Parent context
      parentNode: parentNode,
      parentContent: parentNode?.content
    };
    
    // Render the template
    let rendered = this.promptTemplate;
    
    // Replace simple variables {{variable}}
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const value = data[key];
      rendered = rendered.replace(regex, value !== undefined && value !== null ? String(value) : '');
    });
    
    // Handle conditionals {{#if variable}}...{{/if}}
    rendered = rendered.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
      return data[variable] ? content : '';
    });
    
    return rendered;
  }
  
  // Static method to run multiple nodes in parallel
  static async executeParallel(
    ideas: Idea[], 
    state: GenerationState, 
    config: NodeConfig
  ): Promise<GeneratedContent[]> {
    console.log(`[ContentGenerationNode] Running ${ideas.length} generations in parallel...`);
    
    const nodes = ideas.map(() => new ContentGenerationNode(config));
    const promises = ideas.map((idea, index) => nodes[index].execute(idea, state));
    
    try {
      const results = await Promise.allSettled(promises);
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          // Return error response for failed generations
          console.error(`[ContentGenerationNode] Failed to generate for idea ${ideas[index].id}:`, result.reason);
          return {
            ideaId: ideas[index].id,
            ideaText: ideas[index].text,
            content: `Generation failed: ${result.reason}`,
            metadata: {
              error: true
            }
          };
        }
      });
    } catch (error) {
      console.error('[ContentGenerationNode] Parallel execution error:', error);
      throw error;
    }
  }
}