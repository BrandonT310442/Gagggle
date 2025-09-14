# Implementation Plan: Visual Edges Connecting Draggable Nodes (Using react-xarrows)

## Objective
Add visible curved arrows that connect parent nodes to their children and dynamically update when nodes are dragged.

## Scope
### Included
- Curved arrows between parent and child nodes
- Automatic arrow positioning and bending
- Real-time arrow updates when nodes are dragged
- Clean arrow styling (color, thickness, curvature)

### Excluded  
- Arrow labels or decorations
- Arrow interaction (clicking, selecting)
- Custom routing algorithms (library handles this)

## Technical Approach
Use `react-xarrows` library which automatically handles curved arrows between elements, updates on drag, and provides nice bezier curves out of the box.

## Implementation Steps

### Phase 1: Setup react-xarrows
1. **Install react-xarrows** - Add library dependency
   - Command: `npm install react-xarrows`
   - Dependencies: None
   - Validation: Package installed successfully

2. **Import Xwrapper and Xarrow** - Setup arrow components
   - Location: `app/components/NodeGraph.tsx`
   - Dependencies: react-xarrows installed
   - Validation: Components import without errors

### Phase 2: Add IDs to Nodes
1. **Add unique IDs to IdeaNode divs** - Required for arrow targeting
   - Location: `app/components/IdeaNode.tsx`
   - Dependencies: Node already has id property
   - Validation: Each node div has id attribute

### Phase 3: Implement Arrows
1. **Wrap NodeGraph with Xwrapper** - Required for arrow updates
   - Location: `app/components/NodeGraph.tsx`
   - Dependencies: Xwrapper imported
   - Validation: Wrapper renders correctly

2. **Add Xarrow components** - Create arrows between parent-child pairs
   - Location: `app/components/NodeGraph.tsx`
   - Dependencies: Node IDs, Xarrow imported
   - Validation: Arrows visible between nodes

3. **Configure arrow styling** - Set curve, color, thickness
   - Location: `app/components/NodeGraph.tsx`
   - Dependencies: Xarrow components added
   - Validation: Arrows have nice curved appearance

### Phase 4: Handle Drag Updates
1. **Add drag handler to update arrows** - Refresh on node move
   - Location: `app/components/IdeaNode.tsx`
   - Dependencies: Draggable onDrag prop
   - Validation: Arrows follow nodes when dragged

## Testing Requirements

### Manual Validation
- Drag a parent node - edges follow
- Drag a child node - edge stays connected
- Generate new children - edges appear automatically
- Edges render behind nodes (z-index correct)

## Risk Assessment

### Technical Risks
- **Performance with many arrows**: react-xarrows handles this well up to ~50 arrows
- **Library compatibility**: react-xarrows works with react-draggable out of the box

### Implementation Risks  
- **Arrow update lag**: Use Xwrapper's updateXarrow function on drag
- **Z-index issues**: Ensure arrows render behind nodes

## Success Criteria
- [ ] Edges visible between parent and child nodes
- [ ] Edges update in real-time when dragging
- [ ] No performance issues with typical node counts
- [ ] Clean, maintainable code

## Estimated Complexity
- **Backend**: N/A
- **Frontend**: Low
- **Testing**: Low
- **Overall**: Low

## Simplified Implementation Code Structure

```typescript
// In NodeGraph.tsx
import Xarrow, { Xwrapper } from 'react-xarrows';

// Wrap entire node graph
<Xwrapper>
  {/* Render nodes with unique IDs */}
  {nodes.map(node => (
    <IdeaNode key={node.id} node={node} />
  ))}
  
  {/* Render arrows for each parent-child relationship */}
  {nodes.map(node => 
    node.children?.map(childId => (
      <Xarrow
        key={`arrow-${node.id}-${childId}`}
        start={node.id}
        end={childId}
        color="#gray"
        strokeWidth={2}
        curveness={0.6}
        path="smooth"
      />
    ))
  )}
</Xwrapper>

// In IdeaNode.tsx - Add ID to div and update arrows on drag
<Draggable 
  nodeRef={nodeRef}
  onDrag={() => updateXarrow()} // This triggers arrow updates
>
  <div id={node.id} ref={nodeRef}>
    {/* Node content */}
  </div>
</Draggable>
```