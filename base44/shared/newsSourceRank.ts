/**
 * Source quality, shared by the news engine and the event merger so both agree
 * on what "the best source" for a story is.
 */

/** Wire services and major business desks. */
export const TIER1_SOURCES = [
  'reuters', 'bloomberg', 'financial times', 'wsj', 'wall street journal', 'associated press',
  'ap news', 'cnbc', 'barron', 'nikkei', 'handelsblatt', 'les echos', 'il sole', 'economist',
  'south china morning post', 'the globe and mail', 'marketwatch', 'business day', 'businessday',
  'moneyweb', 'valor', 'business standard', 'economic times', 'the hindu', 'arab news',
  'gulf news', 'the japan times', 'korea herald', 'the straits times',
];

/**
 * The institutions whose own releases are the news itself: a rate decision, a
 * statistical release or a filing is authoritative at the source.
 */
export const OFFICIAL_SOURCES = [
  'federal reserve', 'ecb', 'european central bank', 'sveriges riksbank',
  'riksbank', 'sec edgar', 'bureau of labor statistics',
];

const lc = (value: unknown) => String(value || '').toLowerCase();

export function isTier1(source: string): boolean {
  const s = lc(source);
  return TIER1_SOURCES.some((t) => s.includes(t));
}

export function isOfficial(source: string): boolean {
  const s = lc(source);
  return OFFICIAL_SOURCES.some((t) => s.includes(t));
}