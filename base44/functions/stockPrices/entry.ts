import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { symbols, symbol, mode } = body;

    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');
    if (!FINNHUB_KEY) return Response.json({ error: 'FINNHUB_API_KEY missing' }, { status: 500 });

    // ── SEARCH MODE ──────────────────────────────────────────────────
    if (mode === 'search') {
      if (FINNHUB_KEY) {
        try {
          const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(body.query)}&token=${FINNHUB_KEY}`);
          const data = await res.json();
          const results = (data.result || [])
            .filter(r => {
              const type = r.type || '';
              if (body.assetType === 'etf') return type.includes('ETF');
              if (body.assetType === 'stock') return !type.includes('ETF');
              return true;
            })
            .slice(0, 20)
            .map(r => ({ symbol: r.symbol, name: r.description, type: r.type || 'Stock' }));
          return Response.json({ results });
        } catch {
          return Response.json({ results: [] });
        }
      }
    }

    // ── BATCH PRICE FETCH (SIMPLIFIED) ───────────────────────────────
    if (symbols && symbols.length > 0) {
      const results = {};

      // Crypto symbols
      const cryptoSymbols = symbols.filter(s => ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'AVAX', 'LINK', 'UNI', 'DOT', 'ATOM'].includes(s));
      const stockSymbols = symbols.filter(s => !cryptoSymbols.includes(s));

      // Fetch stocks from Finnhub
      if (stockSymbols.length > 0) {
        await Promise.all(stockSymbols.map(async (sym) => {
          try {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`);
            const data = await res.json();
            const price = data?.c;
            const prevClose = data?.pc;
            
            if (price && price > 0) {
              results[sym] = {
                price: parseFloat(price.toFixed(2)),
                prevClose: prevClose ? parseFloat(prevClose.toFixed(2)) : null,
                timestamp: data?.t ? data.t * 1000 : Date.now(),
                source: 'finnhub'
              };
            } else {
              results[sym] = null;
            }
          } catch {
            results[sym] = null;
          }
        }));
      }

      // Fetch crypto from CoinGecko
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
              results[sym] = {
                price: parseFloat(data[coinId].usd.toFixed(2)),
                prevClose: parseFloat(prevClose.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                timestamp: Date.now(),
                source: 'coingecko'
              };
            } else {
              results[sym] = null;
            }
          });
        } catch {
          cryptoSymbols.forEach(sym => {
            results[sym] = null;
          });
        }
      }

      return Response.json({ prices: results });
    }

    return Response.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});