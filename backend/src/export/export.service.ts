import { IdeaNode } from '../types';
import { graphStore } from '../graph/graphStore';

export function exportGraphToMarkdown(): string {
  const nodes = graphStore.getGraph();
  
  if (nodes.length === 0) {
    return '# AI Whiteboard Export\n\n*No ideas generated yet*\n';
  }
  
  // Build tree structure - find root nodes (no parent)
  const rootNodes = nodes.filter(n => !n.parentId);
  const mergedNodes = nodes.filter(n => n.metadata?.mergedFrom && n.metadata.mergedFrom.length > 0);
  const promptNodes = nodes.filter(n => n.metadata?.isPrompt === true);
  const aiNodes = nodes.filter(n => n.metadata?.generatedBy === 'ai');
  
  let markdown = '# AI Whiteboard Export\n\n';
  
  // Add explanation section
  markdown += '## About This Export\n\n';
  markdown += 'This document represents an idea generation and brainstorming session from an AI-powered whiteboard application. ';
  markdown += 'The system captures user prompts and generates related ideas using Large Language Models (LLMs), ';
  markdown += 'creating a hierarchical tree structure of thoughts and concepts.\n\n';
  
  markdown += '### Structure Legend\n\n';
  markdown += '- **📝 Prompt**: User-provided prompts that initiated idea generation\n';
  markdown += '- **- (Dash)**: First-level generated ideas (direct responses to prompts)\n';
  markdown += '- **• (Bullet)**: Second-level ideas (expansions or details of first-level ideas)\n';
  markdown += '- **◦ (Circle)**: Third-level ideas (further refinements)\n';
  markdown += '- **Merged Ideas**: Synthesized concepts combining multiple ideas\n\n';
  
  markdown += '### Metadata\n\n';
  markdown += `- **Export Date**: ${new Date().toISOString()}\n`;
  markdown += `- **Total Nodes**: ${nodes.length}\n`;
  markdown += `- **User Prompts**: ${promptNodes.length}\n`;
  markdown += `- **AI-Generated Ideas**: ${aiNodes.length}\n`;
  markdown += `- **Root Nodes**: ${rootNodes.length}\n`;
  markdown += `- **Merged Nodes**: ${mergedNodes.length}\n\n`;
  
  markdown += '---\n\n';
  markdown += '## Ideas Tree\n';
  
  if (rootNodes.length === 0) {
    // No root nodes, just list all nodes flat
    markdown += '\nNo root nodes found. Listing all nodes:\n\n';
    for (const node of nodes) {
      markdown += `- ${node.content}\n`;
      if (node.metadata?.generationPrompt) {
        markdown += `  *Prompt: ${node.metadata.generationPrompt}*\n`;
      }
      if (node.metadata?.mergedFrom && node.metadata.mergedFrom.length > 0) {
        markdown += `  *Merged from ${node.metadata.mergedFrom.length} ideas*\n`;
      }
    }
  } else {
    // Build hierarchical structure
    for (const root of rootNodes) {
      markdown += formatNodeTree(root, nodes, 0);
    }
    
    // Add any orphaned nodes (have parent but parent not in graph)
    const orphanedNodes = nodes.filter(n => 
      n.parentId && !nodes.find(p => p.id === n.parentId)
    );
    
    if (orphanedNodes.length > 0) {
      markdown += '\n## Orphaned Ideas (parent not found)\n';
      for (const node of orphanedNodes) {
        markdown += formatNodeTree(node, nodes, 0);
      }
    }
  }
  
  // Add merged nodes section
  if (mergedNodes.length > 0) {
    markdown += '\n## Merged Ideas Summary\n\n';
    markdown += 'These ideas were created by synthesizing multiple concepts:\n\n';
    for (const node of mergedNodes) {
      markdown += `- **${node.content.substring(0, 100)}${node.content.length > 100 ? '...' : ''}**\n`;
      markdown += `  - Combined from ${node.metadata.mergedFrom.length} source ideas\n`;
      if (node.metadata.generationPrompt) {
        markdown += `  - Merge instruction: "${node.metadata.generationPrompt}"\n`;
      }
    }
  }
  
  // Add footer with context
  markdown += '\n---\n\n';
  markdown += '## Export Context\n\n';
  markdown += 'This hierarchical structure was generated through an iterative process where:\n';
  markdown += '1. Users provide initial prompts or questions\n';
  markdown += '2. AI generates multiple ideas in response to each prompt\n';
  markdown += '3. Users can expand on any idea to get more detailed implementations\n';
  markdown += '4. Multiple ideas can be merged to create synthesized concepts\n';
  markdown += '5. The entire conversation forms a tree of interconnected thoughts\n\n';
  markdown += '*This export can be imported into other tools or used as documentation for brainstorming sessions.*\n';
  
  return markdown;
}

function formatNodeTree(node: IdeaNode, allNodes: IdeaNode[], level: number): string {
  const indent = '  '.repeat(level);
  let output = '';
  
  // Check if this is a prompt node
  const isPrompt = node.metadata?.isPrompt === true;
  
  // Format node content with proper indentation for hierarchy
  if (level === 0) {
    if (isPrompt) {
      output += `\n## 📝 Prompt: "${node.content}"\n`;
    } else {
      output += `\n### ${node.content.substring(0, 100)}${node.content.length > 100 ? '...' : ''}\n`;
    }
  } else {
    if (isPrompt) {
      output += `${indent}**📝 Prompt:** "${node.content}"\n`;
    } else {
      // Use bullets with proper indentation for hierarchy
      const bullet = level === 1 ? '-' : level === 2 ? '  •' : '    ◦';
      const contentIndent = level === 1 ? '' : '  '.repeat(level - 1);
      output += `${contentIndent}${bullet} ${node.content}\n`;
    }
  }
  
  // Add metadata with proper indentation
  if (!isPrompt && node.metadata) {
    const metaIndent = '  '.repeat(level + 1);
    
    // Only show prompt for non-root nodes
    if (node.metadata.generationPrompt && level > 1) {
      output += `${metaIndent}_Prompt: ${node.metadata.generationPrompt}_\n`;
    }
    
    if (node.metadata.mergedFrom && node.metadata.mergedFrom.length > 0) {
      const mergedIds = node.metadata.mergedFrom.map(id => {
        const mergedNode = allNodes.find(n => n.id === id);
        return mergedNode ? mergedNode.content.substring(0, 30) + '...' : id.substring(0, 8);
      });
      output += `${metaIndent}_Merged from: ${mergedIds.join(', ')}_\n`;
    }
  }
  
  // Add children with increased indentation
  const children = allNodes.filter(n => n.parentId === node.id);
  if (children.length > 0) {
    // Add spacing before children for better readability
    if (isPrompt && level === 0) {
      output += '\n';
    }
    for (const child of children) {
      output += formatNodeTree(child, allNodes, level + 1);
    }
    // Add spacing after all children
    if (level === 0 && !isPrompt) {
      output += '\n';
    }
  }
  
  return output;
}

// Debug function to show graph structure
export function getGraphDebugInfo(): any {
  const nodes = graphStore.getGraph();
  const rootNodes = nodes.filter(n => !n.parentId);
  const promptNodes = nodes.filter(n => n.metadata?.isPrompt === true);
  
  return {
    totalNodes: nodes.length,
    rootNodes: rootNodes.length,
    promptNodes: promptNodes.length,
    nodes: nodes.map(n => ({
      id: n.id,
      content: n.content.substring(0, 80) + (n.content.length > 80 ? '...' : ''),
      parentId: n.parentId,
      childIds: n.childIds,
      generatedBy: n.metadata?.generatedBy,
      isPrompt: n.metadata?.isPrompt === true,
      metadata: n.metadata
    }))
  };
}