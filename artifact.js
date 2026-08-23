import { parseDocument, serializeDocument } from './packages/document/index.js';
import { renderReader } from './packages/renderer/index.js';
import { localPersistence } from './packages/persistence/index.js';
import { createHistory, dispatch, undo, redo } from './packages/actions/index.js';
import { renderCanvas } from './packages/canvas/renderer.js';

const artifact = document.querySelector('#artifact');
const status = document.querySelector('#artifactStatus');
let history; let currentDocument; let mode = 'reader'; let viewport = { x: 40, y: 40, zoom: 1 }; let selectedIds = []; let connectFrom = null; let transaction = null;
try { const saved = localPersistence.load(); if (saved) { currentDocument = parseDocument(saved); currentDocument.metadata.theme ||= 'editorial'; history = createHistory(currentDocument); status.textContent = 'LOCAL ARTIFACT · SAVED'; render(); } } catch (error) { console.warn('Could not restore artifact', error); status.textContent = 'COULD NOT RESTORE'; }
function render() { if (!history) return; currentDocument = history.document; artifact.className = `artifact artifact-page-content theme-${currentDocument.metadata?.theme || 'editorial'}${mode === 'canvas' ? ' canvas-artifact' : ''}`; if (mode === 'reader') artifact.innerHTML = renderReader(currentDocument); else renderCanvasMode(); localPersistence.save(currentDocument); updateControls(); }
function renderCanvasMode() { renderCanvas(artifact, currentDocument, { viewport, selectedIds,
  onSelect: (id, additive) => { selectedIds = additive ? (selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]) : [id]; renderCanvasMode(); },
  onMove: (id, dx, dy) => { if (!transaction) transaction = { id, dx: 0, dy: 0 }; transaction.dx += dx; transaction.dy += dy; const element = history.document.elements.find((item) => item.id === id); if (element) { element.x += dx; element.y += dy; } renderCanvasMode(); },
  onResize: (id, dw, dh) => { if (!transaction) transaction = { id, dw: 0, dh: 0, resize: true }; transaction.dw += dw; transaction.dh += dh; const element = history.document.elements.find((item) => item.id === id); if (element) { element.width = Math.max(90, element.width + dw); element.height = Math.max(50, element.height + dh); } renderCanvasMode(); },
  onMoveEnd: () => { if (!transaction) return; const tx = transaction; history.undoStack.push(tx.resize ? { type: 'resize', id: tx.id, dw: -tx.dw, dh: -tx.dh } : { type: 'move', ids: [tx.id], dx: -tx.dx, dy: -tx.dy }); history.redoStack = []; transaction = null; localPersistence.save(history.document); updateControls(); },
  onConnect: (id) => { if (!connectFrom) { connectFrom = id; status.textContent = 'CHOOSE A TARGET'; return; } if (connectFrom !== id) history = dispatch(history, { type: 'connect', from: connectFrom, to: id, relation: 'flows_to', label: ' leads to ' }); connectFrom = null; status.textContent = 'LOCAL ARTIFACT · SAVED'; render(); },
}); }
function updateControls() { document.querySelector('#undo').disabled = !history?.undoStack.length; document.querySelector('#redo').disabled = !history?.redoStack.length; }
function setMode(next) { mode = next; document.querySelector('#readerMode').classList.toggle('active', mode === 'reader'); document.querySelector('#canvasMode').classList.toggle('active', mode === 'canvas'); document.querySelector('#canvasHelp').hidden = mode !== 'canvas'; render(); }
document.querySelector('#readerMode').addEventListener('click', () => setMode('reader')); document.querySelector('#canvasMode').addEventListener('click', () => setMode('canvas'));
document.querySelector('#undo').addEventListener('click', () => { if (history) { history = undo(history); render(); } }); document.querySelector('#redo').addEventListener('click', () => { if (history) { history = redo(history); render(); } });
document.querySelector('#exportJson').addEventListener('click', () => { if (!currentDocument) return; const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([serializeDocument(currentDocument)], { type: 'application/json' })); link.download = 'explainer-document.json'; link.click(); URL.revokeObjectURL(link.href); });
artifact.addEventListener('wheel', (event) => { if (mode !== 'canvas') return; event.preventDefault(); viewport.zoom = Math.min(2, Math.max(.5, viewport.zoom * (event.deltaY < 0 ? 1.08 : .92))); renderCanvasMode(); }, { passive: false });
document.addEventListener('keydown', (event) => { if (mode !== 'canvas' || !history) return; if (event.key === 'Escape') { selectedIds = []; connectFrom = null; renderCanvasMode(); } if ((event.key === 'Delete' || event.key === 'Backspace') && selectedIds.length) { event.preventDefault(); history = dispatch(history, { type: 'delete', ids: selectedIds }); selectedIds = []; render(); } });
