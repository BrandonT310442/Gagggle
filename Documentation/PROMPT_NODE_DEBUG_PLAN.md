# PromptNode Missing Issue - Debug & Fix Plan

## Problem Analysis
From console logs, we see:
- 3 nodes are being received from backend
- All nodes have `isPrompt: undefined` (should be `true` for prompt node)
- NodeGraph filters find 0 prompt nodes, 3 idea nodes
- This means the prompt node is not being properly marked or created

## Investigation Steps

### 1. Backend Check ✓
- `backend/src/generation/generate.ts` - Code looks correct, creates promptNode with `isPrompt: true`
- Needs verification: Is the prompt node actually being returned in API response?

### 2. API Transport Check
- `app/services/ideaGeneration.ts` - Check if data is lost in transport
- Network tab: Verify API response contains prompt node with correct metadata

### 3. Frontend Context Check
- `app/contexts/IdeaGraphContext.tsx` - Check if nodes are processed correctly
- Verify response.ideas includes prompt node and it's being added to state

### 4. Component Check
- `app/components/NodeGraph.tsx` - Filter logic looks correct
- `app/components/PromptNode.tsx` - Component exists and should work

## Root Cause Hypothesis
Most likely causes (in order of probability):
1. **Backend not returning prompt node** - Generate function creates it but doesn't include in response
2. **Mock service being used** - Frontend might be using mock data instead of real backend
3. **API response format mismatch** - Prompt node being filtered out somewhere
4. **Context state update issue** - Nodes not being added to state correctly

## Fix Plan

### Phase 1: Add Debug Logging
1. Add backend logging in `generate.ts` to confirm prompt node creation
2. Add API service logging to see exact response
3. Add context logging to see what nodes are being processed

### Phase 2: Identify Root Cause
1. Check if backend is running and being called
2. Check if prompt node is in API response
3. Check if prompt node is being added to frontend state

### Phase 3: Implement Fix
Based on root cause:
- **If backend issue**: Fix prompt node inclusion in response
- **If API issue**: Fix request/response handling
- **If frontend issue**: Fix context state management
- **If mock issue**: Ensure real backend is being used

### Phase 4: Verification
1. Verify prompt node appears in browser logs with `isPrompt: true`
2. Verify PromptNode component renders on whiteboard
3. Verify model info displays correctly in PromptNode

## Success Criteria
- Console shows: `NodeGraph: Prompt nodes found: 1`
- PromptNode appears centered above IdeaNodes on whiteboard
- PromptNode shows correct model icon and name
- Whiteboard layout: PromptNode (top center) → IdeaNodes (horizontal row below)