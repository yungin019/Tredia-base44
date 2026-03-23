import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * PROVIDER AUDIT - Test each stock/ETF provider with real responses
 * Returns: raw response, status, error reason
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const symbols = ['SPOT', 'AMD', 'GLD'];
    const results = {
      timestamp: new Date().toISOString(),
      symbols,
      tests: {}
    };

    const ALPACA_KEY = Deno.env.get('ALPACA_API_KEY');
    const POLYGON_KEY = Deno.env.get('POLYGON_API_KEY');
    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');
    const AV_KEY = Deno.env.get('ALPHAVANTAGE_API_KEY');

    // ── ALPACA TEST ────────────────────────────────────────────────────
    console.log('[Audit] Testing Alpaca...');
    results.tests.alpaca = {};
    
    if (ALPACA_KEY) {
      try {
        // Test IEX data feed (best for Alpaca)
        const res = await fetch(
          'https://data.alpaca.markets/v1beta3/latest/quotes?symbols=SPOT,AMD,GLD',
          {
            headers: {
              'APCA-API-KEY-ID': ALPACA_KEY,
              'Accept': 'application/json'
            },
            signal: AbortSignal.timeout(3000)
          }
        );
        
        const data = await res.json();
        results.tests.alpaca = {
          status: res.status,
          endpoint: '/v1beta3/latest/quotes',
          request: { symbols: 'SPOT,AMD,GLD' },
          response: data,
          error: res.status !== 200 ? res.statusText : null
        };
        console.log('[Alpaca] Status:', res.status);
      } catch (e) {
        results.tests.alpaca.error = e.message;
        console.error('[Alpaca] Error:', e.message);
      }
    }

    // ── POLYGON TEST ────────────────────────────────────────────────────
    console.log('[Audit] Testing Polygon...');
    results.tests.polygon = {};
    
    if (POLYGON_KEY) {
      try {
        const res = await fetch(
          `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers?apiKey=${POLYGON_KEY}`,
          { signal: AbortSignal.timeout(3000) }
        );
        
        const data = await res.json();
        results.tests.polygon = {
          status: res.status,
          endpoint: '/v2/snapshot/locale/us/markets/stocks/tickers',
          response: typeof data === 'object' ? {
            status: data.status,
            count: data.results?.length || 0,
            error: data.error
          } : data,
          error: res.status !== 200 ? res.statusText : null
        };
        console.log('[Polygon] Status:', res.status);
      } catch (e) {
        results.tests.polygon.error = e.message;
        console.error('[Polygon] Error:', e.message);
      }
    }

    // ── FINNHUB TEST ────────────────────────────────────────────────────
    console.log('[Audit] Testing Finnhub...');
    results.tests.finnhub = {};
    
    if (FINNHUB_KEY) {
      try {
        const res = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=SPOT&token=${FINNHUB_KEY}`,
          { signal: AbortSignal.timeout(3000) }
        );
        
        const data = await res.json();
        results.tests.finnhub = {
          status: res.status,
          endpoint: '/api/v1/quote',
          request: { symbol: 'SPOT' },
          response: data,
          error: data?.error || (res.status !== 200 ? res.statusText : null)
        };
        console.log('[Finnhub] Status:', res.status);
      } catch (e) {
        results.tests.finnhub.error = e.message;
        console.error('[Finnhub] Error:', e.message);
      }
    }

    // ── ALPHAVANTAGE TEST ────────────────────────────────────────────────
    console.log('[Audit] Testing AlphaVantage...');
    results.tests.alphavantage = {};
    
    if (AV_KEY) {
      try {
        const res = await fetch(
          `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=SPOT&apikey=${AV_KEY}`,
          { signal: AbortSignal.timeout(3000) }
        );
        
        const data = await res.json();
        results.tests.alphavantage = {
          status: res.status,
          endpoint: '/query (GLOBAL_QUOTE)',
          request: { symbol: 'SPOT' },
          response: data,
          error: data?.Information ? 'Rate limited or daily quota exceeded' : null
        };
        console.log('[AlphaVantage] Status:', res.status);
      } catch (e) {
        results.tests.alphavantage.error = e.message;
        console.error('[AlphaVantage] Error:', e.message);
      }
    }

    // ── COINGECKO TEST (crypto baseline) ────────────────────────────────
    console.log('[Audit] Testing CoinGecko...');
    results.tests.coingecko = {};
    
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
        { signal: AbortSignal.timeout(3000) }
      );
      
      const data = await res.json();
      results.tests.coingecko = {
        status: res.status,
        endpoint: '/simple/price',
        response: data,
        error: res.status !== 200 ? res.statusText : null
      };
      console.log('[CoinGecko] Status:', res.status);
    } catch (e) {
      results.tests.coingecko.error = e.message;
      console.error('[CoinGecko] Error:', e.message);
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});