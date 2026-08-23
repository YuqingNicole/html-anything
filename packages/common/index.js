export const APP_NAME = 'html-anything';
export const FEATURE_FLAGS = Object.freeze({ collaboration: false, sharing: false, analytics: false, debug: false });
export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const createId = (prefix = 'id') => globalThis.crypto?.randomUUID?.() || `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const isFinitePoint = (point) => Number.isFinite(point?.x) && Number.isFinite(point?.y);
export const deepFreeze = (value) => { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; Object.freeze(value); Object.values(value).forEach(deepFreeze); return value; };
