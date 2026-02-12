// ─── Token Governor (DBZ Power Level Control) ─────────────────────────────────
const DBZ_LEVELS = {
  low: { name: '🟢 Krillin', color: '#4CAF50' },
  medium: { name: '🔵 Vegeta', color: '#2196F3' },
  high: { name: '🟡 Super Saiyan', color: '#FFD700' },
  ssg: { name: '🟠 SS God', color: '#FF5722' },
  ssb: { name: '💠 SS Blue', color: '#00BCD4' },
  max: { name: '🔴 Ultra Instinct', color: '#E0E0E0' },
  custom: { name: '⚪ Custom', color: '#888' }
};
const LEVEL_ORDER = ['low', 'medium', 'high', 'ssg', 'ssb', 'max'];

function tempPersonality(t) {
  if (t == null) return '';
  if (t <= 0.3) return '🥋 Chi-Chi Mode — focused';
  if (t <= 0.6) return '📚 Gohan Mode — balanced';
  return '💥 Broly Mode — creative';
}

function setReasoningUI(enabled, budgetTokens) {
  const toggle = document.getElementById('gov-reasoning-toggle');
  const label = document.getElementById('gov-reasoning-label');
  const budgetRow = document.getElementById('gov-budget-row');
  const budgetSlider = document.getElementById('gov-budget-slider');
  const budgetVal = document.getElementById('gov-budget-value');
  const note = document.getElementById('gov-reasoning-note');
  const tempSlider = document.getElementById('gov-temp-slider');
  const tempPresets = document.querySelector('.gov-temp-presets');
  if (!toggle) return;
  toggle.checked = enabled;
  label.textContent = enabled ? 'ON' : 'OFF';
  label.style.color = enabled ? '#7c5cff' : '#888';
  if (enabled) {
    budgetRow.style.display = 'flex';
    note.style.display = 'block';
    tempSlider.classList.add('disabled');
    if (tempPresets) tempPresets.classList.add('disabled');
    tempSlider.value = 1;
    document.getElementById('gov-temp-value').textContent = '1.00';
    document.querySelectorAll('.gov-temp-preset').forEach(b => b.classList.remove('active'));
    const broly = document.querySelector('.gov-temp-preset[data-temp="1.0"]');
    if (broly) broly.classList.add('active');
    if (budgetTokens != null) {
      budgetSlider.value = budgetTokens;
      budgetVal.textContent = Number(budgetTokens).toLocaleString();
    }
  } else {
    budgetRow.style.display = 'none';
    note.style.display = 'none';
    tempSlider.classList.remove('disabled');
    if (tempPresets) tempPresets.classList.remove('disabled');
  }
}

async function initGovernor() {
  const gov = await fetch('/api/governor').then(r => r.json()).catch(() => null);
  if (!gov) {
    document.getElementById('config-status').textContent = '❌ Failed to load';
    document.getElementById('config-status').className = 'budget-pill critical';
    return;
  }
  window._govData = gov;
  document.getElementById('config-status').textContent = '✅ Connected';
  document.getElementById('config-status').className = 'budget-pill ok';
  renderGovernorStatus(gov);
  setupGovernorControls(gov);
}

function renderGovernorStatus(gov) {
  const el = id => document.getElementById(id);
  const fmt = n => n != null ? n.toLocaleString() : '—';

  el('gov-active-tokens').textContent = fmt(gov.activeMaxTokens);
  const lvl = DBZ_LEVELS[gov.currentLevel] || DBZ_LEVELS.custom;
  el('gov-active-level').textContent = lvl.name;
  el('gov-mode-display').textContent = gov.mode === 'manual' ? '🎛️ Manual' : '🤖 Auto';
  el('gov-mode-sub').textContent = gov.mode === 'auto' && gov.schedule?.enabled ? 'Time schedule active' : 'Direct control';
  el('gov-reserve').textContent = fmt(gov.knobs?.reserveTokensFloor);
  el('gov-temp').textContent = gov.knobs?.temperature != null ? gov.knobs.temperature.toFixed(2) : '—';
  el('gov-temp-mode').textContent = tempPersonality(gov.knobs?.temperature);

  const reasoningEl = el('gov-reasoning-status');
  if (reasoningEl) {
    reasoningEl.textContent = gov.knobs?.reasoning ? '🧠 ON' : '💤 OFF';
    const budgetSub = el('gov-reasoning-sub');
    if (budgetSub) {
      budgetSub.textContent = gov.knobs?.reasoning
        ? 'budget: ' + fmt(gov.knobs.budgetTokens) + ' tokens'
        : 'Thinking disabled';
    }
  }

  if (gov.updatedAt) {
    const d = new Date(gov.updatedAt);
    el('gov-updated').textContent = d.toLocaleTimeString();
    el('gov-updated-sub').textContent = d.toLocaleDateString();
  }
}

function setupGovernorControls(gov) {
  const slider = document.getElementById('gov-slider');
  const sliderVal = document.getElementById('gov-slider-value');
  const reserveInput = document.getElementById('gov-reserve-input');
  const tempSlider = document.getElementById('gov-temp-slider');
  const tempVal = document.getElementById('gov-temp-value');

  // Set current values
  slider.value = gov.manualMaxTokens || gov.levels?.[gov.currentLevel] || 16384;
  sliderVal.textContent = Number(slider.value).toLocaleString();
  if (gov.knobs?.reserveTokensFloor) reserveInput.value = gov.knobs.reserveTokensFloor;
  if (gov.knobs?.temperature != null) { tempSlider.value = gov.knobs.temperature; tempVal.textContent = gov.knobs.temperature.toFixed(2); }

  // Initialize reasoning toggle
  setReasoningUI(!!gov.knobs?.reasoning, gov.knobs?.budgetTokens || 10000);

  // Mode radios
  document.querySelectorAll('input[name="gov-mode"]').forEach(r => { r.checked = r.value === gov.mode; });

  // Preset highlights
  document.querySelectorAll('.gov-preset').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.level === gov.currentLevel);
  });

  // Temp preset highlights
  const currentTemp = gov.knobs?.temperature;
  if (currentTemp != null) {
    document.querySelectorAll('.gov-temp-preset').forEach(btn => {
      btn.classList.toggle('active', Math.abs(parseFloat(btn.dataset.temp) - currentTemp) < 0.01);
    });
  }

  // Schedule bar
  renderScheduleBar(gov.schedule);

  // Only attach event listeners once
  if (window._govInitialized) return;
  window._govInitialized = true;

  // Preset buttons
  document.querySelectorAll('.gov-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gov-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      slider.value = btn.dataset.tokens;
      sliderVal.textContent = Number(btn.dataset.tokens).toLocaleString();
      document.querySelectorAll('.gov-task-preset').forEach(b => b.classList.remove('active'));
    });
  });

  // Slider
  slider.addEventListener('input', () => {
    sliderVal.textContent = Number(slider.value).toLocaleString();
    const presetMatch = document.querySelector(`.gov-preset[data-tokens="${slider.value}"]`);
    document.querySelectorAll('.gov-preset').forEach(b => b.classList.remove('active'));
    if (presetMatch) presetMatch.classList.add('active');
    document.querySelectorAll('.gov-task-preset').forEach(b => b.classList.remove('active'));
  });

  // Temperature slider
  tempSlider.addEventListener('input', () => {
    tempVal.textContent = Number(tempSlider.value).toFixed(2);
    const matchTemp = document.querySelector(`.gov-temp-preset[data-temp="${tempSlider.value}"]`);
    document.querySelectorAll('.gov-temp-preset').forEach(b => b.classList.remove('active'));
    if (matchTemp) matchTemp.classList.add('active');
    document.querySelectorAll('.gov-task-preset').forEach(b => b.classList.remove('active'));
  });

  // Temperature preset buttons
  document.querySelectorAll('.gov-temp-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const temp = parseFloat(btn.dataset.temp);
      tempSlider.value = temp;
      tempVal.textContent = temp.toFixed(2);
      document.querySelectorAll('.gov-temp-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.gov-task-preset').forEach(b => b.classList.remove('active'));
    });
  });

  // Reasoning toggle
  document.getElementById('gov-reasoning-toggle').addEventListener('change', (e) => {
    const budgetSlider = document.getElementById('gov-budget-slider');
    setReasoningUI(e.target.checked, Number(budgetSlider.value));
    document.querySelectorAll('.gov-task-preset').forEach(b => b.classList.remove('active'));
  });

  // Budget tokens slider
  document.getElementById('gov-budget-slider').addEventListener('input', () => {
    const val = document.getElementById('gov-budget-slider');
    document.getElementById('gov-budget-value').textContent = Number(val.value).toLocaleString();
    document.querySelectorAll('.gov-task-preset').forEach(b => b.classList.remove('active'));
  });

  // Task preset buttons (combo: sets both power level + temperature + reasoning)
  document.querySelectorAll('.gov-task-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      const preset = window._govData?.taskPresets?.[presetKey];
      if (!preset) return;
      // Set power level
      const levelBtn = document.querySelector(`.gov-preset[data-level="${preset.level}"]`);
      if (levelBtn) {
        document.querySelectorAll('.gov-preset').forEach(b => b.classList.remove('active'));
        levelBtn.classList.add('active');
        slider.value = levelBtn.dataset.tokens;
        sliderVal.textContent = Number(levelBtn.dataset.tokens).toLocaleString();
      }
      // Set reasoning + temperature
      if (preset.reasoning) {
        setReasoningUI(true, preset.budgetTokens || 10000);
      } else {
        setReasoningUI(false);
        tempSlider.value = preset.temperature;
        tempVal.textContent = preset.temperature.toFixed(2);
        document.querySelectorAll('.gov-temp-preset').forEach(b => b.classList.remove('active'));
        const matchTemp = document.querySelector(`.gov-temp-preset[data-temp="${preset.temperature}"]`);
        if (matchTemp) matchTemp.classList.add('active');
      }
      // Highlight task preset
      document.querySelectorAll('.gov-task-preset').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Status hint
      const status = document.getElementById('gov-save-status');
      status.textContent = '✨ ' + preset.name + ' preset loaded — click Save to apply';
      status.style.color = '#ffb347';
      setTimeout(() => { if (status.textContent.includes('loaded')) status.textContent = ''; }, 4000);
    });
  });

  // Save button
  document.getElementById('gov-save').addEventListener('click', async () => {
    const mode = document.querySelector('input[name="gov-mode"]:checked')?.value || 'manual';
    const activePreset = document.querySelector('.gov-preset.active');
    const slots = window._govScheduleHours || [];
    const consolidated = consolidateSchedule(slots);
    const payload = {
      mode,
      currentLevel: activePreset?.dataset.level || 'custom',
      manualMaxTokens: Number(slider.value),
      schedule: { enabled: mode === 'auto', slots: consolidated },
      knobs: (() => {
        const reasoningOn = document.getElementById('gov-reasoning-toggle').checked;
        const k = {
          reserveTokensFloor: Number(reserveInput.value),
          temperature: reasoningOn ? 1 : Number(tempSlider.value),
          reasoning: reasoningOn
        };
        if (reasoningOn) k.budgetTokens = Number(document.getElementById('gov-budget-slider').value);
        return k;
      })()
    };

    const status = document.getElementById('gov-save-status');
    status.textContent = 'Saving...';
    status.style.color = '#45d6a9';
    try {
      const resp = await fetch('/api/governor', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await resp.json();
      if (data.ok) {
        const lvl = DBZ_LEVELS[activePreset?.dataset.level] || DBZ_LEVELS.custom;
        status.textContent = '✅ Power level set! ' + lvl.name + ' — ' + Number(slider.value).toLocaleString() + ' tokens';
        renderGovernorStatus(data.governor);
        setTimeout(() => { status.textContent = ''; }, 5000);
      } else {
        status.textContent = '❌ ' + (data.error || 'Failed');
        status.style.color = '#ff4d4d';
      }
    } catch (e) {
      status.textContent = '❌ ' + e.message;
      status.style.color = '#ff4d4d';
    }
  });
}

function consolidateSchedule(hours) {
  if (!hours || !hours.length) return [{ start: 0, end: 24, level: 'medium' }];
  const slots = [];
  let current = { start: 0, level: hours[0] || 'medium' };
  for (let h = 1; h < 24; h++) {
    if ((hours[h] || 'medium') !== current.level) {
      slots.push({ start: current.start, end: h, level: current.level });
      current = { start: h, level: hours[h] || 'medium' };
    }
  }
  slots.push({ start: current.start, end: 24, level: current.level });
  return slots;
}

function renderScheduleBar(schedule) {
  const bar = document.getElementById('gov-schedule-bar');
  if (!bar) return;
  const colors = { low: '#1a3a2a', medium: '#2a2a4e', high: '#4e2a1a', ssg: '#3e1a1a', ssb: '#1a2e3e', max: '#3e1a3e' };

  // Expand slots into 24-hour array
  const hours = new Array(24).fill('medium');
  if (schedule?.slots) {
    for (const s of schedule.slots) {
      for (let h = s.start; h < s.end && h < 24; h++) hours[h] = s.level;
    }
  }
  window._govScheduleHours = hours;

  bar.innerHTML = hours.map((lvl, h) => {
    const dbz = DBZ_LEVELS[lvl] || DBZ_LEVELS.medium;
    const now = new Date().getHours();
    const isNow = h === now;
    return `<div class="gov-hour-seg ${lvl}${isNow ? ' now' : ''}" data-hour="${h}" style="background:${colors[lvl]||'#333'};border-color:${dbz.color}" title="${h}:00 — ${dbz.name}">${h}</div>`;
  }).join('');

  // Legend
  const legend = document.getElementById('gov-schedule-slots');
  if (legend) {
    legend.innerHTML = '<div class="gov-schedule-legend">' +
      LEVEL_ORDER.map(l => `<span><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:${DBZ_LEVELS[l].color};margin-right:4px"></span>${DBZ_LEVELS[l].name}</span>`).join('') +
      '</div><div style="font-size:11px;color:#666;margin-top:4px">Click hours to cycle power levels</div>';
  }

  // Click handlers for each hour
  bar.querySelectorAll('.gov-hour-seg').forEach(seg => {
    seg.addEventListener('click', () => {
      const h = Number(seg.dataset.hour);
      const current = window._govScheduleHours[h];
      const next = LEVEL_ORDER[(LEVEL_ORDER.indexOf(current) + 1) % LEVEL_ORDER.length];
      window._govScheduleHours[h] = next;
      const dbz = DBZ_LEVELS[next];
      seg.className = `gov-hour-seg ${next}${h === new Date().getHours() ? ' now' : ''}`;
      seg.style.background = colors[next] || '#333';
      seg.style.borderColor = dbz.color;
      seg.title = `${h}:00 — ${dbz.name}`;
    });
  });
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initGovernor);
