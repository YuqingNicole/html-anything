export const ELEMENT_TYPES = Object.freeze({ node: 'node', edge: 'edge', group: 'group', note: 'note', frame: 'frame', sourceCard: 'source-card' });

export function isNode(element) { return element?.type === ELEMENT_TYPES.node; }
export function isEdge(element) { return element?.type === ELEMENT_TYPES.edge; }
export function isContainer(element) { return ['group', 'frame'].includes(element?.type); }
export function getElementBounds(element) { return { x: element.x || 0, y: element.y || 0, width: element.width || 150, height: element.height || 80 }; }
export function getElementTitle(element) { return element?.title || element?.text || element?.label || ''; }
export function collectNodeIds(elements) { return elements.filter(isNode).map((element) => element.id); }
export function repairBindings(elements) {
  const ids = new Set(elements.map((element) => element.id));
  return elements.filter((element) => !isEdge(element) || (ids.has(element.from) && ids.has(element.to)));
}
