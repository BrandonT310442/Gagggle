# Implementation Plan: Graph-Tracking Export

## Objective
Track the graph structure in the backend as nodes are created/modified, then provide a simple export of that structure as markdown.

## Scope

### Included
- Store graph structure as nodes are created
- Track parent-child relationships automatically
- Simple export endpoint that returns the stored graph as markdown
- Graph updates on merge and categorize operations

### Excluded  
- Complex state management
- Multiple export formats
- Frontend state syncing

## Technical Approach

**Incremental tracking**: Each time a node is created, we know its parent from the request, so we build the graph incrementally.

Key principles:
1. **Automatic tracking**: Graph builds itself as nodes are created
2. **Simple storage**: Just maintain nodes and their relationships
3. **Direct export**: Convert stored graph to markdown

## Implementation Steps

### Phase 1: Graph Storage

1. **Create Simple Graph Store**
   - Location: `backend/src/graph/graphStore.ts`
   - Dependencies: None (simple in-memory)
   - Validation: Graph operations work
   ```typescript
   class GraphStore {
     private nodes: Map<string, IdeaNode> = new Map();
     
     addNode(node: IdeaNode): void {
       this.nodes.set(node.id, node);
       
       // If node has parent, update parent's childIds
       if (node.parentId) {
         const parent = this.nodes.get(node.parentId);
         if (parent && !parent.childIds.includes(node.id)) {
           parent.childIds.push(node.id);
         }
       }
     }
     
     getGraph(): IdeaNode[] {
       return Array.from(this.nodes.values());
     }
     
     clear(): void {
       this.nodes.clear();
     }
   }
   
   export const graphStore = new GraphStore();
   ```

### Phase 2: Update Existing Endpoints

2. **Update Generate Endpoint to Store Nodes**
   - Location: `backend/src/generation/generate.ts`
   - Dependencies: GraphStore
   - Validation: Nodes added to graph
   ```typescript
   import { graphStore } from '../graph/graphStore';
   
   export async function generateIdeas(request: GenerateIdeasRequest): Promise<GenerateIdeasResponse> {
     // ... existing generation logic ...
     
     // After generating ideas, add them to graph
     for (const idea of ideas) {
       graphStore.addNode(idea);
     }
     
     return response;
   }
   ```

3. **Update Merge Endpoint**
   - Location: `backend/src/merge/merge.ts`
   - Dependencies: GraphStore
   - Validation: Merged node added
   ```typescript
   export async function mergeIdeas(request: MergeIdeasRequest): Promise<MergeIdeasResponse> {
     // ... existing merge logic ...
     
     // Add merged node to graph
     graphStore.addNode(mergedIdea);
     
     return response;
   }
   ```


### Phase 3: Export Implementation

5. **Create Simple Export Service**
   - Location: `backend/src/export/export.service.ts`
   - Dependencies: GraphStore
   - Validation: Markdown output
   ```typescript
   import { graphStore } from '../graph/graphStore';
   
   export function exportGraphToMarkdown(): string {
     const nodes = graphStore.getGraph();
     
     // Build tree structure
     const rootNodes = nodes.filter(n => !n.parentId);
     
     let markdown = '# Whiteboard Export\n\n';
     markdown += `*Generated: ${new Date().toISOString()}*\n\n`;
     markdown += '## Ideas\n\n';
     
     // Recursively format nodes
     for (const root of rootNodes) {
       markdown += formatNodeTree(root, nodes, 0);
     }
     
     return markdown;
   }
   
   function formatNodeTree(node: IdeaNode, allNodes: IdeaNode[], level: number): string {
     const indent = '  '.repeat(level);
     let output = `${indent}- ${node.content}\n`;
     
     // Add children
     const children = allNodes.filter(n => n.parentId === node.id);
     for (const child of children) {
       output += formatNodeTree(child, allNodes, level + 1);
     }
     
     return output;
   }
   ```

6. **Add Export Endpoint**
   - Location: `backend/src/server.ts`
   - Dependencies: Export service
   - Validation: Returns markdown
   ```typescript
   import { exportGraphToMarkdown } from './export/export.service';
   
   app.get('/api/export', (req, res) => {
     const markdown = exportGraphToMarkdown();
     res.json({
       success: true,
       content: markdown
     });
   });
   ```

### Phase 4: Frontend Integration

7. **Simple Export Button**
   - Location: `app/page.tsx`
   - Dependencies: None
   - Validation: Downloads markdown
   ```typescript
   const handleExport = async () => {
     const response = await fetch('/api/export');
     const data = await response.json();
     
     if (data.success) {
       // Download markdown
       const blob = new Blob([data.content], { type: 'text/markdown' });
       const url = URL.createObjectURL(blob);
       const a = document.createElement('a');
       a.href = url;
       a.download = `whiteboard-export.md`;
       a.click();
     }
   };
   
   <button onClick={handleExport}>Export Board</button>
   ```

## Summary

This is a very simple implementation:

1. **GraphStore**: Simple Map that stores nodes as they're created
2. **Automatic Tracking**: When generate/merge creates nodes, they're added to the graph
3. **Parent-Child Links**: Graph maintains relationships automatically
4. **Export**: Simple GET endpoint returns the graph as hierarchical markdown

## Key Points

- No complex state management
- Graph builds incrementally as nodes are created
- Export is just a traversal of the stored graph
- No need to pass full board state from frontend

## Estimated Complexity
- **Backend**: Low (just add graphStore and update endpoints)
- **Frontend**: Minimal (just an export button)
- **Overall**: Low

This approach is extremely simple - the graph tracks itself as operations happen, and export just dumps the current graph as markdown.