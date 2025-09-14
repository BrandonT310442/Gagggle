# Ultra Simple: Just Use react-draggable

## 5 Minute Implementation

### Step 1: Install

```bash
npm install react-draggable
```

### Step 2: Wrap IdeaNode
In `IdeaNode.tsx`:
```typescript
import Draggable from 'react-draggable';

// Wrap your existing IdeaNode content
<Draggable>
  <div>
    {/* Your existing IdeaNode content */}
  </div>
</Draggable>
```

### Done! 
Nodes are now draggable. They'll start at their auto-centered positions and can be dragged anywhere.