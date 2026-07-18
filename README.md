# DocScribe — Agentic Clinical Documentation Demo

An AI **doctor's-assistant scribe**: a doctor–patient consultation is transcribed, and a
tool-using agent turns it into a verified, standards-compliant SOAP note — with drug-interaction
checks, ICD-10 codes, and review flags the doctor approves before signing.

Runs entirely on your machine. Bring **either** a Claude Pro/Max subscription (no API key needed)
**or** API keys from OpenAI / Gemini / Kimi — and switch between providers live in the UI to
compare how different LLMs perform on the same task.

> ⚠️ Demo project with mock patient data. Not a medical device; not for real clinical use.

## How it works — the two agents

| Agent | Job | Tools |
|---|---|---|
| **Encounter Simulator** | Role-plays a realistic consultation grounded in the selected patient's record (stands in for live speech-to-text) | none |
| **Clinical Scribe** | Reads the transcript and documents it, autonomously deciding which tools to call | `get_patient_record` · `check_drug_interactions` · `suggest_icd_codes` · `flag_followup` · `save_soap_note` |

Every tool call streams live into the UI, so you can watch the agent work. System prompts live in
`server/prompts.js`, tool implementations in `server/tools.js`.

## Prerequisites

- **Node.js 18+** (20 LTS recommended) — [nodejs.org](https://nodejs.org). Check with `node --version`.
- **At least one LLM provider** (see next section). You don't need all of them.

## Setup

```bash
git clone https://github.com/Narayana-Murari/DocScribe.git
cd DocScribe
npm install
```

### Provider option A — Claude subscription (no API key)

If you have a Claude **Pro or Max** subscription, the demo runs on it through the
[Claude Agent SDK](https://code.claude.com/docs/en/agent-sdk), which reuses your local
Claude Code login:

1. Install Claude Code: `npm install -g @anthropic-ai/claude-code` (or see
   [claude.com/claude-code](https://claude.com/claude-code) for native installers).
2. Run `claude` once in any terminal and log in with your Claude account.
3. That's it — the "Claude (Pro subscription)" option in the demo now works. No key, no `.env`.

*(Have an Anthropic API key instead of a subscription? `claude` accepts that at login too.)*

### Provider option B — API keys (OpenAI / Gemini / Kimi)

```bash
cp .env.example .env
```

Open `.env` and uncomment/fill whichever keys you have:

```bash
OPENAI_API_KEY=sk-...          # platform.openai.com
GEMINI_API_KEY=...             # aistudio.google.com
KIMI_API_KEY=...               # platform.moonshot.ai
```

Model choices and base URLs are overridable in the same file. Providers without a key simply
show as "not configured" in the dropdown — everything else keeps working. All three run through
one OpenAI-compatible adapter (`server/providers.js`), so adding another compatible provider is
a few lines.

**`.env` is gitignored — never commit API keys.**

## Run

```bash
npm start        # or ./run.sh
```

Open **http://localhost:3001**.

## Demo walkthrough (90 seconds)

1. Pick a patient — **Abdul Rahman** has the best story: he's on warfarin and tends to
   self-medicate with a neighbour's ibuprofen.
2. Click **▶ Simulate Visit** — the Encounter Simulator generates today's consultation
   (falls back to a pre-recorded transcript if the LLM call fails).
3. Click **✦ Generate Note** — watch the Scribe agent live: record lookup → ⚠ drug-interaction
   hit → ICD codes → review flags → draft SOAP note.
4. Review the note, see what the agent caught, **Approve & Sign**.
5. Switch the **LLM Provider** dropdown and rerun the same transcript to compare models.

**Live dictation:** tools like Wispr Flow type into any focused text field — focus the transcript
pane and dictate instead of simulating.

## Project layout

```
server/   index.js (Express + SSE) · providers.js (multi-LLM adapter) · prompts.js
          claudeAgent.js (Agent SDK path) · toolLoop.js (OpenAI-compat agent loop)
          tools.js (clinical tools) · data.js (mock patients, interaction & ICD DBs)
public/   index.html · app.js · styles.css   — no build step, no framework
scripts/  make-deck.js (pitch deck PPTX) · smoke-claude.js (Claude auth check)
```

Useful scripts: `npm run smoke` verifies your Claude login works; `npm run deck` regenerates
the pitch deck.

## Troubleshooting

- **"Claude … agent ended: error"** → run `npm run smoke`. If it fails, run `claude` in a
  terminal and complete login.
- **Provider shows "not configured"** → the matching key is missing from `.env`; restart the
  server after editing it.
- **Port in use** → set `PORT=3002` in `.env`.
