import { getBounds, edgePath } from './index.js';

export function renderCanvas(container, explainerDocument, { viewport = { x: 40, y: 40, zoom: 1 }, selectedIds = [], onMove, onMoveEnd, onResize, onSelect, onConnect } = {}) {
  container.innerHTML = '';
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'mental-canvas'); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `${explainerDocument.title} visual mental model`);
  const scene = document.createElementNS('http://www.w3.org/2000/svg', 'g'); scene.setAttribute('transform', `translate(${viewport.x} ${viewport.y}) scale(${viewport.zoom})`);
  const nodes = new Map(explainerDocument.elements.filter((e) => e.type === 'node').map((e) => [e.id, e]));
  const edges = explainerDocument.elements.filter((e) => e.type === 'edge');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs'); defs.innerHTML = '<marker id="canvas-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#73b9ff"/></marker>'; svg.append(defs);
  for (const edge of edges) {
    const from = nodes.get(edge.from); const to = nodes.get(edge.to); if (!from || !to) continue;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', edgePath(getBounds(from), getBounds(to))); path.setAttribute('class', 'canvas-edge'); path.setAttribute('marker-end', 'url(#canvas-arrow)'); scene.append(path);
  }
  for (const node of nodes.values()) {
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g'); group.dataset.id = node.id; group.setAttribute('class', `canvas-node role-${node.role}${selectedIds.includes(node.id) ? ' selected' : ''}`); group.setAttribute('tabindex', '0'); group.setAttribute('aria-label', node.title); group.setAttribute('transform', `translate(${node.x} ${node.y})`);
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); rect.setAttribute('width', node.width); rect.setAttribute('height', node.height); rect.setAttribute('rx', '14');
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text'); title.setAttribute('x', '16'); title.setAttribute('y', '34'); title.textContent = node.title;
    const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect'); handle.setAttribute('class', 'resize-handle'); handle.setAttribute('x', node.width - 14); handle.setAttribute('y', node.height - 14); handle.setAttribute('width', '10'); handle.setAttribute('height', '10'); handle.setAttribute('rx', '2');
    group.append(rect, title, handle); scene.append(group);
    let start; let moved = false; let resizeStart;
    group.addEventListener('pointerdown', (event) => { if (event.target === handle) { resizeStart = { x: event.clientX, y: event.clientY }; group.setPointerCapture(event.pointerId); return; } onSelect?.(node.id, event.shiftKey); group.setPointerCapture(event.pointerId); start = { x: event.clientX, y: event.clientY }; });
    group.addEventListener('pointermove', (event) => {
      if (resizeStart) { onResize?.(node.id, (event.clientX - resizeStart.x) / viewport.zoom, (event.clientY - resizeStart.y) / viewport.zoom); resizeStart = { x: event.clientX, y: event.clientY }; return; }
      if (!start) return; moved = true; onMove?.(node.id, (event.clientX - start.x) / viewport.zoom, (event.clientY - start.y) / viewport.zoom); start = { x: event.clientX, y: event.clientY };
    });
    group.addEventListener('pointerup', () => { if (moved) onMoveEnd?.(); start = null; resizeStart = null; moved = false; }); group.addEventListener('dblclick', () => onConnect?.(node.id));
  }
  svg.append(scene); container.append(svg); return svg;
}
