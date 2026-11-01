/**
 * Shared news taxonomy + ordering helpers.
 *
 * The backend already scores, classifies and deduplicates every article once;
 * this file only holds the labels the UI renders and the per-user ordering that
 * needs no extra request (watchlist / portfolio symbols, already loaded).
 */

export const NEWS_CATEGORIES = ['Macro', 'Stocks', 'Crypto', 'Commodities', 'Geopolitics'];

// The feed's region chips. 'All' is the default and sends no filter.
export const NEWS_REGIONS = ['US', 'Nordics', 'Europe', 'Asia', 'Latin America', 'Africa', 'Middle East'];

export const NEWS_REGION_SHORT = {
  'Latin America': 'LatAm',
  'Middle East': 'Mid East',
  Nordics: 'Nordics',
};

export const NEWS_REGION_FLAGS = {
  US: '🇺🇸',
  Nordics: '🇸🇪',
  Europe: '🇪🇺',
  Asia: '🌏',
  'Latin America': '🌎',
  Africa: '🌍',
  'Middle East': '🕌',
  Global: '🌐',
  Crypto: '₿',
};

/** "Affects: $VALE, Copper" — empty string when nothing is known. */
export function affectsLine(article) {
  const list = article?.affects;
  if (!Array.isArray(list) || list.length === 0) return '';
  return `Affects: ${list.join(', ')}`;
}

/**
 * Watchlist and portfolio assets first, everything else newest-first.
 * No network call: the caller passes the symbols it already has.
 */
export function orderForUser(articles, mySymbols) {
  const mine = new Set((mySymbols || []).map((s) => String(s).toUpperCase()));
  if (!Array.isArray(articles)) return [];
  const decorated = articles.map((a) => ({
    ...a,
    isYours: (a.affectSymbols || []).some((s) => mine.has(String(s).toUpperCase())),
  }));
  const time = (a) => (a.publishedAt ? new Date(a.publishedAt).getTime() : 0);
  // The backend pins one top story; it stays pinned above everything.
  const top = decorated.filter((a) => a.isTopStory);
  const yours = decorated.filter((a) => !a.isTopStory && a.isYours).sort((a, b) => time(b) - time(a));
  const rest = decorated.filter((a) => !a.isTopStory && !a.isYours).sort((a, b) => time(b) - time(a));
  return [...top, ...yours, ...rest];
}