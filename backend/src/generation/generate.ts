import { GenerateIdeasRequest, GenerateIdeasResponse, IdeaNode } from '../types';
import { getLLMProvider } from '../llm/provider';
import { generateId } from '../utils/validation';
import * as fs from 'fs';
import * as path from 'path';

// Load prompt templates
function loadPromptTemplate(filename: string): string {
  const promptPath = path.join(__dirname, 'prompts', filename);
  return fs.readFileSync(promptPath, 'utf-8');
}

// Simple template replacement
function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;
  
  // Replace simple variables {{variable}}
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, data[key] || '');
  });
  
  // Handle conditionals {{#if variable}}...{{/if}}
  rendered = rendered.replace(/{{#if (\w+)}}([\s\S]*?){{\/if}}/g, (match, variable, content) => {
    return data[variable] ? content : '';
  });
  
  return rendered;
}

export async function generateIdeas(request: GenerateIdeasRequest): Promise<GenerateIdeasResponse> {
  const startTime = Date.now();
  const provider = getLLMProvider(request.modelConfig);
  
  try {
    // Determine which prompt template to use
    const isExpansion = !!request.parentNode;
    const templateFile = isExpansion ? 'expand-ideas.md' : 'generate-ideas.md';
    const template = loadPromptTemplate(templateFile);
    
    // Prepare template data
    const templateData = {
      prompt: request.prompt,
      count: request.count,
      domain: request.constraints?.domain,
      style: request.constraints?.style,
      maxLength: request.constraints?.maxLength,
      parentContent: request.parentNode?.content,
      parentMetadata: request.parentNode?.metadata ? JSON.stringify(request.parentNode.metadata) : null
    };
    
    // Render the prompt
    const fullPrompt = renderTemplate(template, templateData);
    
    // Call LLM provider
    const generatedTexts = await provider.generateIdeas({
      prompt: fullPrompt,
      count: request.count,
      parentContext: request.parentNode?.content,
      temperature: request.constraints?.style === 'creative' ? 0.9 : 0.7
    });
    
    // Convert generated texts to IdeaNodes
    const ideas: IdeaNode[] = generatedTexts.map((text, index) => ({
      id: generateId(),
      boardId: request.boardId,
      content: text,
      parentId: request.parentNode?.id,
      childIds: [],
      metadata: {
        generatedBy: 'ai',
        generationPrompt: request.prompt,
        style: request.constraints?.style,
        domain: request.constraints?.domain
      },
      createdBy: 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    const generationTime = Date.now() - startTime;
    
    return {
      success: true,
      ideas,
      promptUsed: fullPrompt,
      generationTime
    };
    
  } catch (error) {
    console.error('Error generating ideas:', error);
    throw error;
  }
}