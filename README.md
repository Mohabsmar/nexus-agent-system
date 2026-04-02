# 🐱 Z-Claw - AI Agent System Terminal Interface

<div align="center">

![Z-Claw](https://img.shields.io/badge/🐱_Z--Claw-Terminal_Interface-00f5ff?style=for-the-badge)

**Zero-Compromise Learning & Agent Workbench**

*Built by Mohab & VoiceClaw (both 11 years old!)*

</div>

---

## ⚡ One-Liner Install

```bash
npx z-claw
```

That's it! The setup wizard will guide you through everything.

---

## 🚀 Quick Start

```bash
# Run directly (no install needed)
npx z-claw

# Or install globally
npm install -g z-claw
z-claw

# Run a task directly
npx z-claw --run "Build a REST API with auth"
```

---

## 🎯 Features

- **🗣️ Natural Language Tasks** - Just type what you want
- **🧠 Smart Provider Routing** - Picks the best AI for each task
- **💾 Persistent Memory** - Remembers everything across sessions
- **🔌 8+ AI Providers** - Claude, GPT, Groq, Gemini, and more
- **🎤 Voice Mode** - Speak and listen to your AI
- **🛒 Massive Marketplace** - Skills, Agents, Plugins, Templates, and more!

---

## 🛒 Z-Claw Marketplace

The **biggest AI agent marketplace** with 10 categories:

### 🤖 Agents
Pre-configured AI agents for specific tasks:
- Senior Developer Agent - Expert coding & architecture
- Research Analyst - Web research & synthesis
- Project Manager - Task & workflow management
- Data Scientist - ML & data analysis
- Creative Writer - Content & storytelling

### ⚡ Skills
Extend Z-Claw with new capabilities from multiple sources:
- ClawdHub (39,000+ skills)
- Smithery (MCP servers)
- npm Registry
- GitHub
- Composio

### 🔌 Plugins
Integrations and extensions:
- Slack Channel - Workspace messaging
- Discord Channel - Bot integration
- GitHub Integration - Repo & issue management
- WhatsApp Channel - Personal messaging
- Notion Integration - Notes & databases

### 📄 Templates
Project and workflow templates:
- Next.js 16 Starter - Full-stack with TypeScript
- AI Chatbot Template - Streaming chatbot
- API Service Template - RESTful with auth

### 🔄 Workflows
Automated workflows and pipelines:
- CI/CD Pipeline - Build & deploy automation
- Support Automation - Customer service AI
- Daily Reports - Scheduled generation

### 💬 Prompts
Pre-built prompt templates:
- Code Review - Security & performance analysis
- Tech Documentation - Generate from code
- Creative Writer - Story & content

### 🗣️ Voices
Voice packs for text-to-speech:
- Professional Male - Business voice
- Friendly Female - Assistant voice
- Deep Narrator - Presentation voice

### 🔗 Integrations
Connect with external services:
- Google Workspace - Drive, Docs, Calendar
- Microsoft 365 - Teams, Outlook, OneDrive
- Jira - Issue tracking

### 🎨 Themes
UI themes and color schemes:
- Midnight Blue - Elegant dark theme
- Sunset Orange - Warm light theme
- Cyberpunk Neon - Futuristic neon

---

## 📋 Commands

| Command | Alias | Description |
|---------|-------|-------------|
| `help` | | Show all commands |
| `run <goal>` | | Execute a task |
| `chat` | | Interactive chat mode |
| `marketplace` | `mp`, `market` | Browse full marketplace |
| `agents` | | Browse AI agents |
| `plugins` | | Browse plugins |
| `templates` | | Browse templates |
| `workflows` | | Browse workflows |
| `prompts` | | Browse prompt templates |
| `voices` | | Browse voice packs |
| `integrations` | | Browse integrations |
| `themes` | | Browse themes |
| `skills` | | Browse skill marketplace |
| `providers` | | List AI providers |
| `keys` | | Manage API keys |
| `stats` | | Usage statistics |
| `config` | | View/edit settings |
| `setup` | | Run setup wizard |
| `clear` | | Clear screen |
| `exit` | `q`, `quit` | Exit Z-Claw |

---

## 🔌 API Endpoints

Z-Claw exposes REST API endpoints for programmatic access:

### Marketplace API
```
GET  /api/marketplace              # Search marketplace
GET  /api/marketplace?action=stats # Get marketplace stats
GET  /api/marketplace?action=featured # Get featured items
GET  /api/marketplace?action=trending # Get trending items
GET  /api/marketplace?action=new-releases # Get new releases
GET  /api/marketplace?action=installed # Get installed items
GET  /api/marketplace/[slug]       # Get specific item
POST /api/marketplace/[slug]       # Install item
DELETE /api/marketplace/[slug]     # Uninstall item

GET  /api/marketplace/agents       # List all agents
GET  /api/marketplace/plugins      # List all plugins
GET  /api/marketplace/templates    # List all templates
GET  /api/marketplace/workflows    # List all workflows
GET  /api/marketplace/prompts      # List all prompts
GET  /api/marketplace/voices       # List all voices
GET  /api/marketplace/integrations # List all integrations
GET  /api/marketplace/themes       # List all themes
```

### Query Parameters
```
q           - Search query
category    - Filter by category
source      - Filter by source (clawdhub, smithery, npm, github)
tags        - Filter by tags (comma-separated)
author      - Filter by author
price       - Filter by price (free, freemium, paid)
rating      - Minimum rating
installed   - Show only installed (true/false)
featured    - Show only featured (true/false)
sort        - Sort by (popular, recent, rating, downloads, name)
limit       - Results per page (default: 20)
offset      - Pagination offset
```

---

## 🔑 API Keys

Z-Claw will ask for API keys during setup. Get them from:

| Provider | Get Key |
|----------|---------|
| Anthropic | [console.anthropic.com](https://console.anthropic.com/) |
| OpenAI | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Groq | [console.groq.com/keys](https://console.groq.com/keys) |
| Google | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| Mistral | [console.mistral.ai](https://console.mistral.ai/) |

---

## 🎨 Themes

Choose your vibe during setup:
- 🐙 **Cyberpunk** - Cyan/Purple neon glow
- 🌲 **Forest** - Natural green tones
- 🔥 **Fire** - Orange/Red warmth
- 🌙 **Dark** - Clean gray minimalism

---

## 💡 Example Session

```
$ npx z-claw

    ███████╗███████╗ █████╗ ██╗      █████╗ 
    ╚══███╔╝██╔════╝██╔══██╗██║     ██╔══██╗
      ███╔╝ █████╗  ███████║██║     ███████║
     ███╔╝  ██╔══╝  ██╔══██║██║     ██╔══██║
    ███████╗███████╗██║  ██║███████╗██║  ██║
    ╚══════╝╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
    
    Zero-Compromise Learning & Agent Workbench
    Built by Mohab & VoiceClaw
    ══════════════════════════════════════════

🚀 First Time Setup Wizard
──────────────────────────────────────────────────

? What should I call you? Mohab
? Which AI provider do you want as default? Anthropic (Claude)
? Enter your ANTHROPIC API key: ********
? Enable voice mode? No
? Choose your theme: 🐙 Cyberpunk
? Enable privacy mode? No

✅ Setup complete!
  Config saved to: ~/.config/z-claw-nodejs/config.json

Type "help" to see available commands

  Hello Mohab! I'm Z-Claw, your AI assistant.
  Type your goal or "help" for commands.

Mohab@z-claw ❯ marketplace

  🛒 Z-Claw Marketplace
  ──────────────────────────────────────────────────
  Discover and install extensions for Z-Claw

? What would you like to explore?
  🤖 Agents        Pre-configured AI agents
  ⚡ Skills        Extend Z-Claw capabilities
  🔌 Plugins       Integrations and extensions
  📄 Templates     Project templates
  🔄 Workflows     Automated pipelines
  💬 Prompts       Pre-built prompts
  🗣️ Voices        Voice packs for TTS
  🔗 Integrations  External services
  🎨 Themes        UI themes
  🔍 Search all items
  ⭐ Featured items
  📈 Trending now

Mohab@z-claw ❯ agents

  🤖 Agents
  ──────────────────────────────────────────────────
  1. Senior Developer Agent ★ 4.9
     Expert coding and architecture • 25K installs
  2. Research Analyst ★ 4.8
     Web research and synthesis • 18K installs
  3. Project Manager ★ 4.7
     Task and workflow management • 12K installs
  4. Data Scientist ★ 4.8
     ML and data analysis • 15K installs

? What would you like to do?
  View item details
  Install an item
  ← Back to marketplace

Mohab@z-claw ❯ exit

  👋 Bye! See you next time!
```

---

## 🛠️ CLI Options

```bash
z-claw [options]

Options:
  -v, --version     Show version
  -s, --setup       Run setup wizard
  -c, --config      Show configuration
  -r, --run <goal>  Run a task directly
  --providers       List all providers
  --keys            Manage API keys
  -h, --help        Show help
```

---

## 🌐 Supported Providers

| Provider | Models | Best For |
|----------|--------|----------|
| **Anthropic** | Claude Opus 4.6, Sonnet 4.5 | Reasoning, coding, safety |
| **OpenAI** | GPT-5.4, GPT-4.5 Turbo | Creativity, versatility |
| **Groq** | Llama 4 70B, Mixtral | Ultra-fast inference |
| **Google** | Gemini 3.1 Pro | Knowledge, multimodal |
| **Mistral** | Mistral Large 2, Codestral | Code generation |
| **xAI** | Grok 4.20 | Real-time info, wit |
| **DeepSeek** | DeepSeek V4 | Cost-effective reasoning |
| **Ollama** | Local models | Privacy, offline use |

---

## 📁 Project Structure

```
z-claw/
├── src/
│   ├── app/api/           # Next.js API routes
│   │   ├── marketplace/   # Marketplace endpoints
│   │   ├── agent/         # Agent execution
│   │   ├── skills/        # Skills API
│   │   └── providers/     # Provider management
│   ├── lib/zclaw/         # Core library
│   │   ├── core/          # Core components
│   │   ├── marketplaces/  # Marketplace system
│   │   ├── memory/        # Memory engine
│   │   ├── planner/       # DAG planner
│   │   ├── security/      # Security manager
│   │   ├── tools/         # Tool registry
│   │   └── voice/         # Voice layer
│   └── cli/               # CLI interface
├── bin/z-claw.js          # CLI entry point
└── package.json
```

---

## 📁 Config Location

Your config is stored at:
- **macOS/Linux**: `~/.config/z-claw-nodejs/config.json`
- **Windows**: `%APPDATA%\z-claw-nodejs\config.json`

---

## 🔒 Privacy & Security

- API keys are encrypted before storage
- No data leaves your machine except API calls
- Privacy mode available (local models only)
- All credentials stored locally

---

## 👥 Authors

**Mohab & VoiceClaw** - Two 11-year-olds who thought they could build something better than the grown-ups did.

*"Why wait to be an adult to build cool stuff?"*

---

## 📜 License

MIT © 2025 Mohab & VoiceClaw

---

<div align="center">

**Star ⭐ us on GitHub!**

https://github.com/Mohabsmar/nexus-agent-system

</div>
