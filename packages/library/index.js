import { createDocument } from '../document/index.js';
import { templates } from '../templates/index.js';

export const library = Object.freeze(Object.entries(templates).map(([id, template]) => ({ id, kind: 'template', title: template.label, description: template.description })));
export function createFromLibrary(id, input) { const template = templates[id] || templates.pipeline; return createDocument(template.build(input)); }
export function exportLibraryItem(item) { return JSON.stringify({ type: 'html-anything-library-item', version: 1, ...item }, null, 2); }
