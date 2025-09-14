# Gagggle: AI-Augmented Collaborative Whiteboard

An intelligent whiteboarding platform that supercharges creativity through AI-powered ideation, real-time collaboration, and seamless idea manipulation.

## 🎯 Vision

Gagggle transforms the traditional whiteboarding experience by eliminating "blank page anxiety" and accelerating the ideation process. We combine the spatial freedom of tools like Miro and FigJam with powerful AI capabilities that generate, expand, and synthesize ideas in real-time.

## 🚀 Problem We're Solving

Traditional whiteboarding tools require manual ideation and organization, leading to:
- Slow start times and creative blocks
- Manual effort in grouping and iterating on ideas
- Limited creative exploration and combination of concepts
- Inefficient brainstorming sessions

**Our Solution:** AI-augmented ideation that jump-starts creativity while maintaining the flexibility of manual collaboration.

## 🏗️ Technical Architecture

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

## 🔄 User Journey

1. **Start** → Create new board or select template
2. **Prompt** → Enter ideation prompt (e.g., "Ways to improve user onboarding")
3. **Generate** → AI creates 6-10 initial idea sticky notes
4. **Expand** → Click any idea to generate sub-ideas and details
5. **Combine** → Select multiple ideas for AI-powered synthesis
6. **Collaborate** → Invite team members for real-time editing
7. **Annotate** → Add drawings, arrows, and manual notes
8. **Export** → Save and share results in various formats

## 🗺️ Development Roadmap

### Phase 1: MVP (Months 1-2)
- [ ] Core whiteboard canvas with sticky notes
- [ ] AI idea generation from prompts
- [ ] Basic idea expansion
- [ ] Real-time collaboration (text only)
- [ ] Export to PDF/text
- [ ] User authentication

### Phase 2: Enhanced AI (Month 3)
- [ ] Idea combination/hybridization
- [ ] Advanced prompt refinement
- [ ] AI-powered clustering
- [ ] Context-aware suggestions

### Phase 3: Collaboration (Month 4)
- [ ] Freehand drawing tools
- [ ] Advanced permission system
- [ ] Version history
- [ ] Templates library
- [ ] Comments and chat

### Phase 4: Integrations (Post-MVP)
- [ ] Slack/Teams integration
- [ ] Notion/JIRA sync
- [ ] API for third-party apps
- [ ] Mobile applications

## 🚀 Getting Started

### Prerequisites
```bash
Node.js 18+
npm 9+
```

### Installation
```bash
# Clone repository
git clone https://github.com/yourusername/gagggle.git
cd gagggle

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys (GROQ_API_KEY, COHERE_API_KEY)

# Start frontend development server
npm run dev

# In another terminal, start backend server
npm run backend:dev

# For local network demo (allows other devices on network to connect)
npm run demo:local
```

### Environment Variables
```env
# API Keys
GROQ_API_KEY=your_groq_api_key
COHERE_API_KEY=your_cohere_api_key

# Server Configuration
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit

# Test AI client
npm run ai-client
```

## 📈 Performance Targets

- **Idea Generation:** < 2 seconds for 10 ideas
- **Board Load Time:** < 1 second
- **Real-time Sync:** < 100ms latency
- **AI Response:** < 3 seconds for expansion/combination
- **Concurrent Users:** Support 50+ per board

## 🔒 Security & Privacy

- End-to-end encryption for sensitive boards
- GDPR/CCPA compliant data handling
- Regular security audits
- IP protection for generated ideas
- Role-based access control

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with Next.js, React, and TypeScript
- Powered by OpenAI and Anthropic Claude
- Inspired by Miro, FigJam, and collaborative creativity tools

## 📞 Contact

- Website: [gagggle.ai](https://gagggle.ai)
- Email: team@gagggle.ai
- Twitter: [@gagggle](https://twitter.com/gagggle)

---

**Built with ❤️ for creative teams everywhere**
