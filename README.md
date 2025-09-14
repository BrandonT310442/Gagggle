# Gagggle: AI-Augmented Collaborative Whiteboard

An intelligent whiteboarding platform that supercharges creativity through AI-powered ideation, real-time collaboration, and seamless idea manipulation.

## Vision

Gagggle transforms the traditional whiteboarding experience by eliminating "blank page anxiety" and accelerating the ideation process. We combine the spatial freedom of tools like Miro and FigJam with powerful AI capabilities that generate, expand, and synthesize ideas in real-time.

## Problem We're Solving

Traditional whiteboarding tools require manual ideation and organization, leading to:
- Slow start times and creative blocks
- Manual effort in grouping and iterating on ideas
- Limited creative exploration and combination of concepts
- Inefficient brainstorming sessions

**Our Solution:** AI-augmented ideation that jump-starts creativity while maintaining the flexibility of manual collaboration.

## Technical Architecture

### Frontend Stack
- **Next.js 15.5** - React framework with App Router
- **React 19.1** - UI component library
- **TypeScript 5** - Type-safe development
- **Tailwind CSS v4** - Responsive styling
- **ReactFlow** - Node-based graph visualization for whiteboard
- **React Draggable** - Drag and drop functionality
- **Socket.io Client** - Real-time collaboration
- **Lottie React** - Animations

### Backend Stack
- **Node.js/Express 5** - API server
- **TypeScript** - Type-safe backend development
- **Socket.io** - Real-time synchronization and cursor sharing
- **LangChain/LangGraph** - AI orchestration and workflow management

### AI Providers & Integration
- **Groq SDK** - Fast inference for idea generation
- **Cohere AI** - Advanced language model integration
- **LangChain Core** - Prompt engineering and chain management
- **LangGraph** - Stateful AI workflows for:
  - Idea generation and extraction
  - Content expansion
  - Idea merging and synthesis
  - Automatic categorization

### Key Features Implementation
- **Graph Store** - In-memory graph data structure for nodes and edges
- **Custom Prompt Templates** - Markdown-based prompts for different operations
- **Zod Validation** - Runtime type checking for API requests
- **Modular LLM Providers** - Swappable AI providers (Groq, Cohere, Mock)

## User Journey

1. **Start** → Create new board or select template
2. **Prompt** → Enter ideation prompt (e.g., "Ways to improve user onboarding")
3. **Generate** → AI creates 6-10 initial idea sticky notes
4. **Expand** → Click any idea to generate sub-ideas and details
5. **Combine** → Select multiple ideas for AI-powered synthesis
6. **Collaborate** → Invite team members for real-time editing
7. **Annotate** → Add drawings, arrows, and manual notes
8. **Export** → Save and share results in various formats

## Future Plans

### Core Features
- Advanced AI-powered idea clustering and categorization
- Real-time collaborative editing with multiple users
- Freehand drawing tools and annotations
- Export functionality (PDF, images, text)
- Template library for common brainstorming scenarios

### AI Enhancements
- Context-aware idea suggestions based on existing content
- Multi-modal AI integration (text, images, voice)
- Intelligent idea combination and synthesis
- Automated meeting summaries and action items

### Collaboration Features
- User authentication and permission management
- Version history and change tracking
- Comments and threaded discussions
- Screen sharing and video integration


## Getting Started

### Prerequisites
```bash
Node.js 18+
npm 9+
```

### API Keys Setup

Before running the application, you'll need to obtain API keys from the AI providers:

#### Groq API Key
1. Visit [Groq Console](https://console.groq.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_...`)

#### Cohere API Key
1. Visit [Cohere Dashboard](https://dashboard.cohere.ai/)
2. Sign up or log in to your account
3. Go to API Keys section
4. Generate a new API key
5. Copy the key (starts with `co_...`)

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/gagggle.git
cd gagggle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys:
# GROQ_API_KEY=your_groq_api_key_here
# COHERE_API_KEY=your_cohere_api_key_here

# Start frontend development server
npm run dev

# In another terminal, start backend server
npm run backend:dev
```

### Environment Variables
```env
# API Keys (Required)
GROQ_API_KEY=your_groq_api_key_here
COHERE_API_KEY=your_cohere_api_key_here

# Server Configuration
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Local Network Setup (For Team Collaboration)

To allow other users on your network to access the whiteboard:

#### Quick Setup
```bash
# Terminal 1: Get your local IP and start backend
npm run get-ip
npm run backend:local

# Terminal 2: Start frontend on network
npm run dev:local

# Share this URL with teammates:
# http://YOUR_IP:3000/?room=YOUR_ROOM_ID
```

#### Detailed Network Configuration

1. **Find your local IP address:**
   ```bash
   # Automatic detection
   npm run get-ip
   
   # Manual detection
   # macOS/Linux:
   ifconfig | grep inet
   # Windows:
   ipconfig | findstr IPv4
   ```

2. **Start services on network:**
   ```bash
   # Backend (Terminal 1)
   npm run backend:local
   
   # Frontend (Terminal 2) 
   npm run dev:local
   ```

3. **Share with teammates:**
   - Use the Network URL shown in terminal (e.g., `http://192.168.1.100:3000`)
   - Add room parameter: `http://YOUR_IP:3000/?room=demo123`
   - Ensure teammates are on the same WiFi network

#### Network Requirements
- All users must be on the same WiFi network
- Ports 3000 and 3001 must be available
- Firewall should allow connections on these ports

## Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Test AI client
npm run ai-client
```

## Performance Targets

- **Idea Generation:** < 2 seconds for 10 ideas
- **Board Load Time:** < 1 second
- **Real-time Sync:** < 100ms latency
- **AI Response:** < 3 seconds for expansion/combination
- **Concurrent Users:** Support 50+ per board

## Troubleshooting

### Common Issues

**API Key Errors:**
- Ensure your API keys are correctly set in `.env.local`
- Verify keys are active and have sufficient credits
- Check console for specific error messages

**Network Connection Issues:**
- Confirm all users are on the same WiFi network
- Check firewall settings for ports 3000 and 3001
- Verify IP address is correct (not localhost)
- Test backend health: `curl http://YOUR_IP:3001/health`

**Performance Issues:**
- Check WiFi signal strength
- Disable VPN if active
- Ensure no other applications are using the same ports

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.
