import { invokeFunction } from '@/api/functionsClient';

/**
 * Commodity definitions only — no prices, no signals.
 * Prices come from the same quote pipeline every other screen uses (stockPrices)
 * and stay blank when the provider has no data, instead of showing a stale number.
 */
export const COMMODITIES = [
  { symbol: 'XAUUSD', name: 'Gold',              icon: '🥇', unit: '/oz' },
  { symbol: 'XAGUSD', name: 'Silver',            icon: '🥈', unit: '/oz' },
  { symbol: 'XPTUSD', name: 'Platinum',          icon: '⚪', unit: '/oz' },
  { symbol: 'XPDUSD', name: 'Palladium',         icon: '⚫', unit: '/oz' },
  { symbol: 'USOIL',  name: 'Crude Oil (WTI)',   icon: '🛢️', unit: '/bbl' },
  { symbol: 'UKOIL',  name: 'Brent Crude',       icon: '🛢️', unit: '/bbl' },
  { symbol: 'NATGAS', name: 'Natural Gas',       icon: '🔥', unit: '/MMBtu' },
  { symbol: 'COPPER', name: 'Copper',            icon: '🔶', unit: '/lb' },
];

export async function fetchCommodityPrices() {
  let prices = {};
  try {
    const res = await invokeFunction('stockPrices', { symbols: COMMODITIES.map(c => c.symbol) });
    prices = res?.prices || {};
  } catch {
    prices = {};
  }

  return COMMODITIES.map(c => {
    const q = prices[c.symbol];
    const price = Number(q?.price);
    const prevClose = Number(q?.prevClose);
    const change = price > 0 && prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : null;
    return { ...c, price: price > 0 ? price : null, change };
  });
}