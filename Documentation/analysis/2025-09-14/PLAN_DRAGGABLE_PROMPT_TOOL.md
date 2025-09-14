# Implementation Plan: Draggable Prompt Tool

## Objective
Create a smaller, draggable prompt tool that behaves like notes - spawns in empty space when the prompt tool is clicked in the toolbar and can be dragged around the canvas.

## Scope
### Included
- Compact prompt node component (smaller than PromptingBox)
- Draggable functionality using React Flow
- Integration with toolbar prompt tool button
- Real-time collaboration support
- LLM provider and idea count selection
- Submit functionality to generate ideas

### Excluded
- Full-sized PromptingBox replacement
- Modification of existing prompt flow
- Changes to backend API

## Technical Approach
Leverage React Flow's node system to create draggable prompt tool nodes similar to how manual notes work. When submitted, these tool nodes will:
1. Create a permanent prompt node at the top of the graph (like CustomPromptNode)
2. Generate idea nodes as children of that prompt node
3. Remove the draggable prompt tool node after successful submission

## Implementation Steps

### Phase 1: Create Compact Prompt Node Component
1. **Create CustomPromptToolNode Component** - New draggable prompt node
   - Location: `app/components/CustomPromptToolNode.tsx`
   - Dependencies: React Flow, existing prompt logic
   - Validation: Component renders with compact UI

2. **Design Compact UI** - Smaller version of PromptingBox
   - Location: Within CustomPromptToolNode.tsx
   - Dependencies: Existing dropdown components
   - Validation: UI fits in ~300x200px node

3. **Implement Core Prompt Features** - LLM selection, idea count, text input
   - Location: CustomPromptToolNode.tsx
   - Dependencies: Existing model configurations
   - Validation: All dropdowns and input work

### Phase 2: Integrate with Node System
1. **Add Prompt Tool Node Type** - Register in React Flow node types
   - Location: `app/components/NodeGraphFlow.tsx`
   - Dependencies: CustomPromptToolNode component
   - Validation: Node type recognized by React Flow

2. **Create Prompt Tool Node Factory** - Function to create prompt tool instances
   - Location: `app/contexts/IdeaGraphContext.tsx`
   - Dependencies: Node creation pattern from createEmptyNote
   - Validation: Creates unique nodes with positions

3. **Handle Node Positioning** - Place in empty space with grid logic
   - Location: `app/contexts/IdeaGraphContext.tsx`
   - Dependencies: getNextManualNotePosition pattern
   - Validation: No overlap with existing nodes

### Phase 3: Toolbar Integration
1. **Add Prompt Tool Handler** - Connect toolbar button to node creation
   - Location: `app/components/ToolBar.tsx`
   - Dependencies: onPromptToolClick prop
   - Validation: Button click creates node

2. **Wire Handler to Page** - Pass handler from page to toolbar
   - Location: `app/page.tsx`
   - Dependencies: createPromptToolNode from context
   - Validation: Full flow works end-to-end

### Phase 4: Submission and Idea Generation
1. **Create Prompt Node on Submit** - Generate a permanent prompt node at top
   - Location: CustomPromptToolNode.tsx → IdeaGraphContext
   - Dependencies: Prompt node creation logic
   - Validation: Prompt node appears at top of graph

2. **Generate Child Ideas** - Create idea nodes as children of prompt node
   - Location: IdeaGraphContext.tsx
   - Dependencies: generateIdeas with createPromptNode flag
   - Validation: Ideas appear connected to prompt node

3. **Connect to Idea Generation** - Submit prompt to generate ideas
   - Location: CustomPromptToolNode.tsx
   - Dependencies: generateIdeas from IdeaGraphContext
   - Validation: Full flow creates prompt + idea nodes

4. **Handle Tool Node Cleanup** - Remove draggable prompt tool after submission
   - Location: CustomPromptToolNode.tsx
   - Dependencies: Node removal logic
   - Validation: Tool node removed after successful submission

### Phase 5: Real-time Collaboration
1. **Sync Prompt Nodes** - Share prompt nodes with collaborators
   - Location: `app/contexts/IdeaGraphContext.tsx`
   - Dependencies: Socket.io sync-ideas event
   - Validation: Nodes appear for all users

2. **Share Typing State** - Show collaborative typing in prompt nodes
   - Location: CustomPromptToolNode.tsx
   - Dependencies: Existing typing event system
   - Validation: Real-time text updates visible

## Testing Requirements

### Unit Tests
- CustomPromptToolNode: Renders with all UI elements
- CustomPromptToolNode: Handles text input and dropdown changes
- IdeaGraphContext: Creates prompt nodes with unique IDs

### Integration Tests
- Toolbar → Node Creation: Click creates draggable node
- Node → Idea Generation: Submit generates ideas correctly
- Collaboration: Prompt nodes sync between users

### Manual Validation
- Node appears in empty space when prompt tool clicked
- Node can be dragged around the canvas
- Prompt submission generates ideas as expected
- Multiple prompt nodes can exist simultaneously
- Real-time collaboration works for prompt nodes

## Risk Assessment

### Technical Risks
- **Node Type Conflicts**: Use unique node type identifier (promptToolNode)
- **Position Calculation**: Reuse proven grid logic from manual notes
- **State Management**: Keep prompt state within node component

### Implementation Risks
- **UI Space Constraints**: Design compact but usable interface
- **Drag Performance**: React Flow handles drag efficiently
- **Collaboration Complexity**: Follow existing sync patterns

## Success Criteria
- [ ] Prompt tool button creates draggable prompt tool node
- [ ] Tool node has compact, functional prompting UI
- [ ] Tool node can be dragged around canvas
- [ ] Submission creates permanent prompt node at top
- [ ] Ideas generate as children of prompt node
- [ ] Tool node is removed after submission
- [ ] Multiple prompt tool nodes can coexist
- [ ] Real-time collaboration works
- [ ] No regression in existing functionality

## Estimated Complexity
- **Backend**: Low (no changes needed)
- **Frontend**: Medium (new component, integration)
- **Testing**: Low (similar to existing patterns)
- **Overall**: Medium

## Implementation Notes

### Key Files to Reference
- `app/contexts/IdeaGraphContext.tsx:340-391` - createEmptyNote pattern
- `app/components/CustomIdeaNode.tsx` - Node component structure
- `app/components/PromptingBox.tsx` - Prompt UI elements to reuse
- `app/components/NodeGraphFlow.tsx:29-32` - Node type registration

### Design Considerations
- Keep tool node size around 300x200px for usability
- Use same dropdown components but in compact layout
- Consider single-line text input vs textarea
- Auto-focus text input when node created
- Tool node is temporary - removed after submission
- Permanent prompt node created at top (like current flow)
- Ideas generated as children of the prompt node

### Node Flow
1. User clicks prompt tool in toolbar
2. Draggable prompt tool node appears in empty space
3. User fills in prompt and settings
4. On submit:
   - Creates permanent prompt node at top of graph
   - Generates idea nodes as children
   - Removes the draggable tool node
5. Result matches current PromptingBox behavior