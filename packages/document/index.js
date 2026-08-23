export const DOCUMENT_TYPE = 'html-anything';
export const DOCUMENT_VERSION = 1;
const makeId = () => globalThis.crypto?.randomUUID?.() || `doc-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function createDocument({ title, thesis, nodes, template = 'pipeline', sources = [] }) {
  const now = new Date().toISOString();
  const elements = nodes.map((label, index) => ({
    id: `node-${index + 1}`,
    type: 'node',
    role: index === 0 ? 'cause' : index === nodes.length - 1 ? 'effect' : 'mechanism',
    x: index * 180,
    y: 0,
    width: 150,
    height: 80,
    title: label,
  }));
  elements.push(...nodes.slice(0, -1).map((_, index) => ({
    id: `edge-${index + 1}`,
    type: 'edge',
    from: `node-${index + 1}`,
    to: `node-${index + 2}`,
    relation: 'flows_to',
    label: ' leads to ',
  })));
  return { type: DOCUMENT_TYPE, version: DOCUMENT_VERSION, id: makeId(), title, thesis, template, elements, sources, metadata: { generatedAt: now } };
}

export function validateDocument(input) {
  const errors = [];
  if (!input || input.type !== DOCUMENT_TYPE) errors.push('invalid document type');
  if (!Number.isInteger(input?.version)) errors.push('missing document version');
  if (!Array.isArray(input?.elements)) errors.push('elements must be an array');
  const ids = new Set((input?.elements || []).map((element) => element.id));
  for (const element of input?.elements || []) {
    if (!element.id || !element.type) errors.push('element needs id and type');
    if (element.type === 'edge' && (!ids.has(element.from) || !ids.has(element.to))) errors.push(`broken edge: ${element.id}`);
  }
  return { valid: errors.length === 0, errors };
}

export function restoreDocument(input) {
  const document = structuredClone(input || {});
  document.type ||= DOCUMENT_TYPE;
  document.version ||= DOCUMENT_VERSION;
  document.elements ||= [];
  document.sources ||= [];
  document.metadata ||= {};
  document.elements = document.elements.filter((element) => element?.id && element?.type);
  const ids = new Set(document.elements.map((element) => element.id));
  document.elements = document.elements.filter((element) => element.type !== 'edge' || (ids.has(element.from) && ids.has(element.to)));
  return document;
}

export function structuredCloneDocument(document) { return structuredClone(document); }
export function serializeDocument(document) { return JSON.stringify(document, null, 2); }
export function parseDocument(raw) {
  const restored = restoreDocument(typeof raw === 'string' ? JSON.parse(raw) : raw);
  const result = validateDocument(restored);
  if (!result.valid) throw new Error(result.errors.join('; '));
  return restored;
}
