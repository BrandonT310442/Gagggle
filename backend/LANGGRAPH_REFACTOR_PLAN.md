# LangGraph Architecture Refactor Plan

## Overview
Refactor the generation system to use LangGraph and LangChain with a two-stage approach:
1. **Idea Extraction Node**: Generates N different approaches/ideas based on the input prompt
2. **Parallel Generation Nodes**: Processes each idea in parallel to create full responses

## Architecture Design

### Current Architecture
- Single-step generation using direct LLM calls
- Returns partial responses that need expansion
- Limited control over idea diversity and quality

### Proposed LangGraph Architecture
```
Input Prompt
    ↓
[Idea Extraction Node]
    ↓
Generates N Ideas/Approaches
    ↓
[Parallel Execution]
    ├── [Generation Node 1] → Full Response 1
    ├── [Generation Node 2] → Full Response 2
    ├── [Generation Node 3] → Full Response 3
    └── [Generation Node N] → Full Response N
    ↓
[Result Aggregation]
    ↓
Final Output
```

## Implementation Steps

### Phase 1: Setup Dependencies
1. **Install Required Packages**
   - `npm install langchain @langchain/core`
   - `npm install @langchain/langgraph`
   - `npm install @langchain/groq @langchain/cohere`
   - Update TypeScript dependencies if needed

2. **Create Type Definitions**
   - Define graph state interfaces
   - Create node input/output types
   - Set up workflow configuration types

3. **Project Structure**
   ```
   backend/src/
   ├── generation/
   │   ├── langgraph/
   │   │   ├── nodes/
   │   │   │   ├── ideaExtraction.ts
   │   │   │   └── contentGeneration.ts
   │   │   ├── workflow/
   │   │   │   └── generationGraph.ts
   │   │   ├── types.ts
   │   │   └── utils.ts
   │   └── generate.ts (updated)
   ```

### Phase 2: Create Idea Extraction Node
1. **Build `IdeaExtractionNode`**
   ```typescript
   // Extracts N different approaches from the input prompt
   class IdeaExtractionNode {
     async execute(state: GraphState): Promise<Ideas[]>
   }
   ```

2. **Implement Prompt Engineering**
   - Create prompts that encourage diverse thinking
   - Add constraints for idea differentiation
   - Include domain-specific guidance

3. **Structured Output Parsing**
   - Use Zod or similar for schema validation
   - Ensure consistent idea format
   - Handle edge cases and errors

### Phase 3: Create Generation Node
1. **Build `ContentGenerationNode`**
   ```typescript
   // Expands a single idea into a full response
   class ContentGenerationNode {
     async execute(idea: Idea, context: Context): Promise<FullResponse>
   }
   ```

2. **Make Node Reusable**
   - Stateless design for parallel execution
   - Configurable parameters per execution
   - Consistent output format

3. **Error Handling**
   - Retry logic for failed generations
   - Fallback strategies
   - Proper error propagation

### Phase 4: Build LangGraph Workflow
1. **Create Main Graph**
   ```typescript
   const workflow = new StateGraph<GenerationState>()
     .addNode("extract_ideas", ideaExtractionNode)
     .addNode("generate_content", contentGenerationNode)
     .addConditionalEdges("extract_ideas", routeToParallel)
     .compile();
   ```

2. **Implement Parallel Execution**
   - Use `map` operations for parallel node execution
   - Configure concurrency limits
   - Handle partial failures

3. **State Management**
   - Track progress through nodes
   - Maintain context between stages
   - Store intermediate results

4. **Result Aggregation**
   - Collect all parallel outputs
   - Format final response
   - Add metadata and tracking

### Phase 5: Integration
1. **Update `generateIdeas` Function**
   ```typescript
   export async function generateIdeas(request: GenerateIdeasRequest) {
     const graph = createGenerationGraph(request);
     const result = await graph.invoke(request);
     return formatResponse(result);
   }
   ```

2. **API Endpoint Updates**
   - Maintain backward compatibility
   - Add new parameters for graph configuration
   - Update response format if needed

3. **Configuration Management**
   - Allow switching between old and new implementation
   - Add feature flags for gradual rollout
   - Configure parallel execution limits

### Phase 6: Testing & Optimization
1. **Unit Tests**
   - Test each node independently
   - Validate state transitions
   - Test error scenarios

2. **Integration Tests**
   - End-to-end workflow testing
   - Parallel execution verification
   - Performance benchmarking

3. **Prompt Optimization**
   - A/B test different prompts
   - Measure idea diversity
   - Optimize for quality and speed

4. **Monitoring & Debugging**
   - Add logging at each node
   - Track execution times
   - Monitor success rates

## Technical Details

### State Schema
```typescript
interface GenerationState {
  input: {
    prompt: string;
    count: number;
    constraints?: Constraints;
    parentNode?: ParentNode;
  };
  ideas: Array<{
    id: string;
    approach: string;
    reasoning: string;
  }>;
  responses: Array<{
    ideaId: string;
    content: string;
    metadata: Record<string, any>;
  }>;
  errors: Array<{
    nodeId: string;
    error: string;
    timestamp: Date;
  }>;
}
```

### Node Configuration
```typescript
interface NodeConfig {
  model: string;
  temperature: number;
  maxRetries: number;
  timeout: number;
  parallelism: number;
}
```

## Benefits of New Architecture

1. **Separation of Concerns**
   - Idea generation is separate from content expansion
   - Each node has a single responsibility
   - Easier to maintain and test

2. **Improved Quality**
   - Ideas are generated with diversity in mind
   - Each idea gets dedicated expansion
   - Better consistency in outputs

3. **Performance**
   - Parallel processing of multiple ideas
   - Configurable concurrency
   - Better resource utilization

4. **Flexibility**
   - Easy to add new nodes
   - Configurable workflow paths
   - Support for different generation strategies

5. **Observability**
   - Clear execution flow
   - Better debugging capabilities
   - Performance metrics per node

## Migration Strategy

1. **Phase 1**: Implement new architecture alongside existing
2. **Phase 2**: Add feature flag to switch between implementations
3. **Phase 3**: Gradual rollout with monitoring
4. **Phase 4**: Full migration after validation
5. **Phase 5**: Remove old implementation

## Success Metrics

- **Quality**: Improved diversity and completeness of responses
- **Performance**: Reduced total generation time through parallelization
- **Reliability**: Lower error rates and better error handling
- **Maintainability**: Cleaner code structure and easier debugging

## Next Steps

1. Review and approve plan
2. Set up development environment with LangChain/LangGraph
3. Begin Phase 1 implementation
4. Create proof of concept with basic nodes
5. Iterate based on initial results