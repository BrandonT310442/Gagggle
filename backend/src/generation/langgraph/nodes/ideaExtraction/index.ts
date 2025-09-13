import { GenerationState, Idea, NodeConfig } from '../../types';
import { getLangChainModel, generateId, parseJSON, withRetry } from '../../utils';
import * as fs from 'fs';
import * as path from 'path';

export class IdeaExtractionNode {
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
  
  async execute(state: GenerationState): Promise<Partial<GenerationState>> {
    const startTime = Date.now();
    const nodeId = 'idea-extraction';
    
    try {
      console.log(`[IdeaExtractionNode] Extracting ${state.input.count} ideas...`);
      
      // Get the LangChain model
      const model = getLangChainModel(this.config);
      
      // Render the prompt template
      const prompt = this.renderPrompt(state);
      
      // Execute with retry logic
      const ideas = await withRetry(async () => {
        const response = await model.invoke([
          {
            role: 'user',
            content: prompt
          }
        ]);
        
        const content = typeof response.content === 'string' 
          ? response.content 
          : response.content.toString();
        
        // Parse the response - expecting a simple array of strings
        const parsed = parseJSON<string[]>(content);
        if (!parsed || !Array.isArray(parsed)) {
          throw new Error('Failed to parse ideas from LLM response');
        }
        
        // Convert strings to Idea objects
        const validatedIdeas: Idea[] = parsed.slice(0, state.input.count).map(text => ({
          id: generateId(),
          text: text
        }));
        
        return validatedIdeas;
      }, this.config.maxRetries ?? 3);
      
      const endTime = Date.now();
      
      console.log(`[IdeaExtractionNode] Successfully extracted ${ideas.length} ideas in ${endTime - startTime}ms`);
      
      // Update state with extracted ideas
      return {
        ideas,
        metadata: {
          ...state.metadata,
          nodeExecutions: {
            ...state.metadata.nodeExecutions,
            [nodeId]: {
              startTime,
              endTime,
              success: true
            }
          }
        }
      };
      
    } catch (error) {
      const endTime = Date.now();
      console.error('[IdeaExtractionNode] Error:', error);
      
      // Update state with error
      return {
        errors: [
          ...state.errors,
          {
            nodeId,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date()
          }
        ],
        metadata: {
          ...state.metadata,
          nodeExecutions: {
            ...state.metadata.nodeExecutions,
            [nodeId]: {
              startTime,
              endTime,
              success: false
            }
          }
        }
      };
    }
  }
  
  private renderPrompt(state: GenerationState): string {
    const { constraints, parentNode } = state.input;
    
    // Prepare template data
    const data: Record<string, any> = {
      count: state.input.count,
      prompt: state.input.prompt,
      style: constraints?.style,
      domain: constraints?.domain,
      parentNode: parentNode,
      parentContent: parentNode?.content,
      
      // Style flags
      isBrief: constraints?.style === 'brief',
      isDetailed: constraints?.style === 'detailed',
      isCreative: constraints?.style === 'creative'
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
}