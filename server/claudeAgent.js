import { query, tool, createSdkMcpServer } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';
import { runTool } from './tools.js';

const CLAUDE_MODEL = process.env.CLAUDE_MODEL; // optional override, e.g. "sonnet"

// Build the in-process MCP server per request so tool handlers can emit
// live events to that request's SSE stream.
function buildScribeServer(emit) {
  const wrap = (name, description, shape) =>
    tool(name, description, shape, async (input) => {
      emit({ type: 'tool_start', name, input });
      const output = runTool(name, input);
      emit({ type: 'tool_result', name, output });
      if (name === 'save_soap_note') emit({ type: 'note', note: input });
      return { content: [{ type: 'text', text: JSON.stringify(output) }] };
    });

  return createSdkMcpServer({
    name: 'scribe',
    version: '1.0.0',
    tools: [
      wrap('get_patient_record', 'Fetch the full patient record. Always call this first.', {
        patientId: z.string().describe('Patient id, e.g. pat-001'),
      }),
      wrap('check_drug_interactions', 'Check medications for known dangerous interactions.', {
        medications: z.array(z.string()),
      }),
      wrap('suggest_icd_codes', 'Suggest ICD-10 codes for diagnoses or complaints.', {
        diagnoses: z.array(z.string()),
      }),
      wrap('flag_followup', 'Raise a review flag for the doctor. One call per flag.', {
        reason: z.string(),
        severity: z.enum(['LOW', 'MODERATE', 'HIGH']),
      }),
      wrap('save_soap_note', 'Save the finished structured SOAP note. Call exactly once.', {
        patientId: z.string(),
        subjective: z.string(),
        objective: z.string(),
        assessment: z.string(),
        plan: z.string(),
        icdCodes: z.array(z.string()).optional(),
        medications: z.array(z.string()).optional(),
        flags: z.array(z.string()).optional(),
      }),
    ],
  });
}

const SCRIBE_TOOL_NAMES = [
  'mcp__scribe__get_patient_record',
  'mcp__scribe__check_drug_interactions',
  'mcp__scribe__suggest_icd_codes',
  'mcp__scribe__flag_followup',
  'mcp__scribe__save_soap_note',
];

export async function runClaudeScribe({ systemPrompt, userPrompt, emit }) {
  const server = buildScribeServer(emit);
  const q = query({
    prompt: userPrompt,
    options: {
      systemPrompt,
      model: CLAUDE_MODEL,
      mcpServers: { scribe: server },
      allowedTools: SCRIBE_TOOL_NAMES,
      permissionMode: 'bypassPermissions',
      maxTurns: 20,
    },
  });

  for await (const msg of q) {
    if (msg.type === 'assistant') {
      for (const block of msg.message.content) {
        if (block.type === 'text' && block.text.trim()) {
          emit({ type: 'text', text: block.text });
        }
      }
    } else if (msg.type === 'result' && msg.subtype !== 'success') {
      emit({ type: 'text', text: `(agent ended: ${msg.subtype})` });
    }
  }
}

export async function runClaudeSimulator({ systemPrompt, userPrompt }) {
  const q = query({
    prompt: userPrompt,
    options: {
      systemPrompt,
      model: CLAUDE_MODEL,
      allowedTools: [],
      maxTurns: 1,
    },
  });
  let out = '';
  for await (const msg of q) {
    if (msg.type === 'result' && msg.subtype === 'success') out = msg.result;
  }
  return out;
}
