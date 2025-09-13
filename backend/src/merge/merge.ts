import { MergeIdeasRequest, MergeIdeasResponse, IdeaNode } from '../types';
import { getLLMProvider } from '../llm/provider';
import { generateId } from '../utils/validation';
import * as fs from 'fs';
import * as path from 'path';

// Load prompt template
function loadPromptTemplate(filename: string): string {
  const promptPath = path.join(__dirname, 'prompts', filename);
  return fs.readFileSync(promptPath, 'utf-8');
}

// Enhanced template replacement for merge templates
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
      itemContent = itemContent.replace(/{{this}}/g, item);
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

// Parse LLM output for merge responses
function parseMergeOutput(text: string): string {
  // First try to parse as JSON
  try {
    // Clean the text - remove markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanedText);
    
    // Check for merged response
    if (parsed.merged && typeof parsed.merged === 'string') {
      return parsed.merged;
    }
    
    // Check if it's a string directly
    if (typeof parsed === 'string') {
      return parsed;
    }
  } catch (e) {
    // JSON parsing failed, use the text as-is
    console.log('JSON parsing failed for merge, using raw text');
  }
  
  // Fallback: clean and return the text
  return text.trim();
}

export async function mergeIdeas(request: MergeIdeasRequest): Promise<MergeIdeasResponse> {
  const startTime = Date.now();
  const provider = getLLMProvider(request.modelConfig);
  
  try {
    // Extract idea contents
    const ideaContents = request.nodes.map(node => node.content);
    
    // Use unified merge template
    const template = loadPromptTemplate('unified-merge.md');
    const strategy = request.mergeStrategy || 'synthesize';
    
    // Prepare template data
    const templateData = {
      nodes: request.nodes,
      nodeCount: request.nodes.length,
      mergeStrategy: strategy,
      userInstruction: request.mergePrompt,
      // Set flags for each strategy
      synthesize: strategy === 'synthesize',
      combine: strategy === 'combine',
      abstract: strategy === 'abstract',
      contrast: strategy === 'contrast'
    };
    
    // Render the prompt
    const fullPrompt = renderTemplate(template, templateData);
    
    // Call LLM provider - we expect a single merged response
    const response = await provider.mergeIdeas({
      ideas: [fullPrompt], // Pass prompt as single item
      mergeInstruction: '',
      strategy: strategy,
      temperature: 0.7
    });
    
    // Parse the response
    const mergedContent = parseMergeOutput(response);
    
    // Create the merged IdeaNode
    const mergedIdea: IdeaNode = {
      id: generateId(),
      boardId: request.boardId,
      content: mergedContent,
      childIds: [],
      metadata: {
        generatedBy: 'ai',
        generationPrompt: request.mergePrompt || `Merged ${ideaContents.length} ideas using ${strategy} strategy`,
        mergedFrom: request.nodes.map(n => n.id),
        mergeStrategy: strategy
      },
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const generationTime = Date.now() - startTime;
    
    return {
      success: true,
      mergedIdea,
      sourceNodeIds: request.nodes.map(n => n.id),
      mergeStrategy: strategy,
      generationTime
    };
    
  } catch (error) {
    console.error('Error merging ideas:', error);
    throw error;
  }
}