import { validateDocument } from '../document/index.js';

const templateMeta = {
  pipeline: { eyebrow: 'SYSTEM MAP', verb: 'flows into', insight: 'Follow the hand-off: each step changes what the next step can do.' },
  feedbackLoop: { eyebrow: 'FEEDBACK LOOP', verb: 'reinforces', insight: 'Look for the loop: an output returns as a stronger input.' },
  'feedback-loop': { eyebrow: 'FEEDBACK LOOP', verb: 'reinforces', insight: 'Look for the loop: an output returns as a stronger input.' },
  branches: { eyebrow: 'TRANSMISSION MAP', verb: 'affects', insight: 'Start at the root, then compare the paths it opens.' },
  timeline: { eyebrow: 'SEQUENCE', verb: 'leads to', insight: 'Read left to right: every stage sets up the next one.' },
  tradeoff: { eyebrow: 'TRADE-OFF', verb: 'pulls against', insight: 'A gain on one side usually asks for a cost on the other.' },
};

export function renderReader(document) {
  const result = validateDocument(document);
  if (!result.valid) throw new Error(result.errors.join('; '));
  const nodes = document.elements.filter((element) => element.type === 'node');
  const edges = document.elements.filter((element) => element.type === 'edge');
  const meta = templateMeta[document.template] || templateMeta.pipeline;
  const templateClass = `reader-${document.template || 'pipeline'}`;
  const flow = nodes.map((node, index) => `<div class="reader-node role-${node.role}"><span class="reader-node-index">${String(index + 1).padStart(2, '0')}</span><strong>${escapeHtml(node.title)}</strong><small>${roleLabel(node.role, index, nodes.length)}</small></div>${index < nodes.length - 1 ? `<span class="reader-arrow" aria-hidden="true">→</span>` : ''}`).join('');
  const edgesHtml = edges.map((edge) => `<li><span>${escapeHtml(findTitle(document, edge.from))}</span><b>${escapeHtml(edge.label || meta.verb)}</b><span>${escapeHtml(findTitle(document, edge.to))}</span></li>`).join('');
  const cards = nodes.map((node, index) => `<article class="explanation-card role-${node.role}"><span class="card-number">${String(index + 1).padStart(2, '0')}</span><div><h3>${escapeHtml(node.title)}</h3><p>${nodeExplanation(node, index, nodes.length)}</p></div></article>`).join('');
  const sources = (document.sources || []).map((source) => `<a href="${escapeAttr(source.url || '#')}" target="_blank" rel="noreferrer">${escapeHtml(source.title || source.url || 'source')}</a>`).join(' · ');
  return `<article class="document-reader ${templateClass}" data-document-id="${escapeAttr(document.id)}"><div class="reader-header"><p class="document-template">${meta.eyebrow}</p><span class="reader-status">ONE-MINUTE MODEL</span></div><section class="reader-conclusion"><span class="conclusion-label">THE SHORT ANSWER</span><h2>${escapeHtml(document.title)}</h2><p class="document-thesis">${escapeHtml(document.thesis)}</p></section><div class="reader-visual"><div class="reader-flow-label">THE SHAPE OF IT</div><div class="reader-flow">${flow}</div></div>${edges.length ? `<section class="relationship-section"><div class="section-label">WHAT CHANGES WHAT</div><ul class="document-relations">${edgesHtml}</ul></section>` : ''}<section class="reader-insight"><span>HOW TO READ THIS</span><p>${meta.insight}</p></section><section class="explanation-section"><div class="section-label">UNPACK THE MODEL</div><div class="explanation-cards">${cards}</div></section>${sources ? `<p class="reader-sources"><span>FACT CHECK</span> Sources · ${sources}</p>` : `<p class="reader-sources"><span>NOTE</span> This is a simplified model. Add sources before treating it as a factual reference.</p>`}</article>`;
}

function roleLabel(role, index, total) { if (role === 'cause' || index === 0) return 'START HERE'; if (role === 'effect' || index === total - 1) return 'WHAT IT CHANGES'; return 'THE MECHANISM'; }
function nodeExplanation(node, index, total) { if (index === 0) return `This is where the story starts: ${escapeHtml(node.title)} sets the chain in motion.`; if (index === total - 1) return `This is the visible result: it is what the earlier steps make possible.`; return `This is the bridge. It turns what came before into the next effect.`; }
function findTitle(document, id) { return document.elements.find((element) => element.id === id)?.title || id; }
function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]); }
function escapeAttr(value = '') { return escapeHtml(value); }
