import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { symbols = ['AAPL', 'NVDA', 'SPY'] } = body;

    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');
    if (!FINNHUB_KEY) return Response.json({ error: 'FINNHUB_API_KEY not set' }, { status: 500 });

    const results = {};

    for (const sym of symbols) {
      try {
        console.log(`\n[DEBUG] Fetching ${sym} from Finnhub...`);
        
        // Fetch raw from Finnhub
        const url = `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`;
        const fetchTime = Date.now();
        const res = await fetch(url);
        const rawResponse = await res.json();
        const fetchedAt = new Date(fetchTime).toISOString();

        console.log(`[DEBUG] ${sym} raw response:`, JSON.stringify(rawResponse));

        // Check if we got a real price
        const price = rawResponse?.c;
        const prevClose = rawResponse?.pc;
        const timestamp = rawResponse?.t; // Unix timestamp from Finnhub

        if (!price || price <= 0) {
          results[sym] = {
            symbol: sym,
            provider: null,
            raw: rawResponse,
            transformed: null,
            usedFallback: false,
            usedMock: false,
            usedSynthetic: false,
            available: false,
            reason: 'No valid price in provider response'
          };
          continue;
        }

        // Transform for frontend
        const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : null;
        const transformed = {
          symbol: sym,
          price: parseFloat(price.toFixed(2)),
          changePct: changePct ? parseFloat(changePct.toFixed(2)) : null,
          timestamp: timestamp ? new Date(timestamp * 1000).toISOString() : fetchedAt,
          status: 'live'
        };

        console.log(`[DEBUG] ${sym} transformed:`, JSON.stringify(transformed));

        results[sym] = {
          symbol: sym,
          provider: 'finnhub',
          raw: rawResponse,
          transformed,
          usedFallback: false,
          usedMock: false,
          usedSynthetic: false,
          available: true,
          fetchedAt,
          quoteTimestamp: timestamp ? new Date(timestamp * 1000).toISOString() : null
        };

      } catch (e) {
        console.error(`[DEBUG] ${sym} failed:`, e.message);
        results[sym] = {
          symbol: sym,
          provider: null,
          raw: null,
          transformed: null,
          usedFallback: false,
          usedMock: false,
          usedSynthetic: false,
          available: false,
          error: e.message
        };
      }
    }

    return Response.json({ debug: results, symbols, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[DEBUG] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});