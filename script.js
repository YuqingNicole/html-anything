const question = document.querySelector('#question');
const generate = document.querySelector('#generate');
const artifact = document.querySelector('#artifact');
const tag = document.querySelector('#artifactTag');
const readTime = document.querySelector('#readTime');
const style = document.querySelector('#style');
const audience = document.querySelector('#audience');
const agent = document.querySelector('#agent');

const examples = {
  'How does the internet work?': {
    title: 'The internet is\na giant delivery system.',
    nodes: ['your phone', 'wifi', 'the web'],
    copy: 'Your message gets chopped into tiny packages, finds its way across many computers, then gets rebuilt on the other side.'
  },
  'Why do airplanes stay in the air?': {
    title: 'An airplane flies\nby pushing air down.',
    nodes: ['wing shape', 'airflow', 'lift'],
    copy: 'The wing is shaped so air moves faster over the top. The pressure difference pushes the plane upward — lift.'
  },
  'What is an API?': {
    title: 'An API is a\nwaiter for software.',
    nodes: ['your app', 'the API', 'a service'],
    copy: 'You ask for something in a language the service understands. The API carries your request out and brings the answer back.'
  }
};

function renderExplainer(topic) {
  const preset = examples[topic] || {
    title: `${topic.replace(/[?!.]+$/, '')}\nwithout the jargon.`,
    nodes: ['the question', 'one idea', 'aha!'],
    copy: 'Start with the simplest useful shape: what goes in, what changes, and what comes out. The details can come later.'
  };
  artifact.className = 'artifact';
  artifact.innerHTML = `
    <h2 class="explain-title">${preset.title.replace('\n', '<br>')}</h2>
    <div class="explain-visual">${preset.nodes.map((node, i) => `<span class="node">${node}</span>${i < preset.nodes.length - 1 ? '<span class="connector">→</span>' : ''}`).join('')}</div>
    <p class="explain-copy">${preset.copy}</p>`;
  tag.textContent = 'GENERATED';
  readTime.textContent = '1 min read';
}

generate.addEventListener('click', () => {
  const topic = question.value.trim() || 'How does the internet work?';
  generate.querySelector('span').textContent = 'Generating…';
  tag.textContent = 'THINKING';
  setTimeout(() => {
    renderExplainer(topic);
    generate.querySelector('span').textContent = 'Generate explainer';
  }, 420);
});

document.querySelectorAll('.suggestions button').forEach(button => {
  button.addEventListener('click', () => {
    question.value = button.dataset.topic;
    question.focus();
  });
});

document.querySelector('#copyPrompt').addEventListener('click', async (event) => {
  const topic = question.value.trim() || 'your topic';
  const prompt = `/eli5 ${topic}\n\nExplain like I'm someone who knows nothing about this topic, using an HTML artifact with big pictures and few words.`;
  await navigator.clipboard?.writeText(prompt);
  event.currentTarget.innerHTML = 'copied ✓';
  setTimeout(() => { event.currentTarget.innerHTML = 'copy AI prompt <span>↗</span>'; }, 1500);
});

function buildTask() {
  const topic = question.value.trim() || 'How does the internet work?';
  const selectedAgent = agent.value;
  return `# Visual explainer task\n\n## Objective\nCreate a self-contained HTML visual explainer for: **${topic}**\n\n## Audience\nExplain this to someone who knows ${audience.value}.\n\n## Style\nUse ${style.options[style.selectedIndex].text}, with big visual structure, few words, and one clear mental model.\n\n## Design philosophy\n- Big pictures: visual structure should carry the explanation.\n- Few words: every sentence must earn its place.\n- One mental model: show the shape of the idea before adding detail.\n- Progressive disclosure: make the first 30 seconds useful, then allow depth.\n- Honest clarity: distinguish facts, assumptions, and uncertainty.\n- Crafted artifact: the result should feel like a small, finished interface—not a wall of generated text.\n\n## Requirements\n- Start with a one-sentence conclusion.\n- Show the mechanism as 3–5 connected steps or nodes.\n- Include one concrete example and one common misconception.\n- Use semantic HTML, responsive CSS, and no external dependencies.\n- Distinguish facts from assumptions; add sources when the topic is factual or time-sensitive.\n- Save the final artifact as explainer.html.\n\n## Agent\nThis task is prepared for ${selectedAgent}. Review the request before running commands or adding dependencies.\n`;
}

const agentCommands = {
  claude: (task) => `claude ${quoteShell(task)}`,
  codex: (task) => `codex exec ${quoteShell(task)}`,
  gemini: (task) => `gemini -p ${quoteShell(task)}`,
  opencode: (task) => `opencode run ${quoteShell(task)}`,
  cursor: () => 'Open this task file in Cursor and ask the Agent to implement it: visual-explainer-task.md',
  windsurf: () => 'Open this task file in Windsurf and ask Cascade to implement it: visual-explainer-task.md'
};

function quoteShell(value) {
  return `'${value.replaceAll("'", "'\\''")}'`;
}

document.querySelector('#copyAgentPrompt').addEventListener('click', async (event) => {
  const task = buildTask();
  const command = agentCommands[agent.value](task);
  await navigator.clipboard?.writeText(command);
  event.currentTarget.textContent = 'copied ✓';
  setTimeout(() => { event.currentTarget.textContent = 'copy agent prompt'; }, 1500);
});

document.querySelector('#downloadTask').addEventListener('click', (event) => {
  const blob = new Blob([buildTask()], { type: 'text/markdown;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'visual-explainer-task.md';
  link.click();
  URL.revokeObjectURL(link.href);
  event.currentTarget.textContent = 'downloaded ✓';
  setTimeout(() => { event.currentTarget.textContent = 'download task .md'; }, 1500);
});

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') generate.click();
});
