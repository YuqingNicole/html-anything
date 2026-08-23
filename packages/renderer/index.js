import { validateDocument } from '../document/index.js';

const templateMeta = {
  pipeline: { eyebrow: 'SYSTEM MAP', verb: 'flows into' },
  feedbackLoop: { eyebrow: 'FEEDBACK LOOP', verb: 'reinforces' },
  'feedback-loop': { eyebrow: 'FEEDBACK LOOP', verb: 'reinforces' },
  branches: { eyebrow: 'TRANSMISSION MAP', verb: 'affects' },
  timeline: { eyebrow: 'SEQUENCE', verb: 'leads to' },
  tradeoff: { eyebrow: 'TRADE-OFF', verb: 'pulls against' },
};

export function renderReader(document) {
  const result = validateDocument(document);
  if (!result.valid) throw new Error(result.errors.join('; '));
  const nodes = document.elements.filter((element) => element.type === 'node');
  const edges = document.elements.filter((element) => element.type === 'edge');
  const meta = templateMeta[document.template] || templateMeta.pipeline;
  const templateClass = `reader-${document.template || 'pipeline'}`;
  const flow = nodes.map((node, index) => `<div class="reader-node role-${node.role}"><span class="reader-node-index">${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(node.title)}</strong><small>${escapeHtml(node.role || 'mechanism')}</small></div>${index < nodes.length - 1 ? `<span class="reader-arrow" aria-hidden="true">→</span>` : ''}`).join('');
  const edgesHtml = edges.map((edge) => `<li><span>${escapeHtml(findTitle(document, edge.from))}</span><b>${escapeHtml(edge.label || meta.verb)}</b><span>${escapeHtml(findTitle(document, edge.to))}</span></li>`).join('');
  const sources = (document.sources || []).map((source) => `<a href="${escapeAttr(source.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(source.title || source.url || 'source')}</a>`).join(' · ');
  return `<article class="document-reader ${templateClass}" data-document-id="${escapeAttr(document.id)}"><div class="reader-header"><p class="document-template">${meta.eyebrow}</p><span class="reader-status">MENTAL MODEL</span></div><h2>${escapeHtml(document.title)}</h2><p class="document-thesis">${escapeHtml(document.thesis)}</p><div class="reader-visual"><div class="reader-flow-label">THE SHAPE OF IT</div><div class="reader-flow">${flow}</div></div>${edges.length ? `<ul class="document-relations">${edgesHtml}</ul>` : ''}${sources ? `<p class="reader-sources">Sources · ${sources}</p>` : ''}</article>`;
}

function findTitle(document, id) { return document.elements.find((element) => element.id === id)?.title || id; }
function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]); }
function escapeAttr(value = '') { return escapeHtml(value); }
