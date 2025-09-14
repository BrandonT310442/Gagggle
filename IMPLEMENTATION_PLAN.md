# Implementation Plan: Leaf Node Interaction Menu

## Overview
Add an interactive menu that appears when users click on leaf nodes (nodes without children), showing options to "Add a Prompt" or "Add Your Idea". The menu displays with a downward arrow from the clicked node.

## Requirements
- When a user clicks a **leaf node** (node with no children)
- Display a menu below the node with a downward arrow
- Menu contains two options:
  - "Add a Prompt" (with sparkle icon)
  - "Add Your Idea" (with document icon)
- Options are **not draggable**
- Clicking "Add a Prompt" creates a new PromptNode as a child
- Tree expands to show the new connection

## Implementation Steps

### 1. Create AddOptionsMenu Component
**File:** `/app/components/AddOptionsMenu.tsx`
- Create new component with two styled buttons
- Position absolutely below parent node
- Include downward arrow indicator
- Non-draggable (no Draggable wrapper)
- Props: `parentNodeId`, `position`, `onAddPrompt`, `onAddIdea`, `onClose`

### 2. Update IdeaNode Component
**File:** `/app/components/IdeaNode.tsx`
- Add state for menu visibility: `const [showOptionsMenu, setShowOptionsMenu] = useState(false)`
- Detect leaf nodes: `const isLeafNode = !node.childIds || node.childIds.length === 0`
- Modify click handler to show menu for leaf nodes
- Calculate menu position based on node position
- Render AddOptionsMenu conditionally

### 3. Implement Add Prompt Functionality
**Context Updates:** `/app/contexts/IdeaGraphContext.tsx`
- Add method: `addPromptToNode(parentNodeId: string)`
- Create new PromptNode with parent relationship
- Update parent's `childIds` array
- Set proper metadata (`isPrompt: true`)

### 4. Connect PromptNode as Child
**Integration Steps:**
- When "Add a Prompt" is clicked:
  1. Create new PromptNode instance
  2. Set `parentId` to clicked node's ID
  3. Add new node ID to parent's `childIds`
  4. Update state in IdeaGraphContext
  5. Close the options menu
  6. Re-render with new arrow connection

### 5. Handle Tree Visual Updates
**File:** `/app/components/NodeGraph.tsx`
- Ensure Xarrow components update
- Position new PromptNode below parent
- Maintain existing arrow rendering logic
- Trigger `updateXarrow()` after node addition

## Component Structure

```typescript
// AddOptionsMenu.tsx
interface AddOptionsMenuProps {
  parentNodeId: string;
  position: { x: number; y: number };
  onAddPrompt: () => void;
  onAddIdea: () => void;
  onClose: () => void;
}

// IdeaNode.tsx updates
const handleNodeClick = () => {
  if (isLeafNode && !showOptionsMenu) {
    setShowOptionsMenu(true);
  }
  onSelect?.();
};
```

## UI Design
- **Arrow:** Downward pointing, connects node to menu
- **Menu Style:** 
  - Background: Light gray/blue (#8B9DC3)
  - Two buttons stacked vertically
  - Icons: Sparkle for prompt, Document for idea
  - Text: White, centered
  - Fixed width: ~300px
  - Padding: 16px per button
  - Gap between buttons: 8px

## State Management Flow
1. User clicks leaf node → `showOptionsMenu = true`
2. Menu renders below node
3. User clicks "Add a Prompt"
4. Context creates new PromptNode
5. Parent-child relationship established
6. Menu closes → `showOptionsMenu = false`
7. Tree re-renders with new connection

## Testing Checklist
- [ ] Leaf node detection works correctly
- [ ] Menu appears only for nodes without children
- [ ] Menu position is correct (below node)
- [ ] Arrow visual connects properly
- [ ] "Add a Prompt" creates PromptNode
- [ ] New node appears as child with arrow
- [ ] Tree structure updates in state
- [ ] Menu closes after action
- [ ] Click outside closes menu
- [ ] Non-leaf nodes don't show menu

## Future Enhancements
- "Add Your Idea" functionality (manual text input)
- Animation for menu appearance
- Keyboard navigation support
- Multiple prompt types selection
- Undo/redo for node operations