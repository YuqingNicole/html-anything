export function createAppState(overrides = {}) {
  return { mode: 'reader', viewport: { x: 40, y: 40, zoom: 1 }, selectedIds: [], activeTool: 'select', theme: 'dark-artifact', ...overrides };
}

export function updateAppState(state, patch) { return { ...state, ...patch, viewport: patch.viewport ? { ...state.viewport, ...patch.viewport } : state.viewport }; }
export function selectIds(state, ids, additive = false) { return updateAppState(state, { selectedIds: additive ? [...new Set([...state.selectedIds, ...ids])] : ids }); }
export function clearSelection(state) { return updateAppState(state, { selectedIds: [] }); }
