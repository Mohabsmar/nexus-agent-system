# NEXUS - Next-Generation Extensible Unified Agent System

<div align="center">

![NEXUS Logo](https://img.shields.io/badge/NEXUS-Agent%20System-emerald?style=for-the-badge&labelColor=gray)

**The OpenClaw Killer** 🚀

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-cyan?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[Features](#features) • [Quick Start](#quick-start) • [Architecture](#architecture) • [API](#api-reference) • [Deployment](#deployment)

</div>

---

## 🎯 Overview

NEXUS is an elite AI agent system built to outperform every other agent framework on the market. It's not a chatbot. It's not a wrapper. It's a **full-stack autonomous reasoning engine** with:

- **Persistent Memory** - Multi-tier memory system that never forgets
- **Real-time Voice Interaction** - Full duplex voice with multiple providers
- **Multi-Provider Intelligence Routing** - Smart routing across 8+ AI providers
- **Self-Healing Tool Execution** - 4-layer resilience with automatic recovery
- **Access to Every Major Skill Marketplace** - Unified access to 40,000+ skills

## ✨ Features

### 🧠 Multi-Provider LLM Routing
Intelligently routes tasks to the most appropriate language model:
- **Anthropic** - Claude Opus, Sonnet, Haiku
- **OpenAI** - GPT-4o, GPT-4o-mini, O3
- **Groq** - Llama 3.3 70B, Mixtral (ultra-fast)
- **Mistral** - Mistral Large, Codestral
- **Google** - Gemini 2.0 Flash/Pro
- **Cohere** - Command-R+, Embeddings
- **Together AI** - Open-source models
- **Ollama** - Local, private models

### 🗄️ 5-Tier Memory System
Never forgets anything important:
1. **Working Memory** - In-context for current session
2. **Episodic Memory** - Session summaries with SQLite persistence
3. **Semantic Memory** - Knowledge store with vector embeddings
4. **Procedural Memory** - Learned workflows and skills
5. **User Preferences** - Persistent settings

### 📊 DAG-Based Task Planner
- Builds Directed Acyclic Graphs for complex tasks
- Identifies parallel execution opportunities
- Dependency tracking with automatic scheduling
- Visual execution graph in dashboard

### 🛠️ Self-Healing Tool Execution
4-layer resilience system:
1. **Pre-call Validation** - Parameter schema validation
2. **Retry with Backoff** - Exponential backoff for transient errors
3. **Error Classification** - AUTH_ERROR, RATE_LIMIT, TIMEOUT, etc.
4. **Fallback Routing** - Automatic tool replacement

### 🎤 Full-Duplex Voice Layer
- **TTS Providers**: ElevenLabs, OpenAI TTS, Coqui, pyttsx3
- **STT Providers**: OpenAI Whisper, Deepgram, AssemblyAI
- **Voice Personas**: Professional, Assistant, Developer, Teacher
- **Wake Word Detection**: "Hey Nexus"
- **Interruption Handling**: Stop speaking when user interrupts

### 📦 Unified Skill Marketplace
Access all major skill marketplaces:
- **ClawdHub** - 39,000+ skills
- **Smithery** - MCP servers
- **Composio** - 250+ app integrations
- **npm Registry** - Community packages
- **GitHub** - Topic-tagged repos
- **OpenTools** - Pre-built API integrations

### 🔐 Security & Privacy
- Capability-based permissions
- Privacy mode (local-only execution)
- System keychain integration
- Granular access control

### 📈 Self-Improvement Loop
- Post-run evaluation scoring
- Automatic improvement suggestions
- Prompt self-editing (advanced mode)
- Cost optimization recommendations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or Bun
- pnpm (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/nexus-agent.git
cd nexus-agent

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys

# Run database migrations
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

```env
# AI Providers
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key
GROQ_API_KEY=your_key
MISTRAL_API_KEY=your_key
GOOGLE_API_KEY=your_key
COHERE_API_KEY=your_key
TOGETHER_API_KEY=your_key

# Voice (Optional)
ELEVENLABS_API_KEY=your_key
DEEPGRAM_API_KEY=your_key
ASSEMBLYAI_API_KEY=your_key

# Database
DATABASE_URL=file:./nexus.db
```

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        NEXUS AGENT                          │
├─────────────┬─────────────┬─────────────┬─────────────────┤
│   Router    │   Planner   │   Memory    │     Voice       │
│  (LLM Ops)  │   (DAG)     │  (5-Tier)   │   (TTS/STT)     │
├─────────────┼─────────────┼─────────────┼─────────────────┤
│    Tools    │ Marketplace │  Security   │   Evaluator     │
│ (Self-Heal) │  (7 Src)    │ (Perms)     │ (Improve)       │
└─────────────┴─────────────┴─────────────┴─────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │    Dashboard UI   │
                    │   (Next.js 16)    │
                    └───────────────────┘
```

### Core Components

| Component | File | Description |
|-----------|------|-------------|
| **Router** | `src/lib/nexus/core/router.ts` | Multi-provider LLM routing |
| **Planner** | `src/lib/nexus/planner/dag-planner.ts` | DAG-based task planning |
| **Memory** | `src/lib/nexus/memory/memory-engine.ts` | 5-tier memory system |
| **Tools** | `src/lib/nexus/tools/tool-registry.ts` | Self-healing execution |
| **Voice** | `src/lib/nexus/voice/voice-layer.ts` | TTS/STT integration |
| **Marketplace** | `src/lib/nexus/marketplaces/skill-marketplace.ts` | Skill management |
| **Security** | `src/lib/nexus/security/security-manager.ts` | Permissions & secrets |
| **Evaluation** | `src/lib/nexus/core/evaluation.ts` | Self-improvement loop |
| **Checkpoint** | `src/lib/nexus/core/checkpoint.ts` | Rollback system |

## 📡 API Reference

### POST /api/agent
Execute a task with the agent.

```typescript
interface RunRequest {
  goal: string;           // Task description
  voice?: boolean;        // Enable voice mode
  model?: string;         // Override model
  provider?: string;      // Override provider
  budget?: number;        // Cost limit ($)
  timeout?: number;       // Time limit (ms)
  autoConfirm?: boolean;  // Skip confirmations
  noMemory?: boolean;     // Skip memory operations
  noPlan?: boolean;       // Skip DAG planning
}
```

### GET /api/providers
List all providers with health status.

### GET/POST /api/skills
Search and manage skills.

### GET/POST /api/memory
Access memory system.

### GET/POST /api/tools
List and execute tools.

### GET/POST /api/voice
Voice configuration and control.

### GET/POST /api/config
System configuration.

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Docker

```bash
docker build -t nexus-agent .
docker run -p 3000:3000 nexus-agent
```

### Self-Hosted

```bash
# Build for production
pnpm build

# Start server
pnpm start
```

## 🎨 Dashboard Features

The web dashboard includes:

- **Real-time Stats** - Runs, tokens, costs, success rate
- **Task Execution** - Quick task input with options
- **Provider Management** - Health monitoring, model selection
- **Skill Browser** - Search, install, manage skills
- **Memory Viewer** - Browse episodic/semantic memory
- **Tool Registry** - View and execute tools
- **Settings Panel** - Permissions, voice, privacy

## 📊 Competitive Comparison

| Feature | OpenClaw | AutoGPT | Devin | **NEXUS** |
|---------|----------|---------|-------|-----------|
| Voice I/O | ❌ | ❌ | ❌ | ✅ |
| Multi-Provider | ❌ | ❌ | ❌ | ✅ 8+ |
| Skill Marketplaces | 1 | 0 | 0 | ✅ 7+ |
| Memory Tiers | 1 | 1 | 1 | ✅ 5 |
| DAG Planning | ❌ | ❌ | ❌ | ✅ |
| Self-Healing | ❌ | ❌ | ❌ | ✅ 4-layer |
| Self-Improvement | ❌ | ❌ | ❌ | ✅ |
| Web Dashboard | ❌ | ❌ | ❌ | ✅ |
| Privacy Mode | ❌ | ❌ | ❌ | ✅ |
| Rollback | ❌ | ❌ | ❌ | ✅ |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

---

<div align="center">

**NEXUS** - *The OpenClaw Killer* 🚀

Made with ❤️ by the NEXUS Team

</div>
