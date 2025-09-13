import { GenerateIdeasRequest, GenerateIdeasResponse, IdeaNode } from '../types';
import { GenerationWorkflow } from './langgraph/workflow/generationGraph';
import { NodeConfig } from './langgraph/types';
import { generateId } from '../utils/validation';
import { graphStore } from '../graph/graphStore';

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
    
    // Create a node for the user's prompt if this is a root generation (no parent)
    let promptNode: IdeaNode | undefined;
    let effectiveParentNode = request.parentNode;
    
    if (!request.parentNode && request.createPromptNode !== false) {
      // Create a node for the user prompt
      promptNode = {
        id: generateId(),
        content: request.prompt,
        parentId: undefined,
        childIds: [],
        metadata: {
          generatedBy: 'user',
          isPrompt: true,
          modelProvider: modelConfig.provider,
          modelName: modelConfig.model || getDefaultModel(modelConfig.provider),
          modelLabel: modelConfig.modelLabel,
          createdAt: new Date().toISOString()
        },
        createdBy: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add prompt node to the graph
      graphStore.addNode(promptNode);
      console.log(`[Generate] Created prompt node: ${promptNode.id}`);
      
      // Use the prompt node as the parent for generated ideas
      effectiveParentNode = {
        id: promptNode.id,
        content: promptNode.content
      };
    }
    
    // Configure the workflow based on request
    const nodeConfig: NodeConfig = {
      modelProvider: modelConfig.provider,
      modelName: modelConfig.model || getDefaultModel(modelConfig.provider),
      temperature: 0.7,
      maxRetries: 3,
      timeout: 30000
    };
    
    // Create and execute the workflow
    const workflow = new GenerationWorkflow(nodeConfig);
    const result = await workflow.execute({
      prompt: request.prompt,
      count: request.count,
      parentNode: effectiveParentNode,
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
      content: response.content,
      parentId: effectiveParentNode?.id,
      childIds: [],
      metadata: {
        generatedBy: 'ai',
        generationPrompt: request.prompt,
        ideaText: response.ideaText,
        ...response.metadata
      },
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const generationTime = Date.now() - startTime;
    
    // Add prompt node and generated ideas to the graph store
    if (promptNode) {
      graphStore.addNode(promptNode);
    }

    for (const idea of ideas) {
      graphStore.addNode(idea);
    }
    
    console.log(`[Generate] Successfully generated ${ideas.length} ideas in ${generationTime}ms`);
    console.log(`[Generate] Graph now contains ${graphStore.getSize()} nodes`);
    
    // Include prompt node if it was created
    const allIdeas = promptNode ? [promptNode, ...ideas] : ideas;

    return {
      success: true,
      ideas: allIdeas,
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