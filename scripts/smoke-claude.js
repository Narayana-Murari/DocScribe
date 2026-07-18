// Quick auth check: verifies the Agent SDK can run on the local Claude Code login.
import { query } from '@anthropic-ai/claude-agent-sdk';

const q = query({
  prompt: 'Reply with exactly: OK',
  options: { allowedTools: [], maxTurns: 1, model: process.env.CLAUDE_MODEL },
});
for await (const msg of q) {
  if (msg.type === 'result') {
    console.log('subtype:', msg.subtype, '| result:', msg.result ?? '(none)');
    process.exit(msg.subtype === 'success' ? 0 : 1);
  }
}
