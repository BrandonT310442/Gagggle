import { CategorizeRequest, CategorizeResponse } from '../types';
import { getLLMProvider } from '../llm/provider';
import * as fs from 'fs';
import * as path from 'path';

// Load prompt template (same pattern as merge)
function loadPromptTemplate(filename: string): string {
  const promptPath = path.join(__dirname, 'prompts', filename);
  return fs.readFileSync(promptPath, 'utf-8');
}

// Template rendering (same as merge implementation)
function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;
  
  // Replace simple variables {{variable}}
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, data[key] || '');
  });
  
  // Handle array iteration {{#each items}}...{{/each}}
  rendered = rendered.replace(/{{#each (\w+)}}([\s\S]*?){{\/each}}/g, (match, arrayName, content) => {
    const array = data[arrayName];
    if (!Array.isArray(array)) return '';
    
    return array.map((item, index) => {
      let itemContent = content;
      itemContent = itemContent.replace(/{{this.content}}/g, item.content || '');
      itemContent = itemContent.replace(/{{@index}}/g, (index + 1).toString());
      return itemContent;
    }).join('\n');
  });
  
  // Handle conditionals {{#if variable}}...{{/if}}
  rendered = rendered.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
    return data[variable] ? content : '';
  });
  
  return rendered;
}

// Parse categorization output - extract quoted string from LLM response
function parseCategoryOutput(text: string): string {
  const trimmed = text.trim();
  
  // If it's wrapped in quotes, extract the content
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  
  // Try to extract the first quoted string
  const match = text.match(/"([^"]+)"/);
  if (match && match[1]) {
    return match[1];
  }
  
  // Fallback: return cleaned text
  return trimmed;
}

export async function categorizeNodes(request: CategorizeRequest): Promise<CategorizeResponse> {
  const startTime = Date.now();
  const provider = getLLMProvider(request.modelConfig);
  
  try {
    // Load the categorization prompt template
    const template = loadPromptTemplate('categorize-nodes.md');
    
    // Prepare template data
    const templateData = {
      nodeCount: request.nodes.length,
      nodes: request.nodes
    };
    
    // Render the prompt
    const fullPrompt = renderTemplate(template, templateData);
    
    // Call LLM provider with the prompt
    const response = await provider.mergeIdeas({
      prompt: fullPrompt,
      temperature: 0.7
    });
    
    // Parse the response to get the category name
    const category = parseCategoryOutput(response);
    
    // Extract node IDs from the request
    const nodeIds = request.nodes.map(node => node.id);
    
    const generationTime = Date.now() - startTime;
    
    return {
      success: true,
      category,
      nodeIds,
      generationTime
    };
    
  } catch (error) {
    console.error('Error categorizing nodes:', error);
    throw error;
  }
}