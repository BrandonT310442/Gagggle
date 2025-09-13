# AI Model Integration - GROQ & Cohere

This document explains the AI model integration that allows users to choose between GROQ and Cohere models for idea generation and merging.

## 🚀 Features

- **Multi-Provider Support**: GROQ, Cohere, and Mock providers
- **Model Selection**: Choose specific models within each provider
- **REST API**: Full API endpoints for web applications
- **Standalone Script**: Command-line tool for direct usage
- **Type Safety**: Full TypeScript integration

## 🔧 Setup

### 1. Environment Variables

Create a `.env` file in the project root with your API keys:

```bash
# API Keys
GROQ_API_KEY=your_groq_api_key_here
COHERE_API_KEY=your_cohere_api_key_here

# Optional: Set default provider
LLM_PROVIDER=groq  # or 'cohere' or 'mock'

# Server Configuration
PORT=3001
```

### 2. Install Dependencies

Dependencies are already installed. The integration uses:
- `groq-sdk` for GROQ API
- `cohere-ai` for Cohere API

## 📡 API Usage

### Start the Backend Server

```bash
npm run backend:dev  # Development mode with auto-reload
# or
npm run backend      # Production mode
```

The server runs on `http://localhost:3001`

### Available Endpoints

#### 1. Health Check
```bash
GET /health
```

#### 2. List Available Models
```bash
GET /api/models

# Get models for specific provider
GET /api/models?provider=groq
```

#### 3. Generate Ideas
```bash
POST /api/generate
Content-Type: application/json

{
  "prompt": "Generate startup ideas for AI",
  "count": 3,
  "boardId": "my-board",
  "modelConfig": {
    "provider": "groq",
    "model": "llama3-8b-8192"
  },
  "constraints": {
    "style": "creative",
    "domain": "technology"
  }
}
```

#### 4. Merge Ideas
```bash
POST /api/merge
Content-Type: application/json

{
  "boardId": "my-board",
  "nodes": [
    {"id": "1", "content": "AI-powered chatbot"},
    {"id": "2", "content": "Voice assistant for smart homes"}
  ],
  "mergeStrategy": "synthesize",
  "modelConfig": {
    "provider": "cohere",
    "model": "command-r"
  }
}
```

## 🖥️ Standalone Script Usage

The `ai-client` script allows direct interaction with the AI models:

### Basic Usage

```bash
# List all available models
npm run ai-client -- --operation list-models

# Generate ideas with GROQ
npm run ai-client -- --provider groq --model llama3-8b-8192 --prompt "Generate startup ideas" --count 5

# Generate ideas with Cohere
npm run ai-client -- --provider cohere --model command --prompt "Marketing strategies" --count 3

# Use environment default provider
npm run ai-client -- --prompt "Team productivity ideas"

# Merge ideas (comma-separated)
npm run ai-client -- --operation merge --provider groq --prompt "AI chatbot, Voice assistant, Smart home automation"
```

### Script Options

- `-p, --provider <provider>`: AI provider (groq, cohere, mock)
- `-m, --model <model>`: Specific model name
- `-o, --operation <operation>`: Operation (generate, merge, list-models)
- `--prompt <prompt>`: Text prompt to process
- `-c, --count <number>`: Number of ideas to generate (default: 3)
- `-t, --temperature <number>`: Randomness (0.0-1.0, default: 0.7)
- `-h, --help`: Show help message

## 🎯 Available Models

### GROQ Models
- `llama3-8b-8192`: Fast, efficient general-purpose model
- `llama3-70b-8192`: Larger, more capable model
- `mixtral-8x7b-32768`: Mixture of experts model
- `gemma-7b-it`: Google's instruction-tuned model
- `gemma2-9b-it`: Updated Gemma model

### Cohere Models
- `command`: Standard command model
- `command-light`: Faster, lighter version
- `command-r`: Research-oriented model
- `command-r-plus`: Enhanced research model

## 🏗️ Architecture

### Provider System

```typescript
interface LLMProvider {
  generateIdeas(params: LLMGenerationParams): Promise<string[]>;
  mergeIdeas(params: LLMMergeParams): Promise<string>;
  setModel?(model: string): void;
  getModel?(): string;
}
```

### Model Configuration

```typescript
interface ModelConfig {
  provider: 'groq' | 'cohere' | 'mock';
  model?: string;  // Optional specific model
}
```

### Request Examples

```typescript
// Generate ideas with model selection
const request: GenerateIdeasRequest = {
  prompt: "AI startup ideas",
  count: 3,
  boardId: "board-123",
  modelConfig: {
    provider: "groq",
    model: "llama3-70b-8192"
  }
};

// Merge ideas with different provider
const mergeRequest: MergeIdeasRequest = {
  boardId: "board-123",
  nodes: [
    { id: "1", content: "Idea 1" },
    { id: "2", content: "Idea 2" }
  ],
  mergeStrategy: "synthesize",
  modelConfig: {
    provider: "cohere",
    model: "command-r-plus"
  }
};
```

## 🛠️ Implementation Details

### File Structure

```
backend/src/
├── llm/
│   ├── provider.ts      # Base provider and factory
│   ├── groq.ts         # GROQ implementation
│   ├── cohere.ts       # Cohere implementation
│   └── mock.ts         # Mock provider for testing
├── types.ts            # TypeScript interfaces
├── server.ts           # Express server with endpoints
└── scripts/
    └── ai-client.ts    # Standalone CLI script
```

### Error Handling

The system includes comprehensive error handling:
- API key validation
- Provider-specific error messages
- Graceful fallbacks
- Detailed error responses

### Security Considerations

- API keys stored in environment variables
- No API keys exposed in client responses
- Input validation on all endpoints
- Rate limiting (can be added as needed)

## 📝 Examples

### Web Application Integration

```javascript
// Frontend JavaScript example
async function generateIdeas(prompt, provider = 'groq', model = 'llama3-8b-8192') {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      count: 5,
      boardId: 'my-board',
      modelConfig: { provider, model }
    })
  });
  
  const data = await response.json();
  return data.ideas;
}

// Usage
const ideas = await generateIdeas('AI startup ideas', 'cohere', 'command-r');
```

### Node.js Direct Usage

```javascript
import { getLLMProvider } from './backend/src/llm/provider';

// Direct provider usage
const provider = getLLMProvider({ provider: 'groq', model: 'llama3-8b-8192' });
const ideas = await provider.generateIdeas({
  prompt: 'Generate creative solutions',
  count: 3
});
```

## 🧪 Testing

The mock provider is available for testing without API keys:

```bash
# Test with mock provider
npm run ai-client -- --provider mock --prompt "Test ideas" --count 3

# Test API with mock
curl -X POST http://localhost:3001/api/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Test","count":2,"boardId":"test","modelConfig":{"provider":"mock"}}'
```

## 🚀 Production Deployment

1. Set environment variables in your hosting platform
2. Ensure `GROQ_API_KEY` and `COHERE_API_KEY` are properly configured
3. Set `LLM_PROVIDER` to your preferred default provider
4. Deploy with `npm run backend`

The integration is now ready for production use with full model selection capabilities!
