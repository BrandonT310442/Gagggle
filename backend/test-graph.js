#!/usr/bin/env node

/**
 * Test script for graph structure tracking
 * 
 * This script tests that the graph is correctly storing nodes and relationships
 * as they are created through the generate and merge endpoints.
 * 
 * Requirements:
 * - Backend server must be running (npm run backend)
 * - COHERE_API_KEY environment variable must be set
 * 
 * Usage: node test-graph.js
 */

const CONFIG = {
  baseUrl: 'http://localhost:3001',
  modelConfig: {
    provider: 'cohere',  // Use cohere for actual testing
    model: 'command-r-plus'
  }
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function clearGraph() {
  log('\n🧹 Clearing graph...', 'yellow');
  const response = await fetch(`${CONFIG.baseUrl}/api/graph/clear`, {
    method: 'POST'
  });
  const result = await response.json();
  log(`   Graph cleared: ${result.message}`, 'green');
}

async function getGraphDebug() {
  const response = await fetch(`${CONFIG.baseUrl}/api/graph/debug`);
  return await response.json();
}

async function generateRootIdeas() {
  log('\n🌱 Generating root ideas...', 'blue');
  
  const response = await fetch(`${CONFIG.baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Generate 3 innovative ideas for improving user onboarding experience in a SaaS application. Each idea should be specific and actionable.',
      count: 3,
      modelConfig: CONFIG.modelConfig
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    log(`   ✅ Generated ${result.ideas.length} root ideas`, 'green');
    result.ideas.forEach((idea, i) => {
      log(`      ${i + 1}. ${idea.content.substring(0, 50)}...`, 'reset');
    });
    return result.ideas;
  } else {
    log(`   ❌ Generation failed`, 'red');
    return [];
  }
}

async function generateChildIdeas(parentNode) {
  log(`\n🌿 Generating child ideas for: "${parentNode.content.substring(0, 40)}..."`, 'blue');
  
  const response = await fetch(`${CONFIG.baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: 'Expand on this idea with 2 specific implementation approaches. Include technical details and concrete steps.',
      count: 2,
      parentNode: {
        id: parentNode.id,
        content: parentNode.content
      },
      modelConfig: CONFIG.modelConfig
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    log(`   ✅ Generated ${result.ideas.length} child ideas`, 'green');
    result.ideas.forEach((idea, i) => {
      log(`      ${i + 1}. ${idea.content.substring(0, 50)}...`, 'reset');
    });
    return result.ideas;
  } else {
    log(`   ❌ Generation failed`, 'red');
    return [];
  }
}

async function mergeIdeas(nodes) {
  log(`\n🔀 Merging ${nodes.length} ideas...`, 'blue');
  
  const response = await fetch(`${CONFIG.baseUrl}/api/merge`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nodes: nodes.map(n => ({
        id: n.id,
        content: n.content
      })),
      mergePrompt: 'Synthesize these implementation approaches into a comprehensive unified strategy that combines the best aspects of each idea.',
      modelConfig: CONFIG.modelConfig
    })
  });
  
  const result = await response.json();
  
  if (result.success) {
    log(`   ✅ Created merged idea: "${result.mergedIdea.content.substring(0, 60)}..."`, 'green');
    return result.mergedIdea;
  } else {
    log(`   ❌ Merge failed`, 'red');
    return null;
  }
}

async function exportGraph() {
  log('\n📄 Exporting graph as markdown...', 'blue');
  
  const response = await fetch(`${CONFIG.baseUrl}/api/export`);
  const result = await response.json();
  
  if (result.success) {
    log('   ✅ Export successful!', 'green');
    log('\n--- EXPORTED MARKDOWN ---', 'magenta');
    console.log(result.content);
    log('--- END MARKDOWN ---', 'magenta');
    return result.content;
  } else {
    log(`   ❌ Export failed`, 'red');
    return null;
  }
}

async function verifyGraphStructure() {
  log('\n🔍 Verifying graph structure...', 'yellow');
  
  const debugInfo = await getGraphDebug();
  
  log(`   Total nodes in graph: ${debugInfo.totalNodes}`, 'reset');
  log(`   Root nodes: ${debugInfo.rootNodes}`, 'reset');
  log(`   Prompt nodes: ${debugInfo.promptNodes || 0}`, 'reset');
  
  if (debugInfo.nodes && debugInfo.nodes.length > 0) {
    log('\n   Node structure:', 'reset');
    debugInfo.nodes.forEach(node => {
      const isPrompt = node.isPrompt || (node.metadata && node.metadata.isPrompt);
      const indent = node.parentId ? '      └─ ' : '   ';
      const nodeType = isPrompt ? '📝 ' : '';
      const contentPreview = node.content ? node.content.substring(0, 80) + (node.content.length > 80 ? '...' : '') : '[No content]';
      log(`${indent}${nodeType}[${node.id.substring(0, 8)}...] ${contentPreview}`, 'reset');
      if (node.parentId) {
        log(`         Parent: ${node.parentId.substring(0, 8)}...`, 'reset');
      }
      if (node.childIds && node.childIds.length > 0) {
        log(`         Children: ${node.childIds.length} [${node.childIds.map(id => id.substring(0, 8)).join(', ')}...]`, 'reset');
      }
      if (node.metadata || node.generatedBy) {
        if (node.metadata && node.metadata.mergedFrom) {
          log(`         Merged from: ${node.metadata.mergedFrom.map(id => id.substring(0, 8)).join(', ')}...`, 'reset');
        }
        const generatedBy = node.generatedBy || (node.metadata && node.metadata.generatedBy);
        if (generatedBy) {
          log(`         Generated by: ${generatedBy}`, 'reset');
        }
      }
    });
  } else {
    log('   ⚠️  No nodes found in graph!', 'yellow');
  }
  
  return debugInfo;
}

async function runTests() {
  log('========================================', 'magenta');
  log('   Graph Structure Test Suite', 'magenta');
  log('========================================', 'magenta');
  
  try {
    // Check if backend is running
    const healthCheck = await fetch(`${CONFIG.baseUrl}/health`);
    if (!healthCheck.ok) {
      log('\n❌ Backend is not running!', 'red');
      log('Start it with: cd backend && npm run dev', 'yellow');
      process.exit(1);
    }
    
    // Clear the graph to start fresh
    await clearGraph();
    
    // Test 1: Generate root ideas
    log('\n📝 TEST 1: Generate root ideas and verify they\'re stored', 'yellow');
    const rootIdeas = await generateRootIdeas();
    let graphInfo = await verifyGraphStructure();
    
    // Account for prompt node + generated ideas
    const expectedNodes = rootIdeas.length + 1; // +1 for the prompt node
    if (graphInfo.totalNodes === expectedNodes) {
      log('   ✅ TEST 1 PASSED: Prompt node and root ideas stored correctly', 'green');
      log(`      - Created 1 prompt node and ${rootIdeas.length} idea nodes`, 'green');
    } else {
      log(`   ❌ TEST 1 FAILED: Expected ${expectedNodes} nodes (1 prompt + ${rootIdeas.length} ideas), got ${graphInfo.totalNodes}`, 'red');
    }
    
    // Test 2: Generate child ideas
    log('\n📝 TEST 2: Generate child ideas and verify parent-child relationships', 'yellow');
    const firstRoot = rootIdeas[0];
    const childIdeas = await generateChildIdeas(firstRoot);
    graphInfo = await verifyGraphStructure();
    
    const expectedTotal = expectedNodes + childIdeas.length;
    if (graphInfo.totalNodes === expectedTotal) {
      log('   ✅ TEST 2 PASSED: Child ideas stored with correct parent', 'green');
    } else {
      log(`   ❌ TEST 2 FAILED: Expected ${expectedTotal} nodes, got ${graphInfo.totalNodes}`, 'red');
    }
    
    // Test 3: Merge ideas
    log('\n📝 TEST 3: Merge ideas and verify merged node is stored', 'yellow');
    const nodesToMerge = childIdeas.length >= 2 ? childIdeas.slice(0, 2) : childIdeas;
    if (nodesToMerge.length > 0) {
      const mergedIdea = await mergeIdeas(nodesToMerge);
      graphInfo = await verifyGraphStructure();
      
      const expectedAfterMerge = expectedTotal + (mergedIdea ? 1 : 0);
      if (graphInfo.totalNodes === expectedAfterMerge) {
        log('   ✅ TEST 3 PASSED: Merged idea stored correctly', 'green');
      } else {
        log(`   ❌ TEST 3 FAILED: Expected ${expectedAfterMerge} nodes, got ${graphInfo.totalNodes}`, 'red');
      }
    } else {
      log('   ⚠️  TEST 3 SKIPPED: No child ideas to merge', 'yellow');
    }
    
    // Test 4: Generate ideas from multiple parents
    log('\n📝 TEST 4: Generate ideas from different parent nodes', 'yellow');
    let expectedWithMoreChildren = graphInfo.totalNodes; // Use current total as baseline
    if (rootIdeas.length > 1) {
      const secondRoot = rootIdeas[1];
      const secondChildIdeas = await generateChildIdeas(secondRoot);
      graphInfo = await verifyGraphStructure();
      
      expectedWithMoreChildren = expectedWithMoreChildren + secondChildIdeas.length;
      if (graphInfo.totalNodes === expectedWithMoreChildren) {
        log('   ✅ TEST 4 PASSED: Multiple parent-child relationships working', 'green');
      } else {
        log(`   ❌ TEST 4 FAILED: Expected ${expectedWithMoreChildren} nodes, got ${graphInfo.totalNodes}`, 'red');
      }
    } else {
      log('   ⚠️  TEST 4 SKIPPED: Not enough root ideas', 'yellow');
    }
    
    // Test 5: Export and verify structure
    log('\n📝 TEST 5: Export graph and verify markdown structure', 'yellow');
    const markdown = await exportGraph();
    
    if (markdown && markdown.includes('## Ideas')) {
      log('   ✅ TEST 5 PASSED: Export generates valid markdown', 'green');
      
      // Check if hierarchy is preserved
      const hasIndentation = markdown.includes('  -');
      if (hasIndentation) {
        log('   ✅ Hierarchy preserved in export', 'green');
      } else {
        log('   ⚠️  Warning: No hierarchy detected in export', 'yellow');
      }
    } else {
      log('   ❌ TEST 5 FAILED: Export did not generate valid markdown', 'red');
    }
    
    // Final summary
    log('\n========================================', 'magenta');
    log('   Test Suite Complete!', 'magenta');
    log(`   Final graph size: ${graphInfo.totalNodes} nodes`, 'magenta');
    log('========================================', 'magenta');
    
  } catch (error) {
    log(`\n❌ Test suite failed with error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run the tests
runTests().catch(console.error);