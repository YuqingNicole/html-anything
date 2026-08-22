const question = document.querySelector('#question');
const generate = document.querySelector('#generate');
const artifact = document.querySelector('#artifact');
const tag = document.querySelector('#artifactTag');
const readTime = document.querySelector('#readTime');
const style = document.querySelector('#style');

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

document.addEventListener('keydown', (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') generate.click();
});
