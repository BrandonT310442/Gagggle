import { GenerateTitleRequest, GenerateTitleResponse } from '../types';
import { getLLMProvider } from '../llm/provider';
import * as fs from 'fs';
import * as path from 'path';

// Load prompt template
function loadPromptTemplate(filename: string): string {
  const promptPath = path.join(__dirname, 'prompts', filename);
  return fs.readFileSync(promptPath, 'utf-8');
}

// Simple template replacement for title generation
function renderTemplate(template: string, data: Record<string, any>): string {
  let rendered = template;
  
  // Replace simple variables {{variable}}
  Object.keys(data).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, data[key] || '');
  });
  
  return rendered;
}

// Parse LLM output for title
function parseTitle(text: string): string {
  // Clean up the response
  const trimmed = text.trim();
  
  // Remove quotes if present
  let title = trimmed;
  if (title.startsWith('"') && title.endsWith('"')) {
    title = title.slice(1, -1);
  }
  if (title.startsWith("'") && title.endsWith("'")) {
    title = title.slice(1, -1);
  }
  
  // Remove any "Title:" prefix if present
  title = title.replace(/^Title:\s*/i, '');
  
  // Take only the first line if multiple lines
  const firstLine = title.split('\n')[0].trim();
  
  // Limit length to reasonable title length (max ~60 chars)
  if (firstLine.length > 60) {
    return firstLine.substring(0, 57) + '...';
  }
  
  return firstLine || 'Brainstorming Session';
}

export async function generateTitle(request: GenerateTitleRequest): Promise<GenerateTitleResponse> {
  const startTime = Date.now();
  
  try {
    // Get the LLM provider
    const provider = getLLMProvider(request.modelConfig);
    
    // Load and render the prompt template
    const template = loadPromptTemplate('generate-title.md');
    const prompt = renderTemplate(template, {
      input: request.input
    });
    
    console.log(`[GenerateTitle] Using provider: ${request.modelConfig?.provider || 'default'}`);
    
    // Call the LLM provider
    const rawTitle = await provider.generateTitle({
      prompt: prompt,
      maxTokens: 50,
      temperature: 0.7
    });
    
    // Parse and clean the title
    const title = parseTitle(rawTitle);
    
    const generationTime = Date.now() - startTime;
    
    console.log(`[GenerateTitle] Generated title: "${title}" in ${generationTime}ms`);
    
    return {
      success: true,
      title,
      generationTime
    };
    
  } catch (error) {
    const generationTime = Date.now() - startTime;
    console.error('[GenerateTitle] Error generating title:', error);
    
    // Return a fallback title on error
    return {
      success: false,
      title: 'Brainstorming Session',
      generationTime
    };
  }
}