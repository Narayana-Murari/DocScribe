import { patients, interactionDb, icdDb } from './data.js';

// In-memory store of saved notes for the session.
export const savedNotes = [];

// Shared tool implementations. Both the Claude Agent SDK path and the
// OpenAI-compatible tool loop dispatch into these.
export const toolImpls = {
  get_patient_record({ patientId }) {
    const p = patients.find((x) => x.id === patientId);
    if (!p) return { error: `No patient with id ${patientId}` };
    return p;
  },

  check_drug_interactions({ medications }) {
    const meds = (medications || []).map((m) => String(m).toLowerCase());
    const hits = [];
    for (const entry of interactionDb) {
      const [a, b] = entry.pair;
      const hasA = meds.some((m) => m.includes(a));
      const hasB = meds.some((m) => m.includes(b));
      if (hasA && hasB) hits.push(entry);
    }
    return {
      checked: medications,
      interactions: hits,
      summary: hits.length
        ? `${hits.length} interaction(s) found`
        : 'No known interactions in the checked list',
    };
  },

  suggest_icd_codes({ diagnoses }) {
    const results = [];
    for (const d of diagnoses || []) {
      const text = String(d).toLowerCase();
      const hit = icdDb.find((e) => e.match.some((kw) => text.includes(kw)));
      results.push(hit ? { input: d, code: hit.code, label: hit.label } : { input: d, code: null, label: 'No match — code manually' });
    }
    return { suggestions: results };
  },

  flag_followup({ reason, severity }) {
    return { flagged: true, reason, severity: severity || 'MODERATE' };
  },

  save_soap_note(note) {
    const saved = { id: `note-${Date.now()}`, savedAt: new Date().toISOString(), ...note };
    savedNotes.push(saved);
    return { saved: true, noteId: saved.id };
  },
};

// JSON Schemas (OpenAI function-calling format) shared across providers.
export const toolSchemas = [
  {
    name: 'get_patient_record',
    description: 'Fetch the full patient record (history, allergies, current medications, last vitals). Always call this first.',
    parameters: {
      type: 'object',
      properties: { patientId: { type: 'string', description: 'Patient id, e.g. pat-001' } },
      required: ['patientId'],
    },
  },
  {
    name: 'check_drug_interactions',
    description: 'Check a list of medications (existing + newly mentioned) for known dangerous interactions.',
    parameters: {
      type: 'object',
      properties: { medications: { type: 'array', items: { type: 'string' } } },
      required: ['medications'],
    },
  },
  {
    name: 'suggest_icd_codes',
    description: 'Suggest ICD-10 codes for a list of diagnoses or presenting complaints.',
    parameters: {
      type: 'object',
      properties: { diagnoses: { type: 'array', items: { type: 'string' } } },
      required: ['diagnoses'],
    },
  },
  {
    name: 'flag_followup',
    description: 'Raise a review flag for the doctor (drug interaction, allergy conflict, urgent symptom). One call per flag.',
    parameters: {
      type: 'object',
      properties: {
        reason: { type: 'string' },
        severity: { type: 'string', enum: ['LOW', 'MODERATE', 'HIGH'] },
      },
      required: ['reason', 'severity'],
    },
  },
  {
    name: 'save_soap_note',
    description: 'Save the finished structured SOAP note. Call exactly once, after all checks.',
    parameters: {
      type: 'object',
      properties: {
        patientId: { type: 'string' },
        subjective: { type: 'string' },
        objective: { type: 'string' },
        assessment: { type: 'string' },
        plan: { type: 'string' },
        icdCodes: { type: 'array', items: { type: 'string' }, description: 'e.g. ["I10 — Essential hypertension"]' },
        medications: { type: 'array', items: { type: 'string' }, description: 'Final medication list with doses' },
        flags: { type: 'array', items: { type: 'string' }, description: 'Review flags for the doctor' },
      },
      required: ['patientId', 'subjective', 'objective', 'assessment', 'plan'],
    },
  },
];

export function runTool(name, input) {
  const impl = toolImpls[name];
  if (!impl) return { error: `Unknown tool ${name}` };
  try {
    return impl(input || {});
  } catch (e) {
    return { error: String(e) };
  }
}
