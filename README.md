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
- **🛠️ Skill Marketplace** - Install new abilities from ClawdHub, Smithery, npm

---

## 📋 Commands

| Command | Description |
|---------|-------------|
| `help` | Show all commands |
| `run <goal>` | Execute a task |
| `chat` | Interactive chat mode |
| `providers` | List AI providers |
| `keys` | Manage API keys |
| `skills` | Browse skill marketplace |
| `stats` | Usage statistics |
| `config` | View/edit settings |
| `setup` | Run setup wizard |
| `clear` | Clear screen |
| `exit` | Exit Z-Claw |

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

Mohab@z-claw ❯ Build a REST API with authentication

⠋ Planning task...
✅ Task completed!

  Result:
  ────────────────────────────────────────
    Status:     ✅ Completed
    Duration:   3.42s
    Tokens:     1,247
    Cost:       $0.0012
    Provider:   anthropic

Mohab@z-claw ❯ chat

  💬 Chat Mode
  Type "exit" to return to main menu

  You: What can you help me with?
  Z-Claw: I can help with coding, research, writing, data analysis...
  
  You: exit
  Returning to main menu...

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
