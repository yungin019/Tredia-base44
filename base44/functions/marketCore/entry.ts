/**
 * marketCore — the Markets screen's price feed.
 *
 * action=core   → price for the 8 core assets
 * action=search → local symbol match + live quote
 * action=debug  → cache + provider probe
 *
 * Pricing goes through ../../shared/marketQuotes.ts (Finnhub for stocks,
 * TwelveData for crypto, each with the other as fallback, 60s cache,
 * single-flight). There is no poll guard any more: the previous version
 * returned an empty cache to any request that arrived while a cold poll was
 * already running, which is why concurrent page loads showed all eight core
 * assets as "Unavailable / Offline".
 */
import { getQuote, getQuotes, isCryptoSymbol } from '../../shared/marketQuotes.ts';

const CORE_SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'AMZN', 'SPY', 'QQQ', 'BTC', 'ETH'];
const SEARCH_MATCH_LIMIT = 10;
const SEARCH_QUOTE_LIMIT = 5;

const SYMBOL_META: Record<string, { name: string; type: string; sector: string }> = {
  AAPL: { name: 'Apple', type: 'stock', sector: 'Technology' },
  NVDA: { name: 'NVIDIA', type: 'stock', sector: 'Technology' },
  TSLA: { name: 'Tesla', type: 'stock', sector: 'Automotive' },
  AMZN: { name: 'Amazon', type: 'stock', sector: 'Technology' },
  MSFT: { name: 'Microsoft', type: 'stock', sector: 'Technology' },
  META: { name: 'Meta', type: 'stock', sector: 'Technology' },
  GOOGL: { name: 'Google', type: 'stock', sector: 'Technology' },
  GOOG: { name: 'Google C', type: 'stock', sector: 'Technology' },
  NFLX: { name: 'Netflix', type: 'stock', sector: 'Media' },
  COIN: { name: 'Coinbase', type: 'stock', sector: 'Crypto' },
  AMD: { name: 'Advanced Micro Devices', type: 'stock', sector: 'Technology' },
  INTC: { name: 'Intel', type: 'stock', sector: 'Technology' },
  QCOM: { name: 'Qualcomm', type: 'stock', sector: 'Technology' },
  CRM: { name: 'Salesforce', type: 'stock', sector: 'Software' },
  ADBE: { name: 'Adobe', type: 'stock', sector: 'Software' },
  SNOW: { name: 'Snowflake', type: 'stock', sector: 'Software' },
  DDOG: { name: 'Datadog', type: 'stock', sector: 'Software' },
  SPOT: { name: 'Spotify', type: 'stock', sector: 'Media' },
  UBER: { name: 'Uber', type: 'stock', sector: 'Technology' },
  LYFT: { name: 'Lyft', type: 'stock', sector: 'Technology' },
  ABNB: { name: 'Airbnb', type: 'stock', sector: 'Travel' },
  PLTR: { name: 'Palantir', type: 'stock', sector: 'Software' },
  JPM: { name: 'JPMorgan Chase', type: 'stock', sector: 'Finance' },
  BAC: { name: 'Bank of America', type: 'stock', sector: 'Finance' },
  GS: { name: 'Goldman Sachs', type: 'stock', sector: 'Finance' },
  BLK: { name: 'BlackRock', type: 'stock', sector: 'Finance' },
  JNJ: { name: 'Johnson & Johnson', type: 'stock', sector: 'Healthcare' },
  PFE: { name: 'Pfizer', type: 'stock', sector: 'Healthcare' },
  ABBV: { name: 'AbbVie', type: 'stock', sector: 'Healthcare' },
  MRK: { name: 'Merck', type: 'stock', sector: 'Healthcare' },
  WMT: { name: 'Walmart', type: 'stock', sector: 'Retail' },
  KO: { name: 'Coca-Cola', type: 'stock', sector: 'Beverages' },
  PEP: { name: 'PepsiCo', type: 'stock', sector: 'Food & Beverage' },
  MCD: { name: "McDonald's", type: 'stock', sector: 'Restaurant' },
  TSM: { name: 'TSMC', type: 'stock', sector: 'Semiconductors' },
  ARM: { name: 'Arm Holdings', type: 'stock', sector: 'Semiconductors' },
  SMCI: { name: 'Super Micro Computer', type: 'stock', sector: 'Hardware' },
  RBLX: { name: 'Roblox', type: 'stock', sector: 'Gaming' },
  UPST: { name: 'Upstart', type: 'stock', sector: 'FinTech' },
  SPY: { name: 'S&P 500 ETF', type: 'etf', sector: 'Index' },
  QQQ: { name: 'Nasdaq 100 ETF', type: 'etf', sector: 'Index' },
  DIA: { name: 'Dow Jones ETF', type: 'etf', sector: 'Index' },
  VOO: { name: 'Vanguard S&P 500', type: 'etf', sector: 'Index' },
  VTI: { name: 'Vanguard Total Stock', type: 'etf', sector: 'Index' },
  IWM: { name: 'Russell 2000 ETF', type: 'etf', sector: 'Index' },
  ARKK: { name: 'ARK Innovation ETF', type: 'etf', sector: 'Growth' },
  GLD: { name: 'Gold Trust ETF', type: 'etf', sector: 'Commodities' },
  SLV: { name: 'Silver Trust ETF', type: 'etf', sector: 'Commodities' },
  XLK: { name: 'Tech Select Sector ETF', type: 'etf', sector: 'Technology' },
  XLF: { name: 'Finance Select ETF', type: 'etf', sector: 'Finance' },
  XLE: { name: 'Energy Select ETF', type: 'etf', sector: 'Energy' },
  TLT: { name: 'Long Treasury ETF', type: 'etf', sector: 'Fixed Income' },
  SCHD: { name: 'Schwab Dividend ETF', type: 'etf', sector: 'Dividend' },
  BTC: { name: 'Bitcoin', type: 'crypto', sector: 'Crypto' },
  ETH: { name: 'Ethereum', type: 'crypto', sector: 'Crypto' },
  SOL: { name: 'Solana', type: 'crypto', sector: 'Crypto' },
  XRP: { name: 'Ripple', type: 'crypto', sector: 'Crypto' },
  ADA: { name: 'Cardano', type: 'crypto', sector: 'Crypto' },
  DOGE: { name: 'Dogecoin', type: 'crypto', sector: 'Crypto' },
  MATIC: { name: 'Polygon', type: 'crypto', sector: 'Crypto' },
  AVAX: { name: 'Avalanche', type: 'crypto', sector: 'Crypto' },
  LINK: { name: 'Chainlink', type: 'crypto', sector: 'Crypto' },
  DOT: { name: 'Polkadot', type: 'crypto', sector: 'Crypto' },
  LTC: { name: 'Litecoin', type: 'crypto', sector: 'Crypto' },
};

const metaFor = (symbol: string) => SYMBOL_META[symbol] || { name: symbol, type: 'stock', sector: 'Unknown' };

function assetPayload(symbol: string, quote: any) {
  const meta = metaFor(symbol);
  if (!quote || !(quote.price > 0)) {
    return { symbol, name: meta.name, type: meta.type, sector: meta.sector, status: 'unavailable' };
  }
  return {
    symbol,
    name: meta.name,
    type: meta.type,
    sector: meta.sector,
    status: 'live',
    price: quote.price,
    changePct: quote.changePct ?? 0,
    timestamp: quote.fetchedAt,
    provider: quote.source,
    ...(quote.stale ? { stale: true } : {}),
  };
}

function matchSymbols(query: string) {
  const q = query.toUpperCase();
  const matched: string[] = [];
  for (const symbol of Object.keys(SYMBOL_META)) {
    if (matched.length >= SEARCH_MATCH_LIMIT) break;
    const meta = SYMBOL_META[symbol];
    if (symbol === q || symbol.startsWith(q) || meta.name.toUpperCase().includes(q)) {
      matched.push(symbol);
    }
  }
  return matched;
}

async function handleSearch(query: string) {
  const matched = matchSymbols(query);
  if (matched.length === 0) return [];

  const quotes = await getQuotes(matched.slice(0, SEARCH_QUOTE_LIMIT));
  return matched.map((symbol) => assetPayload(symbol, quotes[symbol]));
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action || 'core';

    if (action === 'debug') {
      const [aapl, btc] = await Promise.all([getQuote('AAPL'), getQuote('BTC')]);
      return Response.json({
        aapl,
        btc,
        finnhubKeyPresent: !!Deno.env.get('FINNHUB_API_KEY'),
        twelveKeyPresent: !!Deno.env.get('TWELVEDATA_API_KEY'),
        timestamp: Date.now(),
      });
    }

    if (action === 'core') {
      const quotes = await getQuotes(CORE_SYMBOLS);
      const assets = CORE_SYMBOLS.map((symbol) => assetPayload(symbol, quotes[symbol]));
      const live = assets.filter((a) => a.status === 'live').length;
      console.log(`[Core] ${live}/${assets.length} live — ${assets.filter((a) => a.status === 'live').map((a) => `${a.symbol}:${a.provider}`).join(', ')}`);
      return Response.json({
        assets,
        meta: { total: assets.length, live, unavailable: assets.length - live, timestamp: Date.now() },
      });
    }

    if (action === 'search') {
      const query = String(body.query || body.q || '').trim();
      if (!query) return Response.json({ results: [], meta: { query: '' } });
      const results = await handleSearch(query);
      return Response.json({
        results,
        meta: {
          query,
          count: results.length,
          live: results.filter((r) => r.status === 'live').length,
          timestamp: Date.now(),
        },
      });
    }

    if (action === 'crypto') {
      // Kept for callers that still ask for the crypto pair explicitly.
      const quote = await getQuote(String(body.symbol || 'BTC'));
      return Response.json({ quote, isCrypto: isCryptoSymbol(String(body.symbol || '')) });
    }

    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error) {
    console.error('[marketCore] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});