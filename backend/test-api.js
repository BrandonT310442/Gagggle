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
  
  // Choose operation: 'generate', 'merge', 'categorize', or 'title'
  operation: 'title', // 'generate', 'merge', 'categorize', or 'title'
  
  // Model configuration
  modelConfig: {
    provider: 'cohere', // 'groq', 'cohere', or 'mock'
    model: 'command-r-plus' // Choose from available models
  },
  
  // For GENERATION
  generation: {
    prompt: 'Expand on this answer with specific implementation details, technical considerations, and user experience improvements. Provide a comprehensive 10-sentence expansion.',
    count: 2,
    // Test expansion on a parent node
    parentNode: {
      id: 'parent-123',
      content: 'Create an AI-powered onboarding assistant that uses machine learning to personalize the tutorial experience based on user behavior patterns. The system should track user interactions, identify areas where users struggle, and dynamically adjust the tutorial content and pacing. Include features like contextual tooltips, interactive walkthroughs, progress tracking with gamification elements, and the ability to skip or revisit sections. The assistant should support multiple learning styles (visual, textual, hands-on) and provide real-time feedback. Integration with analytics tools will help measure onboarding success rates and identify drop-off points for continuous improvement.'
    }
  },
  
  // For MERGE
  merge: {
    nodes: [
      {
        id: 'node-1',
        content: 'Implement a machine learning-based recommendation engine that analyzes user behavior patterns in real-time to suggest personalized learning paths. The system should use collaborative filtering and content-based filtering algorithms to identify similar user profiles and predict which features users are most likely to need help with. Track metrics like time spent on each section, click patterns, and error rates to continuously refine the ML model. Integration with TensorFlow.js allows for client-side inference, reducing server load and improving response times. The recommendation engine should also factor in user role, industry, and stated goals to provide contextually relevant suggestions.'
      },
      {
        id: 'node-2', 
        content: 'Build a gamified progress tracking system with achievement badges, experience points, and leveling mechanics to increase user engagement during onboarding. Create milestone-based rewards that unlock advanced features or customization options as users complete tutorial sections. Implement a leaderboard system for enterprise clients to foster friendly competition among new team members. Include streak counters for daily engagement and provide visual feedback through confetti animations and progress bars. The gamification layer should be optional and customizable based on company culture, with the ability to disable competitive elements while keeping personal achievement tracking.'
      },
      {
        id: 'node-3',
        content: 'Develop an intelligent chatbot assistant powered by natural language processing that can answer questions, provide contextual help, and guide users through complex workflows. The chatbot should understand user intent through sentiment analysis and be able to escalate to human support when needed. Implement conversation memory to maintain context across multiple interactions and provide personalized responses based on user history. Include multilingual support with automatic language detection and real-time translation capabilities. The assistant should proactively offer help when detecting user frustration or confusion through behavior analysis like rage clicks or extended idle time.'
      },
      {
        id: 'node-4',
        content: 'Create an adaptive UI/UX system that dynamically adjusts the interface complexity based on user proficiency levels and learning progress. Start with a simplified interface showing only essential features, then gradually reveal advanced functionality as users demonstrate competence. Implement A/B testing frameworks to continuously optimize the onboarding flow based on conversion metrics and user feedback. Use heat mapping and session recording tools to identify pain points and areas of confusion. The system should support multiple device types with responsive design and maintain consistency across web, mobile, and desktop applications.'
      }
    ],
    mergePrompt: 'Synthesize these four advanced onboarding features into a cohesive, enterprise-ready onboarding platform architecture. Focus on how these components work together, data flow between systems, technical implementation considerations, and expected business outcomes. Provide a 12-sentence comprehensive synthesis that could serve as an executive summary for stakeholders.'
  },
  
  // For CATEGORIZE
  categorize: {
    nodes: [
      {
        id: 'cat-1',
        content: 'Implement user authentication with OAuth2 and JWT tokens for secure login'
      },
      {
        id: 'cat-2',
        content: 'Add two-factor authentication using SMS or authenticator apps'
      },
      {
        id: 'cat-3',
        content: 'Create password reset flow with email verification'
      }
    ]
  },
  
  // For TITLE GENERATION
  title: {
    inputs: [
      // Test 1: Simple project idea
      'I want to build a collaborative whiteboard application for remote teams to brainstorm ideas together in real-time',
    ],
    // Select which input to test (0-4)
    selectedInput: 0
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
  
  if (CONFIG.generation.parentNode) {
    console.log('\n📍 Expanding on parent node:');
    console.log('  Parent ID:', CONFIG.generation.parentNode.id);
    console.log('  Parent Content:', CONFIG.generation.parentNode.content);
  }
  
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
  console.log('Number of nodes:', CONFIG.merge.nodes.length);
  console.log('\n🎯 Merge Prompt:', CONFIG.merge.mergePrompt);
  
  console.log('\n📋 Nodes to merge:');
  CONFIG.merge.nodes.forEach((node, index) => {
    console.log(`\n${index + 1}. [${node.id}]`);
    // Show first 150 characters of each node
    const preview = node.content.length > 150 
      ? node.content.substring(0, 150) + '...' 
      : node.content;
    console.log(`   ${preview}`);
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

// Test title generation
async function testTitle() {
  console.log('\n✏️ Testing TITLE endpoint...\n');
  console.log('Provider:', CONFIG.modelConfig.provider);
  console.log('Model:', CONFIG.modelConfig.model || 'default');
  
  const selectedInput = CONFIG.title.inputs[CONFIG.title.selectedInput];
  console.log('\n📝 Input text:');
  console.log(selectedInput);
  
  const requestBody = {
    input: selectedInput,
    modelConfig: CONFIG.modelConfig
  };
  
  console.log('\n📤 Sending request to:', `${CONFIG.baseUrl}/api/title`);
  
  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/title`, {
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
    console.log('\n🎯 Generated Title:\n');
    console.log(`"${data.title}"`);
    
    // Test all inputs if using Cohere provider
    if (CONFIG.modelConfig.provider === 'cohere' && CONFIG.title.selectedInput === 0) {
      console.log('\n🔄 Testing with all sample inputs...\n');
      
      for (let i = 0; i < CONFIG.title.inputs.length; i++) {
        const input = CONFIG.title.inputs[i];
        const testBody = {
          input: input,
          modelConfig: CONFIG.modelConfig
        };
        
        try {
          const testResponse = await fetch(`${CONFIG.baseUrl}/api/title`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(testBody)
          });
          
          if (testResponse.ok) {
            const testData = await testResponse.json();
            console.log(`Test ${i + 1}: "${testData.title}" (${testData.generationTime}ms)`);
            // Show first 60 chars of input for context
            const inputPreview = input.length > 60 ? input.substring(0, 60) + '...' : input;
            console.log(`   Input: ${inputPreview}`);
          }
        } catch (err) {
          console.log(`Test ${i + 1}: Failed - ${err.message}`);
        }
      }
      
      // Test with different Cohere models
      console.log('\n🔄 Testing with different Cohere models...\n');
      const cohereModels = ['command', 'command-light', 'command-r', 'command-r-plus'];
      
      for (const model of cohereModels) {
        const modelTestBody = {
          input: selectedInput,
          modelConfig: {
            provider: 'cohere',
            model: model
          }
        };
        
        try {
          const modelResponse = await fetch(`${CONFIG.baseUrl}/api/title`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(modelTestBody)
          });
          
          if (modelResponse.ok) {
            const modelData = await modelResponse.json();
            console.log(`${model}: "${modelData.title}" (${modelData.generationTime}ms)`);
          }
        } catch (err) {
          console.log(`${model}: Failed - ${err.message}`);
        }
      }
    }
    
    if (CONFIG.modelConfig.provider === 'mock') {
      console.log('\n⚠️  Note: Using mock provider - responses are simulated');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

// Test categorization
async function testCategorize() {
  console.log('\n📂 Testing CATEGORIZE endpoint...');
  console.log('Provider:', CONFIG.modelConfig.provider);
  console.log('Model:', CONFIG.modelConfig.model || 'default');
  console.log('Categorizing', CONFIG.categorize.nodes.length, 'nodes');
  
  const requestBody = {
    nodes: CONFIG.categorize.nodes,
    modelConfig: CONFIG.modelConfig
  };
  
  console.log('\n📤 Sending request to:', `${CONFIG.baseUrl}/api/categorize`);
  
  try {
    const response = await fetch(`${CONFIG.baseUrl}/api/categorize`, {
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
    console.log('\n📂 Category:\n');
    console.log('Category Name:', data.category);
    console.log('Categorized Node IDs:', data.nodeIds.join(', '));
    
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
  } else if (CONFIG.operation === 'categorize') {
    await testCategorize();
  } else if (CONFIG.operation === 'title') {
    await testTitle();
  } else {
    console.error('❌ Invalid operation. Choose "generate", "merge", "categorize", or "title"');
  }
  
  console.log('\n========================================\n');
}

// Run the test
main().catch(console.error);