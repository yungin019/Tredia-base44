import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * LIVE QUOTES - Unified quote fetch (no cache, no fallback)
 * 
 * PRIMARY PROVIDERS:
 * - Finnhub: Stocks, ETFs, indices (via ETF proxy)
 * - CoinGecko: Crypto
 * 
 * RESPONSE CONTRACT:
 * - status: "live" | "unavailable"
 * - price, change, changePercent, timestamp when live
 * - error reason when unavailable
 * 
 * NO CACHED DATA. NO FALLBACK. HONEST AVAILABILITY.
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

    // Separate stocks/ETFs from crypto
    const CRYPTO_SYMBOLS = new Set(['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'AVAX', 'LINK', 'UNI', 'DOT', 'ATOM']);
    const stockSymbols = symbols.filter(s => !CRYPTO_SYMBOLS.has(s));
    const cryptoSymbols = symbols.filter(s => CRYPTO_SYMBOLS.has(s));

    const results = {};
    const TIMEOUT = 2500; // 2.5s hard limit per symbol

    // ── FETCH STOCKS/ETFS via FINNHUB ──────────────────────────────────
    if (stockSymbols.length > 0) {
      for (const symbol of stockSymbols) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`,
            { signal: controller.signal }
          );

          clearTimeout(timeoutId);

          if (res.status !== 200) {
            results[symbol] = { status: 'unavailable', error: `Finnhub HTTP ${res.status}` };
            continue;
          }

          const data = await res.json();

          // Validate price exists
          if (!data.c || data.c === null || data.c === 0) {
            results[symbol] = { status: 'unavailable', error: 'No price data from provider' };
            continue;
          }

          results[symbol] = {
            status: 'live',
            symbol,
            price: parseFloat(data.c.toFixed(2)),
            change: parseFloat(data.d.toFixed(2)),
            changePercent: parseFloat(data.dp.toFixed(2)),
            high: parseFloat(data.h.toFixed(2)),
            low: parseFloat(data.l.toFixed(2)),
            prevClose: parseFloat(data.pc.toFixed(2)),
            timestamp: data.t * 1000,
            provider: 'finnhub'
          };

          console.log(`[liveQuotes] ✓ ${symbol}: $${results[symbol].price}`);
        } catch (error) {
          results[symbol] = { 
            status: 'unavailable', 
            error: error.message || 'Timeout or network error' 
          };
          console.error(`[liveQuotes] ${symbol}:`, error.message);
        }
      }
    }

    // ── FETCH CRYPTO via COINGECKO ─────────────────────────────────────
    if (cryptoSymbols.length > 0) {
      const COIN_MAP = {
        'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
        'ADA': 'cardano', 'DOGE': 'dogecoin', 'MATIC': 'matic-network',
        'AVAX': 'avalanche-2', 'LINK': 'chainlink', 'UNI': 'uniswap',
        'DOT': 'polkadot', 'ATOM': 'cosmos'
      };

      try {
        const ids = cryptoSymbols.map(s => COIN_MAP[s]).join(',');
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (res.status === 429) {
          cryptoSymbols.forEach(s => {
            results[s] = { status: 'unavailable', error: 'CoinGecko rate limited' };
          });
          console.warn('[liveQuotes] CoinGecko rate limited (429)');
        } else if (res.status !== 200) {
          cryptoSymbols.forEach(s => {
            results[s] = { status: 'unavailable', error: `CoinGecko HTTP ${res.status}` };
          });
        } else {
          const data = await res.json();

          cryptoSymbols.forEach(symbol => {
            const coinId = COIN_MAP[symbol];
            const coinData = data[coinId];

            if (!coinData || !coinData.usd) {
              results[symbol] = { status: 'unavailable', error: 'No price data from provider' };
              return;
            }

            const price = coinData.usd;
            const change24h = coinData.usd_24h_change || 0;
            const prevPrice = price / (1 + change24h / 100);

            results[symbol] = {
              status: 'live',
              symbol,
              price: parseFloat(price.toFixed(2)),
              change: parseFloat((price - prevPrice).toFixed(2)),
              changePercent: parseFloat(change24h.toFixed(2)),
              prevClose: parseFloat(prevPrice.toFixed(2)),
              timestamp: Date.now(),
              provider: 'coingecko'
            };

            console.log(`[liveQuotes] ✓ ${symbol}: $${results[symbol].price}`);
          });
        }
      } catch (error) {
        cryptoSymbols.forEach(s => {
          results[s] = { 
            status: 'unavailable', 
            error: error.message || 'CoinGecko timeout or network error' 
          };
        });
        console.error('[liveQuotes] CoinGecko error:', error.message);
      }
    }

    return Response.json({
      quotes: results,
      timestamp: Date.now(),
      note: 'All quotes live or unavailable (no cache, no fallback)'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});