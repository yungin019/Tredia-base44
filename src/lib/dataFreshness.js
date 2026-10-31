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