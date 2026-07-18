import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { patients, cannedDialogues } from './data.js';
import { listProviders, getProvider } from './providers.js';
import { SIMULATOR_PROMPT, SCRIBE_PROMPT } from './prompts.js';
import { runOpenAiCompatScribe, runOpenAiCompatSimulator } from './toolLoop.js';
import { runClaudeScribe, runClaudeSimulator } from './claudeAgent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/patients', (_req, res) => res.json(patients));
app.get('/api/providers', (_req, res) => res.json(listProviders()));

// ── Agent 1: Encounter Simulator ────────────────────────────────
app.post('/api/simulate', async (req, res) => {
  const { patientId, provider: providerId } = req.body || {};
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return res.status(400).json({ error: 'Unknown patientId' });

  const provider = getProvider(providerId);
  const userPrompt = `Patient record:\n${JSON.stringify(patient, null, 2)}\n\nGenerate today's consultation transcript.`;
  const started = Date.now();
  try {
    let transcript;
    if (provider.kind === 'claude-agent-sdk') {
      transcript = await runClaudeSimulator({ systemPrompt: SIMULATOR_PROMPT, userPrompt });
    } else {
      transcript = await runOpenAiCompatSimulator({ provider, systemPrompt: SIMULATOR_PROMPT, userPrompt });
    }
    if (!transcript?.trim()) throw new Error('Empty transcript from provider');
    res.json({ transcript, source: provider.id, ms: Date.now() - started });
  } catch (err) {
    console.error('[simulate] falling back to canned dialogue:', err.message);
    res.json({ transcript: cannedDialogues[patientId], source: 'canned', warning: err.message, ms: Date.now() - started });
  }
});

// ── Agent 2: Clinical Scribe (SSE stream of agent events) ───────
app.post('/api/scribe', async (req, res) => {
  const { patientId, transcript, provider: providerId } = req.body || {};
  const patient = patients.find((p) => p.id === patientId);
  if (!patient) return res.status(400).json({ error: 'Unknown patientId' });
  if (!transcript?.trim()) return res.status(400).json({ error: 'Transcript is empty' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  const emit = (ev) => res.write(`data: ${JSON.stringify(ev)}\n\n`);

  const provider = getProvider(providerId);
  const userPrompt =
    `Patient id: ${patient.id} (${patient.name}).\n\nConsultation transcript:\n---\n${transcript}\n---\n` +
    `Produce and save the clinical note now.`;

  const started = Date.now();
  emit({ type: 'start', provider: provider.label });
  try {
    if (provider.kind === 'claude-agent-sdk') {
      await runClaudeScribe({ systemPrompt: SCRIBE_PROMPT, userPrompt, emit });
    } else {
      await runOpenAiCompatScribe({ provider, systemPrompt: SCRIBE_PROMPT, userPrompt, emit });
    }
    emit({ type: 'done', ms: Date.now() - started });
  } catch (err) {
    console.error('[scribe]', err);
    emit({ type: 'error', message: err.message });
  }
  res.end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`MedicPro Scribe demo → http://localhost:${PORT}`));
