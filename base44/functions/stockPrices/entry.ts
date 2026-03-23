import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const PRIORITY_ASSETS = ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'GOOGL', 'TSLA', 'META', 'SPY', 'QQQ', 'BTC', 'ETH'];

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

    // Helper: fetch with timeout
    const fetchWithTimeout = async (url, ms = 5000) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), ms);
      try {
        const res = await fetch(url, { signal: controller.signal });
        clearTimeout(timer);
        return res;
      } catch {
        clearTimeout(timer);
        throw new Error('Timeout');
      }
    };

    // ── OHLC chart data ────────────────────────────────────────────────
    if (mode === 'ohlc' && symbol) {
      const now = Math.floor(Date.now() / 1000);
      const fromTs = now - 30 * 86400;
      const toDate = new Date().toISOString().split('T')[0];
      const fromDate = new Date(Date.now() - 30 * 86400 * 1000).toISOString().split('T')[0];

      const isInternational = /\.(PA|DE|AS|T|HK|L|MI|MC|BR|KL|SI|V|AX|NZ|BO|NS|JO|SW|OL|ST|CO|HE|AT|LS|WA|PR|RO|TL|VI|BA|MX|SN)$/i.test(symbol);
      const isForex = /^([A-Z]{2,3})(USD|EUR|GBP|JPY|CHF|AUD|CAD|NZD)$/i.test(symbol);
      const isCrypto = /^(BTC|ETH|XRP|LTC|BCH|ADA|DOT|SOL|AVAX|MATIC|LINK|UNI|DOGE|SHIB)$/.test(symbol);

      // Provider 1: Polygon (best for US + international stocks)
      if (POLYGON_KEY && !isForex) {
        try {
          const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/1/day/${fromDate}/${toDate}?adjusted=true&sort=asc&limit=100&apiKey=${POLYGON_KEY}`;
          const res = await fetchWithTimeout(url);
          const data = await res.json();
          if (data.results && data.results.length > 1) {
            const chartData = data.results.map(r => ({
              date: new Date(r.t).toISOString().split('T')[0],
              open: parseFloat(r.o.toFixed(2)),
              high: parseFloat(r.h.toFixed(2)),
              low: parseFloat(r.l.toFixed(2)),
              close: parseFloat(r.c.toFixed(2)),
              volume: r.v,
            }));
            return Response.json({ chartData, source: 'polygon' });
          }
        } catch (e) {
          console.log(`Polygon failed for ${symbol}:`, e.message);
        }
      }

      // Provider 2: Finnhub (US stocks only, very reliable)
      if (FINNHUB_KEY && !isInternational && !isForex && !isCrypto) {
        try {
          const url = `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${fromTs}&to=${now}&token=${FINNHUB_KEY}`;
          const res = await fetchWithTimeout(url, 6000);
          const data = await res.json();
          if (data.s === 'ok' && data.c && data.c.length > 1) {
            const chartData = data.t.map((ts, i) => ({
              date: new Date(ts * 1000).toISOString().split('T')[0],
              open: parseFloat(data.o[i].toFixed(2)),
              high: parseFloat(data.h[i].toFixed(2)),
              low: parseFloat(data.l[i].toFixed(2)),
              close: parseFloat(data.c[i].toFixed(2)),
              volume: data.v[i],
            }));
            return Response.json({ chartData, source: 'finnhub' });
          }
        } catch (e) {
          console.log(`Finnhub failed for ${symbol}:`, e.message);
        }
      }

      // Provider 3: Twelve Data (international + forex + crypto)
      if (TWELVEDATA_KEY) {
        try {
          let tdSymbol = symbol;
          if (isForex) {
            const fm = symbol.match(/^([A-Z]{2,3})(USD|EUR|GBP|JPY|CHF|AUD|CAD|NZD)$/i);
            if (fm) tdSymbol = `${fm[1]}/${fm[2]}`;
          } else if (isInternational) {
            const EXCHANGE_MAP = { 'PA': 'XPAR', 'DE': 'XETR', 'AS': 'XAMS', 'T': 'TSE', 'HK': 'HKEX', 'L': 'LSE', 'MI': 'MIL', 'AX': 'ASX' };
            const intlMatch = symbol.match(/^(.+)\.([A-Z]+)$/);
            if (intlMatch && EXCHANGE_MAP[intlMatch[2]]) {
              tdSymbol = `${intlMatch[1]}:${EXCHANGE_MAP[intlMatch[2]]}`;
            }
          }

          const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(tdSymbol)}&interval=1day&outputsize=100&apikey=${TWELVEDATA_KEY}`;
          const res = await fetchWithTimeout(url, 7000);
          const data = await res.json();
          if (data.values && data.values.length > 1) {
            const chartData = data.values.reverse().map(r => ({
              date: r.datetime.slice(0, 10),
              open: parseFloat(parseFloat(r.open).toFixed(2)),
              high: parseFloat(parseFloat(r.high).toFixed(2)),
              low: parseFloat(parseFloat(r.low).toFixed(2)),
              close: parseFloat(parseFloat(r.close).toFixed(2)),
              volume: parseInt(r.volume || 0),
            }));
            return Response.json({ chartData, source: 'twelvedata' });
          }
        } catch (e) {
          console.log(`Twelve Data failed for ${symbol}:`, e.message);
        }
      }

      // Provider 4: AlphaVantage (last resort, limited calls)
      if (AV_KEY) {
        try {
          let avUrl;
          if (isForex) {
            const fm = symbol.match(/^([A-Z]{2,3})(USD|EUR|GBP|JPY|CHF|AUD|CAD|NZD)$/i);
            avUrl = `https://www.alphavantage.co/query?function=FX_DAILY&from_symbol=${fm[1]}&to_symbol=${fm[2]}&outputsize=compact&apikey=${AV_KEY}`;
          } else if (isCrypto) {
            avUrl = `https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${symbol}&market=USD&apikey=${AV_KEY}`;
          } else {
            avUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${AV_KEY}`;
          }

          const res = await fetchWithTimeout(avUrl, 8000);
          const data = await res.json();
          const tsKey = Object.keys(data).find(k => k.includes('Time Series') || k.includes('FX') || k.includes('Digital'));
          if (tsKey && data[tsKey]) {
            const entries = Object.entries(data[tsKey]).sort(([a], [b]) => a.localeCompare(b)).slice(-30);
            const chartData = entries.map(([date, v]) => {
              const openKey = Object.keys(v).find(k => k.includes('open'));
              const highKey = Object.keys(v).find(k => k.includes('high'));
              const lowKey = Object.keys(v).find(k => k.includes('low'));
              const closeKey = Object.keys(v).find(k => k.includes('close'));
              return {
                date,
                open: parseFloat((v[openKey] || 0).toFixed(2)),
                high: parseFloat((v[highKey] || 0).toFixed(2)),
                low: parseFloat((v[lowKey] || 0).toFixed(2)),
                close: parseFloat((v[closeKey] || 0).toFixed(2)),
                volume: 0,
              };
            }).filter(d => d.close > 0);
            if (chartData.length > 1) {
              return Response.json({ chartData, source: 'alphavantage' });
            }
          }
        } catch (e) {
          console.log(`AlphaVantage failed for ${symbol}:`, e.message);
        }
      }

      // Fallback: return empty with clear status
      return Response.json({ chartData: [], source: 'unavailable', symbol });
    }

    // ── Search endpoint ───────────────────────────────────────────────
    if (mode === 'search' && body.query) {
      const assetFilter = body.assetType || 'all';
      const q = body.query.trim().toUpperCase();

      if (assetFilter === 'crypto' && FINNHUB_KEY) {
        try {
          const res = await fetch(`https://finnhub.io/api/v1/crypto/symbol?exchange=BINANCE&token=${FINNHUB_KEY}`);
          const data = await res.json();
          const cryptoResults = (Array.isArray(data) ? data : [])
            .filter(r => (r.symbol || '').toUpperCase().includes(q) || (r.description || '').toUpperCase().includes(q))
            .slice(0, 15)
            .map(r => ({ symbol: r.symbol, name: r.description || r.displaySymbol, type: 'Crypto' }));
          return Response.json({ results: cryptoResults });
        } catch {
          return Response.json({ results: [] });
        }
      }

      if (assetFilter === 'forex') {
        return Response.json({ results: [], note: 'Search by exact symbol (e.g., EURUSD)' });
      }

      if (FINNHUB_KEY) {
        try {
          const res = await fetch(`https://finnhub.io/api/v1/search?q=${encodeURIComponent(body.query)}&token=${FINNHUB_KEY}`);
          const data = await res.json();
          const TYPE_MAP = { 'Common Stock': 'Stock', 'EQS': 'Stock', 'ADR': 'ADR', 'ETF': 'ETF', 'DR': 'ADR', 'Fund': 'Fund' };
          const results = (data.result || [])
            .filter(r => {
              if (assetFilter === 'etf') return ['ETF', 'Fund'].includes(r.type);
              if (assetFilter === 'stock') return ['Common Stock', 'EQS', 'ADR', 'DR'].includes(r.type);
              return true;
            })
            .slice(0, 20)
            .map(r => ({ symbol: r.symbol, name: r.description, type: TYPE_MAP[r.type] || 'Stock' }));
          return Response.json({ results });
        } catch {
          return Response.json({ results: [] });
        }
      }
    }

    // ── Batch price fetch (CRITICAL FIX) ───────────────────────────────
    if (symbols && symbols.length > 0) {
      const results = {};

      await Promise.all(symbols.map(async (sym) => {
        const isIntl = /\.(PA|DE|AS|T|HK|L|MI|SW|AX)$/i.test(sym);
        const isFx = /^([A-Z]{2,3})(USD|EUR|GBP|JPY|CHF|AUD|CAD|NZD)$/i.test(sym);
        const isCrypto = /^(BTC|ETH|XRP|LTC|BCH|ADA|DOT|SOL|AVAX|MATIC|LINK|UNI|DOGE|SHIB)$/.test(sym);
        const isPriority = PRIORITY_ASSETS.includes(sym);

        // Strategy: Try multiple providers, ensure we get data for priority assets
        const providers = [];

        // 1. Yahoo Finance (fastest, reliable for all US stocks + ETFs)
        if (!isCrypto && !isFx) {
          providers.push(async () => fetchYahoo(sym));
        }

        // 2. Polygon (best overall - US + international stocks, NOT crypto)
        if (POLYGON_KEY && !isFx && !isCrypto) {
          providers.push(async () => {
            const url = `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${POLYGON_KEY}`;
            const res = await fetchWithTimeout(url);
            const data = await res.json();
            const price = data?.results?.c || data?.results?.[0]?.c;
            const prevClose = data?.results?.c || data?.results?.[0]?.c;
            if (price && price > 0) {
              return {
                price: parseFloat(price.toFixed(2)),
                prevClose: prevClose ? parseFloat(prevClose.toFixed(2)) : null,
                timestamp: data?.results?.t || Date.now()
              };
            }
            throw new Error('Polygon no data');
          });
        }

        // 3. Finnhub (US stocks - very reliable for priority assets)
        if (FINNHUB_KEY && !isIntl && !isFx && !isCrypto) {
          providers.push(async () => {
            const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`);
            const data = await res.json();
            if (data.c && data.c > 0 && data.pc && data.pc > 0) {
              return {
                price: parseFloat(data.c.toFixed(2)),
                prevClose: parseFloat(data.pc.toFixed(2)),
                timestamp: data.t ? data.t * 1000 : Date.now()
              };
            }
            throw new Error('Finnhub no data');
          });
        }

        // 3. CoinGecko (crypto only - primary, with rate limit handling)
        if (isCrypto) {
          providers.push(async () => {
            const COINGECKO_IDS = {
              'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
              'ADA': 'cardano', 'DOGE': 'dogecoin', 'MATIC': 'matic-network',
              'AVAX': 'avalanche-2', 'LINK': 'chainlink', 'UNI': 'uniswap',
              'SHIB': 'shiba-inu', 'PEPE': 'pepe', 'LDO': 'lido-dao'
            };
            const coinId = COINGECKO_IDS[sym.toUpperCase()];
            if (!coinId) throw new Error('CoinGecko no ID');
            
            const res = await fetchWithTimeout(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`, 8000);
            const data = await res.json();
            
            // Check for rate limit error
            if (data.status && data.status.error_code === 429) {
              throw new Error('CoinGecko rate limited');
            }
            
            const coinData = data[coinId];
            if (coinData && coinData.usd && coinData.usd > 1) {
              const change = coinData.usd_24h_change || 0;
              const prevClose = coinData.usd / (1 + change / 100);
              return {
                price: parseFloat(coinData.usd.toFixed(2)),
                prevClose: parseFloat(prevClose.toFixed(2)),
                change: parseFloat(change.toFixed(2)),
                timestamp: Date.now()
              };
            }
            throw new Error('CoinGecko no data');
          });
        }

        // 4. Twelve Data (international + forex fallback)
        if (TWELVEDATA_KEY && !isCrypto) {
          providers.push(async () => {
            let tdSymbol = sym;
            if (isFx) {
              const fm = sym.match(/^([A-Z]{2,3})(USD|EUR|GBP|JPY|CHF|AUD|CAD|NZD)$/i);
              if (fm) tdSymbol = `${fm[1]}/${fm[2]}`;
            }
            const res = await fetchWithTimeout(`https://api.twelvedata.com/price?symbol=${encodeURIComponent(tdSymbol)}&apikey=${TWELVEDATA_KEY}`);
            const data = await res.json();
            if (data.price && data.price > 0) {
              return {
                price: parseFloat(parseFloat(data.price).toFixed(2)),
                prevClose: null,
                timestamp: Date.now()
              };
            }
            throw new Error('TwelveData no data');
          });
        }

        // 5. AlphaVantage (forex/commodities)
        if (AV_KEY && isFx) {
          providers.push(async () => {
            const fm = sym.match(/^([A-Z]{2,3})(USD|EUR|GBP|JPY|CHF|AUD|CAD|NZD)$/i);
            const res = await fetchWithTimeout(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${fm[1]}&to_currency=${fm[2]}&apikey=${AV_KEY}`);
            const data = await res.json();
            const rate = parseFloat(data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate'] || 0);
            if (rate > 0) {
              return {
                price: parseFloat(rate.toFixed(4)),
                prevClose: null,
                timestamp: Date.now()
              };
            }
            throw new Error('AV no data');
          });
        }

        // Execute providers in sequence until one succeeds
        let lastError = '';
        for (const provider of providers) {
          try {
            const data = await provider();
            results[sym] = data;
            break;
          } catch (e) {
            lastError = e.message;
            // Try next provider
            continue;
          }
        }
        
        if (!results[sym]) {
          console.log(`All providers failed for ${sym}: ${lastError}`);
        }

        // If all providers failed for a priority asset, try harder with retries
        if (!results[sym] && isPriority) {
          for (let retry = 0; retry < 3; retry++) {
            try {
              await new Promise(resolve => setTimeout(resolve, 1000 * (retry + 1)));
              if (POLYGON_KEY) {
                const url = `https://api.polygon.io/v2/aggs/ticker/${sym}/prev?adjusted=true&apiKey=${POLYGON_KEY}`;
                const res = await fetchWithTimeout(url);
                const data = await res.json();
                const price = data?.results?.c || data?.results?.[0]?.c;
                if (price && price > 0) {
                  results[sym] = {
                    price: parseFloat(price.toFixed(2)),
                    prevClose: parseFloat(price.toFixed(2)),
                    timestamp: Date.now()
                  };
                  break;
                }
              }
            } catch {
              continue;
            }
          }
        }

        // Last resort: return null (but this should rarely happen for priority assets)
        if (!results[sym]) {
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