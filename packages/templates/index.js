export const templates = {
  pipeline: {
    label: 'Input → Transform → Output',
    description: '用 3–5 个节点解释一个系统如何运行。',
    build: ({ title, thesis, nodes, sources = [] }) => ({ title, thesis, nodes, sources, template: 'pipeline' }),
  },
  feedbackLoop: {
    label: 'Causal feedback loop',
    description: '解释会自我强化或自我修正的机制。',
    build: ({ title, thesis, nodes, sources = [] }) => ({ title, thesis, nodes, sources, template: 'feedback-loop' }),
  },
  branches: {
    label: 'Transmission branches',
    description: '从一个核心变量分出多个影响路径。',
    build: ({ title, thesis, nodes, sources = [] }) => ({ title, thesis, nodes, sources, template: 'branches' }),
  },
  timeline: {
    label: 'Before → Now → Next',
    description: '解释变化、转折与接下来要观察什么。',
    build: ({ title, thesis, nodes, sources = [] }) => ({ title, thesis, nodes, sources, template: 'timeline' }),
  },
  tradeoff: {
    label: 'Trade-off scale',
    description: '解释两个目标为什么无法同时最大化。',
    build: ({ title, thesis, nodes, sources = [] }) => ({ title, thesis, nodes, sources, template: 'tradeoff' }),
  },
};

export function listTemplates() { return Object.entries(templates).map(([id, value]) => ({ id, ...value })); }
export function getTemplate(id) { return templates[id] || templates.pipeline; }
