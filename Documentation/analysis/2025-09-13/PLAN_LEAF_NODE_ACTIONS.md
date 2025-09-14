# Implementation Plan: Leaf Node Action Menu with Contextual Prompting

## Objective
Add an action menu to leaf nodes (nodes without children) that appears on click, offering "Add a Prompt" and "Add Your Idea" options. When "Add a Prompt" is selected, display a smaller version of PromptingBox that includes the parent node's content as context.

## Scope
### Included
- Action menu component that appears below leaf nodes when clicked
- Detection of leaf nodes (nodes without children)
- "Add a Prompt" button functionality
- "Add Your Idea" button functionality
- Smaller, contextual version of PromptingBox
- Integration of parent node content into prompt context
- Proper positioning and arrow pointing to selected node

### Excluded  
- Modifying non-leaf nodes behavior
- Complex menu animations
- Persistent menu state across page refreshes

## Technical Approach
Create a new ActionMenu component that renders conditionally when a leaf node is selected. Reuse PromptingBox with modifications for a more compact, contextual experience. Position the menu below the selected node with an arrow pointing up.

## Implementation Steps

### Phase 1: Create Action Menu Component
1. **Create ActionMenu component** - Two-button menu with arrow
   - Location: New file `app/components/ActionMenu.tsx`
   - Dependencies: None
   - Validation: Component renders with two styled buttons

2. **Add positioning logic** - Calculate position below selected node
   - Location: `app/components/ActionMenu.tsx`
   - Dependencies: Node position/dimensions
   - Validation: Menu appears directly below node with arrow

3. **Style menu with arrow indicator** - Match design from image
   - Location: `app/components/ActionMenu.tsx`
   - Dependencies: Tailwind CSS
   - Validation: Visual match with provided design

### Phase 2: Integrate Menu with Leaf Nodes
1. **Add leaf node detection** - Check if node has no children
   - Location: `app/components/IdeaNode.tsx`
   - Dependencies: childIds array
   - Validation: Only leaf nodes trigger menu

2. **Add menu trigger on node click** - Show menu when leaf node selected
   - Location: `app/components/NodeGraph.tsx`
   - Dependencies: ActionMenu component, selected node state
   - Validation: Menu appears on leaf node click

3. **Handle menu dismissal** - Close on outside click or action
   - Location: `app/components/NodeGraph.tsx`
   - Dependencies: Click event handlers
   - Validation: Menu closes appropriately

### Phase 3: Create Contextual PromptingBox
1. **Create MiniPromptingBox component** - Smaller variant of PromptingBox
   - Location: New file `app/components/MiniPromptingBox.tsx`
   - Dependencies: PromptingBox component
   - Validation: Compact version renders correctly

2. **Add parent context integration** - Include parent node content
   - Location: `app/components/MiniPromptingBox.tsx`
   - Dependencies: Parent node data
   - Validation: Parent content visible in prompt area

3. **Modify prompt submission** - Include context in API call
   - Location: `app/components/MiniPromptingBox.tsx`
   - Dependencies: IdeaGraph context
   - Validation: Context sent with prompt

### Phase 4: Implement "Add Your Idea" Feature
1. **Create idea input modal** - Simple text input for manual ideas
   - Location: New file `app/components/AddIdeaModal.tsx`
   - Dependencies: None
   - Validation: Modal with text input renders

2. **Handle manual idea submission** - Add idea as child node
   - Location: `app/contexts/IdeaGraphContext.tsx`
   - Dependencies: Existing node structure
   - Validation: Manual idea added as child

### Phase 5: Wire Everything Together
1. **Connect action buttons to features** - Link menu to components
   - Location: `app/components/NodeGraph.tsx`
   - Dependencies: All new components
   - Validation: Buttons trigger correct actions

2. **Handle state transitions** - Menu -> PromptingBox/Modal flow
   - Location: `app/components/NodeGraph.tsx`
   - Dependencies: State management
   - Validation: Smooth transitions between states

## Testing Requirements

### Manual Validation
- Click leaf node - action menu appears below
- Click non-leaf node - no menu appears
- Click "Add a Prompt" - mini prompting box opens with context
- Click "Add Your Idea" - manual input modal opens
- Submit prompt - new children generated under selected node
- Click outside menu - menu closes
- Drag node - menu follows if open

## Risk Assessment

### Technical Risks
- **Positioning complexity**: Use getBoundingClientRect for accurate positioning
- **State management**: Keep menu state in NodeGraph for consistency
- **Z-index conflicts**: Ensure menu appears above nodes but below modals

### Implementation Risks  
- **Menu flickering**: Use proper event handlers to prevent re-renders
- **Context overflow**: Truncate long parent content with ellipsis

## Success Criteria
- [ ] Action menu appears only for leaf nodes
- [ ] Menu positioned correctly below selected node
- [ ] "Add a Prompt" opens contextual prompting box
- [ ] Parent node content included in prompt context
- [ ] "Add Your Idea" allows manual idea entry
- [ ] New nodes properly connected as children
- [ ] Clean UI transitions and interactions

## Estimated Complexity
- **Backend**: N/A
- **Frontend**: Medium
- **Testing**: Low
- **Overall**: Medium

## Code Structure Preview

```typescript
// ActionMenu.tsx
interface ActionMenuProps {
  position: { x: number; y: number };
  onAddPrompt: () => void;
  onAddIdea: () => void;
  onClose: () => void;
}

// MiniPromptingBox.tsx
interface MiniPromptingBoxProps {
  parentNode: IdeaNode;
  onSubmit: (prompt: string, config: any) => void;
  onClose: () => void;
}

// In NodeGraph.tsx
const [showActionMenu, setShowActionMenu] = useState(false);
const [actionMenuPosition, setActionMenuPosition] = useState({ x: 0, y: 0 });
const [showMiniPrompting, setShowMiniPrompting] = useState(false);

const handleNodeClick = (node: IdeaNode) => {
  if (node.childIds.length === 0) {
    // Show action menu for leaf nodes
    setShowActionMenu(true);
    setActionMenuPosition(calculatePosition(node));
  }
};
```