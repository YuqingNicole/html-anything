import { structuredCloneDocument } from '../document/index.js';

const makeId = () => globalThis.crypto?.randomUUID?.() || `edge-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function applyCommand(document, command) {
  const next = structuredCloneDocument(document);
  switch (command.type) {
    case 'insert':
      next.elements.push(...command.elements);
      return next;
    case 'move':
      return updateElements(next, command.ids, (element) => ({ ...element, x: element.x + command.dx, y: element.y + command.dy }));
    case 'updateText':
      return updateElements(next, [command.id], (element) => ({ ...element, ...command.patch }));
    case 'resize':
      return updateElements(next, [command.id], (element) => ({ ...element, width: Math.max(90, element.width + command.dw), height: Math.max(50, element.height + command.dh) }));
    case 'connect':
      next.elements.push({ id: command.id || makeId(), type: 'edge', from: command.from, to: command.to, relation: command.relation, label: command.label });
      return next;
    case 'delete': {
      const ids = new Set(command.ids);
      next.elements = next.elements.filter((element) => !ids.has(element.id) && !(element.type === 'edge' && (ids.has(element.from) || ids.has(element.to))));
      return next;
    }
    default:
      throw new Error(`Unknown command: ${command.type}`);
  }
}

export function invertCommand(document, command) {
  switch (command.type) {
    case 'insert': return { type: 'delete', ids: command.elements.map((element) => element.id) };
    case 'move': return { ...command, dx: -command.dx, dy: -command.dy };
    case 'connect': return { type: 'delete', ids: [command.id] };
    case 'delete': return { type: 'insert', elements: document.elements.filter((element) => command.ids.includes(element.id)) };
    case 'resize': return { type: 'resize', id: command.id, dw: -command.dw, dh: -command.dh };
    case 'updateText': {
      const element = document.elements.find((item) => item.id === command.id);
      const patch = Object.fromEntries(Object.keys(command.patch).map((key) => [key, element?.[key]]));
      return { type: 'updateText', id: command.id, patch };
    }
    default: throw new Error(`Cannot invert command: ${command.type}`);
  }
}

export function createHistory(document) {
  return { document, undoStack: [], redoStack: [] };
}

export function dispatch(history, command) {
  return { document: applyCommand(history.document, command), undoStack: [...history.undoStack, invertCommand(history.document, command)], redoStack: [] };
}

export function undo(history) {
  if (!history.undoStack.length) return history;
  const command = history.undoStack.at(-1);
  return { document: applyCommand(history.document, command), undoStack: history.undoStack.slice(0, -1), redoStack: [...history.redoStack, invertCommand(history.document, command)] };
}

export function redo(history) {
  if (!history.redoStack.length) return history;
  const command = history.redoStack.at(-1);
  return { document: applyCommand(history.document, command), undoStack: [...history.undoStack, invertCommand(history.document, command)], redoStack: history.redoStack.slice(0, -1) };
}

function updateElements(document, ids, update) {
  const selected = new Set(ids);
  document.elements = document.elements.map((element) => selected.has(element.id) ? update(element) : element);
  return document;
}
