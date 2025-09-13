# Implementation Plan: Title Generation Endpoint

## Objective
Create a simple API endpoint that takes a user's initial input and generates an appropriate title for their brainstorming session.

## Scope
### Included
- POST `/api/title` endpoint
- Title generation TypeScript logic
- Title generation prompt template
- Request/response validation
- Integration with existing LLM provider system

### Excluded
- Frontend integration
- Title persistence/storage
- Title editing functionality

## Technical Approach
Following the existing pattern from merge endpoint (which uses getLLMProvider), create a title generation feature that:
1. Accepts the first user input text and optional model configuration
2. Uses getLLMProvider to get the appropriate LLM provider instance
3. Loads and renders a prompt template using the same pattern as merge.ts
4. Calls the LLM provider with the rendered prompt
5. Returns the title through a validated API response

## Implementation Steps

### Phase 1: Type Definitions and Validation
1. **Add Title Generation Types** - Define request/response interfaces
   - Location: `/Users/bt/Documents/GitHub/hackthenorth/backend/src/types.ts`
   - Dependencies: None
   - Validation: Types compile without errors

2. **Create Validation Schema** - Add Zod schema for title endpoint
   - Location: `/Users/bt/Documents/GitHub/hackthenorth/backend/src/utils/validation.ts`
   - Dependencies: Title types defined
   - Validation: Schema properly validates input

### Phase 2: Core Implementation
3. **Update LLM Provider Interface** - Add generateTitle method to provider interface
   - Location: `/Users/bt/Documents/GitHub/hackthenorth/backend/src/types.ts` (LLMProvider interface)
   - Dependencies: None
   - Validation: Types compile without errors

4. **Implement generateTitle in Providers** - Add generateTitle method to each provider
   - Locations: 
     - `/Users/bt/Documents/GitHub/hackthenorth/backend/src/llm/groq.ts`
     - `/Users/bt/Documents/GitHub/hackthenorth/backend/src/llm/cohere.ts`
     - `/Users/bt/Documents/GitHub/hackthenorth/backend/src/llm/mock.ts`
   - Dependencies: Updated LLMProvider interface
   - Validation: Each provider implements the method

5. **Create Title Generation Prompt** - Write prompt template
   - Location: `/Users/bt/Documents/GitHub/hackthenorth/backend/src/generation/prompts/generate-title.md`
   - Dependencies: None
   - Validation: Prompt file exists and is readable

6. **Implement Title Generation Logic** - Create title.ts with generation function
   - Location: `/Users/bt/Documents/GitHub/hackthenorth/backend/src/generation/title.ts`
   - Dependencies: Types, prompt template, getLLMProvider
   - Key implementation details:
     - Import getLLMProvider from '../llm/provider'
     - Load prompt template using fs.readFileSync (like merge.ts)
     - Render template with user input
     - Call provider.generateTitle() with rendered prompt
     - Parse and return the title
   - Validation: Function imports and exports correctly

### Phase 3: API Integration
7. **Add Title Endpoint to Server** - Register POST /api/title route
   - Location: `/Users/bt/Documents/GitHub/hackthenorth/backend/src/server.ts`
   - Dependencies: Title generation function, validation schema
   - Validation: Endpoint appears in server startup logs

### Phase 4: Testing
8. **Test Title Generation** - Verify endpoint functionality
   - Location: Manual testing via curl/Postman
   - Dependencies: All implementation complete
   - Validation: Endpoint returns valid title for test input

## Testing Requirements

### Unit Tests
- `generateTitle` function: Validates proper title generation
- Prompt rendering: Ensures template substitution works

### Integration Tests
- API endpoint: Returns 200 with valid input
- API endpoint: Returns 400 with invalid input
- LLM provider integration: Successfully calls provider

### Manual Validation
- Test with various input lengths (short, medium, long)
- Test with different content types (questions, statements, ideas)
- Verify title is concise (3-8 words typical)

## Risk Assessment

### Technical Risks
- **LLM Response Parsing**: Use similar parsing logic to categorize endpoint
- **Prompt Quality**: Keep prompt simple and focused on brevity

### Implementation Risks
- **Pattern Consistency**: Follow existing endpoint patterns exactly
- **Error Handling**: Reuse existing error handling patterns

## Success Criteria
- [ ] All implementation steps completed
- [ ] Endpoint responds with valid titles
- [ ] Integration with existing LLM providers works
- [ ] No regression in existing functionality
- [ ] Title generation completes in < 2 seconds

## Estimated Complexity
- **Backend**: Low
- **Frontend**: N/A (out of scope)
- **Testing**: Low
- **Overall**: Low

## Implementation Details

### Request Format
```json
{
  "input": "User's initial brainstorming prompt or question",
  "modelConfig": {
    "provider": "groq",
    "model": "optional-model-name"
  }
}
```

### Response Format
```json
{
  "success": true,
  "title": "Generated Title Here",
  "generationTime": 1234
}
```

### File Structure
```
backend/src/generation/
├── title.ts           # Title generation logic
└── prompts/
    └── generate-title.md  # Title generation prompt
```

### Key Implementation Pattern (Following merge.ts)
```typescript
// title.ts structure
import { getLLMProvider } from '../llm/provider';
import * as fs from 'fs';
import * as path from 'path';

function loadPromptTemplate(filename: string): string {
  const promptPath = path.join(__dirname, 'prompts', filename);
  return fs.readFileSync(promptPath, 'utf-8');
}

function renderTemplate(template: string, data: Record<string, any>): string {
  // Template rendering logic
}

export async function generateTitle(request: GenerateTitleRequest): Promise<GenerateTitleResponse> {
  const provider = getLLMProvider(request.modelConfig);
  const template = loadPromptTemplate('generate-title.md');
  const prompt = renderTemplate(template, { input: request.input });
  
  const title = await provider.generateTitle({
    prompt: prompt,
    maxTokens: 50,
    temperature: 0.7
  });
  
  return {
    success: true,
    title: parseTitle(title),
    generationTime: Date.now() - startTime
  };
}
```

### LLM Provider Method Signature
```typescript
// Add to LLMProvider interface in types.ts
generateTitle(params: LLMTitleParams): Promise<string>;

// LLMTitleParams type
interface LLMTitleParams {
  prompt: string;
  maxTokens?: number;
  temperature?: number;
}
```