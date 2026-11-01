/**
 * Shared quote + chart-series layer for every market screen.
 *
 * Rules it enforces, per isolate:
 *  - one provider call per symbol per 60s quote window (cached, and single-flight:
 *    concurrent callers await the same in-flight request instead of re-fetching)
 *  - chart series cached for 60s (intraday) / 1h (daily and above)
 *  - stocks: Finnhub first, TwelveData as fallback; crypto: CoinGecko first
 *    (free Demo key), TwelveData as fallback
 *  - last known real quote/series is served (flagged stale) before ever
 *    reporting "unavailable"
 *  - a provider that answers 429 / "credits" is parked for 60s so a rate limit
 *    cannot burn the remaining budget
 */

import { logDiag } from './diagLog.ts';

const QUOTE_TTL_MS = 60_000;
const INTRADAY_TTL_MS = 60_000;
const DAILY_TTL_MS = 3_600_000;
const COOLDOWN_MS = 60_000;

const CRYPTO = new Set([
  'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 'AVAX',
  'LINK', 'UNI', 'DOT', 'ATOM', 'LTC', 'BCH',
]);

// CoinGecko addresses coins by id, not ticker.
const COINGECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  LINK: 'chainlink',
  UNI: 'uniswap',
  DOT: 'polkadot',
  ATOM: 'cosmos',
  LTC: 'litecoin',
  BCH: 'bitcoin-cash',
};

// Finnhub quotes crypto as exchange pairs.
const FINNHUB_PAIRS: Record<string, string> = {
  BTC: 'BINANCE:BTCUSDT',
  ETH: 'BINANCE:ETHUSDT',
  SOL: 'BINANCE:SOLUSDT',
  XRP: 'BINANCE:XRPUSDT',
  ADA: 'BINANCE:ADAUSDT',
  DOGE: 'BINANCE:DOGEUSDT',
  AVAX: 'BINANCE:AVAXUSDT',
  LINK: 'BINANCE:LINKUSDT',
  DOT: 'BINANCE:DOTUSDT',
  LTC: 'BINANCE:LTCUSDT',
};

const TIMEFRAMES: Record<string, { interval: string; outputsize: number; ttl: number }> = {
  '1D': { interval: '15min', outputsize: 78, ttl: INTRADAY_TTL_MS },
  '1W': { interval: '1h', outputsize: 120, ttl: INTRADAY_TTL_MS },
  '1M': { interval: '1day', outputsize: 30, ttl: DAILY_TTL_MS },
  '3M': { interval: '1day', outputsize: 90, ttl: DAILY_TTL_MS },
  '1Y': { interval: '1week', outputsize: 52, ttl: DAILY_TTL_MS },
};

const store = globalThis as any;
store.__tredioQuotes = store.__tredioQuotes || {
  quotes: new Map(),
  series: new Map(),
  quoteInflight: new Map(),
  seriesInflight: new Map(),
  cooldown: new Map(),
};
const cache = store.__tredioQuotes;

export const isCryptoSymbol = (symbol: string) => CRYPTO.has(String(symbol || '').toUpperCase());

const upper = (value: any) => String(value || '').trim().toUpperCase();

function parked(provider: string) {
  return Date.now() < (cache.cooldown.get(provider) || 0);
}

function park(provider: string, reason: string) {
  cache.cooldown.set(provider, Date.now() + COOLDOWN_MS);
  console.warn(`[quotes] ${provider} parked for ${COOLDOWN_MS / 1000}s — ${reason}`);
}

function quoteShape(raw: any, symbol: string) {
  const price = Number(raw.price);
  const prevClose = Number(raw.prevClose) > 0 ? Number(raw.prevClose) : null;
  const changePct = prevClose
    ? ((price - prevClose) / prevClose) * 100
    : (Number.isFinite(Number(raw.changePct)) ? Number(raw.changePct) : null);
  return {
    symbol,
    price: Math.round(price * 100) / 100,
    prevClose: prevClose === null ? null : Math.round(prevClose * 100) / 100,
    change: Number.isFinite(changePct) ? Math.round((price - (prevClose || price)) * 100) / 100 : null,
    changePct: Number.isFinite(changePct) ? Math.round(Number(changePct) * 100) / 100 : null,
    high: Number(raw.high) > 0 ? Number(raw.high) : null,
    low: Number(raw.low) > 0 ? Number(raw.low) : null,
    open: Number(raw.open) > 0 ? Number(raw.open) : null,
    source: raw.source,
    fetchedAt: Date.now(),
    stale: false,
  };
}

async function finnhubQuote(symbol: string, key: string) {
  if (!key) throw new Error('FINNHUB_API_KEY not set');
  if (parked('finnhub')) throw new Error('finnhub parked after a rate limit');
  const providerSymbol = FINNHUB_PAIRS[symbol] || symbol;
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(providerSymbol)}&token=${key}`,
    { signal: AbortSignal.timeout(6000) },
  );
  if (res.status === 429) {
    park('finnhub', 'HTTP 429');
    throw new Error('finnhub HTTP 429');
  }
  if (!res.ok) throw new Error(`finnhub HTTP ${res.status}`);
  const d = await res.json();
  if (!(Number(d?.c) > 0)) throw new Error('finnhub returned no price');
  return quoteShape(
    { price: d.c, prevClose: d.pc, high: d.h, low: d.l, open: d.o, changePct: d.dp, source: 'finnhub' },
    symbol,
  );
}

/** Crypto: CoinGecko's simple/price endpoint, authenticated with the Demo key. */
async function coinGeckoQuote(symbol: string) {
  const id = COINGECKO_IDS[symbol];
  if (!id) throw new Error(`coingecko has no id for ${symbol}`);
  if (parked('coingecko')) throw new Error('coingecko parked after a rate limit');

  const key = Deno.env.get('COINGECKO_API_KEY') || '';
  const headers: Record<string, string> = { accept: 'application/json' };
  if (key) headers['x-cg-demo-api-key'] = key;

  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`,
    { headers, signal: AbortSignal.timeout(7000) },
  );
  if (res.status === 429) {
    park('coingecko', 'HTTP 429');
    throw new Error('coingecko HTTP 429');
  }
  if (!res.ok) throw new Error(`coingecko HTTP ${res.status}`);

  const d = await res.json().catch(() => ({}));
  const price = Number(d?.[id]?.usd);
  if (!(price > 0)) throw new Error('coingecko returned no price');
  const changePct = Number(d?.[id]?.usd_24h_change);
  return quoteShape(
    {
      price,
      prevClose: Number.isFinite(changePct) ? price / (1 + changePct / 100) : null,
      changePct,
      source: 'coingecko',
    },
    symbol,
  );
}

async function twelveQuote(symbol: string) {
  const key = Deno.env.get('TWELVEDATA_API_KEY') || '';
  if (!key) throw new Error('TWELVEDATA_API_KEY not set');
  if (parked('twelvedata')) throw new Error('twelvedata parked after a rate limit');
  const providerSymbol = isCryptoSymbol(symbol) ? `${symbol}/USD` : symbol;
  const res = await fetch(
    `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(providerSymbol)}&apikey=${key}`,
    { signal: AbortSignal.timeout(8000) },
  );
  const d = await res.json().catch(() => ({}));
  const message = String(d?.message || '');
  if (res.status === 429 || d?.code === 429 || /rate limit|credits|limit reached/i.test(message)) {
    park('twelvedata', message || 'HTTP 429');
    throw new Error(`twelvedata: ${message || 'HTTP 429'}`);
  }
  if (!(Number(d?.close) > 0)) throw new Error(`twelvedata: ${message || 'no price'}`);
  return quoteShape(
    {
      price: d.close,
      prevClose: d.previous_close
        ? Number(d.previous_close)
        : (Number(d.close) / (1 + Number(d.percent_change || 0) / 100)),
      high: d.high,
      low: d.low,
      open: d.open,
      changePct: d.percent_change,
      source: 'twelvedata',
    },
    symbol,
  );
}

/** One quote, cached 60s. Concurrent callers share a single provider request. */
export async function getQuote(rawSymbol: string) {
  const symbol = upper(rawSymbol);
  if (!symbol) return null;

  const cached = cache.quotes.get(symbol);
  if (cached && Date.now() - cached.fetchedAt < QUOTE_TTL_MS) {
    return { ...cached, stale: false };
  }

  const pending = cache.quoteInflight.get(symbol);
  if (pending) return pending;

  const finnhubKey = Deno.env.get('FINNHUB_API_KEY') || '';
  const providers = isCryptoSymbol(symbol) && COINGECKO_IDS[symbol]
    ? ['coingecko', 'twelvedata']
    : ['finnhub', 'twelvedata'];

  const task = (async () => {
    for (const provider of providers) {
      const startedAt = Date.now();
      try {
        const quote = provider === 'finnhub'
          ? await finnhubQuote(symbol, finnhubKey)
          : provider === 'coingecko'
            ? await coinGeckoQuote(symbol)
            : await twelveQuote(symbol);
        cache.quotes.set(symbol, quote);
        logDiag({ type: 'provider_ok', source: provider, ok: true, durationMs: Date.now() - startedAt });
        return quote;
      } catch (error) {
        console.warn(`[quotes] ${symbol} via ${provider} failed: ${error.message}`);
        logDiag({
          type: /429|rate limit|credits|parked/i.test(error.message) ? 'provider_rate_limit' : 'provider_error',
          source: provider,
          ok: false,
          durationMs: Date.now() - startedAt,
          detail: `${symbol}: ${error.message}`,
        });
      }
    }
    if (cached) {
      console.warn(`[quotes] ${symbol} serving last known quote (${Math.round((Date.now() - cached.fetchedAt) / 1000)}s old)`);
      return { ...cached, stale: true };
    }
    console.error(`[quotes] ${symbol} unavailable from every provider`);
    return null;
  })();

  cache.quoteInflight.set(symbol, task);
  try {
    return await task;
  } finally {
    cache.quoteInflight.delete(symbol);
  }
}

/** Batch quotes (parallel, but each symbol is fetched at most once per window). */
export async function getQuotes(symbols: string[]) {
  const list = Array.from(new Set((symbols || []).map(upper).filter(Boolean)));
  const pairs = await Promise.all(list.map(async (symbol) => [symbol, await getQuote(symbol)] as const));
  const out: Record<string, any> = {};
  pairs.forEach(([symbol, quote]) => { out[symbol] = quote; });
  return out;
}

/** CoinGecko candle windows: 1D is 30-min bars, 1W onwards 4-hour bars. */
const COINGECKO_OHLC_DAYS: Record<string, string> = {
  '1D': '1', '1W': '7', '1M': '30', '3M': '90', '1Y': '365',
};

/**
 * Crypto candles from CoinGecko — the same provider that prices crypto here, so
 * the chart and the quote can never disagree. OHLC endpoint, not a synthesized
 * series: real open/high/low/close for the candlestick view.
 */
async function coinGeckoSeries(symbol: string, timeframe: string) {
  const id = COINGECKO_IDS[symbol];
  if (!id) throw new Error(`coingecko has no id for ${symbol}`);
  if (parked('coingecko')) throw new Error('coingecko parked after a rate limit');

  const key = Deno.env.get('COINGECKO_API_KEY') || '';
  const headers: Record<string, string> = { accept: 'application/json' };
  if (key) headers['x-cg-demo-api-key'] = key;

  const days = COINGECKO_OHLC_DAYS[timeframe] || '1';
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=${days}`,
    { headers, signal: AbortSignal.timeout(9000) },
  );
  if (res.status === 429) {
    park('coingecko', 'HTTP 429');
    throw new Error('coingecko HTTP 429');
  }
  if (!res.ok) throw new Error(`coingecko ohlc HTTP ${res.status}`);

  const rows = await res.json().catch(() => []);
  const intraday = timeframe === '1D' || timeframe === '1W';
  const bars = (Array.isArray(rows) ? rows : [])
    .map((r: any[]) => {
      const stamp = new Date(Number(r[0]));
      const date = Number.isNaN(stamp.getTime())
        ? ''
        : intraday
          ? stamp.toISOString().slice(0, 16).replace('T', ' ')
          : stamp.toISOString().slice(0, 10);
      return { date, open: Number(r[1]), high: Number(r[2]), low: Number(r[3]), close: Number(r[4]) };
    })
    .filter((b) => b.date && Number.isFinite(b.close) && b.close > 0 && Number.isFinite(b.high));

  if (bars.length === 0) throw new Error('coingecko ohlc returned no bars');
  return bars;
}

async function twelveSeries(symbol: string, interval: string, outputsize: number) {
  const key = Deno.env.get('TWELVEDATA_API_KEY') || '';
  if (!key) throw new Error('TWELVEDATA_API_KEY not set');
  if (parked('twelvedata')) throw new Error('twelvedata parked after a rate limit');
  const providerSymbol = isCryptoSymbol(symbol) ? `${symbol}/USD` : symbol;
  const res = await fetch(
    `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(providerSymbol)}&interval=${interval}&outputsize=${outputsize}&apikey=${key}`,
    { signal: AbortSignal.timeout(10000) },
  );
  const d = await res.json().catch(() => ({}));
  const message = String(d?.message || '');
  if (res.status === 429 || d?.code === 429 || /rate limit|credits|limit reached/i.test(message)) {
    park('twelvedata', message || 'HTTP 429');
    throw new Error(`twelvedata series: ${message || 'HTTP 429'}`);
  }
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
    .filter((bar: any) => Number.isFinite(bar.close) && Number.isFinite(bar.high) && Number.isFinite(bar.low));
}

/**
 * OHLC series for a timeframe. 60s cache for intraday (1D/1W), 1h for daily
 * and above. Falls back to a coarser interval, then to the last cached series.
 */
export async function getSeries(rawSymbol: string, rawTimeframe: string = '1D') {
  const symbol = upper(rawSymbol);
  const timeframe = TIMEFRAMES[upper(rawTimeframe)] ? upper(rawTimeframe) : '1D';
  const cfg = TIMEFRAMES[timeframe];
  const key = `${symbol}:${timeframe}`;
  if (!symbol) return { chartData: [], source: 'unavailable', interval: cfg.interval };

  const cached = cache.series.get(key);
  if (cached && Date.now() - cached.fetchedAt < cfg.ttl) {
    return { chartData: cached.chartData, source: cached.source, interval: cached.interval, cached: true };
  }

  const pending = cache.seriesInflight.get(key);
  if (pending) return pending;

  const task = (async () => {
    // Crypto candles come from CoinGecko first (the app's crypto price source),
    // then TwelveData; equities only ever come from TwelveData.
    const attempts: { provider: 'coingecko' | 'twelvedata'; interval: string }[] =
      isCryptoSymbol(symbol) && COINGECKO_IDS[symbol]
        ? [{ provider: 'coingecko', interval: cfg.interval }, { provider: 'twelvedata', interval: cfg.interval }]
        : [{ provider: 'twelvedata', interval: cfg.interval }];
    const coarser = timeframe === '1Y' ? '1week' : '1day';
    if (!attempts.some((a) => a.interval === coarser)) {
      attempts.push({ provider: 'twelvedata', interval: coarser });
    }

    for (const { provider, interval } of attempts) {
      try {
        const chartData = provider === 'coingecko'
          ? await coinGeckoSeries(symbol, timeframe)
          : await twelveSeries(symbol, interval, cfg.outputsize);
        if (chartData.length > 0) {
          const result = { chartData, source: provider, interval, cached: false };
          cache.series.set(key, { ...result, fetchedAt: Date.now() });
          return result;
        }
      } catch (error) {
        console.warn(`[quotes] ${symbol} ${timeframe} via ${provider} failed: ${error.message}`);
        logDiag({ type: 'provider_error', source: provider, ok: false, detail: `series ${symbol} ${timeframe}: ${error.message}` });
      }
    }

    if (cached) {
      console.warn(`[quotes] ${symbol} ${timeframe} serving last known series`);
      return { chartData: cached.chartData, source: cached.source, interval: cached.interval, stale: true };
    }
    return { chartData: [], source: 'unavailable', interval: cfg.interval };
  })();

  cache.seriesInflight.set(key, task);
  try {
    return await task;
  } finally {
    cache.seriesInflight.delete(key);
  }
}