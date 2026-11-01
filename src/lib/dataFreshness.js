/**
 * Single source of truth for how fresh our market data really is.
 *
 * Our quotes come from delayed provider feeds (Finnhub / TwelveData) and are
 * re-fetched at most once a minute, so the app must never label them "LIVE"
 * or "Real-time". Every badge and note in the app reads its wording from
 * here, so the claim can only change in one place.
 */
export const PRICE_DATA_LABEL = 'Delayed 15 min';
export const PRICE_DATA_BADGE = '15M DELAY';
export const PRICE_DATA_SHORT = 'Delayed';
export const PRICE_DATA_CADENCE = 'Refreshes every 60s';

/**
 * Crypto has its own, faster pipeline: CoinGecko answers with a spot price that
 * is refreshed every 60 seconds, so a crypto screen must show its real
 * freshness. The 15-minute delay wording belongs to the equity feeds only.
 */
export const CRYPTO_DATA_SOURCE = 'coingecko';

export const isCryptoFeed = (sourceName) => String(sourceName || '') === CRYPTO_DATA_SOURCE;

/** "Updated ~1 min · CoinGecko" for crypto, the delayed-feed label otherwise. */
export function freshnessLabel({ source, fetchedAt } = {}) {
  if (!isCryptoFeed(source)) return PRICE_DATA_LABEL;
  const mins = fetchedAt ? Math.max(0, Math.round((Date.now() - Number(fetchedAt)) / 60000)) : 0;
  return `Updated ~${Math.max(1, mins)} min · CoinGecko`;
}