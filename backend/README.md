# BrainstormBoard Backend

Simple Express server for AI-powered idea generation and merging.

## Structure

```
backend/
└── src/
    ├── server.ts           # Main Express server
    ├── types.ts           # TypeScript interfaces
    ├── generation/        # Idea generation logic
    │   ├── generate.ts
    │   └── prompts/      # Markdown prompt templates
    ├── merge/            # Idea merging logic
    │   ├── merge.ts
    │   └── prompts/      # Markdown prompt templates
    ├── llm/              # LLM provider interface
    │   ├── provider.ts
    │   └── mock.ts
    └── utils/
        └── validation.ts  # Input validation
```

## API Endpoints

- `POST /api/generate` - Generate new ideas
- `POST /api/merge` - Merge existing ideas
- `GET /health` - Health check

## Running the Server

The server runs on port 3000 by default and uses a mock LLM provider for development.