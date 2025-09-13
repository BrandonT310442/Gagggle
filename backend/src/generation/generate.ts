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

// Enhanced template replacement
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
  
  // Handle unless conditionals {{#unless variable}}...{{/unless}}
  rendered = rendered.replace(/{{#unless (\w+)}}([\s\S]*?){{\/unless}}/g, (match, variable, content) => {
    return !data[variable] ? content : '';
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
  
  return rendered;
}

// Parse LLM output - handles both JSON and fallback formats
function parseLLMOutput(text: string, expectedCount: number): string[] {
  // First try to parse as JSON
  try {
    // Clean the text - remove markdown code blocks if present
    const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const parsed = JSON.parse(cleanedText);
    
    // Check for responses array (generation format)
    if (parsed.responses && Array.isArray(parsed.responses)) {
      return parsed.responses.slice(0, expectedCount);
    }
    
    // Check for single merged response
    if (parsed.merged && typeof parsed.merged === 'string') {
      return [parsed.merged];
    }
    
    // Check if it's an array directly
    if (Array.isArray(parsed)) {
      return parsed.slice(0, expectedCount);
    }
  } catch (e) {
    // JSON parsing failed, fall back to text parsing
    console.log('JSON parsing failed, using fallback text parsing');
  }
  
  // Fallback: Parse numbered list format
  const ideas: string[] = [];
  
  // Try to parse numbered format (1. idea, 2. idea, etc)
  const numberedPattern = /^\d+\.\s+(.+?)(?=^\d+\.|$)/gms;
  const matches = text.matchAll(numberedPattern);
  
  for (const match of matches) {
    if (match[1]) {
      ideas.push(match[1].trim());
    }
  }
  
  // If we didn't get enough matches, try line-by-line parsing
  if (ideas.length < expectedCount) {
    const lines = text.split('\n').filter(line => line.trim());
    for (const line of lines) {
      // Skip lines that are just numbers or very short
      if (line.length > 10 && !ideas.includes(line)) {
        // Remove leading numbers, bullets, dashes
        const cleaned = line.replace(/^[\d\.\-\*\s]+/, '').trim();
        if (cleaned.length > 10) {
          ideas.push(cleaned);
        }
      }
    }
  }
  
  // If still not enough, split by double newlines
  if (ideas.length < expectedCount) {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20);
    for (const para of paragraphs) {
      if (!ideas.includes(para.trim())) {
        ideas.push(para.trim());
      }
    }
  }
  
  // Return what we got, up to expected count
  return ideas.slice(0, expectedCount);
}

export async function generateIdeas(request: GenerateIdeasRequest): Promise<GenerateIdeasResponse> {
  const startTime = Date.now();
  const provider = getLLMProvider(request.modelConfig);
  
  try {
    // Use unified prompt template
    const template = loadPromptTemplate('unified-prompt.md');
    
    // Prepare template data
    const templateData = {
      // Operation flags
      isGeneration: true,
      operation: 'generation',
      
      // Parent node context
      parentNode: request.parentNode,
      parentContent: request.parentNode?.content,
      parentMetadata: request.parentNode?.metadata ? JSON.stringify(request.parentNode.metadata) : null,
      
      // Generation parameters
      prompt: request.prompt,
      count: request.count,
      
      // Count flags for template
      isThree: request.count === 3,
      isFour: request.count === 4,
      isFive: request.count === 5,
      isMore: request.count > 5,
      
      // Constraints
      constraints: request.constraints,
      domain: request.constraints?.domain,
      style: request.constraints?.style,
      maxLength: request.constraints?.maxLength
    };
    
    // Render the prompt
    const fullPrompt = renderTemplate(template, templateData);
    
    // Call LLM provider - returns array but we expect JSON in first element
    const responses = await provider.generateIdeas({
      prompt: fullPrompt,
      count: 1,  // We handle count in the prompt itself
      parentContext: request.parentNode?.content,
      temperature: request.constraints?.style === 'creative' ? 0.9 : 0.7
    });
    
    // Parse the response using our robust parser
    const generatedTexts = parseLLMOutput(responses[0] || '', request.count);
    
    // If we didn't get enough responses, log a warning
    if (generatedTexts.length < request.count) {
      console.warn(`Expected ${request.count} ideas but got ${generatedTexts.length}`);
    }
    
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