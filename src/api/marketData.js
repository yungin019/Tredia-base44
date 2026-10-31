import { invokeFunction } from '@/api/functionsClient';

// ── One shared source for quotes and signals ────────────────────────────────
// A 60s module cache plus a single in-flight request, so the crypto quotes, the
// crypto signals and the Fear & Greed gauges all read the exact same numbers.
const CACHE_TTL = 60 * 1000;
let cryptoCache = { at: 0, data: null };
let cryptoInFlight = null;
let fngCache = { at: 0, data: null };
let fngInFlight = null;

async function requestCrypto() {
  // Same quote pipeline as every other price in the app (stockPrices → marketCore),
  // so a crypto signal can never disagree with the crypto quote it refers to.
  const symbols = ['BTC', 'ETH', 'SOL'];
  try {
    const res = await invokeFunction('stockPrices', { symbols });
    const prices = res?.prices || {};
    return symbols.map(symbol => {
      const q = prices[symbol];
      const price = Number(q?.price);
      if (!(price > 0)) return { symbol, price: null, change24h: null };
      const prevClose = Number(q?.prevClose);
      const change24h = prevClose > 0
        ? ((price - prevClose) / prevClose) * 100
        : (Number.isFinite(Number(q?.change)) ? Number(q.change) : null);
      return { symbol, price, change24h };
    });
  } catch {
    return null;
  }
}

export async function fetchCryptoData() {
  if (cryptoCache.data && Date.now() - cryptoCache.at < CACHE_TTL) return cryptoCache.data;
  if (cryptoInFlight) return cryptoInFlight;
  cryptoInFlight = requestCrypto()
    .then(data => {
      if (data) cryptoCache = { at: Date.now(), data };
      return data;
    })
    .finally(() => { cryptoInFlight = null; });
  return cryptoInFlight;
}

async function requestFearGreed() {
  try {
    const res = await fetch('https://api.alternative.me/fng/');
    const data = await res.json();
    const item = data.data?.[0];
    if (!item) return null;
    return { value: parseInt(item.value), classification: item.value_classification };
  } catch {
    return null;
  }
}

export async function fetchFearGreed() {
  if (fngCache.data && Date.now() - fngCache.at < CACHE_TTL) return fngCache.data;
  if (fngInFlight) return fngInFlight;
  fngInFlight = requestFearGreed()
    .then(data => {
      if (data) fngCache = { at: Date.now(), data };
      return data;
    })
    .finally(() => { fngInFlight = null; });
  return fngInFlight;
}