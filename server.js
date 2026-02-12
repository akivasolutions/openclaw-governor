const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3939;

// Paths
const GOVERNOR_PATH = path.join(process.env.HOME, '.openclaw', 'governor.json');
const OPENCLAW_CONFIG = path.join(process.env.HOME, '.openclaw', 'openclaw.json');

// Middleware
app.use(express.json());
app.use(express.static('public'));

// ─── Helper Functions ──────────────────────────────────────────────────────────

function readGovernor() {
  try {
    return JSON.parse(fs.readFileSync(GOVERNOR_PATH, 'utf-8'));
  } catch {
    return {
      mode: 'manual',
      currentLevel: 'high',
      manualMaxTokens: 16384,
      levels: {
        low: 4096,
        medium: 8192,
        high: 16384,
        ssg: 32768,
        ssb: 65536,
        max: 128000
      },
      schedule: {
        enabled: false,
        slots: [
          { start: 0, end: 8, level: 'low' },
          { start: 8, end: 23, level: 'medium' },
          { start: 23, end: 24, level: 'low' }
        ]
      },
      knobs: {
        reserveTokensFloor: 20000,
        temperature: null,
        reasoning: false,
        budgetTokens: 10000
      },
      taskPresets: {
        code: { level: 'medium', temperature: 0.3, reasoning: false, name: '💻 Code', desc: 'Precise coding' },
        creativity: { level: 'high', temperature: 1, reasoning: true, budgetTokens: 12000, name: '🎨 Creative', desc: 'Writing & content (thinking)' },
        pm: { level: 'low', temperature: 0.5, reasoning: false, name: '📋 PM', desc: 'Project management' },
        planning: { level: 'ssg', temperature: 1, reasoning: true, budgetTokens: 10000, name: '🏗️ Planning', desc: 'Architecture design (thinking)' },
        brainstorm: { level: 'high', temperature: 1, reasoning: true, budgetTokens: 15000, name: '💡 Brainstorm', desc: 'Wild ideation (thinking)' },
        debug: { level: 'ssb', temperature: 1, reasoning: true, budgetTokens: 20000, name: '🐛 Debug', desc: 'Deep analysis (thinking)' }
      },
      updatedAt: new Date().toISOString()
    };
  }
}

function getActiveMaxTokens(gov) {
  if (gov.mode === 'manual') {
    return gov.manualMaxTokens || gov.levels[gov.currentLevel] || 16384;
  }
  if (gov.schedule?.enabled) {
    const hour = new Date().getHours();
    const slot = gov.schedule.slots.find(s => hour >= s.start && hour < s.end);
    if (slot) return gov.levels[slot.level] || 16384;
  }
  return gov.levels[gov.currentLevel] || 16384;
}

function findOpusModel(oc) {
  const providers = oc.models?.providers || {};
  for (const prov of Object.values(providers)) {
    if (!prov.models) continue;
    for (const m of prov.models) {
      if (m.id === 'claude-opus-4-6') return m;
    }
  }
  return null;
}

// ─── API Routes ────────────────────────────────────────────────────────────────

app.get('/api/governor', (req, res) => {
  const gov = readGovernor();
  gov.activeMaxTokens = getActiveMaxTokens(gov);
  
  // Read current openclaw.json values
  try {
    const oc = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG, 'utf-8'));
    const opus = findOpusModel(oc);
    gov.configMaxTokens = opus?.maxTokens || null;
    
    const opusKey = 'anthropic/claude-opus-4-6';
    gov.configTemperature = oc.agents?.defaults?.models?.[opusKey]?.params?.temperature ?? null;
    gov.reasoningEnabled = !!(opus?.reasoning);
    gov.configBudgetTokens = oc.agents?.defaults?.models?.[opusKey]?.params?.budget_tokens ?? null;
    gov.configReserveFloor = oc.agents?.defaults?.compaction?.reserveTokensFloor || null;
  } catch (e) {
    console.error('Failed to read openclaw config:', e.message);
  }
  
  res.json(gov);
});

app.post('/api/governor', (req, res) => {
  try {
    const gov = readGovernor();
    const body = req.body;

    if (body.mode !== undefined) gov.mode = body.mode;
    if (body.currentLevel !== undefined) gov.currentLevel = body.currentLevel;
    if (body.manualMaxTokens !== undefined) gov.manualMaxTokens = Number(body.manualMaxTokens);
    if (body.schedule !== undefined) gov.schedule = body.schedule;
    if (body.knobs !== undefined) Object.assign(gov.knobs, body.knobs);
    gov.updatedAt = new Date().toISOString();

    fs.writeFileSync(GOVERNOR_PATH, JSON.stringify(gov, null, 2));

    // Apply to openclaw.json
    const activeTokens = getActiveMaxTokens(gov);
    try {
      const oc = JSON.parse(fs.readFileSync(OPENCLAW_CONFIG, 'utf-8'));
      const opus = findOpusModel(oc);
      
      if (opus) {
        opus.maxTokens = activeTokens;
        delete opus.temperature; // Not valid on model defs
        if (gov.knobs.reasoning != null) {
          opus.reasoning = !!gov.knobs.reasoning;
        }
      }

      // Set params on agents.defaults.models
      const opusKey = 'anthropic/claude-opus-4-6';
      if (!oc.agents) oc.agents = {};
      if (!oc.agents.defaults) oc.agents.defaults = {};
      if (!oc.agents.defaults.models) oc.agents.defaults.models = {};
      if (!oc.agents.defaults.models[opusKey]) oc.agents.defaults.models[opusKey] = {};
      if (!oc.agents.defaults.models[opusKey].params) oc.agents.defaults.models[opusKey].params = {};
      
      const params = oc.agents.defaults.models[opusKey].params;
      
      if (gov.knobs.reasoning) {
        delete params.temperature;
        if (gov.knobs.budgetTokens != null) {
          params.budget_tokens = Number(gov.knobs.budgetTokens);
        }
      } else {
        if (gov.knobs.temperature != null) {
          params.temperature = gov.knobs.temperature;
        }
        delete params.budget_tokens;
      }

      // Reserve floor
      if (!oc.agents.defaults.compaction) oc.agents.defaults.compaction = {};
      if (gov.knobs.reserveTokensFloor != null) {
        oc.agents.defaults.compaction.reserveTokensFloor = Number(gov.knobs.reserveTokensFloor);
      }

      fs.writeFileSync(OPENCLAW_CONFIG, JSON.stringify(oc, null, 2));
    } catch (e) {
      console.error('Failed to update openclaw config:', e.message);
      return res.json({ ok: false, error: e.message });
    }

    res.json({ ok: true, governor: gov });
  } catch (e) {
    console.error('Governor save error:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ─── Start Server ──────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🦞 OpenClaw Governor running on http://localhost:${PORT}`);
  console.log(`   Config: ${GOVERNOR_PATH}`);
  console.log(`   OpenClaw: ${OPENCLAW_CONFIG}`);
});
