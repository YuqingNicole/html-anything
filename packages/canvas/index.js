export function worldToScreen(point, viewport) {
  return { x: (point.x + viewport.x) * viewport.zoom, y: (point.y + viewport.y) * viewport.zoom };
}

export function screenToWorld(point, viewport) {
  return { x: point.x / viewport.zoom - viewport.x, y: point.y / viewport.zoom - viewport.y };
}

export function getBounds(element) {
  return { x: element.x || 0, y: element.y || 0, width: element.width || 150, height: element.height || 80 };
}

export function edgePath(from, to) {
  const x1 = from.x + from.width; const y1 = from.y + from.height / 2;
  const x2 = to.x; const y2 = to.y + to.height / 2;
  const curve = Math.max(40, Math.abs(x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + curve} ${y1}, ${x2 - curve} ${y2}, ${x2} ${y2}`;
}
