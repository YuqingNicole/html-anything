const KEY = 'html-anything:document:v1';

export const localPersistence = {
  load() {
    try { return localStorage.getItem(KEY); } catch { return null; }
  },
  save(document) {
    try { localStorage.setItem(KEY, JSON.stringify(document)); } catch { /* storage is optional */ }
  },
  clear() {
    try { localStorage.removeItem(KEY); } catch { /* storage is optional */ }
  },
};
