import { GenerateIdeasRequest, GenerateIdeasResponse, IdeaNode } from '../types';
import { GenerationWorkflow } from './langgraph/workflow/generationGraph';
import { NodeConfig } from './langgraph/types';
import { generateId } from '../utils/validation';

// Helper function to get default model for provider
function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'groq':
      return 'llama-3.3-70b-versatile';
    case 'cohere':
      return 'command-r-plus';
    case 'mock':
      return 'mock-model';
    default:
      return 'default-model';
  }
}

export async function generateIdeas(request: GenerateIdeasRequest): Promise<GenerateIdeasResponse> {
  const startTime = Date.now();
  
  try {
    // Use default config if not provided
    const modelConfig = request.modelConfig || { provider: 'mock' as const };
    
    console.log(`[Generate] Starting generation with provider: ${modelConfig.provider}, model: ${modelConfig.model}`);
    
    // Configure the workflow based on request
    const nodeConfig: NodeConfig = {
      modelProvider: modelConfig.provider,
      modelName: modelConfig.model || getDefaultModel(modelConfig.provider),
      temperature: request.constraints?.style === 'creative' ? 0.9 : 0.7,
      maxRetries: 3,
      timeout: 30000
    };
    
    // Create and execute the workflow
    const workflow = new GenerationWorkflow(nodeConfig);
    const result = await workflow.execute({
      prompt: request.prompt,
      count: request.count,
      boardId: request.boardId,
      constraints: request.constraints,
      parentNode: request.parentNode,
      modelConfig: modelConfig
    });
    
    // Check for errors
    if (result.errors && result.errors.length > 0) {
      console.error('[Generate] Workflow errors:', result.errors);
      
      // If we have no responses at all, throw an error
      if (!result.responses || result.responses.length === 0) {
        throw new Error(`Generation failed: ${result.errors[0].error}`);
      }
    }
    
    // Convert responses to IdeaNodes
    const ideas: IdeaNode[] = result.responses.map(response => ({
      id: generateId(),
      boardId: request.boardId,
      content: response.content,
      parentId: request.parentNode?.id,
      childIds: [],
      metadata: {
        generatedBy: 'ai',
        generationPrompt: request.prompt,
        ideaText: response.ideaText,
        style: request.constraints?.style,
        domain: request.constraints?.domain,
        ...response.metadata
      },
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const generationTime = Date.now() - startTime;
    
    console.log(`[Generate] Successfully generated ${ideas.length} ideas in ${generationTime}ms`);
    
    return {
      success: true,
      ideas,
      promptUsed: request.prompt,
      generationTime
    };
    
  } catch (error) {
    const generationTime = Date.now() - startTime;
    console.error('[Generate] Error generating ideas:', error);
    
    // Return error response
    return {
      success: false,
      ideas: [],
      promptUsed: request.prompt,
      generationTime
    };
  }
}