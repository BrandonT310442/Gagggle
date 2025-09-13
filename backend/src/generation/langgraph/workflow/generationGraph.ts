import { StateGraph } from '@langchain/langgraph';
import { GenerationState, NodeConfig } from '../types';
import { IdeaExtractionNode } from '../nodes/ideaExtraction';
import { ContentGenerationNode } from '../nodes/contentGeneration';

export class GenerationWorkflow {
  private graph: any;
  private ideaExtractionNode: IdeaExtractionNode;
  private config: NodeConfig;
  
  constructor(config: NodeConfig) {
    this.config = config;
    this.ideaExtractionNode = new IdeaExtractionNode(config);
    this.graph = this.buildGraph();
  }
  
  private buildGraph() {
    // Create a new state graph
    const workflow = new StateGraph<GenerationState>({
      channels: {
        input: {
          value: (x: any, y: any) => y ?? x,
        },
        ideas: {
          value: (x: any, y: any) => y ?? x,
          default: () => []
        },
        responses: {
          value: (x: any, y: any) => y ?? x,
          default: () => []
        },
        errors: {
          value: (x: any[], y: any[]) => [...(x || []), ...(y || [])],
          default: () => []
        },
        metadata: {
          value: (x: any, y: any) => ({ ...x, ...y }),
          default: () => ({
            startTime: Date.now(),
            nodeExecutions: {}
          })
        }
      }
    });
    
    // Add nodes
    workflow.addNode('extract_ideas', async (state: GenerationState) => {
      console.log('[Workflow] Starting idea extraction...');
      return await this.ideaExtractionNode.execute(state);
    });
    
    workflow.addNode('generate_content', async (state: GenerationState) => {
      console.log('[Workflow] Starting parallel content generation...');
      
      if (!state.ideas || state.ideas.length === 0) {
        console.error('[Workflow] No ideas to generate content for');
        return {
          errors: [{
            nodeId: 'generate_content',
            error: 'No ideas available for content generation',
            timestamp: new Date()
          }]
        };
      }
      
      // Run parallel content generation
      const responses = await ContentGenerationNode.executeParallel(
        state.ideas,
        state,
        this.config
      );
      
      return {
        responses,
        metadata: {
          ...state.metadata,
          endTime: Date.now()
        }
      };
    });
    
    // Add edges from start
    workflow.addEdge('__start__' as any, 'extract_ideas' as any);
    workflow.addEdge('extract_ideas' as any, 'generate_content' as any);
    workflow.addEdge('generate_content' as any, '__end__' as any);
    
    // Compile the graph
    return workflow.compile();
  }
  
  async execute(input: GenerationState['input']): Promise<GenerationState> {
    console.log('[Workflow] Starting generation workflow...');
    const startTime = Date.now();
    
    // Initialize state
    const initialState: GenerationState = {
      input,
      ideas: [],
      responses: [],
      errors: [],
      metadata: {
        startTime,
        nodeExecutions: {}
      }
    };
    
    try {
      // Execute the workflow
      const result = await this.graph.invoke(initialState);
      
      const endTime = Date.now();
      console.log(`[Workflow] Completed in ${endTime - startTime}ms`);
      
      return {
        ...result,
        metadata: {
          ...result.metadata,
          endTime
        }
      };
    } catch (error) {
      console.error('[Workflow] Error executing workflow:', error);
      
      return {
        ...initialState,
        errors: [{
          nodeId: 'workflow',
          error: error instanceof Error ? error.message : 'Unknown workflow error',
          timestamp: new Date()
        }],
        metadata: {
          ...initialState.metadata,
          endTime: Date.now()
        }
      };
    }
  }
}