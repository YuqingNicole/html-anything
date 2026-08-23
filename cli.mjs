#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const args = process.argv.slice(2);
const help = `html-anything explain "your question" [options]
html-anything refine "feedback" --input explainer.html [options]

Options:
  --agent claude|codex|gemini|opencode   local coding agent (default: claude)
  --out file.html                        output HTML (default: explainer.html)
  --repo path                            project/repository context and working directory
  --context path                         extra file or directory to include (repeatable)
  --open                                 open the generated HTML on macOS

Examples:
  node cli.mjs explain "How does an API work?" --agent claude --out explainer.html
  node cli.mjs explain "Explain this feature" --repo ~/my-app --context src/app.ts
  node cli.mjs refine "Make the diagram clearer" --input explainer.html --out explainer-v2.html`;

if (!args.length || args.includes('--help')) { console.log(help); process.exit(0); }

const command = args[0];
if (!['explain', 'refine'].includes(command)) { console.error(help); process.exit(1); }

function option(name, fallback = undefined) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}
function has(name) { return args.includes(name); }
function positional() {
  const skip = new Set(['--agent', '--out', '--repo', '--context', '--input']);
  return args.slice(1).filter((arg, index, list) => {
    if (arg.startsWith('--')) return false;
    return index === 0 || !skip.has(list[index - 1]);
  });
}

const agent = option('--agent', 'claude');
const output = option('--out', command === 'refine' ? 'explainer-refined.html' : 'explainer.html');
const repo = option('--repo');
const input = option('--input');
const question = positional().join(' ');
const extraContexts = [];
for (let i = 0; i < args.length; i += 1) if (args[i] === '--context' && args[i + 1]) extraContexts.push(args[i + 1]);
const supported = { claude: ['claude', '-p'], codex: ['codex', 'exec'], gemini: ['gemini', '-p'], opencode: ['opencode', 'run'] };

if (!question || !supported[agent] || (command === 'refine' && !input)) {
  console.error(help);
  process.exit(1);
}

function readContext(target, maxBytes = 12000) {
  const absolute = resolve(target);
  if (!existsSync(absolute)) return `\n[Context missing: ${target}]`;
  const info = statSync(absolute);
  if (!info.isFile()) return `\n[Context directory: ${target}; agent may inspect it in its working directory]`;
  const content = readFileSync(absolute, 'utf8');
  return `\n\n--- ${target} ---\n${content.slice(0, maxBytes)}${content.length > maxBytes ? '\n[truncated]' : ''}`;
}

function buildContext() {
  const parts = [];
  if (repo) {
    parts.push(readContext(resolve(repo, 'README.md')));
    parts.push(readContext(resolve(repo, 'package.json'), 8000));
  }
  for (const item of extraContexts) parts.push(readContext(item));
  if (command === 'refine') parts.push(readContext(input, 30000));
  return parts.length ? `\n\n## Project context\n${parts.join('')}` : '\n\nNo project context was supplied. Work only from the request.';
}

const task = command === 'explain'
  ? `Create a self-contained HTML visual explainer for: ${question}\n\nDesign philosophy:\n- Big pictures: visual structure should carry the explanation.\n- Few words: every sentence must earn its place.\n- One mental model: show the shape before adding detail.\n- Progressive disclosure: make the first 30 seconds useful, then allow depth.\n- Honest clarity: distinguish facts, assumptions, and uncertainty.\n- Crafted artifact: make a finished interface, not a wall of generated text.\n\nRequirements:\n- Explain the core idea in one sentence.\n- Show a 3–5 step visual mental model with semantic HTML and responsive CSS.\n- Use no external dependencies.\n- Include one concrete example, one misconception, and sources when appropriate.\n- If project context is provided, respect its existing conventions and do not modify unrelated files.\n- Return only the complete HTML document, beginning with <!doctype html>.${buildContext()}`
  : `Refine the existing HTML explainer according to this feedback: ${question}\n\nDesign philosophy:\n- Big pictures, few words, one mental model.\n- Preserve clarity, hierarchy, progressive disclosure, and honest uncertainty.\n\nRequirements:\n- Preserve the core content and visual language unless the feedback asks for a change.\n- Return the complete revised self-contained HTML document, beginning with <!doctype html>.\n- Use no external dependencies.${buildContext()}`;

const cwd = repo && existsSync(resolve(repo)) ? resolve(repo) : process.cwd();
console.error(`Running ${agent} in ${cwd}…`);
const result = spawnSync(supported[agent][0], [...supported[agent].slice(1), task], {
  encoding: 'utf8', cwd, maxBuffer: 10 * 1024 * 1024,
});
if (result.error) { console.error(`Could not start ${agent}: ${result.error.message}`); process.exit(1); }
if (result.status !== 0) { console.error(result.stderr || `${agent} exited with code ${result.status}`); process.exit(result.status || 1); }

const html = result.stdout.trim().replace(/^```html\s*/i, '').replace(/\s*```$/i, '');
if (!html.toLowerCase().includes('<!doctype html>') && !html.toLowerCase().includes('<html')) {
  console.error('Agent did not return an HTML document. Raw output saved to agent-output.txt.');
  writeFileSync('agent-output.txt', result.stdout);
  process.exit(1);
}
writeFileSync(output, html + '\n');
console.log(`Saved ${resolve(output)}`);
if (has('--open') && process.platform === 'darwin') spawnSync('open', [resolve(output)], { stdio: 'ignore' });
