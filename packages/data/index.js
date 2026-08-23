import { DOCUMENT_VERSION, restoreDocument, validateDocument } from '../document/index.js';
import { repairBindings } from '../elements/index.js';

export function migrateDocument(input) {
  const document = structuredClone(input || {});
  document.version ||= 1;
  if (document.version > DOCUMENT_VERSION) throw new Error(`Unsupported document version: ${document.version}`);
  return document;
}

export function restoreAndRepair(input) {
  const restored = restoreDocument(migrateDocument(input));
  restored.elements = repairBindings(restored.elements);
  const result = validateDocument(restored);
  if (!result.valid) throw new Error(result.errors.join('; '));
  return restored;
}
