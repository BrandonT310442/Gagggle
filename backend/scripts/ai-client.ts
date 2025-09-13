#!/usr/bin/env ts-node

/**
 * Standalone AI Client Script
 * 
 * This script allows you to interact with GROQ and Cohere models directly
 * without running the full Express server.
 * 
 * Usage:
 *   npm run ai-client -- --provider groq --model llama3-8b-8192 --prompt "Generate 3 startup ideas"
 *   npm run ai-client -- --provider cohere --model command --prompt "Merge these ideas: idea1, idea2"
 */

import dotenv from 'dotenv';
import { getLLMProvider, getAvailableModels, AVAILABLE_MODELS } from '../src/llm/provider';
import { LLMProviderType, ModelConfig } from '../src/types';

// Load environment variables
dotenv.config();

interface CLIArgs {
  provider?: LLMProviderType;
  model?: string;
  prompt?: string;
  count?: number;
  operation?: 'generate' | 'merge' | 'list-models';
  temperature?: number;
  help?: boolean;
}

function parseArgs(): CLIArgs {
  const args: CLIArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const nextArg = argv[i + 1];

    switch (arg) {
      case '--provider':
      case '-p':
        args.provider = nextArg as LLMProviderType;
        i++;
        break;
      case '--model':
      case '-m':
        args.model = nextArg;
        i++;
        break;
      case '--prompt':
        args.prompt = nextArg;
        i++;
        break;
      case '--count':
      case '-c':
        args.count = parseInt(nextArg) || 3;
        i++;
        break;
      case '--temperature':
      case '-t':
        args.temperature = parseFloat(nextArg) || 0.7;
        i++;
        break;
      case '--operation':
      case '-o':
        args.operation = nextArg as 'generate' | 'merge' | 'list-models';
        i++;
        break;
      case '--help':
      case '-h':
        args.help = true;
        break;
    }
  }

  return args;
}

function printHelp() {
  console.log(`
🤖 AI Client Script - GROQ & Cohere Integration

Usage:
  npm run ai-client -- [options]

Options:
  -p, --provider <provider>     AI provider (groq, cohere, mock)
  -m, --model <model>          Specific model to use
  -o, --operation <operation>  Operation to perform (generate, merge, list-models)
      --prompt <prompt>        Prompt text to process
  -c, --count <number>         Number of ideas to generate (default: 3)
  -t, --temperature <number>   Temperature for randomness (0.0-1.0, default: 0.7)
  -h, --help                   Show this help message

Examples:
  # List all available models
  npm run ai-client -- --operation list-models

  # Generate ideas with GROQ
  npm run ai-client -- --provider groq --model llama3-8b-8192 --prompt "Generate startup ideas for AI" --count 5

  # Generate ideas with Cohere
  npm run ai-client -- --provider cohere --model command --prompt "Generate marketing strategies" --count 3

  # Use default provider from environment
  npm run ai-client -- --prompt "Generate ideas for improving team productivity"

Environment Variables:
  GROQ_API_KEY      - Your GROQ API key
  COHERE_API_KEY    - Your Cohere API key
  LLM_PROVIDER      - Default provider (groq, cohere, mock)
`);
}

function listModels() {
  console.log('📋 Available Models:\n');
  
  Object.entries(AVAILABLE_MODELS).forEach(([provider, models]) => {
    console.log(`${provider.toUpperCase()}:`);
    models.forEach(model => console.log(`  • ${model}`));
    console.log('');
  });
}

async function generateIdeas(config: ModelConfig, prompt: string, count: number = 3, temperature: number = 0.7) {
  try {
    console.log(`🔧 Using provider: ${config.provider}${config.model ? ` (${config.model})` : ''}`);
    console.log(`💭 Prompt: ${prompt}`);
    console.log(`🎯 Generating ${count} ideas...\n`);

    const provider = getLLMProvider(config);
    
    const startTime = Date.now();
    const ideas = await provider.generateIdeas({
      prompt,
      count,
      temperature
    });
    const duration = Date.now() - startTime;

    console.log('✨ Generated Ideas:\n');
    ideas.forEach((idea, index) => {
      console.log(`${index + 1}. ${idea}\n`);
    });

    console.log(`⏱️  Generated in ${duration}ms`);
    
  } catch (error) {
    console.error('❌ Error generating ideas:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function mergeIdeas(config: ModelConfig, prompt: string, temperature: number = 0.7) {
  try {
    // For demo purposes, split the prompt by commas as ideas to merge
    const ideas = prompt.split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    if (ideas.length < 2) {
      console.error('❌ For merge operation, provide multiple ideas separated by commas');
      process.exit(1);
    }

    console.log(`🔧 Using provider: ${config.provider}${config.model ? ` (${config.model})` : ''}`);
    console.log(`🔗 Merging ${ideas.length} ideas...\n`);
    
    ideas.forEach((idea, index) => {
      console.log(`${index + 1}. ${idea}`);
    });
    console.log('');

    const provider = getLLMProvider(config);
    
    const startTime = Date.now();
    const mergedIdea = await provider.mergeIdeas({
      ideas,
      strategy: 'synthesize',
      temperature
    });
    const duration = Date.now() - startTime;

    console.log('🎯 Merged Result:\n');
    console.log(mergedIdea);
    console.log(`\n⏱️  Merged in ${duration}ms`);
    
  } catch (error) {
    console.error('❌ Error merging ideas:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    return;
  }

  if (args.operation === 'list-models' || (!args.prompt && !args.operation)) {
    listModels();
    return;
  }

  if (!args.prompt) {
    console.error('❌ Error: --prompt is required for generate and merge operations');
    console.log('Use --help for usage information');
    process.exit(1);
  }

  // Determine provider and model
  const provider = args.provider || (process.env.LLM_PROVIDER as LLMProviderType) || 'mock';
  const model = args.model;
  
  const config: ModelConfig = { provider, model };

  // Validate provider
  if (!Object.keys(AVAILABLE_MODELS).includes(provider)) {
    console.error(`❌ Error: Unknown provider '${provider}'. Available: ${Object.keys(AVAILABLE_MODELS).join(', ')}`);
    process.exit(1);
  }

  // Validate model if specified
  if (model && !getAvailableModels(provider).includes(model)) {
    console.error(`❌ Error: Model '${model}' not available for provider '${provider}'`);
    console.log(`Available models for ${provider}: ${getAvailableModels(provider).join(', ')}`);
    process.exit(1);
  }

  const operation = args.operation || 'generate';
  const temperature = args.temperature || 0.7;

  switch (operation) {
    case 'generate':
      await generateIdeas(config, args.prompt, args.count || 3, temperature);
      break;
    case 'merge':
      await mergeIdeas(config, args.prompt, temperature);
      break;
    default:
      console.error(`❌ Error: Unknown operation '${operation}'. Available: generate, merge, list-models`);
      process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}
