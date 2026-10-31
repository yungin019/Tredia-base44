import { invokeFunction } from '@/api/functionsClient';
import { fetchCryptoData, fetchFearGreed } from '@/api/marketData';

/**
 * Shared market context for the TREK engine.
 *
 * Prices, 24h changes and Fear & Greed come from the SAME cached calls the
 * quote screens use (fetchCryptoData / fetchFearGreed), so a signal can never
 * quote a different 24h change than the quote it refers to.
 */

export async function fetchStockRSI(symbol) {
  try {
    const res = await invokeFunction('marketAggregator', { type: 'rsi', symbol });
    const rsi = Number(res?.rsi);
    // No RSI from the provider means no RSI — a made-up 55 is worse than none.
    return Number.isFinite(rsi) ? rsi : null;
  } catch {
    return null;
  }
}

export async function fetchStockPrice(symbol) {
  try {
    // stockPrices is the quote source every price display on the app reads.
    const res = await invokeFunction('stockPrices', { symbols: [symbol] });
    const q = res?.prices?.[symbol];
    const price = Number(q?.price);
    if (!(price > 0)) return null;
    const prevClose = Number(q?.prevClose) > 0 ? Number(q.prevClose) : null;
    const change24h = prevClose
      ? ((price - prevClose) / prevClose) * 100
      : (Number.isFinite(Number(q?.change)) ? Number(q.change) : null);
    return { price, change24h };
  } catch {
    return null;
  }
}

export async function buildMarketContext(userPortfolio = null) {
  const [fng, crypto] = await Promise.all([fetchFearGreed(), fetchCryptoData()]);
  const btc = crypto?.find(c => c.symbol === 'BTC') || null;
  const eth = crypto?.find(c => c.symbol === 'ETH') || null;

  return {
    fng_value: fng?.value ?? null,
    fng_label: fng?.classification ?? null,
    btc_price: btc?.price ?? null,
    btc_change_24h: btc?.change24h ?? null,
    eth_price: eth?.price ?? null,
    eth_change_24h: eth?.change24h ?? null,
    portfolio: userPortfolio,
    timestamp: new Date().toISOString(),
  };
}