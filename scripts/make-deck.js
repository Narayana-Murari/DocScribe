// Generates MedicPro_Scribe_Deck.pptx — the hackathon pitch deck.
import pptxgen from 'pptxgenjs';

const TEAL = '1A6B6B';
const TEAL_LIGHT = '2A9090';
const IVORY = 'F7F4EE';
const AMBER = 'E8922A';
const TEXT = '1C2B2B';
const MUTED = '5A7070';
const RED = 'C0392B';

const pptx = new pptxgen();
pptx.defineLayout({ name: 'WIDE', width: 13.33, height: 7.5 });
pptx.layout = 'WIDE';

const serif = 'Georgia';
const sans = 'Helvetica';

function baseSlide({ dark = false } = {}) {
  const s = pptx.addSlide();
  s.background = { color: dark ? TEAL : IVORY };
  return s;
}

function titleBar(s, title, subtitle) {
  s.addText(title, {
    x: 0.6, y: 0.35, w: 12.1, h: 0.85,
    fontFace: serif, fontSize: 32, color: TEAL, bold: false,
  });
  if (subtitle) {
    s.addText(subtitle, { x: 0.62, y: 1.12, w: 12, h: 0.4, fontFace: sans, fontSize: 14, color: MUTED });
  }
  s.addShape('rect', { x: 0.62, y: 1.05, w: 1.6, h: 0.045, fill: { color: AMBER } });
}

function bullets(s, items, opts = {}) {
  s.addText(
    items.map((t) => ({ text: t, options: { bullet: { code: '2022', indent: 14 }, breakLine: true, paraSpaceAfter: 10 } })),
    { x: 0.7, y: opts.y ?? 1.7, w: opts.w ?? 12, h: opts.h ?? 5.2, fontFace: sans, fontSize: opts.size ?? 16, color: TEXT, valign: 'top', ...opts.extra },
  );
}

// ── Slide 1: Title ─────────────────────────────────────────────
{
  const s = baseSlide({ dark: true });
  s.addText([
    { text: 'MedicPro ', options: { color: 'FFFFFF' } },
    { text: 'Scribe', options: { color: AMBER, italic: true } },
  ], { x: 0.8, y: 2.3, w: 11.7, h: 1.2, fontFace: serif, fontSize: 54 });
  s.addText('An agentic clinical documentation assistant for rural practices', {
    x: 0.85, y: 3.5, w: 11, h: 0.6, fontFace: sans, fontSize: 20, color: 'D4ECEC',
  });
  s.addText('Doctor speaks. Agents listen, verify, and document — the doctor just reviews and signs.', {
    x: 0.85, y: 4.2, w: 11, h: 0.5, fontFace: sans, fontSize: 14, color: 'A8C4C4', italic: true,
  });
  s.addShape('rect', { x: 0.85, y: 4.05, w: 2.2, h: 0.04, fill: { color: AMBER } });
}

// ── Slide 2: Problem ───────────────────────────────────────────
{
  const s = baseSlide();
  titleBar(s, 'The Problem We Solve', 'Clinical documentation is stealing care time');
  bullets(s, [
    'Doctors in high-volume clinics spend 2–3 hours a day writing notes — often after hours, from memory.',
    'Rushed documentation misses what matters: drug interactions, allergy conflicts, and follow-ups slip through.',
    'Notes written from memory are incomplete and inconsistent — bad for continuity of care, coding, and billing.',
    'Rural clinics (MedicPro’s users) see the highest patient loads with the least admin support.',
  ]);
  s.addShape('roundRect', { x: 0.7, y: 5.5, w: 12, h: 1.2, rectRadius: 0.1, fill: { color: 'FDF0E0' } });
  s.addText('Our agent turns the raw consultation conversation into a verified, standards-compliant SOAP note — with safety checks a tired human skips.', {
    x: 1.0, y: 5.62, w: 11.4, h: 1.0, fontFace: sans, fontSize: 15, color: TEXT, italic: true, valign: 'middle',
  });
}

// ── Slide 3: The Two Agents ────────────────────────────────────
{
  const s = baseSlide();
  titleBar(s, 'The Two Agents', 'Named, scoped, and separately prompted');
  const card = (x, name, role, lines, accent) => {
    s.addShape('roundRect', { x, y: 1.8, w: 5.9, h: 4.9, rectRadius: 0.12, fill: { color: 'FFFFFF' }, line: { color: 'D8E6E6' } });
    s.addShape('rect', { x, y: 1.8, w: 5.9, h: 0.14, fill: { color: accent } });
    s.addText(name, { x: x + 0.3, y: 2.1, w: 5.3, h: 0.5, fontFace: serif, fontSize: 22, color: TEAL });
    s.addText(role, { x: x + 0.3, y: 2.62, w: 5.3, h: 0.4, fontFace: sans, fontSize: 12, color: MUTED, italic: true });
    s.addText(
      lines.map((t) => ({ text: t, options: { bullet: { code: '2022', indent: 12 }, breakLine: true, paraSpaceAfter: 8 } })),
      { x: x + 0.3, y: 3.1, w: 5.35, h: 3.4, fontFace: sans, fontSize: 13, color: TEXT, valign: 'top' },
    );
  };
  card(0.7, 'Agent 1 — Encounter Simulator', 'Generates the consultation (stands in for Wispr Flow speech-to-text in the live product)', [
    'Role-plays a realistic doctor–patient consultation grounded in the selected patient’s record.',
    'Stays medically consistent: conditions, current meds, allergies, vitals.',
    'Deliberately includes plausible clinical risks (e.g. patient self-medicating) for the scribe to catch.',
    'One-shot generation — no tools needed.',
  ], AMBER);
  card(6.8, 'Agent 2 — Clinical Scribe', 'The star: a tool-using agent that documents and verifies', [
    'Reads the transcript, then autonomously works its 5 tools:',
    'get_patient_record → grounds the note in history & allergies',
    'check_drug_interactions → catches dangerous combinations',
    'suggest_icd_codes → standards-compliant coding',
    'flag_followup → raises review flags for the doctor',
    'save_soap_note → persists the structured draft note',
  ], TEAL_LIGHT);
}

// ── Slide 4: Agent Instructions ────────────────────────────────
{
  const s = baseSlide();
  titleBar(s, 'Instructions We Put in the Agents', 'Excerpts from the actual system prompts');
  const quote = (x, w, title, text, accent) => {
    s.addShape('roundRect', { x, y: 1.75, w, h: 5.0, rectRadius: 0.1, fill: { color: 'FFFFFF' }, line: { color: 'D8E6E6' } });
    s.addText(title, { x: x + 0.25, y: 1.95, w: w - 0.5, h: 0.4, fontFace: sans, fontSize: 13, bold: true, color: accent });
    s.addText(text, { x: x + 0.25, y: 2.4, w: w - 0.5, h: 4.2, fontFace: 'Courier New', fontSize: 10.5, color: TEXT, valign: 'top' });
  };
  quote(0.7, 5.9, 'ENCOUNTER SIMULATOR — system prompt (excerpt)',
    '"Role-play a realistic outpatient consultation... Stay medically consistent with the patient’s record: age, known conditions, current medications, allergies. Include at least: a presenting complaint, today’s vitals, one medication decision, one ordered test, and a follow-up plan. Occasionally include a clinically meaningful risk (e.g. the patient self-medicating with something that interacts with their prescription) so the scribe agent has something to catch."',
    AMBER);
  quote(6.8, 5.9, 'CLINICAL SCRIBE — system prompt (excerpt)',
    '"Work strictly in this order, using your tools: 1) get_patient_record first. 2) Identify every medication mentioned and check_drug_interactions with the full combined list. Never skip this step. 3) suggest_icd_codes. 4) flag_followup for each interaction, allergy conflict or urgent symptom. 5) Draft SOAP: only facts from the transcript and record, no invented findings; each Plan item actionable. 6) save_soap_note exactly once... The note is a draft — the doctor always reviews and approves."',
    TEAL_LIGHT);
}

// ── Slide 5: Best Practices ────────────────────────────────────
{
  const s = baseSlide();
  titleBar(s, 'Agent Best Practices We Followed');
  bullets(s, [
    'Tools over trust — facts come from deterministic tools (record lookup, interaction DB, ICD lookup), not model memory. The LLM reasons; the tools ground.',
    'Ordered workflow in the prompt — the scribe must fetch the record first and may never skip the interaction check. Safety steps are mandatory, not optional.',
    'Human in the loop — the agent only ever produces a draft with flags; the doctor reviews, edits, and signs. No autonomous clinical decisions.',
    'Transparent agency — every tool call streams live to the UI, so the doctor (and the judges) see exactly what the agent did and why.',
    'Fail safe, not silent — if a provider is down, the demo falls back to a pre-recorded encounter; errors surface visibly instead of producing a wrong note.',
    'Provider-agnostic harness — same tools, same prompts, same event stream across Claude, OpenAI, Gemini and Kimi, so models compete on equal footing.',
  ], { size: 15 });
}

// ── Slide 6: Architecture + multi-LLM ──────────────────────────
{
  const s = baseSlide();
  titleBar(s, 'Architecture — Swap the Brain, Keep the Agent', 'One agent harness, four interchangeable LLM providers');
  const box = (x, y, w, h, txt, fill, color = 'FFFFFF', size = 13) => {
    s.addShape('roundRect', { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: 'D8E6E6' } });
    s.addText(txt, { x, y, w, h, align: 'center', valign: 'middle', fontFace: sans, fontSize: size, color, bold: true });
  };
  box(0.7, 2.0, 2.6, 0.9, 'Transcript\n(Wispr Flow dictation\nor Simulator agent)', 'E8922A');
  box(3.9, 2.0, 2.9, 0.9, 'Scribe Agent Loop\n(prompts + tool routing)', TEAL);
  box(7.4, 1.5, 2.4, 0.55, 'Claude — Agent SDK (Pro sub)', TEAL_LIGHT, 'FFFFFF', 11);
  box(7.4, 2.15, 2.4, 0.55, 'OpenAI — gpt-4o', '5A7070', 'FFFFFF', 11);
  box(7.4, 2.8, 2.4, 0.55, 'Gemini — 2.5 flash', '5A7070', 'FFFFFF', 11);
  box(7.4, 3.45, 2.4, 0.55, 'Kimi — k2', '5A7070', 'FFFFFF', 11);
  box(10.3, 2.0, 2.4, 0.9, '5 clinical tools\n(record, interactions,\nICD, flags, save)', '1E7B4B');
  box(3.9, 4.6, 2.9, 0.9, 'Draft SOAP note\n+ flags + ICD codes', 'C0392B');
  box(0.7, 4.6, 2.6, 0.9, 'Doctor reviews,\nedits & signs', TEXT);
  s.addText('→', { x: 3.35, y: 2.15, w: 0.5, h: 0.6, fontSize: 24, color: MUTED, align: 'center' });
  s.addText('→', { x: 6.85, y: 2.15, w: 0.5, h: 0.6, fontSize: 24, color: MUTED, align: 'center' });
  s.addText('⇄', { x: 9.85, y: 2.15, w: 0.5, h: 0.6, fontSize: 24, color: MUTED, align: 'center' });
  s.addText('↓', { x: 5.2, y: 3.6, w: 0.5, h: 0.6, fontSize: 24, color: MUTED, align: 'center' });
  s.addText('←', { x: 3.35, y: 4.75, w: 0.5, h: 0.6, fontSize: 24, color: MUTED, align: 'center' });
  s.addText(
    'Same prompts, same tools, same UI across all four providers — switch live in the demo and compare how each model plans its tool calls, what it catches, and how fast it finishes.',
    { x: 0.7, y: 6.0, w: 12, h: 0.9, fontFace: sans, fontSize: 14, color: MUTED, italic: true },
  );
}

// ── Slide 7: Demo flow ─────────────────────────────────────────
{
  const s = baseSlide();
  titleBar(s, 'Demo Flow (90 seconds)');
  bullets(s, [
    '1 · Pick patient "Abdul Rahman" — 67y, atrial fibrillation, on warfarin, sulfa allergy on record.',
    '2 · Simulate Visit — Encounter Simulator generates today’s consultation: he’s been self-medicating knee pain with a neighbour’s ibuprofen.',
    '3 · Generate Note — watch the Scribe agent live: record lookup → interaction check fires ⚠ warfarin + ibuprofen (HIGH: bleeding risk) → ICD codes → flag raised → SOAP note saved.',
    '4 · Doctor reviews the draft, sees the red flag the agent caught, and signs.',
    '5 · Switch provider dropdown and rerun the same transcript — compare models side by side.',
  ], { size: 16 });
}

const out = new URL('../MedicPro_Scribe_Deck.pptx', import.meta.url).pathname;
await pptx.writeFile({ fileName: out });
console.log('Deck written:', out);
