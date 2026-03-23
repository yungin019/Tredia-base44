import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// In-memory cache (resets on deploy, but persists across function calls)
const priceCache = new Map();

// Last known good prices (hardcoded from latest successful API calls)
const FALLBACK_PRICES = {
  'NVDA': { price: 176.56, prevClose: 172.7, timestamp: 1774292172000 },
  'AAPL': { price: 252.31, prevClose: 247.99, timestamp: 1774292171000 },
  'MSFT': { price: 383.19, prevClose: 381.87, timestamp: 1774292170000 },
  'TSLA': { price: 381.46, prevClose: 367.96, timestamp: 1774291140290000 },
  'AMZN': { price: 211.31, prevClose: 205.37, timestamp: 1774291140210000 },
  'SPY': { price: 658.88, prevClose: 648.57, timestamp: 1774292172000 },
  'BTC': { price: 71045, prevClose: 68572.82, timestamp: 1774292680892000, source: 'coingecko' },
  'ETH': { price: 2167.66, prevClose: 2065.49, timestamp: 1774292680892000, source: 'coingecko' }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { symbols, symbol, mode } = body;

    // ── SEARCH MODE ──────────────────────────────────────────────────
    if (mode === 'search') {
      const q = body.query?.trim().toUpperCase() || '';
      
      // Try Finnhub if available (quota permitting)
      if (FINNHUB_KEY) {
        try {
          const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(q)}&token=${FINNHUB_KEY}`);
          const data = await res.json();
          if (data.result && Array.isArray(data.result)) {
            const results = data.result
              .filter(r => {
                const type = r.type || '';
                if (body.assetType === 'etf') return type.includes('ETF');
                if (body.assetType === 'stock') return !type.includes('ETF');
                return true;
              })
              .slice(0, 20)
              .map(r => ({ symbol: r.symbol, name: r.description, type: r.type || 'Stock' }));
            if (results.length > 0) return Response.json({ results });
          }
        } catch (e) {
          console.log('[Search] Finnhub failed:', e.message);
        }
      }
      
      return Response.json({ results: [] });
    }

    // ── BATCH PRICE FETCH ───────────────────────────────────────────────
    if (symbols && symbols.length > 0) {
      const results = {};

      // Crypto symbols
      const cryptoSymbols = symbols.filter(s => ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'AVAX', 'LINK', 'UNI', 'DOT', 'ATOM'].includes(s));
      const stockSymbols = symbols.filter(s => !cryptoSymbols.includes(s));

      // Fetch stocks from CoinGecko (crypto, no rate limit issues)
      if (cryptoSymbols.length > 0) {
        const COIN_IDS = {
          'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
          'ADA': 'cardano', 'DOGE': 'dogecoin', 'MATIC': 'matic-network',
          'AVAX': 'avalanche-2', 'LINK': 'chainlink', 'UNI': 'uniswap',
          'DOT': 'polkadot', 'ATOM': 'cosmos'
        };
        
        try {
          const ids = cryptoSymbols.map(s => COIN_IDS[s]).filter(Boolean).join(',');
          const res = await fetch(
            `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
          );
          const data = await res.json();
          
          cryptoSymbols.forEach(sym => {
            const coinId = COIN_IDS[sym];
            if (data[coinId] && data[coinId].usd) {
              const change = data[coinId].usd_24h_change || 0;
              const prevClose = data[coinId].usd / (1 + change / 100);
              const priceData = {
                price: parseFloat(data[coinId].usd.toFixed(2)),
                prevClose: parseFloat(prevClose.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                timestamp: Date.now(),
                source: 'coingecko'
              };
              priceCache.set(sym, priceData);
              results[sym] = priceData;
            } else {
              // Try cache
              const cached = priceCache.get(sym);
              results[sym] = cached || null;
            }
          });
        } catch (e) {
          // Fall back to cache
          cryptoSymbols.forEach(sym => {
            const cached = priceCache.get(sym);
            results[sym] = cached || null;
          });
        }
      }

      // Fetch stocks: CHECK CACHE FIRST (providers exhausted)
      if (stockSymbols.length > 0) {
        stockSymbols.forEach(sym => {
          // Try cache first
          const cached = priceCache.get(sym);
          if (cached) {
            results[sym] = cached;
            return;
          }

          // Fall back to hardcoded last-known-good prices
          const fallback = FALLBACK_PRICES[sym];
          if (fallback) {
            results[sym] = { ...fallback, source: 'cached-fallback' };
            priceCache.set(sym, results[sym]);
          } else {
            results[sym] = null;
          }
        });
      }

      return Response.json({ prices: results });
    }

    return Response.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});