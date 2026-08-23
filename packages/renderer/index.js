import { validateDocument } from '../document/index.js';

export function renderReader(document) {
  const result = validateDocument(document);
  if (!result.valid) throw new Error(result.errors.join('; '));
  const nodes = document.elements.filter((element) => element.type === 'node');
  const edges = document.elements.filter((element) => element.type === 'edge');
  const flow = nodes.map((node, index) => `${node.title}${index < nodes.length - 1 ? ' <span class="connector">→</span> ' : ''}`).join('');
  const edgesHtml = edges.map((edge) => `<li><b>${findTitle(document, edge.from)}</b> ${edge.label || '→'} <b>${findTitle(document, edge.to)}</b></li>`).join('');
  return `<article class="document-reader" data-document-id="${document.id}"><p class="document-template">${document.template}</p><h2>${escapeHtml(document.title)}</h2><p class="document-thesis">${escapeHtml(document.thesis)}</p><div class="document-flow">${flow}</div><ul class="document-relations">${edgesHtml}</ul></article>`;
}
function findTitle(document, id) { return document.elements.find((element) => element.id === id)?.title || id; }
function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]); }
