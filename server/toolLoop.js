import { chatCompletion } from './providers.js';
import { toolSchemas, runTool } from './tools.js';

// Generic agentic tool loop for OpenAI-compatible providers (OpenAI, Gemini, Kimi).
// Emits the same event shapes as the Claude Agent SDK path so the UI is provider-agnostic.
export async function runOpenAiCompatScribe({ provider, systemPrompt, userPrompt, emit }) {
  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  for (let turn = 0; turn < 12; turn++) {
    const msg = await chatCompletion(provider, messages, toolSchemas);
    messages.push(msg);

    if (msg.content) emit({ type: 'text', text: msg.content });

    const calls = msg.tool_calls || [];
    if (!calls.length) return; // agent is done

    for (const call of calls) {
      const name = call.function.name;
      let input = {};
      try { input = JSON.parse(call.function.arguments || '{}'); } catch { /* leave empty */ }
      emit({ type: 'tool_start', name, input });
      const output = runTool(name, input);
      emit({ type: 'tool_result', name, output });
      if (name === 'save_soap_note') emit({ type: 'note', note: input });
      messages.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(output),
      });
    }
  }
  emit({ type: 'text', text: '(stopped: reached max agent turns)' });
}

// One-shot generation (Encounter Simulator) on an OpenAI-compatible provider.
export async function runOpenAiCompatSimulator({ provider, systemPrompt, userPrompt }) {
  const msg = await chatCompletion(provider, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
  return msg.content || '';
}
