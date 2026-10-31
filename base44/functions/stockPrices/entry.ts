/**
 * stockPrices — every quote, chart series and symbol search in the app.
 *
 * All provider access goes through ../../shared/marketQuotes.ts, so:
 *  - stocks are priced by Finnhub (TwelveData as fallback), crypto by
 *    TwelveData (Finnhub as fallback)
 *  - a symbol is never sent to a provider more than once per cache window
 *    (60s quotes, 60s intraday bars, 1h daily bars) and concurrent requests
 *    share one in-flight provider call
 *  - a last known real quote is returned before "unavailable"
 *
 * No fabricated prices: a symbol with no provider data and no cache is null.
 */
import { getQuote, getQuotes, getSeries } from '../../shared/marketQuotes.ts';

const SEARCH_TIMEOUT_MS = 6000;

async function finnhubSearch(query: string, assetType: string | undefined, key: string) {
  if (!key) return [];
  const res = await fetch(
    `https://finnhub.io/api/v1/search?q=${encodeURIComponent(query)}&token=${key}`,
    { signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS) },
  );
  if (!res.ok) throw new Error(`finnhub search HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data?.result)) return [];
  return data.result
    .filter((r: any) => {
      const type = String(r.type || '');
      if (assetType === 'etf') return type.includes('ETF');
      if (assetType === 'stock') return !type.includes('ETF');
      return true;
    })
    .slice(0, 20)
    .map((r: any) => ({ symbol: r.symbol, name: r.description, type: r.type || 'Stock' }));
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { symbol, symbols, mode } = body;

    // ── SEARCH ──────────────────────────────────────────────────────────
    if (mode === 'search') {
      const query = String(body.query || '').trim().toUpperCase();
      if (!query) return Response.json({ results: [] });
      try {
        const results = await finnhubSearch(query, body.assetType, Deno.env.get('FINNHUB_API_KEY') || '');
        return Response.json({ results });
      } catch (error) {
        console.warn('[stockPrices] search failed:', error.message);
        return Response.json({ results: [] });
      }
    }

    // ── CHART SERIES ────────────────────────────────────────────────────
    if (mode === 'ohlc' || mode === 'history') {
      const result = await getSeries(symbol, String(body.timeframe || '1D'));
      return Response.json(result);
    }

    // ── BATCH QUOTES ────────────────────────────────────────────────────
    if (Array.isArray(symbols)) {
      const quotes = await getQuotes(symbols);
      const prices: Record<string, any> = {};
      Object.entries(quotes).forEach(([sym, quote]) => {
        if (!quote) { prices[sym] = null; return; }
        prices[sym] = {
          price: quote.price,
          prevClose: quote.prevClose,
          change: quote.change,
          changePct: quote.changePct,
          high: quote.high,
          low: quote.low,
          open: quote.open,
          timestamp: quote.fetchedAt,
          fetchedAt: quote.fetchedAt,
          source: quote.source,
          ...(quote.stale ? { stale: true } : {}),
        };
      });
      return Response.json({ prices });
    }

    // ── SINGLE QUOTE ────────────────────────────────────────────────────
    if (symbol) {
      const quote = await getQuote(symbol);
      return Response.json({ quote });
    }

    return Response.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('[stockPrices] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});