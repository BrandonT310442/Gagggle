import { IdeaNode } from '../types';

class GraphStore {
  private nodes: Map<string, IdeaNode> = new Map();
  
  addNode(node: IdeaNode): void {
    // Store the node
    this.nodes.set(node.id, node);
    
    // If node has parent, update parent's childIds
    if (node.parentId) {
      const parent = this.nodes.get(node.parentId);
      if (parent && !parent.childIds.includes(node.id)) {
        parent.childIds.push(node.id);
      }
    }
  }
  
  getNode(id: string): IdeaNode | undefined {
    return this.nodes.get(id);
  }
  
  getGraph(): IdeaNode[] {
    return Array.from(this.nodes.values());
  }
  
  getSize(): number {
    return this.nodes.size;
  }
  
  clear(): void {
    this.nodes.clear();
  }
}

// Export singleton instance
export const graphStore = new GraphStore();