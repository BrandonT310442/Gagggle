#!/usr/bin/env node

/**
 * Simple test script for testing the backend API endpoints
 * 
 * Usage: node test-api.js
 * 
 * Customize the configuration below before running
 */

// ============================================
// CONFIGURATION - Customize these values
// ============================================

const CONFIG = {
  // Backend URL
  baseUrl: 'http://localhost:3001',
  
  // Choose operation: 'generate' or 'merge'
  operation: 'generate', // 'generate' or 'merge'
  
  // Model configuration
  modelConfig: {
    provider: 'cohere', // 'groq', 'cohere', or 'mock'
    model: 'command-r-plus' // Choose from available models
  },
  
  // For GENERATION
  generation: {
    prompt: 'Ways to improve user onboarding experience for a mobile app',
    count: 3,
    boardId: 'test-board-123',
    // Optional: uncomment to test expansion
    // parentNode: {
    //   id: 'parent-123',
    //   content: 'Implement a guided tutorial system'
    // },
    constraints: {
      style: 'creative', // 'brief', 'detailed', or 'creative'
      domain: 'product design'
    }
  },
  
  // For MERGE
  merge: {
    boardId: 'test-board-123',
    nodes: [
      {
        id: 'node-1',
        content: 'Add interactive tutorials with tooltips'
      },
      {
        id: 'node-2', 
        content: 'Create a progress bar showing onboarding completion'
      },
      {
        id: 'node-3',
        content: 'Implement personalized onboarding based on user type'
      }
    ],
    mergeStrategy: 'synthesize', // 'synthesize', 'combine', 'abstract', or 'contrast'
    mergePrompt: 'Create a comprehensive onboarding strategy'
  }
};

// Available Groq models:
// - 'llama-3.1-8b-instant'
// - 'llama-3.3-70b-versatile'
// - 'meta-llama/llama-guard-4-12b'
// - 'openai/gpt-oss-120b'
// - 'openai/gpt-oss-20b'
// - 'gemma2-9b-it'

// Available Cohere models:
// - 'command'
// - 'command-light'
// - 'command-r'
// - 'command-r-plus'

// ============================================
// TEST SCRIPT - No need to modify below
// ============================================

async function testGeneration() {
  console.log('\n🚀 Testing GENERATION endpoint...\n');
  console.log('Provider:', CONFIG.modelConfig.provider);
  console.log('Model:', CONFIG.modelConfig.model);
  console.log('Prompt:', CONFIG.generation.prompt);
  console.log('Count:', CONFIG.generation.count);
  console.log('Style:', CONFIG.generation.constraints.style);
  
  const requestBody = {
    ...CONFIG.generation,
    modelConfig: CONFIG.modelConfig
  };
  
  console.log('\n📤 Sending request to:', `${CONFIG.baseUrl}/api/generate`);
  
  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('\n✅ Response received!\n');
    console.log('Success:', data.success);
    console.log('Generation time:', data.generationTime, 'ms');
    console.log('\n📝 Generated Ideas:\n');
    
    data.ideas.forEach((idea, index) => {
      console.log(`\n--- Idea ${index + 1} ---`);
      console.log('Content:', idea.content);
      console.log('ID:', idea.id);
      if (idea.parentId) {
        console.log('Parent ID:', idea.parentId);
      }
    });
    
    if (CONFIG.modelConfig.provider === 'mock') {
      console.log('\n⚠️  Note: Using mock provider - responses are simulated');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

async function testMerge() {
  console.log('\n🚀 Testing MERGE endpoint...\n');
  console.log('Provider:', CONFIG.modelConfig.provider);
  console.log('Model:', CONFIG.modelConfig.model);
  console.log('Merge Strategy:', CONFIG.merge.mergeStrategy);
  console.log('Number of nodes:', CONFIG.merge.nodes.length);
  
  console.log('\n📋 Nodes to merge:');
  CONFIG.merge.nodes.forEach((node, index) => {
    console.log(`${index + 1}. ${node.content}`);
  });
  
  const requestBody = {
    ...CONFIG.merge,
    modelConfig: CONFIG.modelConfig
  };
  
  console.log('\n📤 Sending request to:', `${CONFIG.baseUrl}/api/merge`);
  
  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/merge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('\n✅ Response received!\n');
    console.log('Success:', data.success);
    console.log('Generation time:', data.generationTime, 'ms');
    console.log('Merge Strategy Used:', data.mergeStrategy);
    console.log('\n🔀 Merged Idea:\n');
    console.log('Content:', data.mergedIdea.content);
    console.log('ID:', data.mergedIdea.id);
    console.log('Merged from:', data.sourceNodeIds.join(', '));
    
    if (CONFIG.modelConfig.provider === 'mock') {
      console.log('\n⚠️  Note: Using mock provider - responses are simulated');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Main execution
async function main() {
  console.log('========================================');
  console.log('     Backend API Test Script');
  console.log('========================================');
  
  // Check if backend is running
  try {
    const healthCheck = await fetch(`${CONFIG.baseUrl}/health`);
    if (!healthCheck.ok) {
      console.error('\n❌ Backend is not responding at', CONFIG.baseUrl);
      console.error('Make sure the backend is running: cd backend && npm run dev\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Cannot connect to backend at', CONFIG.baseUrl);
    console.error('Make sure the backend is running: cd backend && npm run dev\n');
    process.exit(1);
  }
  
  // Run the selected operation
  if (CONFIG.operation === 'generate') {
    await testGeneration();
  } else if (CONFIG.operation === 'merge') {
    await testMerge();
  } else {
    console.error('❌ Invalid operation. Choose "generate" or "merge"');
  }
  
  console.log('\n========================================\n');
}

// Run the test
main().catch(console.error);