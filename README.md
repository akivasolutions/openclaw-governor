# 🦞 Power Level Governor

**Power Level Control for OpenClaw Agents** — A DBZ-themed token governor that manages context window limits, temperature, and extended thinking (reasoning) for your Claude Opus agent.

> *"It's over 9000!"* — Control your agent's power with Super Saiyan flair.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What Is This?

The Power Level Governor is a standalone web interface that controls resource allocation for OpenClaw agents. It writes directly to your `openclaw.json` config to apply changes in real-time.

### Features

- 🟢 **Power Level Presets** — From Krillin (4K tokens) to Ultra Instinct (128K tokens)
- 🎯 **Task Presets** — One-click combos for Code, Creative, PM, Planning, Brainstorm, Debug
- 🌡️ **Temperature Control** — Chi-Chi (focused), Gohan (balanced), or Broly (creative) modes
- 🧠 **Reasoning Toggle** — Enable extended thinking with budget token control
- 📅 **Time-Based Scheduling** — Auto-adjust power levels by hour of day
- 🎛️ **Manual Override** — Direct control when you need it
- 💾 **Reserve Token Floor** — Set compaction threshold

## Quick Start

```bash
# Clone the repo
git clone https://github.com/akivasolutions/openclaw-governor.git
cd openclaw-governor

# Install dependencies
npm install

# Start the server
npm start
```

Open [http://localhost:3939](http://localhost:3939) in your browser.

## Screenshots

### Power Level Control
The main interface shows your current power level (maxTokens), mode (manual/auto), temperature, reasoning status, and reserve token floor. Click a DBZ preset or use the custom slider to adjust.

### Task Presets
One-click combos that set power level + temperature + reasoning:
- **💻 Code** — 8K tokens, 0.3 temp (precise)
- **🎨 Creative** — 16K tokens, reasoning ON with 12K budget (thinking mode)
- **📋 PM** — 4K tokens, 0.5 temp (balanced)
- **🏗️ Planning** — 32K tokens, reasoning ON with 10K budget
- **💡 Brainstorm** — 16K tokens, reasoning ON with 15K budget
- **🐛 Debug** — 64K tokens, reasoning ON with 20K budget

### Time Schedule
Click individual hours to cycle through power levels. The governor will auto-adjust based on the time of day when in Auto mode.

## Power Levels Reference

| Level | Name | Tokens | Use Case |
|-------|------|--------|----------|
| 🟢 | Krillin | 4,096 | Quick tasks, low context |
| 🔵 | Vegeta | 8,192 | Standard coding, moderate context |
| 🟡 | Super Saiyan | 16,384 | Complex tasks, large files |
| 🟠 | SS God | 32,768 | Architecture design, planning |
| 💠 | SS Blue | 65,536 | Deep debugging, multi-file analysis |
| 🔴 | Ultra Instinct | 128,000 | Maximum power, full repository context |

See [docs/POWER-LEVELS.md](docs/POWER-LEVELS.md) for detailed explanations.

## Configuration

The governor reads and writes to:
- `~/.openclaw/governor.json` — Governor settings
- `~/.openclaw/openclaw.json` — OpenClaw config (applies changes here)

### Default Config

```json
{
  "mode": "manual",
  "currentLevel": "high",
  "manualMaxTokens": 16384,
  "levels": {
    "low": 4096,
    "medium": 8192,
    "high": 16384,
    "ssg": 32768,
    "ssb": 65536,
    "max": 128000
  },
  "schedule": {
    "enabled": false,
    "slots": [
      { "start": 0, "end": 8, "level": "low" },
      { "start": 8, "end": 23, "level": "medium" },
      { "start": 23, "end": 24, "level": "low" }
    ]
  },
  "knobs": {
    "reserveTokensFloor": 20000,
    "temperature": 0.5,
    "reasoning": false,
    "budgetTokens": 10000
  }
}
```

## API Reference

### `GET /api/governor`

Fetch current governor state.

**Response:**
```json
{
  "mode": "manual",
  "currentLevel": "high",
  "manualMaxTokens": 16384,
  "activeMaxTokens": 16384,
  "levels": { ... },
  "schedule": { ... },
  "knobs": { ... },
  "configMaxTokens": 16384,
  "configTemperature": 0.5,
  "reasoningEnabled": false,
  "updatedAt": "2026-02-12T06:00:00.000Z"
}
```

### `POST /api/governor`

Update governor settings.

**Request Body:**
```json
{
  "mode": "manual",
  "currentLevel": "high",
  "manualMaxTokens": 16384,
  "schedule": {
    "enabled": false,
    "slots": [ ... ]
  },
  "knobs": {
    "reserveTokensFloor": 20000,
    "temperature": 0.5,
    "reasoning": false,
    "budgetTokens": 10000
  }
}
```

**Response:**
```json
{
  "ok": true,
  "governor": { ... }
}
```

## How It Works

1. **Frontend** — Single-page app with DBZ-themed controls
2. **Backend** — Express server that reads/writes config files
3. **Integration** — Writes to `openclaw.json` to apply changes to the Opus model

When you click "Save & Apply":
1. Governor saves your settings to `~/.openclaw/governor.json`
2. It updates the `claude-opus-4-6` model entry in `openclaw.json`:
   - Sets `maxTokens` to the active power level
   - Sets `reasoning` flag if enabled
   - Sets `temperature` and `budget_tokens` in `agents.defaults.models` params
   - Sets `reserveTokensFloor` in `agents.defaults.compaction`
3. OpenClaw picks up the changes on the next message

## Why DBZ Theme?

Because power levels are fun, and it makes resource management memorable:
- **Krillin** = low power, quick tasks
- **Vegeta** = solid mid-tier
- **Super Saiyan** = going beyond normal limits
- **SS God** / **SS Blue** = elite performance
- **Ultra Instinct** = maximum power, instinctive mastery

Plus, it's a reminder: with great power comes great API costs. Use wisely!

## Requirements

- Node.js 14+
- OpenClaw installed at `~/.openclaw/`
- An active `openclaw.json` config with `claude-opus-4-6` model

## Port Configuration

Default port: `3939`

Override with:
```bash
PORT=4000 npm start
```

## Development

```bash
# Clone and install
git clone https://github.com/akivasolutions/openclaw-governor.git
cd openclaw-governor
npm install

# Run in dev mode
npm run dev
```

The frontend is plain HTML/CSS/JS — no build step required. Edit files in `public/` and refresh your browser.

## License

MIT — See [LICENSE](LICENSE)

## Contributing

Pull requests welcome! This is a community tool for OpenClaw users.

## Credits

Built by [Akiva Solutions](https://akivasolutions.com) for the OpenClaw community.

**Inspired by:**
- Dragon Ball Z power levels
- The need for better token budget control
- Harold's obsession with making everything a dashboard

---

*"This isn't even my final form!"* — Your OpenClaw agent, probably.
