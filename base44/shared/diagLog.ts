/**
 * Diagnostics logging shared by every instrumented function.
 *
 * Two rules keep this cheap and safe:
 *  - successes are throttled per source (2 min), so a busy provider writes a
 *    handful of rows a day instead of one per quote; failures are always kept.
 *  - nothing sensitive is stored: text is sanitized (tokens, keys, emails) and
 *    truncated before it ever reaches the database.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { waitUntil } from 'base44:runtime';

let ctxReq = null;

/** Called once per request by an instrumented function. */
export function setDiagContext(req) {
  ctxReq = req;
}

/** Public price per 1M tokens, USD. Used for the "estimated AI cost" figures. */
const MODEL_PRICES = {
  gemini_3_8_flash: { in: 0.3, out: 1.2 },
  gpt_6_luna: { in: 0.25, out: 1.0 },
  'claude-sonnet-4-20250514': { in: 3, out: 15 },
  'gpt-4o': { in: 2.5, out: 10 },
  'gpt-4o-mini': { in: 0.15, out: 0.6 },
};

export function estimateCost(model, charsIn, charsOut) {
  const price = MODEL_PRICES[model] || MODEL_PRICES.gemini_3_8_flash;
  const tokensIn = Math.ceil((charsIn || 0) / 4);
  const tokensOut = Math.ceil((charsOut || 0) / 4);
  return ((tokensIn / 1e6) * price.in) + ((tokensOut / 1e6) * price.out);
}

const REDACTIONS = [
  [/\b[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '[jwt]'],
  [/\b(sk|pk|rk)_[A-Za-z0-9_-]{8,}/g, '[key]'],
  [/\bAIza[A-Za-z0-9_-]{10,}/g, '[key]'],
  [/(bearer\s+)[A-Za-z0-9._-]+/gi, '$1[token]'],
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]'],
  [/(password|passwd|secret|token|apikey|api_key)(["']?\s*[:=]\s*["']?)[^\s"',}]+/gi, '$1$2[redacted]'],
];

export function sanitize(value, max = 600) {
  let text = typeof value === 'string' ? value : (value == null ? '' : String(value));
  for (const [pattern, replacement] of REDACTIONS) text = text.replace(pattern, replacement);
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** Stable id for "same error at the same place". */
export function fingerprint(message, location) {
  const base = `${String(message || '').slice(0, 160)}|${String(location || '')}`;
  let hash = 5381;
  for (let i = 0; i < base.length; i += 1) hash = ((hash * 33) ^ base.charCodeAt(i)) >>> 0;
  return hash.toString(36);
}

const lastOkAt = new Map();

/**
 * Records a metric event. Successes are throttled to one row per source per
 * 2 minutes; failures are always recorded. Never throws — diagnostics must
 * never break the feature it is measuring.
 */
export function logDiag(event) {
  if (!ctxReq) return;
  const source = String(event.source || 'unknown').slice(0, 80);
  const ok = event.ok !== false;

  if (ok) {
    const key = `${event.type}:${source}`;
    const previous = lastOkAt.get(key) || 0;
    if (Date.now() - previous < 120_000) return;
    lastOkAt.set(key, Date.now());
  }

  const req = ctxReq;
  const record = {
    type: event.type,
    source,
    ok,
    duration_ms: Number.isFinite(event.durationMs) ? Math.round(event.durationMs) : null,
    detail: event.detail ? sanitize(event.detail, 300) : null,
    cost_usd: Number.isFinite(event.costUsd) ? Number(event.costUsd.toFixed(6)) : null,
    at: new Date().toISOString(),
  };

  waitUntil((async () => {
    try {
      const client = createClientFromRequest(req);
      await client.asServiceRole.entities.DiagEvent.create(record);
    } catch (error) {
      console.warn('[diag] could not store event:', error.message);
    }
  })());
}