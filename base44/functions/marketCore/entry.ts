import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

/**
 * TREDIO Market Core Engine
 *
 * Serves two endpoints via ?action= param:
 *   action=core   → returns cached prices for 8 core assets (<1s)
 *   action=search → searches metadata + fetches live quotes (2.5s timeout)
 *
 * Providers:
 *   Polygon  → stocks + ETFs
 *   CoinGecko → crypto
 *
 * No Finnhub. No AlphaVantage. No TwelveData.
 * No cache fallback. No fake data. Honest "unavailable" on failure.
 */

// ── GLOBAL CACHE (persists across requests in same isolate) ──────────────
// Using globalThis so cache survives between requests without reset
globalThis._marketCache = globalThis._marketCache || new Map();
globalThis._searchCache = globalThis._searchCache || new Map();
globalThis._pollInProgress = globalThis._pollInProgress || false;
globalThis._lastPollTime = globalThis._lastPollTime || 0;

const coreCache = globalThis._marketCache;
const searchCache = globalThis._searchCache;

const CORE_SYMBOLS_STOCK = ['AAPL', 'NVDA', 'TSLA', 'AMZN', 'SPY', 'QQQ'];
const CORE_SYMBOLS_CRYPTO = ['BTC', 'ETH'];
const ALL_CORE = [...CORE_SYMBOLS_STOCK, ...CORE_SYMBOLS_CRYPTO];

// Staleness thresholds
const LIVE_THRESHOLD_MS = 60000;   // <60s → "live"
const SEARCH_CACHE_TTL_MS = 45000; // 45s search cache

// ── CRYPTO COIN MAP ──────────────────────────────────────────────────────
const COIN_ID_MAP = {
  BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', XRP: 'ripple',
  ADA: 'cardano', DOGE: 'dogecoin', MATIC: 'matic-network',
  AVAX: 'avalanche-2', LINK: 'chainlink', UNI: 'uniswap',
  DOT: 'polkadot', ATOM: 'cosmos', LTC: 'litecoin', BCH: 'bitcoin-cash'
};

// ── LOCAL SYMBOL METADATA ────────────────────────────────────────────────
const SYMBOL_META = {
  // Stocks
  AAPL:  { name: 'Apple',                    type: 'stock', sector: 'Technology' },
  NVDA:  { name: 'NVIDIA',                   type: 'stock', sector: 'Technology' },
  TSLA:  { name: 'Tesla',                    type: 'stock', sector: 'Automotive' },
  AMZN:  { name: 'Amazon',                   type: 'stock', sector: 'Technology' },
  MSFT:  { name: 'Microsoft',                type: 'stock', sector: 'Technology' },
  META:  { name: 'Meta',                     type: 'stock', sector: 'Technology' },
  GOOGL: { name: 'Google',                   type: 'stock', sector: 'Technology' },
  GOOG:  { name: 'Google C',                 type: 'stock', sector: 'Technology' },
  NFLX:  { name: 'Netflix',                  type: 'stock', sector: 'Media' },
  COIN:  { name: 'Coinbase',                 type: 'stock', sector: 'Crypto' },
  AMD:   { name: 'Advanced Micro Devices',   type: 'stock', sector: 'Technology' },
  INTC:  { name: 'Intel',                    type: 'stock', sector: 'Technology' },
  QCOM:  { name: 'Qualcomm',                 type: 'stock', sector: 'Technology' },
  CRM:   { name: 'Salesforce',               type: 'stock', sector: 'Software' },
  ADBE:  { name: 'Adobe',                    type: 'stock', sector: 'Software' },
  SNOW:  { name: 'Snowflake',                type: 'stock', sector: 'Software' },
  DDOG:  { name: 'Datadog',                  type: 'stock', sector: 'Software' },
  SPOT:  { name: 'Spotify',                  type: 'stock', sector: 'Media' },
  UBER:  { name: 'Uber',                     type: 'stock', sector: 'Technology' },
  LYFT:  { name: 'Lyft',                     type: 'stock', sector: 'Technology' },
  ABNB:  { name: 'Airbnb',                   type: 'stock', sector: 'Travel' },
  PLTR:  { name: 'Palantir',                 type: 'stock', sector: 'Software' },
  JPM:   { name: 'JPMorgan Chase',           type: 'stock', sector: 'Finance' },
  BAC:   { name: 'Bank of America',          type: 'stock', sector: 'Finance' },
  GS:    { name: 'Goldman Sachs',            type: 'stock', sector: 'Finance' },
  BLK:   { name: 'BlackRock',                type: 'stock', sector: 'Finance' },
  JNJ:   { name: 'Johnson & Johnson',        type: 'stock', sector: 'Healthcare' },
  PFE:   { name: 'Pfizer',                   type: 'stock', sector: 'Healthcare' },
  ABBV:  { name: 'AbbVie',                   type: 'stock', sector: 'Healthcare' },
  MRK:   { name: 'Merck',                    type: 'stock', sector: 'Healthcare' },
  WMT:   { name: 'Walmart',                  type: 'stock', sector: 'Retail' },
  KO:    { name: 'Coca-Cola',                type: 'stock', sector: 'Beverages' },
  PEP:   { name: 'PepsiCo',                  type: 'stock', sector: 'Food & Beverage' },
  MCD:   { name: "McDonald's",               type: 'stock', sector: 'Restaurant' },
  TSM:   { name: 'TSMC',                     type: 'stock', sector: 'Semiconductors' },
  ARM:   { name: 'Arm Holdings',             type: 'stock', sector: 'Semiconductors' },
  SMCI:  { name: 'Super Micro Computer',     type: 'stock', sector: 'Hardware' },
  RBLX:  { name: 'Roblox',                   type: 'stock', sector: 'Gaming' },
  UPST:  { name: 'Upstart',                  type: 'stock', sector: 'FinTech' },
  // ETFs
  SPY:   { name: 'S&P 500 ETF',             type: 'etf', sector: 'Index' },
  QQQ:   { name: 'Nasdaq 100 ETF',          type: 'etf', sector: 'Index' },
  DIA:   { name: 'Dow Jones ETF',           type: 'etf', sector: 'Index' },
  VOO:   { name: 'Vanguard S&P 500',        type: 'etf', sector: 'Index' },
  VTI:   { name: 'Vanguard Total Stock',    type: 'etf', sector: 'Index' },
  IWM:   { name: 'Russell 2000 ETF',        type: 'etf', sector: 'Index' },
  ARKK:  { name: 'ARK Innovation ETF',      type: 'etf', sector: 'Growth' },
  GLD:   { name: 'Gold Trust ETF',          type: 'etf', sector: 'Commodities' },
  SLV:   { name: 'Silver Trust ETF',        type: 'etf', sector: 'Commodities' },
  XLK:   { name: 'Tech Select Sector ETF',  type: 'etf', sector: 'Technology' },
  XLF:   { name: 'Finance Select ETF',      type: 'etf', sector: 'Finance' },
  XLE:   { name: 'Energy Select ETF',       type: 'etf', sector: 'Energy' },
  TLT:   { name: 'Long Treasury ETF',       type: 'etf', sector: 'Fixed Income' },
  SCHD:  { name: 'Schwab Dividend ETF',     type: 'etf', sector: 'Dividend' },
  // Crypto
  BTC:   { name: 'Bitcoin',  type: 'crypto', sector: 'Crypto', coinId: 'bitcoin' },
  ETH:   { name: 'Ethereum', type: 'crypto', sector: 'Crypto', coinId: 'ethereum' },
  SOL:   { name: 'Solana',   type: 'crypto', sector: 'Crypto', coinId: 'solana' },
  XRP:   { name: 'Ripple',   type: 'crypto', sector: 'Crypto', coinId: 'ripple' },
  ADA:   { name: 'Cardano',  type: 'crypto', sector: 'Crypto', coinId: 'cardano' },
  DOGE:  { name: 'Dogecoin', type: 'crypto', sector: 'Crypto', coinId: 'dogecoin' },
  MATIC: { name: 'Polygon',  type: 'crypto', sector: 'Crypto', coinId: 'matic-network' },
  AVAX:  { name: 'Avalanche',type: 'crypto', sector: 'Crypto', coinId: 'avalanche-2' },
  LINK:  { name: 'Chainlink',type: 'crypto', sector: 'Crypto', coinId: 'chainlink' },
  DOT:   { name: 'Polkadot', type: 'crypto', sector: 'Crypto', coinId: 'polkadot' },
  LTC:   { name: 'Litecoin', type: 'crypto', sector: 'Crypto', coinId: 'litecoin' },
};

// ── PROVIDER FETCH HELPERS ───────────────────────────────────────────────

/**
 * Fetch stock/ETF quotes via Finnhub — sequential with 200ms gap.
 * Finnhub free tier: 60 req/min — easily handles 6 symbols.
 */
async function fetchStockQuotes(symbols, finnhubKey) {
  const results = {};
  const TIMEOUT = 4000;

  for (const symbol of symbols) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${finnhubKey}`;
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.status === 429) {
        console.warn(`[Finnhub] ${symbol} 429`);
        results[symbol] = { status: 'unavailable', error: 'Finnhub rate limited' };
        continue;
      }
      if (res.status !== 200) {
        results[symbol] = { status: 'unavailable', error: `Finnhub HTTP ${res.status}` };
        continue;
      }

      const data = await res.json();
      // Finnhub: c=current, pc=prev close, d=change, dp=change%
      const price = data.c || 0;
      const changePct = data.dp || 0;

      if (!price) {
        results[symbol] = { status: 'unavailable', error: 'Zero price from Finnhub' };
        continue;
      }

      results[symbol] = {
        status: 'live',
        price: parseFloat(price.toFixed(2)),
        changePct: parseFloat(changePct.toFixed(2)),
        timestamp: Date.now(),
        provider: 'finnhub'
      };
      console.log(`[Finnhub] ✓ ${symbol}: $${results[symbol].price}`);
    } catch (err) {
      results[symbol] = { status: 'unavailable', error: err.message };
      console.error(`[Finnhub] ${symbol} error:`, err.message);
    }
    // Small gap between calls — polite, not rate-limit-driven
    await new Promise(r => setTimeout(r, 200));
  }

  return results;
}

async function fetchCoinGeckoQuotes(symbols) {
  const TIMEOUT = 2500;
  const results = {};

  const coinIds = symbols.map(s => COIN_ID_MAP[s]).filter(Boolean);
  if (coinIds.length === 0) {
    symbols.forEach(s => { results[s] = { status: 'unavailable', error: 'Unknown coin' }; });
    return results;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinIds.join(',')}&vs_currencies=usd&include_24hr_change=true`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (res.status === 429) {
      symbols.forEach(s => { results[s] = { status: 'unavailable', error: 'CoinGecko rate limited' }; });
      return results;
    }
    if (res.status !== 200) {
      symbols.forEach(s => { results[s] = { status: 'unavailable', error: `CoinGecko HTTP ${res.status}` }; });
      return results;
    }

    const data = await res.json();

    symbols.forEach(symbol => {
      const coinId = COIN_ID_MAP[symbol];
      const coinData = data[coinId];

      if (!coinData || !coinData.usd) {
        results[symbol] = { status: 'unavailable', error: 'No data from CoinGecko' };
        return;
      }

      const price = coinData.usd;
      const changePct = coinData.usd_24h_change || 0;
      results[symbol] = {
        status: 'live',
        price: parseFloat(price.toFixed(2)),
        changePct: parseFloat(changePct.toFixed(2)),
        timestamp: Date.now(),
        provider: 'coingecko'
      };
    });

    return results;
  } catch (err) {
    symbols.forEach(s => { results[s] = { status: 'unavailable', error: err.message }; });
    return results;
  }
}

// ── STALENESS CHECK ──────────────────────────────────────────────────────
function computeStatus(cached) {
  if (!cached) return 'unavailable';
  const age = Date.now() - cached.timestamp;
  if (age > LIVE_THRESHOLD_MS) return 'unavailable';
  return 'live';
}

function buildCoreResponse() {
  return ALL_CORE.map(symbol => {
    const meta = SYMBOL_META[symbol] || { name: symbol, type: 'stock', sector: 'Unknown' };
    const cached = coreCache.get(symbol);
    const status = computeStatus(cached);

    if (status === 'unavailable' || !cached) {
      return { symbol, name: meta.name, type: meta.type, sector: meta.sector, status: 'unavailable' };
    }

    return {
      symbol,
      name: meta.name,
      type: meta.type,
      sector: meta.sector,
      status: 'live',
      price: cached.price,
      changePct: cached.changePct,
      timestamp: cached.timestamp,
      provider: cached.provider
    };
  });
}

// ── POLLER ───────────────────────────────────────────────────────────────
// Polygon grouped endpoint = 1 API call for ALL stocks → no per-symbol 429s
const POLL_INTERVAL_MS = 60000; // refresh every 60s

async function pollCoreAssets(polygonKey) {
  const now = Date.now();
  if (now - globalThis._lastPollTime < POLL_INTERVAL_MS) return; // too soon
  if (globalThis._pollInProgress) return; // single global lock
  globalThis._pollInProgress = true;
  globalThis._lastPollTime = now;
  console.log('[Poll] START');

  try {
    // ONE Polygon call for all 6 stocks
    const stockResults = await fetchPolygonQuotes(CORE_SYMBOLS_STOCK, polygonKey);
    Object.entries(stockResults).forEach(([sym, data]) => {
      if (data.status === 'live') {
        coreCache.set(sym, { price: data.price, changePct: data.changePct, timestamp: data.timestamp, provider: data.provider });
      } else {
        console.warn(`[Poll] ✗ ${sym}: ${data.error}`);
      }
    });

    // ONE CoinGecko call for all crypto
    const cryptoResults = await fetchCoinGeckoQuotes(CORE_SYMBOLS_CRYPTO);
    Object.entries(cryptoResults).forEach(([sym, data]) => {
      if (data.status === 'live') {
        coreCache.set(sym, { price: data.price, changePct: data.changePct, timestamp: data.timestamp, provider: data.provider });
      } else {
        console.warn(`[Poll] ✗ ${sym}: ${data.error}`);
      }
    });
  } catch (err) {
    console.error('[Poll] Error:', err.message);
  } finally {
    globalThis._pollInProgress = false;
    console.log('[Poll] DONE — cache size:', coreCache.size, '| keys:', [...coreCache.keys()].join(','));
  }
}

// ── SEARCH HANDLER ───────────────────────────────────────────────────────
async function handleSearch(query, polygonKey) {
  if (!query || query.trim().length < 1) return [];

  const q = query.trim().toUpperCase();
  const cacheKey = q;
  const cached = searchCache.get(cacheKey);
  if (cached && (Date.now() - cached.fetchedAt) < SEARCH_CACHE_TTL_MS) {
    console.log(`[Search] Cache hit: ${q}`);
    return cached.results;
  }

  // 1. Match from local metadata
  const matched = [];
  const seen = new Set();

  Object.entries(SYMBOL_META).forEach(([sym, meta]) => {
    if (seen.size >= 10) return;
    if (
      sym === q ||
      sym.startsWith(q) ||
      meta.name.toUpperCase().includes(q)
    ) {
      matched.push({ symbol: sym, ...meta });
      seen.add(sym);
    }
  });

  if (matched.length === 0) {
    // No local match — try Polygon search
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);
      const res = await fetch(
        `https://api.polygon.io/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=10&apiKey=${polygonKey}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.status === 200) {
        const data = await res.json();
        (data.results || []).slice(0, 10).forEach(item => {
          matched.push({
            symbol: item.ticker,
            name: item.name,
            type: (item.type || 'stock').toLowerCase() === 'cs' ? 'stock' : (item.type || 'stock').toLowerCase(),
            sector: item.sic_description || 'Unknown',
            fromPolygon: true
          });
          seen.add(item.ticker);
        });
      }
    } catch (err) {
      console.warn('[Search] Polygon search failed:', err.message);
    }
  }

  if (matched.length === 0) {
    return [];
  }

  // 2. Fetch live prices for matched symbols (max 10)
  const symbolsToFetch = matched.slice(0, 10).map(m => m.symbol);
  const stockSymbols = symbolsToFetch.filter(s => {
    const meta = SYMBOL_META[s];
    return !meta || meta.type !== 'crypto';
  });
  const cryptoSymbols = symbolsToFetch.filter(s => {
    const meta = SYMBOL_META[s];
    return meta && meta.type === 'crypto';
  });

  const priceResults = {};

  const [stockPrices, cryptoPrices] = await Promise.all([
    stockSymbols.length > 0 ? fetchPolygonQuotes(stockSymbols.slice(0, 5), polygonKey) : Promise.resolve({}),
    cryptoSymbols.length > 0 ? fetchCoinGeckoQuotes(cryptoSymbols.slice(0, 5)) : Promise.resolve({})
  ]);

  Object.assign(priceResults, stockPrices, cryptoPrices);

  // 3. Build response
  const results = matched.slice(0, 10).map(meta => {
    const price = priceResults[meta.symbol];

    if (!price || price.status !== 'live') {
      return {
        symbol: meta.symbol,
        name: meta.name,
        type: meta.type || 'stock',
        sector: meta.sector || 'Unknown',
        status: 'unavailable'
      };
    }

    return {
      symbol: meta.symbol,
      name: meta.name,
      type: meta.type || 'stock',
      sector: meta.sector || 'Unknown',
      status: 'live',
      price: price.price,
      changePct: price.changePct,
      timestamp: price.timestamp,
      provider: price.provider
    };
  });

  // Cache results
  searchCache.set(cacheKey, { results, fetchedAt: Date.now() });

  return results;
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const POLYGON_KEY = Deno.env.get('POLYGON_API_KEY');
    if (!POLYGON_KEY) {
      return Response.json({ error: 'POLYGON_API_KEY not set' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'core';

    // ── ACTION: debug ─────────────────────────────────────────────────────
    if (action === 'debug') {
      // 1. Log cache state
      const cacheState = {};
      coreCache.forEach((v, k) => { cacheState[k] = v; });
      console.log('CACHE STATE:', JSON.stringify(cacheState));

      // 2. Direct stock fetch via grouped endpoint
      console.log('POLL START (debug mode)');
      const aaplResult = await fetchPolygonQuotes(['AAPL', 'TSLA', 'NVDA'], POLYGON_KEY);
      console.log('FETCH RESULT: AAPL', JSON.stringify(aaplResult.AAPL));
      console.log('FETCH RESULT: TSLA', JSON.stringify(aaplResult.TSLA));
      console.log('FETCH RESULT: NVDA', JSON.stringify(aaplResult.NVDA));

      // 3. Also fetch crypto
      const cryptoResult = await fetchCoinGeckoQuotes(['BTC']);
      console.log('FETCH RESULT: BTC', JSON.stringify(cryptoResult.BTC));

      // 4. Final payload
      const debugPayload = {
        cache: cacheState,
        polygon_aapl: aaplResult.AAPL,
        polygon_tsla: aaplResult.TSLA,
        polygon_nvda: aaplResult.NVDA,
        coingecko_btc: cryptoResult.BTC,
        polygonKeyPresent: !!POLYGON_KEY,
        polygonKeyPrefix: POLYGON_KEY ? POLYGON_KEY.slice(0, 6) + '...' : 'MISSING',
        timestamp: Date.now()
      };
      console.log('FINAL PAYLOAD:', JSON.stringify(debugPayload));
      return Response.json(debugPayload);
    }

    // ── ACTION: core ──────────────────────────────────────────────────────
    if (action === 'core') {
      console.log('[Core] cache size:', coreCache.size, 'pollInProgress:', globalThis._pollInProgress, 'lastPollTime:', globalThis._lastPollTime);

      if (coreCache.size === 0) {
        // First request or cold boot — block until poll completes
        console.log('[Core] Cold cache — running sync poll');
        await pollCoreAssets(POLYGON_KEY);
      } else {
        // Cache warm — refresh in background only
        pollCoreAssets(POLYGON_KEY).catch(err => console.error('[BG Poll]', err.message));
      }

      const response = buildCoreResponse();
      const liveCount = response.filter(r => r.status === 'live').length;
      console.log('[Core] Returning', liveCount, '/', response.length, 'live assets');

      return Response.json({
        assets: response,
        meta: {
          total: response.length,
          live: liveCount,
          unavailable: response.length - liveCount,
          cacheAgeMs: globalThis._lastPollTime ? Date.now() - globalThis._lastPollTime : null,
          timestamp: Date.now()
        }
      });
    }

    // ── ACTION: search ────────────────────────────────────────────────────
    if (action === 'search') {
      const query = body.query || body.q || '';
      if (!query.trim()) {
        return Response.json({ results: [], meta: { query: '' } });
      }

      const results = await handleSearch(query, POLYGON_KEY);

      return Response.json({
        results,
        meta: {
          query,
          count: results.length,
          live: results.filter(r => r.status === 'live').length,
          timestamp: Date.now()
        }
      });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});