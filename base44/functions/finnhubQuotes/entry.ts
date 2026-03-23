import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * FINNHUB QUOTES - Primary stock/ETF quote provider
 * 
 * Currently the only working provider for live quotes
 * Supports: US stocks, ETFs, indices (as tickers)
 * Rate limit: ~60 requests/min (pro plan shows working)
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { symbols } = body;

    if (!symbols || symbols.length === 0) {
      return Response.json({ error: 'Missing symbols' }, { status: 400 });
    }

    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');
    if (!FINNHUB_KEY) {
      return Response.json({ error: 'FINNHUB_API_KEY not set' }, { status: 500 });
    }

    const results = {};
    const TIMEOUT = 2500; // 2.5s hard limit

    // Fetch each symbol serially with timeout
    for (const symbol of symbols) {
      try {
        console.log(`[Finnhub] Fetching ${symbol}...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (res.status !== 200) {
          console.error(`[Finnhub] ${symbol} returned ${res.status}`);
          results[symbol] = { status: 'unavailable', error: `HTTP ${res.status}` };
          continue;
        }

        const data = await res.json();

        // Validate response has price data
        if (!data.c || data.c === null || data.c === 0) {
          console.warn(`[Finnhub] ${symbol} has invalid price: ${data.c}`);
          results[symbol] = { status: 'unavailable', error: 'No price data' };
          continue;
        }

        // Transform to standard format
        results[symbol] = {
          status: 'live',
          symbol,
          price: parseFloat(data.c.toFixed(2)),
          change: parseFloat(data.d.toFixed(2)),
          changePercent: parseFloat(data.dp.toFixed(2)),
          high: parseFloat(data.h.toFixed(2)),
          low: parseFloat(data.l.toFixed(2)),
          open: parseFloat(data.o.toFixed(2)),
          prevClose: parseFloat(data.pc.toFixed(2)),
          timestamp: data.t * 1000, // Convert to ms
          provider: 'finnhub',
          rawResponse: data
        };

        console.log(`[Finnhub] ✓ ${symbol}: $${results[symbol].price}`);
      } catch (error) {
        console.error(`[Finnhub] ${symbol} error:`, error.message);
        results[symbol] = { 
          status: 'unavailable', 
          error: error.message 
        };
      }
    }

    return Response.json({
      quotes: results,
      timestamp: Date.now(),
      provider: 'finnhub',
      note: 'All quotes live from Finnhub or unavailable (no cache/fallback)'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});