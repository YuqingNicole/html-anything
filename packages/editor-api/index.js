import { createHistory, dispatch, redo, undo } from '../actions/index.js';
import { parseDocument } from '../document/index.js';

export function createEditorApi({ document, onChange } = {}) {
  let history = createHistory(document);
  const notify = () => onChange?.(history.document, history);
  return {
    getDocument: () => history.document,
    getHistory: () => history,
    execute(command) { history = dispatch(history, command); notify(); return history.document; },
    undo() { history = undo(history); notify(); return history.document; },
    redo() { history = redo(history); notify(); return history.document; },
    import(raw) { history = createHistory(parseDocument(raw)); notify(); return history.document; },
    subscribe(callback) { onChange = callback; return () => { onChange = null; }; },
  };
}
