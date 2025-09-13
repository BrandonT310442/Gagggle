# Requirements: BrainstormBoard Backend

## Overview
Backend service for AI-augmented collaborative whiteboard focusing on idea generation and merging functionality.

## Core Requirements

### Technology Stack
- **Language**: TypeScript
- **Runtime**: Node.js
- **AI Integration**: LLM API (OpenAI/Claude/etc.)
- **Database**: TBD (likely PostgreSQL for relational data)
- **API**: REST or GraphQL

### Primary Functions

#### 1. Idea Generation Node
**Purpose**: Generate new idea nodes based on prompts

**Inputs**:
- `prompt`: string - The user's prompt for idea generation
- `count`: number - Number of idea nodes to generate (user-specified)
- `parentNode`: object (optional) - Previous node context if expanding existing idea
  - `id`: string
  - `content`: string
  - `metadata`: object

**Output**:
- Array of generated idea nodes with:
  - `id`: string
  - `content`: string
  - `parentId`: string (optional)
  - `metadata`: object (tags, category, etc.)
  - `createdAt`: timestamp

#### 2. Idea Merge Node
**Purpose**: Combine/synthesize multiple selected ideas

**Inputs**:
- `nodes`: array - Selected nodes to merge
  - Each containing: `id`, `content`, `metadata`
- `mergePrompt`: string (optional) - User's specific merge instruction
- `mergeStrategy`: enum - DEFAULT | USER_GUIDED

**Output**:
- Merged idea node with:
  - `id`: string
  - `content`: string
  - `sourceNodeIds`: array of strings
  - `mergeType`: string
  - `metadata`: object
  - `createdAt`: timestamp

## API Specification

### Endpoints

#### POST /api/ideas/generate
Generate new idea nodes

#### POST /api/ideas/expand
Expand existing idea with sub-ideas

#### POST /api/ideas/merge
Merge multiple ideas into synthesized concept

#### GET /api/ideas/:boardId
Retrieve all ideas for a board

#### PUT /api/ideas/:id
Update idea content/metadata

## Data Models

### IdeaNode
- id: string
- boardId: string
- content: string
- position: {x: number, y: number}
- parentId?: string
- childIds: string[]
- metadata: object
- createdBy: string
- createdAt: Date
- updatedAt: Date

### Board
- id: string
- name: string
- ownerId: string
- nodes: IdeaNode[]
- prompt: string
- createdAt: Date
- updatedAt: Date

## Constraints

### Performance
- Idea generation: < 3 seconds response time
- Merge operation: < 2 seconds response time
- Support concurrent requests

### AI Integration
- Token limit management
- Rate limiting for API calls
- Prompt optimization for quality results
- Context window management for expansions

### Data
- Max nodes per board: 1000
- Max content length per node: 500 characters
- Maintain parent-child relationships
- Preserve merge history

## Success Criteria
- Reliable idea generation with relevant outputs
- Intelligent merging that preserves context
- Low latency for user interactions
- Scalable architecture for multiple boards/users