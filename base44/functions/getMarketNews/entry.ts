import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Map symbols/keywords → region + asset type
const REGION_KEYWORDS = {
  US: ['fed', 'nasdaq', 's&p', 'dow', 'sec', 'treasury', 'powell', 'fomc', 'wall street', 'nyse', 'us economy', 'dollar'],
  Europe: ['ecb', 'euro', 'dax', 'ftse', 'cac', 'lagarde', 'boe', 'european', 'germany', 'france', 'uk ', 'britain', 'paris', 'frankfurt', 'london', 'euronext'],
  Asia: ['boj', 'pboc', 'nikkei', 'hang seng', 'shanghai', 'china', 'japan', 'korea', 'hong kong', 'taiwan', 'tokyo', 'beijing', 'asia'],
  Crypto: ['bitcoin', 'ethereum', 'crypto', 'defi', 'blockchain', 'btc', 'eth', 'coinbase', 'binance', 'solana'],
};

const ASSET_TYPE_KEYWORDS = {
  Crypto:     ['bitcoin', 'ethereum', 'crypto', 'btc', 'eth', 'defi', 'blockchain', 'token', 'solana', 'binance'],
  Forex:      ['dollar', 'euro', 'yen', 'pound', 'currency', 'forex', 'fx', 'rate', 'usd', 'eur', 'gbp'],
  Commodities: ['gold', 'oil', 'silver', 'crude', 'commodity', 'brent', 'wheat', 'copper', 'natural gas', 'xau'],
  Stocks:     ['earnings', 'ipo', 'merger', 'acquisition', 'stock', 'equity', 'shares', 'dividend', 'buyback', 'guidance'],
};

function classify(text) {
  const lc = (text || '').toLowerCase();

  // Region
  let region = 'Global';
  for (const [r, kws] of Object.entries(REGION_KEYWORDS)) {
    if (kws.some(k => lc.includes(k))) { region = r; break; }
  }

  // Asset type (pick first match)
  let assetType = 'General';
  for (const [type, kws] of Object.entries(ASSET_TYPE_KEYWORDS)) {
    if (kws.some(k => lc.includes(k))) { assetType = type; break; }
  }

  // Simple sentiment heuristic
  const bullishWords = ['surge', 'rally', 'record', 'beat', 'soar', 'jump', 'gain', 'rise', 'bullish', 'strong', 'breakout', 'upgrade', 'buy'];
  const bearishWords = ['fall', 'drop', 'plunge', 'miss', 'crash', 'decline', 'warn', 'cut', 'bearish', 'sell', 'downgrade', 'loss', 'risk', 'concern'];
  const bullScore = bullishWords.filter(w => lc.includes(w)).length;
  const bearScore = bearishWords.filter(w => lc.includes(w)).length;
  const sentiment = bullScore > bearScore ? 'BULLISH' : bearScore > bullScore ? 'BEARISH' : 'NEUTRAL';

  return { region, assetType, sentiment };
}

// Extract mentioned tickers from text (rough heuristic: ALLCAPS 2-5 chars after $ or preceded by space)
function extractTickers(text) {
  const matches = (text || '').match(/\b[A-Z]{2,5}\b/g) || [];
  const STOP = new Set(['THE', 'AND', 'FOR', 'ARE', 'BUT', 'NOT', 'YOU', 'ALL', 'CAN', 'HER', 'WAS', 'ONE', 'OUR', 'OUT', 'DAY', 'GET', 'HAS', 'HIM', 'HIS', 'HOW', 'ITS', 'NEW', 'NOW', 'OLD', 'SEE', 'TWO', 'WAY', 'WHO', 'BOY', 'DID', 'ITS', 'LET', 'PUT', 'SAY', 'SHE', 'TOO', 'USE', 'AI', 'US', 'UK', 'EU', 'US', 'FX', 'IPO', 'GDP', 'CPI', 'ECB', 'FED', 'BOE', 'CEO', 'CFO', 'ETF', 'SEC', 'IMF']);
  return [...new Set(matches.filter(m => !STOP.has(m)))].slice(0, 4);
}

// Fetch asset-specific news from Finnhub (company news endpoint)
async function fetchAssetNews(symbol, FINNHUB_KEY) {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const res = await fetch(
    `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(symbol)}&from=${from}&to=${to}&token=${FINNHUB_KEY}`,
    { signal: AbortSignal.timeout(5000) }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (Array.isArray(data) ? data : []).slice(0, 8);
}

// Fetch category news from Finnhub
async function fetchCategoryNews(category, FINNHUB_KEY) {
  const res = await fetch(
    `https://finnhub.io/api/v1/news?category=${category}&token=${FINNHUB_KEY}`,
    { signal: AbortSignal.timeout(5000) }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');
    const body = await req.json().catch(() => ({}));
    const { symbol, region, assetType, limit = 15 } = body;

    let rawArticles = [];

    if (symbol) {
      // Asset-specific mode: fetch company news for the symbol
      const companyNews = await fetchAssetNews(symbol, FINNHUB_KEY);
      rawArticles = companyNews;

      // If few results, supplement with general news
      if (rawArticles.length < 4) {
        const general = await fetchCategoryNews('general', FINNHUB_KEY);
        rawArticles = [...rawArticles, ...general.slice(0, 10)];
      }
    } else {
      // Global feed: pull from multiple categories in parallel
      const [general, crypto, forex, merger] = await Promise.all([
        fetchCategoryNews('general', FINNHUB_KEY),
        fetchCategoryNews('crypto', FINNHUB_KEY),
        fetchCategoryNews('forex', FINNHUB_KEY),
        fetchCategoryNews('merger', FINNHUB_KEY),
      ]);
      // Interleave categories for diversity
      const pool = [];
      const maxEach = 8;
      [general.slice(0, maxEach), crypto.slice(0, maxEach), forex.slice(0, maxEach), merger.slice(0, maxEach)].forEach(arr => {
        arr.forEach((a, i) => { pool.splice(i * 4, 0, a); });
      });
      rawArticles = pool;
    }

    // Deduplicate by headline
    const seen = new Set();
    const deduped = rawArticles.filter(a => {
      if (!a.headline || seen.has(a.headline)) return false;
      seen.add(a.headline);
      return true;
    });

    // Classify and filter
    let articles = deduped
      .filter(a => a.headline && a.url)
      .map(a => {
        const combinedText = `${a.headline} ${a.summary || ''}`;
        const { region: r, assetType: at, sentiment } = classify(combinedText);
        return {
          id: a.id || Math.random(),
          title: a.headline,
          summary: a.summary || '',
          url: a.url,
          image: a.image || null,
          source: a.source || '',
          publishedAt: a.datetime ? new Date(a.datetime * 1000).toISOString() : null,
          age: a.datetime ? formatAge(a.datetime * 1000) : '',
          region: r,
          assetType: at,
          sentiment,
          tickers: symbol ? [symbol, ...extractTickers(a.headline)] : extractTickers(a.headline),
          relevanceScore: symbol
            ? ((a.headline || '').toLowerCase().includes(symbol.toLowerCase()) ? 10 : 5)
            : 7,
        };
      });

    // Apply region filter if requested
    if (region && region !== 'Global') {
      const filtered = articles.filter(a => a.region === region);
      // Fall back to all if filter returns too few
      articles = filtered.length >= 3 ? filtered : articles;
    }

    // Apply asset type filter
    if (assetType && assetType !== 'All') {
      const filtered = articles.filter(a => a.assetType === assetType);
      articles = filtered.length >= 3 ? filtered : articles;
    }

    // Sort by relevance (symbol matches first) then recency
    articles.sort((a, b) => b.relevanceScore - a.relevanceScore || (b.publishedAt > a.publishedAt ? 1 : -1));

    return Response.json({ articles: articles.slice(0, limit) });
  } catch (error) {
    return Response.json({ error: error.message, articles: [] }, { status: 500 });
  }
});

function formatAge(ms) {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}