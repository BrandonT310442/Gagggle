import { z } from 'zod';

// Validation schemas
export const generateIdeasSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000),
  count: z.number().int().min(1).max(10),
  parentNode: z.object({
    id: z.string(),
    content: z.string(),
    metadata: z.record(z.string(), z.any()).optional()
  }).optional(),
  modelConfig: z.object({
    provider: z.enum(['mock', 'groq', 'cohere']),
    model: z.string().optional()
  }).optional()
});

export const mergeIdeasSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    content: z.string(),
    metadata: z.record(z.string(), z.any()).optional()
  })).min(2, 'At least 2 nodes required').max(5),
  mergePrompt: z.string().max(500).optional(),
  modelConfig: z.object({
    provider: z.enum(['mock', 'groq', 'cohere']),
    model: z.string().optional()
  }).optional()
});

export const categorizeNodesSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    content: z.string()
  })).min(2, 'At least 2 nodes required').max(10),
  modelConfig: z.object({
    provider: z.enum(['mock', 'groq', 'cohere']),
    model: z.string().optional()
  }).optional()
});

export const generateTitleSchema = z.object({
  input: z.string().min(1, 'Input is required').max(2000),
  modelConfig: z.object({
    provider: z.enum(['mock', 'groq', 'cohere']),
    model: z.string().optional()
  }).optional()
});

// Validation middleware factory
export function validateRequest(schema: z.ZodSchema) {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.issues
        });
      } else {
        next(error);
      }
    }
  };
}

// Helper to generate unique IDs
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}