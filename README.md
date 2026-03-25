# Claude for Framer

A Framer plugin that integrates Claude AI directly into the editor — generate React components, rewrite copy, create design tokens, and manage CMS content through a conversational interface with real-time streaming.

## Features

### Chat with Context
Conversational AI assistant embedded in the Framer editor. Select any element on the canvas and Claude automatically receives that context, enabling precise and relevant responses.

### Component Generation
Describe a component in natural language and Claude generates production-ready React/TypeScript code. One click to add it as a Code File in your Framer project — ready to drag onto the canvas.

### Copy Editing
Select any text layer, ask Claude to rewrite, translate, shorten, or improve it, and apply the result directly to the canvas without leaving the editor.

### Design Token Creation
Generate color palettes, typography scales, and spacing systems from a simple description. Get consistent, systematic design tokens tailored to your project's style.

### CMS Assistant
Populate Framer CMS collections with AI-generated structured content. Ideal for prototyping, placeholder content, or kickstarting real content production.

### Smart Suggestions
Quick-start prompts to help you explore what the plugin can do — from generating hero sections to creating color palettes.

### Persistent Configuration
API key, model selection, and chat history are stored per-project using Framer's plugin data API. Your setup persists across sessions.

## Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | Plugin UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool and dev server |
| **Framer Plugin SDK** | Editor integration, canvas manipulation, CMS access |
| **Claude API** | AI responses with streaming support |

## Project Structure

```
claude-for-framer/
├── framer.json            # Plugin metadata and configuration
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite build configuration
├── index.html             # Entry HTML
├── public/
│   └── icon.svg           # Plugin icon (30x30)
└── src/
    ├── main.tsx           # Entry point — initializes plugin UI
    ├── App.tsx            # Main interface: chat, settings, message actions
    ├── App.css            # Component styles
    ├── global.css         # CSS variables with dark/light mode support
    ├── claude.ts          # Claude API client with streaming
    ├── hooks.ts           # React hooks for config, messages, and selection
    └── actions.ts         # Framer actions: create components, replace text
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- A [Framer](https://www.framer.com/) account
- A [Claude API key](https://console.anthropic.com/settings/keys)

### Installation

```bash
git clone https://github.com/YuxinDesigner/Claude-For-Framer-Plugin.git
cd claude-for-framer
npm install
```

### Development

```bash
npm run dev
```

Then in Framer:
1. Open your project
2. Go to **Plugins → Developer Tools**
3. The plugin will appear automatically from localhost

### Build & Package

```bash
npm run build
npm run pack
```

This generates a `plugin.zip` ready for submission to the [Framer Marketplace](https://www.framer.com/marketplace/dashboard/plugins/).

## Supported Models

| Model | Best For |
|---|---|
| **Claude Sonnet 4.6** | Fast, balanced responses (default) |
| **Claude Haiku 4.5** | Lightweight, quick tasks |
| **Claude Opus 4.6** | Complex generation and reasoning |

## License

MIT
