# Implementation Plan: Frontend-Backend Integration for Idea Generation

## Objective
Connect the PromptingBox component to the backend generation endpoint to generate child nodes from prompts and display them with visual connections to parent nodes.

## Scope
### Included
- API client for calling the generation endpoint
- State management for idea nodes and graph structure
- Visual component for displaying generated nodes
- Connection lines between parent and child nodes
- Error handling and loading states

### Excluded  
- Cursor sharing functionality (already implemented)
- Export functionality (separate feature)
- Node merging/categorization (not requested)

## Technical Approach
Implement a client-side API service to communicate with the backend, manage the idea graph state using React state or context, and create a visual node tree component that renders the hierarchical structure with SVG connections.

## Implementation Steps

### Phase 1: API Integration
1. **Create API client service** - Set up axios/fetch client for backend communication
   - Location: `app/services/api.ts`
   - Dependencies: None
   - Validation: Test API call returns expected response format

2. **Add environment configuration** - Configure backend URL for development/production
   - Location: `.env.local`, `app/config/environment.ts`
   - Dependencies: None
   - Validation: Verify correct URL loading per environment

3. **Implement generation API call** - Create function to call `/api/generate` endpoint
   - Location: `app/services/ideaGeneration.ts`
   - Dependencies: API client
   - Validation: Successfully generates ideas from test prompt

### Phase 2: State Management
1. **Create idea node types** - Define TypeScript interfaces for nodes and graph
   - Location: `app/types/idea.ts`
   - Dependencies: Backend types alignment
   - Validation: Types match backend response structure

2. **Implement graph state management** - Create React context or state for managing nodes
   - Location: `app/contexts/IdeaGraphContext.tsx`
   - Dependencies: Idea types
   - Validation: Can add/update/retrieve nodes from state

3. **Connect PromptingBox to state** - Wire up form submission to API and state
   - Location: `app/page.tsx`, `app/components/PromptingBox.tsx`
   - Dependencies: API service, graph context
   - Validation: Form submission creates nodes in state

### Phase 3: Visual Node Display
1. **Create IdeaNode component** - Build component to display individual idea nodes
   - Location: `app/components/IdeaNode.tsx`
   - Dependencies: Idea types
   - Validation: Renders node content with proper styling

2. **Implement NodeGraph component** - Container for rendering node hierarchy
   - Location: `app/components/NodeGraph.tsx`
   - Dependencies: IdeaNode component, graph state
   - Validation: Displays multiple nodes in tree structure

3. **Add SVG connection lines** - Draw lines between parent and child nodes
   - Location: `app/components/NodeConnections.tsx`
   - Dependencies: Node positions from graph
   - Validation: Lines correctly connect parent to children

### Phase 4: Integration and Polish
1. **Add loading states** - Show loading indicators during API calls
   - Location: Various components
   - Dependencies: API state management
   - Validation: Loading UI appears during generation

2. **Implement error handling** - Handle and display API errors gracefully
   - Location: API service, UI components
   - Dependencies: Error boundaries
   - Validation: Errors shown to user without breaking app

3. **Add node interactions** - Enable clicking nodes to generate children
   - Location: `app/components/IdeaNode.tsx`
   - Dependencies: Generation API
   - Validation: Can generate ideas from any node

## Testing Requirements

### Unit Tests
- API service: Mock backend responses and error cases
- Graph state: Add/update/delete node operations
- Node components: Render with different props

### Integration Tests
- Full flow: Prompt submission to node display
- Parent-child relationships: Verify correct connections
- Error scenarios: Network failures, invalid responses

### Manual Validation
- Generate ideas from initial prompt
- Generate child ideas from existing nodes
- Verify visual connections are correct
- Test with different LLM providers and idea counts

## Risk Assessment

### Technical Risks
- **CORS issues**: Ensure backend allows frontend origin
- **State complexity**: Use proven patterns like Context API or Zustand
- **Performance with many nodes**: Implement virtualization if needed

### Implementation Risks  
- **API contract mismatch**: Validate types match backend exactly
- **Layout algorithm complexity**: Start with simple tree layout, iterate

## Success Criteria
- [ ] All implementation steps completed
- [ ] Ideas generated and displayed from prompts
- [ ] Parent-child connections visible
- [ ] No console errors or warnings
- [ ] Responsive and performant with 50+ nodes

## Estimated Complexity
- **Backend**: Low (endpoints already exist)
- **Frontend**: Medium (new components and state)
- **Testing**: Low
- **Overall**: Medium