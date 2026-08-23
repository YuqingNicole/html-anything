import { renderReader } from '../renderer/index.js';

export function exportJson(document) { return JSON.stringify(document, null, 2); }

export function exportStandaloneHtml(document) {
  const reader = renderReader(document);
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(document.title)}</title><style>body{margin:0;background:#10151d;color:#f4f0e8;font-family:system-ui,-apple-system,sans-serif}.wrap{max-width:900px;margin:auto;padding:64px 24px}.reader{border:1px solid #334457;border-radius:24px;padding:32px;background:#172331}.template{color:#f6bf58;font:12px monospace;text-transform:uppercase;letter-spacing:.12em}.reader h1{font-size:clamp(34px,7vw,72px);line-height:1;letter-spacing:-.06em}.thesis{font-size:20px;color:#aeb8c5}.flow{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:32px 0}.node{padding:14px 16px;border:1px solid #58718c;border-radius:14px}.arrow{color:#73b9ff;font-size:24px}.relations{border-left:2px solid #f6bf58;padding-left:18px;color:#aeb8c5}</style></head><body><main class="wrap"><article class="reader"><div class="template">${escapeHtml(document.template)}</div><h1>${escapeHtml(document.title)}</h1><p class="thesis">${escapeHtml(document.thesis)}</p>${reader.replace(/^<article[^>]*>|<\/article>$/g, '')}</article></main></body></html>`;
}
function escapeHtml(value = '') { return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]); }
