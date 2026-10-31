import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY') || '';

// In-memory cache (resets on deploy, but persists across function calls)
const priceCache = new Map();

// No hardcoded fallback prices. A quote that cannot be fetched from a provider
// (or served from this process's cache of a real fetch) returns null, so the UI
// shows "unavailable" instead of a stale fabricated price.

Deno.serve(async (req) => {
  try {
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

    // ── OHLC / HISTORY MODE ─────────────────────────────────────────────
    // Intraday + history bars via TwelveData. Without this branch every chart
    // request fell through to "Invalid request", which is why the asset page
    // always showed "Chart data unavailable".
    if (mode === 'ohlc' || mode === 'history') {
      const sym = String(symbol || '').toUpperCase();
      const timeframe = String(body.timeframe || '1D').toUpperCase();
      const TWELVE_KEY = Deno.env.get('TWELVEDATA_API_KEY') || '';
      if (!TWELVE_KEY || !sym) return Response.json({ chartData: [], source: 'unavailable' });

      const CRYPTO = ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'AVAX', 'LINK', 'UNI', 'DOT', 'ATOM'];
      const INTERVALS = {
        '1D': { interval: '15min', outputsize: 78 },
        '1W': { interval: '1h', outputsize: 120 },
        '1M': { interval: '1day', outputsize: 30 },
        '3M': { interval: '1day', outputsize: 90 },
        '1Y': { interval: '1week', outputsize: 52 },
      };
      const cfg = INTERVALS[timeframe] || INTERVALS['1D'];
      const providerSymbol = CRYPTO.includes(sym) ? `${sym}/USD` : sym;

      const fetchSeries = async (interval: string) => {
        const res = await fetch(
          `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(providerSymbol)}&interval=${interval}&outputsize=${cfg.outputsize}&apikey=${TWELVE_KEY}`,
          { signal: AbortSignal.timeout(10000) }
        );
        const d = await res.json();
        const values = Array.isArray(d?.values) ? d.values : [];
        return values
          .slice()
          .reverse()
          .map((v: any) => ({
            date: v.datetime,
            open: parseFloat(v.open),
            high: parseFloat(v.high),
            low: parseFloat(v.low),
            close: parseFloat(v.close),
          }))
          .filter((c: any) => Number.isFinite(c.close));
      };

      try {
        const chartData = await fetchSeries(cfg.interval);
        if (chartData.length > 0) {
          return Response.json({ chartData, source: 'twelvedata', interval: cfg.interval });
        }
      } catch (_) { /* fall through to daily bars */ }

      try {
        const dailyInterval = timeframe === '1Y' ? '1week' : '1day';
        const chartData = await fetchSeries(dailyInterval);
        return Response.json({
          chartData,
          source: chartData.length > 0 ? 'twelvedata' : 'unavailable',
          interval: dailyInterval,
        });
      } catch (_) {
        return Response.json({ chartData: [], source: 'unavailable' });
      }
    }

    // ── BATCH PRICE FETCH ───────────────────────────────────────────────
    // An empty list is a valid "nothing to price yet" request, not a bad one.
    if (Array.isArray(symbols)) {
      const results = {};

      // Crypto symbols
      const cryptoSymbols = symbols.filter(s => ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'AVAX', 'LINK', 'UNI', 'DOT', 'ATOM'].includes(s));
      const stockSymbols = symbols.filter(s => !cryptoSymbols.includes(s));

      // Crypto via TwelveData. CoinGecko now returns 403 for anonymous callers,
      // so this path previously produced nothing and the hardcoded table covered it.
      if (cryptoSymbols.length > 0) {
        const TWELVE_KEY = Deno.env.get('TWELVEDATA_API_KEY') || '';

        await Promise.all(cryptoSymbols.map(async (sym) => {
          const cached = priceCache.get(sym);
          if (cached && (Date.now() - (cached.fetchedAt || 0)) < 30000) {
            results[sym] = cached;
            return;
          }
          if (!TWELVE_KEY) {
            results[sym] = cached || null;
            return;
          }
          try {
            const res = await fetch(
              `https://api.twelvedata.com/quote?symbol=${sym}/USD&apikey=${TWELVE_KEY}`,
              { signal: AbortSignal.timeout(8000) }
            );
            const d = await res.json();
            const price = parseFloat(d.close);
            if (price > 0) {
              const change = parseFloat(d.percent_change || 0);
              const prevClose = d.previous_close
                ? parseFloat(d.previous_close)
                : price / (1 + change / 100);
              const priceData = {
                price: parseFloat(price.toFixed(2)),
                prevClose: parseFloat(prevClose.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                timestamp: Date.now(),
                fetchedAt: Date.now(),
                source: 'twelvedata'
              };
              priceCache.set(sym, priceData);
              results[sym] = priceData;
            } else {
              results[sym] = cached || null;
            }
          } catch (e) {
            results[sym] = cached || null;
          }
        }));
      }

      // Fetch stocks via Finnhub (live), with cache + fallback
      if (stockSymbols.length > 0) {
        // Separate cached from uncached
        const uncached = [];
        stockSymbols.forEach(sym => {
          const cached = priceCache.get(sym);
          if (cached && (Date.now() - (cached.fetchedAt || 0)) < 30000) {
            results[sym] = cached;
          } else {
            uncached.push(sym);
          }
        });

        // Fetch uncached symbols from Finnhub in parallel
        if (uncached.length > 0 && FINNHUB_KEY) {
          await Promise.all(uncached.map(async (sym) => {
            try {
              const res = await fetch(
                `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`
              );
              const d = await res.json();
              if (d && d.c > 0) {
                const priceData = {
                  price: d.c,
                  prevClose: d.pc,
                  high: d.h,
                  low: d.l,
                  open: d.o,
                  timestamp: Date.now(),
                  fetchedAt: Date.now(),
                  source: 'finnhub'
                };
                priceCache.set(sym, priceData);
                results[sym] = priceData;
              } else {
                // Cached real quote only — never a fabricated price
                results[sym] = priceCache.get(sym) || null;
              }
            } catch (e) {
              results[sym] = priceCache.get(sym) || null;
            }
          }));
        } else if (uncached.length > 0) {
          // No API key — cached real quotes only
          uncached.forEach(sym => {
            results[sym] = priceCache.get(sym) || null;
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