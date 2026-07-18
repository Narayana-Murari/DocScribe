import 'dotenv/config';

// Provider registry. Claude runs through the Claude Agent SDK on the local
// Claude Code login (Pro subscription). Everything else speaks the
// OpenAI-compatible chat/completions API — one adapter covers them all.
export const providerDefs = [
  {
    id: 'claude',
    label: 'Claude (Pro subscription)',
    kind: 'claude-agent-sdk',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    kind: 'openai-compat',
    baseUrl: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    keyEnv: 'OPENAI_API_KEY',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    kind: 'openai-compat',
    baseUrl: process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai',
    keyEnv: 'GEMINI_API_KEY',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
  {
    id: 'kimi',
    label: 'Kimi (Moonshot)',
    kind: 'openai-compat',
    baseUrl: process.env.KIMI_BASE_URL || 'https://api.moonshot.ai/v1',
    keyEnv: 'KIMI_API_KEY',
    model: process.env.KIMI_MODEL || 'kimi-k2-turbo-preview',
  },
  {
    id: 'nvidia-glm',
    label: 'GLM-5.2 · NVIDIA free',
    kind: 'openai-compat',
    baseUrl: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    keyEnv: 'NVIDIA_API_KEY',
    model: process.env.NVIDIA_GLM_MODEL || 'z-ai/glm-5.2',
  },
  {
    id: 'nvidia-minimax',
    label: 'MiniMax-M3 · NVIDIA free',
    kind: 'openai-compat',
    baseUrl: process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1',
    keyEnv: 'NVIDIA_API_KEY',
    model: process.env.NVIDIA_MINIMAX_MODEL || 'minimaxai/minimax-m3',
  },
];

export function listProviders() {
  return providerDefs.map((p) => ({
    id: p.id,
    label: p.label,
    model: p.kind === 'claude-agent-sdk' ? (process.env.CLAUDE_MODEL || 'default') : p.model,
    configured: p.kind === 'claude-agent-sdk' ? true : Boolean(process.env[p.keyEnv]),
  }));
}

export function getProvider(id) {
  return providerDefs.find((p) => p.id === id) || providerDefs[0];
}

// One call to an OpenAI-compatible chat/completions endpoint.
export async function chatCompletion(provider, messages, tools) {
  const key = process.env[provider.keyEnv];
  if (!key) throw new Error(`${provider.label} is not configured — set ${provider.keyEnv} in server/.env`);
  const body = { model: provider.model, messages };
  if (tools?.length) {
    body.tools = tools.map((t) => ({ type: 'function', function: t }));
  }
  const res = await fetch(`${provider.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${provider.label} API error ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  return json.choices[0].message;
}
