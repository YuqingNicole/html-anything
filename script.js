import { createDocument, parseDocument, serializeDocument } from './packages/document/index.js';
import { renderReader } from './packages/renderer/index.js';
import { localPersistence } from './packages/persistence/index.js';
import { createHistory, dispatch, undo, redo } from './packages/actions/index.js';
import { renderCanvas } from './packages/canvas/renderer.js';

const question = document.querySelector('#question');
const generate = document.querySelector('#generate');
const artifact = document.querySelector('#artifact');
const tag = document.querySelector('#artifactTag');
const readTime = document.querySelector('#readTime');
const style = document.querySelector('#style');
const audience = document.querySelector('#audience');
const agent = document.querySelector('#agent');
let currentDocument;
let history;
let activeMode = 'reader';
let viewport = { x: 40, y: 40, zoom: 1 };
let connectFrom = null;

const examples = {
  'How does the internet work?': { title: 'The internet is a giant delivery system.', nodes: ['your phone', 'wifi', 'the web'], copy: 'Your message gets chopped into tiny packages, finds its way across many computers, then gets rebuilt on the other side.' },
  'Why do airplanes stay in the air?': { title: 'An airplane flies by pushing air down.', nodes: ['wing shape', 'airflow', 'lift'], copy: 'The wing is shaped so air moves faster over the top. The pressure difference pushes the plane upward — lift.' },
  'What is an API?': { title: 'An API is a waiter for software.', nodes: ['your app', 'the API', 'a service'], copy: 'You ask for something in a language the service understands. The API carries your request out and brings the answer back.' }
};

function documentForTopic(topic) {
  const preset = examples[topic] || { title: `${topic.replace(/[?!.]+$/, '')} without the jargon.`, nodes: ['the question', 'one idea', 'aha!'], copy: 'Start with the simplest useful shape: what goes in, what changes, and what comes out. The details can come later.' };
  return createDocument({ title: preset.title, thesis: preset.copy, nodes: preset.nodes, template: 'pipeline' });
}

function renderExplainer(topic) {
  currentDocument = documentForTopic(topic);
  history = createHistory(currentDocument);
  artifact.className = 'artifact';
  artifact.innerHTML = renderReader(currentDocument);
  tag.textContent = 'GENERATED';
  readTime.textContent = '1 min read';
  localPersistence.save(currentDocument);
}

generate.addEventListener('click', () => {
  const topic = question.value.trim() || 'How does the internet work?';
  generate.querySelector('span').textContent = 'Generating…';
  tag.textContent = 'THINKING';
  setTimeout(() => { renderExplainer(topic); generate.querySelector('span').textContent = 'Generate explainer'; }, 420);
});

document.querySelectorAll('.suggestions button').forEach((button) => button.addEventListener('click', () => { question.value = button.dataset.topic; question.focus(); }));

function refreshHistoryControls() {
  document.querySelector('#undo').disabled = !history?.undoStack.length;
  document.querySelector('#redo').disabled = !history?.redoStack.length;
}
function refreshDocument() {
  currentDocument = history.document;
  if (activeMode === 'reader') artifact.innerHTML = renderReader(currentDocument);
  else renderInteractiveCanvas();
  localPersistence.save(currentDocument);
  refreshHistoryControls();
}
function renderInteractiveCanvas() {
  artifact.className = 'artifact canvas-artifact';
  renderCanvas(artifact, currentDocument, {
    viewport,
    onMove: (id, dx, dy) => { history = dispatch(history, { type: 'move', ids: [id], dx, dy }); refreshDocument(); },
    onConnect: (id) => {
      if (!connectFrom) { connectFrom = id; tag.textContent = 'SELECT TARGET'; return; }
      if (connectFrom !== id) history = dispatch(history, { type: 'connect', from: connectFrom, to: id, relation: 'flows_to', label: ' leads to ' });
      connectFrom = null; tag.textContent = 'EDITED'; refreshDocument();
    },
  });
}
function setMode(mode) {
  activeMode = mode;
  document.querySelector('#readerMode').classList.toggle('active', mode === 'reader');
  document.querySelector('#canvasMode').classList.toggle('active', mode === 'canvas');
  document.querySelector('#canvasHelp').hidden = mode !== 'canvas';
  if (currentDocument) refreshDocument();
}
document.querySelector('#readerMode').addEventListener('click', () => setMode('reader'));
document.querySelector('#canvasMode').addEventListener('click', () => setMode('canvas'));
artifact.addEventListener('wheel', (event) => {
  if (activeMode !== 'canvas') return;
  event.preventDefault(); viewport.zoom = Math.min(2, Math.max(.5, viewport.zoom * (event.deltaY < 0 ? 1.08 : .92))); renderInteractiveCanvas();
}, { passive: false });
document.querySelector('#undo').addEventListener('click', () => { if (history) { history = undo(history); refreshDocument(); } });
document.querySelector('#redo').addEventListener('click', () => { if (history) { history = redo(history); refreshDocument(); } });
document.querySelector('#importJson').addEventListener('click', () => document.querySelector('#jsonFile').click());
document.querySelector('#jsonFile').addEventListener('change', async (event) => {
  const file = event.target.files?.[0]; if (!file) return;
  try { currentDocument = parseDocument(await file.text()); history = createHistory(currentDocument); artifact.className = 'artifact'; artifact.innerHTML = renderReader(currentDocument); tag.textContent = 'IMPORTED'; localPersistence.save(currentDocument); refreshHistoryControls(); }
  catch (error) { tag.textContent = 'INVALID JSON'; console.warn('Could not import document:', error); }
  event.target.value = '';
});

document.querySelector('#downloadJson').addEventListener('click', () => {
  if (!currentDocument) return;
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([serializeDocument(currentDocument)], { type: 'application/json' }));
  link.download = 'explainer-document.json'; link.click(); URL.revokeObjectURL(link.href);
});

document.querySelector('#copyPrompt').addEventListener('click', async (event) => {
  const topic = question.value.trim() || 'your topic';
  await navigator.clipboard?.writeText(`/eli5 ${topic}\n\nExplain like I'm someone who knows nothing about this topic, using an HTML artifact with big pictures and few words.`);
  event.currentTarget.innerHTML = 'copied ✓'; setTimeout(() => { event.currentTarget.innerHTML = 'copy AI prompt <span>↗</span>'; }, 1500);
});

function buildTask() {
  const topic = question.value.trim() || 'How does the internet work?';
  return `# Visual explainer task\n\n## Objective\nCreate a self-contained HTML visual explainer for: **${topic}**\n\n## Audience\nExplain this to someone who knows ${audience.value}.\n\n## Style\nUse ${style.options[style.selectedIndex].text}, with big visual structure, few words, and one clear mental model.\n\n## Design philosophy\n- Big pictures: visual structure should carry the explanation.\n- Few words: every sentence must earn its place.\n- One mental model: show the shape before adding detail.\n- Progressive disclosure: make the first 30 seconds useful, then allow depth.\n- Honest clarity: distinguish facts, assumptions, and uncertainty.\n- Crafted artifact: make a finished interface, not a wall of generated text.\n\n## Architecture\nReturn a validated ExplainerDocument first, then render it. Keep document state separate from app state. Use semantic element IDs and relations.\n\n## Requirements\n- Start with a one-sentence conclusion.\n- Show 3–5 connected nodes.\n- Include one example, one misconception, and sources when appropriate.\n- Use semantic HTML, responsive CSS, no external dependencies.\n- Return standalone HTML beginning with <!doctype html>.\n\n## Agent\nThis task is prepared for ${agent.value}. Review the request before running commands or adding dependencies.\n`;
}

const agentCommands = {
  claude: (task) => `claude ${quoteShell(task)}`, codex: (task) => `codex exec ${quoteShell(task)}`, gemini: (task) => `gemini -p ${quoteShell(task)}`, opencode: (task) => `opencode run ${quoteShell(task)}`, cursor: () => 'Open visual-explainer-task.md in Cursor and ask Agent to implement it.', windsurf: () => 'Open visual-explainer-task.md in Windsurf and ask Cascade to implement it.'
};
function quoteShell(value) { return `'${value.replaceAll("'", "'\\''")}'`; }
document.querySelector('#copyAgentPrompt').addEventListener('click', async (event) => { await navigator.clipboard?.writeText(agentCommands[agent.value](buildTask())); event.currentTarget.textContent = 'copied ✓'; setTimeout(() => { event.currentTarget.textContent = 'copy agent prompt'; }, 1500); });
document.querySelector('#downloadTask').addEventListener('click', (event) => { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([buildTask()], { type: 'text/markdown;charset=utf-8' })); link.download = 'visual-explainer-task.md'; link.click(); URL.revokeObjectURL(link.href); event.currentTarget.textContent = 'downloaded ✓'; setTimeout(() => { event.currentTarget.textContent = 'download task .md'; }, 1500); });

try {
  const saved = localPersistence.load();
  if (saved) { currentDocument = parseDocument(saved); history = createHistory(currentDocument); artifact.className = 'artifact'; artifact.innerHTML = renderReader(currentDocument); tag.textContent = 'RESTORED'; readTime.textContent = '1 min read'; refreshHistoryControls(); }
} catch (error) { console.warn('Could not restore local document:', error); }

document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') generate.click(); });
