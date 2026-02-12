# Power Levels Guide

## The DBZ Philosophy

In Dragon Ball Z, characters unlock new power levels to face stronger opponents. The OpenClaw Governor uses the same concept for token budgets:

- **Low levels** = fast, cheap, focused tasks
- **Mid levels** = balanced performance for everyday work
- **High levels** = elite performance for complex challenges
- **Maximum** = full power for the toughest problems

## Level Breakdown

### 🟢 Krillin (4,096 tokens)

**When to use:**
- Quick questions
- Simple refactoring
- Code reviews
- Chat responses
- Low-context tasks

**Cost:** ~$0.02 per message (input+output)

**Philosophy:** Krillin may not be the strongest, but he's reliable and gets the job done efficiently. Perfect for routine tasks where you don't need massive context.

---

### 🔵 Vegeta (8,192 tokens)

**When to use:**
- Standard coding tasks
- Bug fixes
- Feature implementation
- Documentation writing
- Medium-context work

**Cost:** ~$0.04 per message

**Philosophy:** Vegeta's pride drives him to excel. This is your workhorse level — strong enough for most tasks without burning through your budget.

---

### 🟡 Super Saiyan (16,384 tokens)

**When to use:**
- Complex refactoring
- Large file analysis
- Multi-step workflows
- Creative writing
- Architecture discussions

**Cost:** ~$0.08 per message

**Philosophy:** Breaking through your limits. Super Saiyan unlocks power beyond normal constraints — use it when you need to handle larger context windows.

---

### 🟠 SS God (32,768 tokens)

**When to use:**
- Project-wide refactoring
- Deep architecture design
- Long-form content creation
- Complex debugging across files
- Planning multi-phase projects

**Cost:** ~$0.16 per message

**Philosophy:** Godly power with control. SS God represents mastery — enough context to see the full picture without going overboard.

---

### 💠 SS Blue (65,536 tokens)

**When to use:**
- Full repository analysis
- Large-scale migrations
- Comprehensive debugging
- Multi-file coordination
- Deep system integration work

**Cost:** ~$0.32 per message

**Philosophy:** The fusion of god power and Super Saiyan control. Blue is for when you need massive context windows but still want precision.

---

### 🔴 Ultra Instinct (128,000 tokens)

**When to use:**
- Maximum context required
- Entire codebase in scope
- Complex multi-repo coordination
- Deep research synthesis
- When nothing else will do

**Cost:** ~$0.64 per message

**Philosophy:** Instinctive mastery. Ultra Instinct is the ultimate power level — your agent can hold entire codebases in memory. Use sparingly; it's expensive.

---

## Temperature Modes

### 🥋 Chi-Chi Mode (0.3)

**Personality:** Focused, strict, no-nonsense

**Best for:**
- Precise code generation
- Following exact specifications
- Debugging logic errors
- Structured outputs

**Philosophy:** Chi-Chi keeps Goku disciplined. Use this when you need accuracy over creativity.

---

### 📚 Gohan Mode (0.5)

**Personality:** Balanced, thoughtful, adaptable

**Best for:**
- General-purpose tasks
- Balanced creativity and precision
- Documentation
- Code reviews

**Philosophy:** Gohan balances power with intellect. This is the default — reliable and versatile.

---

### 💥 Broly Mode (1.0)

**Personality:** Creative, unpredictable, explosive

**Best for:**
- Brainstorming
- Creative writing
- Novel solutions
- Exploring alternatives
- Reasoning mode (required by API)

**Philosophy:** Broly's unrestrained power. Maximum creativity and exploration — great for ideation, required for extended thinking.

---

## Reasoning Mode 🧠

**What it is:** Extended thinking mode (Claude's "reasoning" feature) where the model thinks through problems step-by-step before responding.

**When to enable:**
- Complex architecture decisions
- Multi-step problem solving
- Deep debugging
- Planning workflows
- Creative ideation

**Budget Tokens:** Controls how many tokens the model can use for internal reasoning (5K-64K recommended)

**Cost:** Reasoning tokens are cheaper than output tokens but still add up. Use when quality > speed.

**Temperature:** Locked to 1.0 when reasoning is enabled (Anthropic API requirement)

---

## Task Presets

### 💻 Code (8K / 0.3)
**Vegeta + Chi-Chi** — Focused coding with moderate context.

### 🎨 Creative (16K / Reasoning 12K)
**Super Saiyan + Broly + Reasoning** — High-quality creative output with thinking.

### 📋 PM (4K / 0.5)
**Krillin + Gohan** — Quick project management tasks.

### 🏗️ Planning (32K / Reasoning 10K)
**SS God + Broly + Reasoning** — Deep planning with extended thinking.

### 💡 Brainstorm (16K / Reasoning 15K)
**Super Saiyan + Broly + Reasoning** — Wild ideation with reasoning budget.

### 🐛 Debug (64K / Reasoning 20K)
**SS Blue + Broly + Reasoning** — Maximum debugging power with thinking.

---

## Time-Based Scheduling

**Auto Mode** lets you set different power levels by hour of day:

**Example Schedule:**
- **12 AM - 8 AM:** Krillin (low activity, save budget)
- **8 AM - 6 PM:** Vegeta (work hours, balanced)
- **6 PM - 11 PM:** Super Saiyan (evening projects, higher power)
- **11 PM - 12 AM:** Krillin (wind down)

**Use case:** Automatically conserve tokens during off-hours, ramp up during peak work time.

---

## Reserve Token Floor

**What it is:** The minimum number of tokens to keep in context before triggering compaction.

**Recommended:** 20,000 tokens

**Why it matters:** Prevents aggressive compaction that loses important context, but avoids bloating the context window unnecessarily.

**Adjust higher if:**
- You're working on large files
- You need more conversation history
- You're doing multi-step workflows

**Adjust lower if:**
- You want more aggressive compaction
- You're hitting token limits
- You're doing quick, isolated tasks

---

## Cost Management Tips

1. **Start low, scale up** — Begin with Vegeta, only go higher if needed
2. **Use task presets** — They're optimized for common workflows
3. **Enable reasoning selectively** — It's powerful but expensive
4. **Schedule wisely** — Auto mode can save 30-50% on off-peak hours
5. **Monitor usage** — Check your spend patterns and adjust

---

## The "Why" Behind the Theme

Power levels aren't just fun — they're a mental model:

- **Krillin** reminds you to stay efficient
- **Vegeta** is your reliable workhorse
- **Super Saiyan** is breaking through limits when needed
- **God levels** are for mastery and control
- **Ultra Instinct** is ultimate power, used sparingly

By framing token budgets as power levels, you're more likely to:
1. Think about cost/benefit before cranking up the tokens
2. Remember that more power = more responsibility (and cost)
3. Have fun while managing resources

---

*"Power comes in response to a need, not a desire."* — Goku

Use your power levels wisely. 🦞
