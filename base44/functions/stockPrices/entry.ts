import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const TIMEFRAME_MAP = {
  '1D':  { multiplier: 5,  span: 'minute', resolution: '5',  avFunction: 'TIME_SERIES_INTRADAY', avInterval: '5min',  days: 1 },
  '1W':  { multiplier: 60, span: 'minute', resolution: '60', avFunction: 'TIME_SERIES_DAILY',    avInterval: null,    days: 7 },
  '1M':  { multiplier: 1,  span: 'day',    resolution: 'D',  avFunction: 'TIME_SERIES_DAILY',    avInterval: null,    days: 30 },
  '3M':  { multiplier: 1,  span: 'day',    resolution: 'D',  avFunction: 'TIME_SERIES_DAILY',    avInterval: null,    days: 90 },
  '1Y':  { multiplier: 1,  span: 'week',   resolution: 'W',  avFunction: 'TIME_SERIES_WEEKLY',   avInterval: null,    days: 365 },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { symbols, symbol, mode, timeframe = '1M' } = body;

    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');
    const POLYGON_KEY = Deno.env.get('POLYGON_API_KEY');
    const TWELVEDATA_KEY = Deno.env.get('TWELVEDATA_API_KEY');
    const AV_KEY = Deno.env.get('ALPHAVANTAGE_API_KEY');

    // ── OHLC chart data ────────────────────────────────────────────────
    if (mode === 'ohlc' && symbol) {
      const tf = TIMEFRAME_MAP[timeframe] || TIMEFRAME_MAP['1M'];
      const now = Math.floor(Date.now() / 1000);
      const fromTs = now - tf.days * 86400;
      const toDate = new Date().toISOString().split('T')[0];
      const fromDate = new Date(Date.now() - tf.days * 86400 * 1000).toISOString().split('T')[0];

      // Detect international (non-US) symbols by exchange suffix
      const isInternational = /\.(PA|DE|AS|T|HK|L|MI|MC|BR|KL|SI|V|AX|NZ|BO|NS|JO|SW|OL|ST|CO|HE|AT|LS|WA|PR|BU|RO|TL|VI|BA|MX|SN)$/i.test(symbol);

      // Helper: fetch with a hard timeout to avoid blocking on rate-limited providers
      const fetchWithTimeout = (url, ms = 4000) => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), ms);
        return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
      };

      // 1. Polygon (US-only, intraday + daily, very reliable)
      if (POLYGON_KEY && !isInternational) {
        try {
          const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${tf.multiplier}/${tf.span}/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=500&apiKey=${POLYGON_KEY}`;
          const res = await fetchWithTimeout(url);
          const data = await res.json();
          if (data.results && data.results.length > 1) {
            const chartData = data.results.map(r => ({
              date: tf.span === 'minute'
                ? new Date(r.t).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                : new Date(r.t).toISOString().split('T')[0],
              open: parseFloat(r.o.toFixed(2)),
              high: parseFloat(r.h.toFixed(2)),
              low:  parseFloat(r.l.toFixed(2)),
              close: parseFloat(r.c.toFixed(2)),
              volume: r.v,
            }));
            return Response.json({ chartData, source: 'polygon', timeframe });
          }
        } catch { /* fall through */ }
      }

      // 2. Finnhub candles — try this BEFORE Twelve Data for international daily bars
      //    Finnhub free plan covers many EU/Asian exchanges at daily resolution
      if (FINNHUB_KEY) {
        try {
          // For international symbols or longer timeframes, always use daily resolution
          const resolution = isInternational ? 'D' : tf.resolution;
          const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${fromTs}&to=${now}&token=${FINNHUB_KEY}`;
          const res = await fetchWithTimeout(url);
          const data = await res.json();
          if (data.s === 'ok' && data.c && data.c.length > 1) {
            const chartData = data.t.map((ts, i) => ({
              date: new Date(ts * 1000).toISOString().split('T')[0],
              open: parseFloat(data.o[i].toFixed(2)),
              high: parseFloat(data.h[i].toFixed(2)),
              low:  parseFloat(data.l[i].toFixed(2)),
              close: parseFloat(data.c[i].toFixed(2)),
              volume: data.v[i],
            }));
            return Response.json({ chartData, source: 'finnhub', timeframe });
          }
        } catch { /* fall through */ }
      }

      // 3. Twelve Data — global fallback with timeout guard
      if (TWELVEDATA_KEY) {
        try {
          const intervalMap = { '1D': '5min', '1W': '1h', '1M': '1day', '3M': '1day', '1Y': '1week' };
          const intlIntervalMap = { '1D': '1day', '1W': '1day', '1M': '1day', '3M': '1day', '1Y': '1week' };
          const interval = (isInternational ? intlIntervalMap : intervalMap)[timeframe] || '1day';
          const outputsize = (!isInternational && tf.days <= 1) ? 80 : (!isInternational && tf.days <= 7) ? 120 : 365;
          const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${TWELVEDATA_KEY}`;
          const res = await fetchWithTimeout(url, 5000);
          const data = await res.json();
          if (data.values && data.values.length > 1) {
            const chartData = data.values.reverse().map(r => ({
              date: r.datetime,
              open: parseFloat(r.open),
              high: parseFloat(r.high),
              low:  parseFloat(r.low),
              close: parseFloat(r.close),
              volume: parseInt(r.volume || 0),
            }));
            return Response.json({ chartData, source: 'twelvedata', timeframe });
          }
        } catch { /* fall through */ }
      }

      // 4. AlphaVantage — daily/weekly for US stocks, reliable free tier
      //    Also handles Forex via FX_DAILY and Crypto via DIGITAL_CURRENCY_DAILY
      if (AV_KEY) {
        try {
          // Detect Forex/commodity symbols (EURUSD, GBPUSD, XAUUSD, XAGUSD, etc.)
          // XAU/XAG = precious metals, treated same as forex pairs by AV
          const forexMatch = symbol.match(/^([A-Z]{2,3})(USD|EUR|GBP|JPY|CHF|AUD|CAD|NZD)$/i);
          const isCryptoSymbol = /^(BTC|ETH|XRP|LTC|BCH|ADA|DOT|SOL|AVAX|MATIC|LINK|UNI|DOGE|SHIB)$/.test(symbol);

          let avUrl;
          if (forexMatch) {
            avUrl = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${forexMatch[1]}&to_symbol=${forexMatch[2]}&outputsize=compact&apikey=${AV_KEY}`;
          } else if (isCryptoSymbol) {
            avUrl = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=USD&apikey=${AV_KEY}`;
          } else if (tf.avFunction === 'TIME_SERIES_INTRADAY') {
            avUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&outputsize=compact&apikey=${AV_KEY}`;
          } else if (tf.avFunction === 'TIME_SERIES_WEEKLY') {
            avUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${symbol}&apikey=${AV_KEY}`;
          } else {
            avUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${AV_KEY}`;
          }

          const res = await fetchWithTimeout(avUrl, 6000);
          const data = await res.json();

          // AlphaVantage returns data under different keys depending on function
          const tsKey = Object.keys(data).find(k => k.startsWith('Time Series') || k === 'Weekly Time Series' || k.startsWith('Time Series FX') || k.startsWith('Time Series Digital'));
          if (tsKey && data[tsKey]) {
            const entries = Object.entries(data[tsKey]).sort(([a], [b]) => a.localeCompare(b));
            // For daily timeframes, slice to relevant window
            const sliceCount = tf.days <= 30 ? 30 : tf.days <= 90 ? 90 : 260;
            const sliced = entries.slice(-sliceCount);
            const chartData = sliced.map(([date, v]) => {
              // AV keys vary: '1. open' or '1a. open (USD)' for crypto
              const openKey  = Object.keys(v).find(k => k.match(/open/i));
              const highKey  = Object.keys(v).find(k => k.match(/high/i));
              const lowKey   = Object.keys(v).find(k => k.match(/low/i));
              const closeKey = Object.keys(v).find(k => k.match(/close/i) && !k.match(/adjusted/i));
              const volKey   = Object.keys(v).find(k => k.match(/volume/i));
              return {
                date,
                open:  parseFloat(parseFloat(v[openKey]  || 0).toFixed(4)),
                high:  parseFloat(parseFloat(v[highKey]  || 0).toFixed(4)),
                low:   parseFloat(parseFloat(v[lowKey]   || 0).toFixed(4)),
                close: parseFloat(parseFloat(v[closeKey] || 0).toFixed(4)),
                volume: parseInt(v[volKey] || 0),
              };
            }).filter(d => d.close > 0);
            if (chartData.length > 1) {
              return Response.json({ chartData, source: 'alphavantage', timeframe });
            }
          }
        } catch { /* fall through */ }
      }

      // All providers exhausted — honest empty response, no fake data
      return Response.json({ chartData: [], source: 'unavailable', timeframe });
    }

    // ── Search endpoint ───────────────────────────────────────────────
    // Coverage by provider:
    //   Stocks/ETFs: Finnhub /search (30,000+ equities worldwide)
    //   Crypto: Finnhub /crypto/symbol (BTC, ETH, etc. via BINANCE exchange)
    //   Forex: NOT supported by Finnhub /search — forex pairs require direct quote lookup
    if (mode === 'search' && body.query) {
      const assetFilter = body.assetType || 'all';
      const q = body.query.trim().toUpperCase();

      // For crypto tab: use Finnhub crypto symbol list and filter in-memory
      if (assetFilter === 'crypto') {
        try {
          const res = await fetch(`https://finnhub.io/api/v1/crypto/symbol?exchange=BINANCE&token=${FINNHUB_KEY}`);
          const data = await res.json();
          const cryptoResults = (Array.isArray(data) ? data : [])
            .filter(r => {
              const sym = (r.symbol || '').toUpperCase();
              const desc = (r.description || r.displaySymbol || '').toUpperCase();
              return sym.includes(q) || desc.includes(q);
            })
            .slice(0, 15)
            .map(r => ({
              symbol: r.symbol,
              name: r.description || r.displaySymbol || r.symbol,
              type: 'Crypto',
            }));
          return Response.json({ results: cryptoResults });
        } catch {
          return Response.json({ results: [] });
        }
      }

      // For forex tab: Finnhub /search doesn't return forex pairs.
      // Honest response: provider limitation on this plan.
      if (assetFilter === 'forex') {
        return Response.json({
          results: [],
          _note: 'Forex search requires direct symbol lookup (e.g. EUR/USD). Try the exact pair.',
        });
      }

      // Stocks / ETFs / All: Finnhub /search endpoint
      try {
        const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(body.query)}&token=${FINNHUB_KEY}`);
        const data = await res.json();

        const TYPE_MAP = {
          'Common Stock': 'Stock', 'EQS': 'Stock', 'ADR': 'ADR',
          'ETF': 'ETF', 'DR': 'ADR', 'Fund': 'Fund',
        };

        const ETF_TYPES = ['ETF', 'Fund'];
        const STOCK_TYPES = ['Common Stock', 'EQS', 'ADR', 'DR'];

        const results = (data.result || [])
          .filter(r => {
            if (assetFilter === 'etf') return ETF_TYPES.includes(r.type);
            if (assetFilter === 'stock') return STOCK_TYPES.includes(r.type);
            // 'all': include everything returned
            return true;
          })
          .slice(0, 20)
          .map(r => ({
            symbol: r.symbol,
            name: r.description,
            type: TYPE_MAP[r.type] || r.type || 'Asset',
          }));

        return Response.json({ results });
      } catch {
        return Response.json({ results: [] });
      }
    }

    // ── Batch price fetch ─────────────────────────────────────────────
    if (symbols && symbols.length > 0) {
      const results = {};
      await Promise.all(symbols.map(async (sym) => {
        try {
          // 1. Try Finnhub quote (works well for US equities + crypto)
          const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`);
          const data = await res.json();
          if (data.c > 0) {
            results[sym] = parseFloat(data.c.toFixed(2));
            return;
          }

          // 2. Fallback: Twelve Data real-time price (handles EU/Asian exchanges + forex + gold)
          if (TWELVEDATA_KEY) {
            const tdRes = await fetch(`https://api.twelvedata.com/price?symbol=${sym}&apikey=${TWELVEDATA_KEY}`);
            const tdData = await tdRes.json();
            if (tdData.price && parseFloat(tdData.price) > 0) {
              results[sym] = parseFloat(parseFloat(tdData.price).toFixed(4));
              return;
            }
          }

          // 3. Fallback: AlphaVantage for forex + commodities
          if (AV_KEY) {
            const forexMatch = sym.match(/^([A-Z]{3})(USD|EUR|GBP|JPY|CHF|AUD|CAD|NZD)$/i);
            if (forexMatch) {
              const avRes = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${forexMatch[1]}&to_currency=${forexMatch[2]}&apikey=${AV_KEY}`);
              const avData = await avRes.json();
              const rate = parseFloat(avData?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate'] || 0);
              if (rate > 0) { results[sym] = parseFloat(rate.toFixed(4)); return; }
            }
          }

          results[sym] = null;
        } catch {
          results[sym] = null;
        }
      }));
      return Response.json({ prices: results });
    }

    return Response.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});