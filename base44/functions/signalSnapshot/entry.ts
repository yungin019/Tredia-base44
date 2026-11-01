import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { logSignals } from '../../shared/signalLog.ts';
import { getQuotes } from '../../shared/marketQuotes.ts';
import { requireAdmin } from '../../shared/adminAuth.ts';

/**
 * signalSnapshot — the scheduled counterpart to the in-app generators.
 *
 * Hourly during US market hours it logs a direction for the core equity
 * structure set; every four hours around the clock it does the same for crypto.
 * Everything goes to SignalLog with source "scheduled", so the track record
 * separates scheduled reads from the ones a user triggered.
 *
 * Rules kept:
 *  - Quotes come from shared/marketQuotes.ts, the app's one quote layer: one
 *    provider call per symbol per 60s window shared with every other caller,
 *    cached and single-flight. Nothing here adds a new provider cost per run
 *    beyond that single hourly quote per symbol.
 *  - A quote that no provider could confirm (stale fallback) is skipped, and so
 *    is one without a prior close — no change means no honest direction.
 *  - Dedupe is unchanged: logSignals writes one row per symbol, source and hour.
 *  - The direction rules are the app's own momentum read (src/api/signalEngine),
 *    so a scheduled row says what the screen says.
 */

const CRYPTO = ['BTC', 'ETH'];

const EQUITIES: { symbol: string; name: string; sector: string }[] = [
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF', sector: 'ETF' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', sector: 'ETF' },
  { symbol: 'XLK', name: 'Technology Select Sector SPDR', sector: 'ETF' },
  { symbol: 'XLF', name: 'Financial Select Sector SPDR', sector: 'ETF' },
  { symbol: 'XLE', name: 'Energy Select Sector SPDR', sector: 'ETF' },
  { symbol: 'VIXY', name: 'ProShares VIX Short-Term Futures', sector: 'ETF' },
  { symbol: 'TLT', name: 'iShares 20+ Year Treasury Bond ETF', sector: 'ETF' },
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Discretionary' },
];

const CRYPTO_META: { symbol: string; name: string }[] = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
];

/** US regular session in UTC: 14:30–21:00 during EST, Mon–Fri. */
function inUsMarketHours(now: Date) {
  const day = now.getUTCDay();
  if (day === 0 || day === 6) return false;
  const minutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  return minutes >= 14 * 60 + 30 && minutes <= 21 * 60;
}

/** Crypto runs on a 4-hour UTC grid: 00, 04, 08, 12, 16, 20. */
function onCryptoSlot(now: Date) {
  return now.getUTCHours() % 4 === 0;
}

/**
 * The app's momentum read, reduced to its graded direction and confidence:
 * a move of 1% or more sets the bias, 3% or more raises confidence, and a
 * crypto move past 8% reads stronger than the same move in an ETF.
 */
function deriveRead(quote: { changePct: number | null; high: number | null; low: number | null }, isCrypto: boolean) {
  const change = Number(quote?.changePct);
  if (!Number.isFinite(change)) return null;

  const direction = change >= 1 ? 'Bullish' : change <= -1 ? 'Bearish' : 'Neutral';
  let confidence = direction === 'Neutral'
    ? 50 + Math.min(9, Math.abs(change) * 8)
    : 60 + Math.min(28, Math.abs(change) * 6);

  if (isCrypto && Math.abs(change) > 8) confidence += 4;
  if (!isCrypto) confidence -= 5; // broad ETFs move less on one session

  return { direction, confidence: Math.max(45, Math.min(95, Math.round(confidence))) };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    // Only the scheduler (or an admin) may write scheduled rows.
    const admin = await requireAdmin(req, base44);
    if (!admin.ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const scope = ['equities', 'crypto', 'all'].includes(body.scope) ? body.scope : null;
    const now = new Date();

    const runEquities = scope === 'equities' || scope === 'all' || (!scope && inUsMarketHours(now));
    const runCrypto = scope === 'crypto' || scope === 'all' || (!scope && onCryptoSlot(now));

    if (!runEquities && !runCrypto) {
      return Response.json({ ok: true, skipped: 'outside both windows', at: now.toISOString() });
    }

    const targets = [
      ...(runEquities ? EQUITIES.map((a) => ({ ...a, crypto: false })) : []),
      ...(runCrypto ? CRYPTO_META.map((a) => ({ ...a, sector: 'Crypto', crypto: true })) : []),
    ];

    const quotes = await getQuotes(targets.map((t) => t.symbol));

    const rows: any[] = [];
    const skipped: string[] = [];
    for (const target of targets) {
      const quote = quotes[target.symbol];
      const price = Number(quote?.price);
      // A stale quote is a provider failure served from memory — not a baseline.
      if (!quote || quote.stale || !(price > 0)) { skipped.push(`${target.symbol}: no live quote`); continue; }
      const read = deriveRead(quote, target.crypto);
      if (!read) { skipped.push(`${target.symbol}: no prior close`); continue; }
      rows.push({
        at: now.toISOString(),
        symbol: target.symbol,
        name: target.name,
        direction: read.direction,
        confidence: read.confidence,
        price,
        source: 'scheduled',
      });
    }

    if (rows.length === 0) {
      console.warn('[signalSnapshot] nothing to log this run:', skipped.join('; '));
      return Response.json({ ok: true, logged: 0, skipped, at: now.toISOString() });
    }

    const result = await logSignals(base44.asServiceRole, rows, 'Scheduled');
    console.log(`[signalSnapshot] ${runEquities ? 'equities' : ''}${runEquities && runCrypto ? '+' : ''}${runCrypto ? 'crypto' : ''}: `
      + `logged ${result.logged}, deduped ${result.skipped}, unavailable ${skipped.length}`);

    return Response.json({
      ok: true,
      scope: `${runEquities ? 'equities ' : ''}${runCrypto ? 'crypto' : ''}`.trim(),
      logged: result.logged,
      deduped: result.skipped,
      skipped,
      symbols: rows.map((r) => `${r.symbol} ${r.direction} ${r.confidence}% @ ${r.price}`),
      at: now.toISOString(),
    });
  } catch (error) {
    console.error('[signalSnapshot] failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});