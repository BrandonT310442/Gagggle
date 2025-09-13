# Implementation Plan: BrainstormBoard Backend

## Objective
Build a TypeScript backend service with two core AI-powered functions: idea generation and idea merging for a collaborative whiteboard application.

## Scope

### Included
- TypeScript/Node.js backend setup
- Idea generation function with prompt and context support
- Idea merging function with flexible merge strategies
- REST API endpoints for both functions
- Data models and type definitions
- Basic error handling and validation
- LLM provider interface (implementation to be added later)
- Mock LLM provider for development/testing

### Excluded
- Frontend implementation
- Real-time collaboration (WebSockets)
- Authentication/authorization
- Board management CRUD operations
- Database persistence (using in-memory for MVP)
- Drawing/annotation features
- Export functionality

## Technical Approach

### Architecture Pattern
- **Simple Structure**: Direct API handlers with business logic
- **Two Core Functions**: Idea generation and merging in separate folders
- **LLM Provider**: Interface for future implementation
- **Prompts**: Markdown files for prompt templates

### Technology Choices
- **Framework**: Express.js with TypeScript
- **LLM**: Provider interface ready (Groq implementation to be added later)
- **Testing**: Mock provider for development


## Implementation Steps

### Phase 1: Project Setup

1. **Initialize TypeScript Project**
   - Location: `/backend`
   - Dependencies: typescript, express, @types/node, @types/express
   - Validation: `npm run build` succeeds

2. **Setup Express Server**
   - Location: `/backend/src/server.ts`
   - Dependencies: cors, body-parser
   - Validation: Server starts on port 3000

3. **Configure TypeScript**
   - Location: `/backend/tsconfig.json`
   - Dependencies: None
   - Validation: TypeScript compiles

### Phase 2: Core Types

4. **Define All Types and Interfaces**
   - Location: `/backend/src/types.ts`
   - Dependencies: None
   - Validation: Types compile without errors

5. **Setup Input Validation**
   - Location: `/backend/src/utils/validation.ts`
   - Dependencies: zod
   - Validation: Validation functions work

### Phase 3: LLM Provider Setup

6. **Create LLM Provider Interface**
   - Location: `/backend/src/llm/provider.ts`
   - Dependencies: None
   - Validation: Interface properly defined

7. **Create Mock LLM Provider**
   - Location: `/backend/src/llm/mock.ts`
   - Dependencies: None
   - Validation: Returns mock data

### Phase 4: Generation Function

8. **Create Prompt Templates (Markdown)**
   - Location: `/backend/src/generation/prompts/`
   - Files: `generate-ideas.md`, `expand-ideas.md`
   - Validation: Markdown files created

9. **Implement Generation Function**
   - Location: `/backend/src/generation/generate.ts`
   - Dependencies: LLM provider, prompt templates
   - Validation: Function generates ideas

10. **Add Generation API Endpoint**
    - Location: `/backend/src/server.ts`
    - Route: `POST /api/generate`
    - Validation: Endpoint responds

### Phase 5: Merge Function

11. **Create Merge Prompt Templates**
    - Location: `/backend/src/merge/prompts/`
    - Files: `merge-default.md`, `merge-strategies.md`
    - Validation: Markdown files created

12. **Implement Merge Function**
    - Location: `/backend/src/merge/merge.ts`
    - Dependencies: LLM provider, prompt templates
    - Validation: Function merges ideas

13. **Add Merge API Endpoint**
    - Location: `/backend/src/server.ts`
    - Route: `POST /api/merge`
    - Validation: Endpoint responds

### Phase 6: Testing

14. **Write Tests for Generation**
    - Location: `/backend/tests/generation.test.ts`
    - Dependencies: jest, @types/jest
    - Validation: Tests pass

15. **Write Tests for Merge**
    - Location: `/backend/tests/merge.test.ts`
    - Dependencies: jest
    - Validation: Tests pass

## File Structure

```
backend/
├── src/
│   ├── server.ts
│   ├── types.ts
│   ├── generation/
│   │   ├── generate.ts
│   │   └── prompts/
│   │       ├── generate-ideas.md
│   │       └── expand-ideas.md
│   ├── merge/
│   │   ├── merge.ts
│   │   └── prompts/
│   │       ├── merge-default.md
│   │       └── merge-strategies.md
│   ├── llm/
│   │   ├── provider.ts
│   │   └── mock.ts
│   └── utils/
│       └── validation.ts
├── tests/
│   ├── generation.test.ts
│   └── merge.test.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Testing Requirements

### Unit Tests
- `generate.ts`: Test idea generation with various prompts
- `merge.ts`: Test merging with different strategies
- `validation.ts`: Test input validation

### API Tests
- `POST /api/generate`: Test idea generation endpoint
- `POST /api/merge`: Test merging endpoint
- Error scenarios: Invalid inputs, missing fields

### Manual Validation
- Generate ideas with different prompts
- Merge ideas with and without custom prompts
- Test with parent node context
- Verify response times < 3 seconds

## Risk Assessment

### Technical Risks
- **LLM API Integration**: Deferred to later phase, using mock provider initially
- **Response Time Variability**: Mock provider provides consistent response times for development
- **Token Limit Management**: Will be addressed when actual LLM provider is implemented
- **LLM Response Quality**: Mock provider allows testing business logic independently

### Implementation Risks
- **Complex Prompt Engineering**: Start with simple templates, iterate
- **State Management**: Use in-memory store initially, plan for persistence
- **Type Safety**: Strict TypeScript configuration, comprehensive types
- **Error Handling**: Comprehensive error boundaries and logging

## Success Criteria
- [x] TypeScript backend compiles without errors
- [ ] Idea generation endpoint works with < 3s response
- [ ] Merge endpoint combines ideas intelligently
- [ ] All unit tests passing
- [ ] Integration tests verify API contracts
- [ ] Clean separation of concerns in architecture
- [ ] LLM provider abstraction allows easy switching
- [ ] Comprehensive error handling and logging

## Estimated Complexity
- **Backend Setup**: Low
- **LLM Integration**: Medium
- **Service Implementation**: Medium
- **Testing**: Medium
- **Overall**: Medium

## Next Steps
1. Set up the backend project structure
2. Create types.ts with all interfaces
3. Create LLM provider interface and mock
4. Implement generation function with markdown prompts
5. Implement merge function with markdown prompts
6. Add API endpoints to server.ts
7. Write tests
8. **Later: Implement actual LLM provider (Groq)**