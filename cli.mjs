#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const help = `html-anything explain "your question" [--agent claude|codex|gemini|opencode] [--out explainer.html]\n\nThe CLI writes a task brief, invokes the selected local coding agent, and saves its HTML output.`;
if (!args.length || args.includes('--help')) { console.log(help); process.exit(0); }

const question = args.find((arg) => !arg.startsWith('--'));
const agentIndex = args.indexOf('--agent');
const agent = agentIndex >= 0 ? args[agentIndex + 1] : 'claude';
const outIndex = args.indexOf('--out');
const output = outIndex >= 0 ? args[outIndex + 1] : 'explainer.html';
const supported = { claude: ['claude', '-p'], codex: ['codex', 'exec'], gemini: ['gemini', '-p'], opencode: ['opencode', 'run'] };
if (!question || !supported[agent]) { console.error(help); process.exit(1); }

const task = `Create a self-contained HTML visual explainer for: ${question}\n\nRequirements:\n- Explain the core idea in one sentence.\n- Show a 3–5 step visual mental model with semantic HTML and responsive CSS.\n- Use no external dependencies.\n- Include one concrete example, one misconception, and sources when appropriate.\n- Return only the complete HTML document, beginning with <!doctype html>.`;
console.error(`Running ${agent}…`);
const result = spawnSync(supported[agent][0], [...supported[agent].slice(1), task], { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
if (result.error) { console.error(`Could not start ${agent}: ${result.error.message}`); process.exit(1); }
if (result.status !== 0) { console.error(result.stderr || ` ${agent} exited with code ${result.status}`); process.exit(result.status || 1); }
let html = result.stdout.trim().replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
if (!html.toLowerCase().includes('<!doctype html>') && !html.toLowerCase().includes('<html')) {
  console.error('Agent did not return an HTML document. Raw output saved to agent-output.txt.');
  writeFileSync('agent-output.txt', result.stdout);
  process.exit(1);
}
writeFileSync(output, html + '\n');
console.log(`Saved ${output}`);
