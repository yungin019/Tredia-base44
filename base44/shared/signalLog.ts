/**
 * signalLog — the honest, append-only record of every signal the app emits, and
 * the checkpoints that grade it afterwards.
 *
 * Rules this module keeps:
 *  - A logged signal is never edited and never deleted. Grading writes a NEW
 *    SignalOutcome row per checkpoint instead of touching the signal itself, so
 *    "what the engine said, at what price" stays exactly as it was recorded.
 *  - A row is only logged when the generator actually knew a price. No price
 *    means no honest baseline, so the signal is skipped rather than stored with
 *    an invented number.
 *  - One row per symbol, per generator, per hour (fingerprint) — the same feed
 *    re-rendering every 60 seconds does not fill the table with copies.
 *  - Grading is mechanical: Bullish is right when price rose, Bearish when it
 *    fell, Neutral when it stayed inside ±1%.
 */

import { getQuotes } from './marketQuotes.ts';

export type Direction = 'Bullish' | 'Bearish' | 'Neutral';

export const HORIZONS = [
  { key: '1d', label: '1 day', ms: 24 * 60 * 60 * 1000 },
  { key: '1w', label: '1 week', ms: 7 * 24 * 60 * 60 * 1000 },
  { key: '1m', label: '1 month', ms: 30 * 24 * 60 * 60 * 1000 },
] as const;

export const NEUTRAL_BAND_PCT = 1;

export function normalizeDirection(raw: unknown): Direction {
  const value = String(raw || '').trim().toLowerCase();
  if (['buy', 'bullish', 'up', 'long', 'positive'].includes(value)) return 'Bullish';
  if (['sell', 'bearish', 'down', 'short', 'negative', 'avoid'].includes(value)) return 'Bearish';
  return 'Neutral';
}

export function confidenceBand(confidence: unknown): '75+' | '50-74' | 'under 50' {
  const value = Number(confidence);
  if (!Number.isFinite(value)) return 'under 50';
  if (value >= 75) return '75+';
  if (value >= 50) return '50-74';
  return 'under 50';
}

/** YYYY-MM-DDTHH — the hour part of the fingerprint. */
function hourBucket(iso: string): string {
  return String(iso).slice(0, 13);
}

export type SignalRow = {
  at?: string;
  symbol?: string;
  name?: string;
  direction?: string;
  confidence?: number;
  price?: number | null;
  source?: string;
};

function normalizeRow(row: SignalRow, surface: string) {
  const symbol = String(row?.symbol || '').trim().toUpperCase();
  const price = Number(row?.price);
  if (!symbol || !Number.isFinite(price) || price <= 0) return null;

  const direction = normalizeDirection(row.direction);
  const confidence = Number.isFinite(Number(row.confidence)) ? Math.round(Number(row.confidence)) : 0;
  const at = row.at && !Number.isNaN(new Date(row.at).getTime()) ? new Date(row.at).toISOString() : new Date().toISOString();
  const source = String(row.source || 'unknown').slice(0, 60);

  return {
    at,
    symbol,
    name: String(row.name || '').slice(0, 80),
    direction,
    confidence,
    conf_band: confidenceBand(confidence),
    price: Math.round(price * 100000) / 100000,
    source,
    surface: String(surface || '').slice(0, 20),
    fingerprint: `${symbol}|${source}|${hourBucket(at)}`,
  };
}

/**
 * Store the signals a generator just produced. `db` is a service-role client:
 * the entities are admin-only, and generators run without a user session.
 */
export async function logSignals(db: any, rows: SignalRow[], surface: string) {
  const batch = new Map<string, any>();
  for (const row of rows || []) {
    const normalized = normalizeRow(row, surface);
    if (!normalized) continue;
    if (!batch.has(normalized.fingerprint)) batch.set(normalized.fingerprint, normalized);
  }
  if (batch.size === 0) return { logged: 0, skipped: 0 };

  const fingerprints = [...batch.keys()];
  let existing: any[] = [];
  try {
    const page = await db.entities.SignalLog.filter(
      { fingerprint: { $in: fingerprints } },
      { limit: Math.min(500, fingerprints.length * 2) },
    );
    existing = page?.items || [];
  } catch (error) {
    console.warn('[signalLog] dedupe lookup failed:', error.message);
  }

  const seen = new Set(existing.map((row) => row.fingerprint));
  const fresh = [...batch.values()].filter((row) => !seen.has(row.fingerprint));
  if (fresh.length === 0) return { logged: 0, skipped: batch.size };

  await db.entities.SignalLog.bulkCreate(fresh);
  return { logged: fresh.length, skipped: batch.size - fresh.length };
}

function gradeDirection(direction: Direction, changePct: number): boolean {
  if (direction === 'Bullish') return changePct > 0;
  if (direction === 'Bearish') return changePct < 0;
  return Math.abs(changePct) <= NEUTRAL_BAND_PCT;
}

/**
 * Grade every signal that has reached a checkpoint it has not been graded at
 * yet. Reads only; the writes it makes are new SignalOutcome rows.
 */
export async function evaluateSignals(db: any) {
  const now = Date.now();
  const oldestHorizon = HORIZONS[0].ms;

  // Signals are only gradeable once the first checkpoint has passed. The clock
  // starts at the signal's own timestamp, not when the row reached the table.
  const cutoff = new Date(now - oldestHorizon).toISOString();
  const page = await db.entities.SignalLog.filter(
    { at: { $lte: cutoff } },
    { sort: '-at', limit: 400 },
  );
  const logs = page?.items || [];
  if (logs.length === 0) return { graded: 0, symbols: 0, considered: 0 };

  const existing = await db.entities.SignalOutcome.filter(
    { log_id: { $in: logs.map((row) => row.id) } },
    { limit: 1000 },
  );
  const done = new Set((existing?.items || []).map((row) => `${row.log_id}|${row.horizon}`));

  const pending: { log: any; horizon: typeof HORIZONS[number] }[] = [];
  for (const log of logs) {
    const signalAt = log.at ? new Date(log.at).getTime() : new Date(log.created_date).getTime();
    if (!Number.isFinite(signalAt)) continue;
    for (const horizon of HORIZONS) {
      if (now - signalAt < horizon.ms) continue;
      if (done.has(`${log.id}|${horizon.key}`)) continue;
      pending.push({ log, horizon });
      break; // oldest missing checkpoint first; the rest follow on later runs
    }
  }
  if (pending.length === 0) return { graded: 0, symbols: 0, considered: logs.length };

  const symbols = [...new Set(pending.map(({ log }) => String(log.symbol || '').toUpperCase()).filter(Boolean))];
  const quotes = await getQuotes(symbols);

  const outcomes: any[] = [];
  for (const { log, horizon } of pending) {
    const symbol = String(log.symbol || '').toUpperCase();
    const quote = quotes[symbol];
    const priceNow = Number(quote?.price);
    const priceThen = Number(log.price);
    if (!Number.isFinite(priceNow) || priceNow <= 0 || !Number.isFinite(priceThen) || priceThen <= 0) continue;

    const changePct = Math.round(((priceNow - priceThen) / priceThen) * 10000) / 100;
    const correct = gradeDirection(normalizeDirection(log.direction), changePct);
    outcomes.push({
      log_id: log.id,
      signal_at: log.at || log.created_date,
      checked_at: new Date(now).toISOString(),
      symbol,
      direction: normalizeDirection(log.direction),
      confidence: Number(log.confidence) || 0,
      conf_band: log.conf_band || confidenceBand(log.confidence),
      source: log.source || 'unknown',
      surface: log.surface || '',
      horizon: horizon.key,
      price_then: priceThen,
      price_now: priceNow,
      change_pct: changePct,
      correct,
      hit: correct ? 1 : 0,
    });
  }

  if (outcomes.length > 0) await db.entities.SignalOutcome.bulkCreate(outcomes);
  return { graded: outcomes.length, symbols: symbols.length, considered: logs.length };
}

/** Grouped accuracy, computed on the server from the outcome rows. */
async function rollup(db: any, groupBy: string) {
  const result = await db.entities.SignalOutcome.aggregate({
    query: {},
    groupBy,
    avg: ['hit'],
  });
  return (result?.rows || [])
    .map((row: any) => ({
      key: String(row[groupBy] || 'unknown'),
      checks: Number(row.count) || 0,
      accuracy: Math.round((Number(row.avg_hit) || 0) * 1000) / 10,
    }))
    .sort((a: any, b: any) => b.checks - a.checks);
}

export async function signalTrackRecord(db: any) {
  const [totalSignals, gradedChecks, bySymbol, bySource, byBand, byHorizon, byDirection, recent] =
    await Promise.all([
      db.entities.SignalLog.count({}),
      db.entities.SignalOutcome.count({}),
      rollup(db, 'symbol'),
      rollup(db, 'source'),
      rollup(db, 'conf_band'),
      rollup(db, 'horizon'),
      rollup(db, 'direction'),
      db.entities.SignalOutcome.filter({}, { sort: '-checked_at', limit: 12 }),
    ]);

  const overallChecks = gradedChecks;
  const overallHits = bySymbol.reduce((sum: number, row: any) => sum + (row.accuracy / 100) * row.checks, 0);

  return {
    totalSignals,
    gradedChecks,
    pendingSignals: Math.max(0, totalSignals - gradedChecks),
    overallAccuracy: overallChecks ? Math.round((overallHits / overallChecks) * 1000) / 10 : null,
    bySymbol,
    bySource,
    byBand,
    byHorizon,
    byDirection,
    recent: (recent?.items || []).map((row: any) => ({
      symbol: row.symbol,
      direction: row.direction,
      confidence: row.confidence,
      source: row.source,
      horizon: row.horizon,
      changePct: row.change_pct,
      correct: row.correct,
      checkedAt: row.checked_at,
    })),
    generatedAt: new Date().toISOString(),
  };
}