# Implementation Plan: Categorization Endpoint

## Objective
Implement a new backend endpoint that takes multiple nodes as context and creates a unified category for them, following the same architectural pattern as the existing merge functionality with dedicated folders for service logic and prompts.

## Scope

### Included
- New `/api/categorize` endpoint that accepts multiple IdeaNodes
- Categorization service module following merge architecture pattern
- LLM-powered category generation with prompt templates
- Support for custom categorization instructions
- Return category name, description, and reasoning

### Excluded  
- Frontend UI for categorization (separate task)
- Automatic categorization triggers
- Category persistence/storage
- Batch categorization of entire boards

## Technical Approach

Mirror the existing merge architecture pattern:
1. **Service Module**: Core categorization logic in dedicated folder
2. **Prompt Templates**: Markdown-based LLM prompts for category generation
3. **Type Safety**: TypeScript interfaces for requests/responses
4. **LLM Integration**: Reuse existing provider infrastructure
5. **Template System**: Use the same template rendering approach as merge

## Implementation Steps

### Phase 1: Core Categorization Module

1. **Define Categorization Types** - TypeScript interfaces
   - Location: `backend/src/types.ts`
   - Dependencies: Existing `IdeaNode` interface
   - Validation: TypeScript compilation succeeds
   ```typescript
   interface CategorizeRequest {
     nodes: IdeaNode[];           // 2-10 nodes to categorize
     modelConfig?: ModelConfig;    // LLM configuration
   }
   
   interface CategorizeResponse {
     success: boolean;
     category: string;            // The category name
     nodeIds: string[];           // IDs of categorized nodes
     generationTime: number;
   }
   ```

2. **Create Categorization Service** - Main service logic
   - Location: `backend/src/categorize/categorize.ts`
   - Dependencies: LLM providers, template system
   - Validation: Unit tests pass
   ```typescript
   import { CategorizeRequest, CategorizeResponse, IdeaNode } from '../types';
   import { getLLMProvider } from '../llm/provider';
   import * as fs from 'fs';
   import * as path from 'path';
   
   // Load prompt template (same pattern as merge)
   function loadPromptTemplate(filename: string): string {
     const promptPath = path.join(__dirname, 'prompts', filename);
     return fs.readFileSync(promptPath, 'utf-8');
   }
   
   // Template rendering (reuse from merge or extract to shared utils)
   function renderTemplate(template: string, data: Record<string, any>): string {
     // Same implementation as merge
   }
   
   // Parse categorization output
   function parseCategoryOutput(text: string): string {
     // Extract quoted string from LLM response
     const trimmed = text.trim();
     if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
       return trimmed.slice(1, -1);
     }
     return trimmed;
   }
   
   export async function categorizeNodes(request: CategorizeRequest): Promise<CategorizeResponse> {
     // Implementation
   }
   ```

3. **Create Categorization Prompt** - LLM prompt template
   - Location: `backend/src/categorize/prompts/categorize-nodes.md`
   - Dependencies: None
   - Validation: Generates structured output
   ```markdown
   # AI Categorization Assistant
   
   ## System Context
   You are an AI assistant that analyzes groups of ideas and creates meaningful categories that capture their common themes and relationships.
   
   ## Nodes to Categorize
   You are analyzing these {{nodeCount}} nodes:
   {{#each nodes}}
   Node {{@index}}:
   - Content: {{this.content}}
   {{#if this.metadata.tags}}
   - Tags: {{this.metadata.tags}}
   {{/if}}
   {{/each}}
   
   ## Your Task
   Analyze these ideas and create a category that:
   1. Captures the common theme or purpose
   2. Is concise but descriptive
   3. Would help someone understand what these ideas are about
   4. Could be used to group similar ideas in the future
   
   
   ## OUTPUT FORMAT
   
   Respond with ONLY the category name (2-4 words) in quotes:
   
   "Category Name"
   
   Nothing else. Just the quoted category name.
   ```

4. **Add Validation Logic** - Input validation
   - Location: `backend/src/categorize/validation.ts`
   - Dependencies: Zod
   - Validation: Proper error handling
   ```typescript
   import { z } from 'zod';
   
   export const categorizeRequestSchema = z.object({
     nodes: z.array(ideaNodeSchema).min(2).max(10),
     modelConfig: modelConfigSchema.optional()
   });
   
   export function validateCategorizeRequest(data: unknown) {
     return categorizeRequestSchema.parse(data);
   }
   ```

### Phase 2: API Integration

5. **Add Categorization Endpoint** - REST API endpoint
   - Location: `backend/src/server.ts`
   - Dependencies: Categorization service
   - Validation: API returns correct response
   ```typescript
   app.post('/api/categorize', async (req: Request, res: Response) => {
     try {
       // Validate request
       const validatedRequest = validateCategorizeRequest(req.body);
       
       // Call categorization service
       const result = await categorizeNodes(validatedRequest);
       
       // Return response
       res.json(result);
     } catch (error) {
       if (error instanceof z.ZodError) {
         res.status(400).json({ 
           success: false, 
           error: 'Invalid request', 
           details: error.errors 
         });
       } else {
         res.status(500).json({ 
           success: false, 
           error: 'Categorization failed' 
         });
       }
     }
   });
   ```

6. **Update API Documentation** - Document new endpoint
   - Location: `backend/README.md`
   - Dependencies: None
   - Validation: Clear usage examples
   ```markdown
   ### POST /api/categorize
   
   Analyzes multiple nodes and generates a unified category.
   
   **Request Body:**
   ```json
   {
     "nodes": [...],           // Array of IdeaNode objects (2-10)
     "modelConfig": {...}      // Optional model configuration
   }
   ```
   
   **Response:**
   ```json
   {
     "success": true,
     "category": "User Experience",
     "nodeIds": ["id1", "id2"],
     "generationTime": 1234
   }
   ```
   ```

### Phase 3: Advanced Features

7. **Add Multi-Level Categorization** - Support hierarchical categories
   - Location: `backend/src/categorize/categorize.ts`
   - Dependencies: Extended prompt template
   - Validation: Returns nested categories when appropriate
   ```typescript
   // Simplified - just return category name as string
   // Could extend later to return parent category if needed
   ```

8. **Implement Category Variations** - Optional feature for future
   - Location: Could extend main prompt if needed
   - Dependencies: Same categorization service
   - Validation: Returns single best category
   - Note: Keep simple for MVP, one category per request

9. **Add Category Caching** - Cache frequently used categories
   - Location: `backend/src/categorize/cache.ts`
   - Dependencies: Node.js cache or Redis
   - Validation: Cache hit/miss metrics
   ```typescript
   const categoryCache = new Map<string, string>();
   
   function getCacheKey(nodes: IdeaNode[]): string {
     // Generate deterministic cache key from nodes
   }
   ```

## Success Criteria
- [ ] Endpoint accepts 2-10 nodes and returns a category
- [ ] Categories are meaningful and accurate
- [ ] Response returns a clear category name
- [ ] Follows same architecture pattern as merge
- [ ] All tests pass with >80% coverage
- [ ] Documentation is complete with examples
- [ ] Error handling is robust
- [ ] Performance is <2 seconds for typical requests

## Estimated Complexity
- **Backend**: Medium (new module, LLM integration)
- **Testing**: Low-Medium (straightforward test cases)
- **Overall**: Medium

## Future Enhancements

1. **Auto-Categorization**: Automatically categorize new nodes
2. **Category Templates**: Predefined category structures
3. **Bulk Categorization**: Process entire boards
4. **Category Merging**: Combine multiple categories
5. **ML-Based Categorization**: Train custom models
6. **Category Visualization**: Generate category hierarchies
7. **Export Categories**: Include in board exports

## Implementation Notes

### Folder Structure
```
backend/src/
├── categorize/
│   ├── categorize.ts         # Main service logic
│   ├── validation.ts          # Input validation
│   ├── prompts/
│   │   └── categorize-nodes.md  # Single categorization prompt
│   └── __tests__/
│       └── categorize.test.ts
```

### Code Reuse
- Consider extracting template rendering to shared utils
- Reuse LLM provider infrastructure
- Share validation patterns with merge

### Performance Considerations
- Implement request queuing for high load
- Consider streaming responses for large batches
- Add metrics for category quality monitoring

This plan provides a complete implementation path for the categorization endpoint following the established architectural patterns.