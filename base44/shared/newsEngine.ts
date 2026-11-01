/**
 * newsEngine — the one place news is fetched, scored, tagged and cached.
 *
 * Design rules:
 *  - ONE classification pass per article, cached for 12 minutes. Every user
 *    reads the same scored pool, so a feed load costs zero extra provider or AI
 *    calls. (No LLM is used at all: relevance, category, region and sentiment
 *    are deterministic rules, which also keeps them reproducible.)
 *  - Sources: Finnhub (general / crypto / forex / merger + company news) and
 *    GDELT (regional + global event queries, no API key). Both free tier.
 *  - Every article below a relevance score of 40 is dropped (AGM notices,
 *    opinion pieces, listicles, human-interest), and only one article per event
 *    survives — the best source wins.
 *  - Sentiment passes through shared/newsSentiment.ts, so a hack is bearish, a
 *    shortage is never bullish, and low confidence reads neutral.
 *  - Ticker tags and "Affects" symbols are restricted to the app's own asset
 *    universe (shared/assetSymbols.ts) — never $FBI, $UN or a random acronym.
 */

import { ASSET_INDEX } from './assetSymbols.ts';
import { applySentimentGuard } from './newsSentiment.ts';

const POOL_TTL_MS = 12 * 60 * 1000;      // 12 minutes
const REGION_TTL_MS = 45 * 60 * 1000;    // a failed region keeps its last articles
const SYMBOL_TTL_MS = 10 * 60 * 1000;
const MIN_RELEVANCE = 40;

export type NewsRegion = 'US' | 'Europe' | 'Asia' | 'Latin America' | 'Africa' | 'Middle East' | 'Global';
export type NewsCategory = 'Macro' | 'Stocks' | 'Crypto' | 'Commodities' | 'Geopolitics';

export type ScoredArticle = {
  id: string;
  title: string;
  summary: string;
  url: string;
  image: string | null;
  source: string;
  publishedAt: string | null;
  region: NewsRegion;
  category: NewsCategory;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  tickers: string[];
  affects: string[];
  affectSymbols: string[];
  why: string;
  relevanceScore: number;
  assetType: string;
};

// ── THEMES: what makes an article market-relevant, and how much ─────────────
type Theme = { id: string; category: NewsCategory; weight: number; terms: string[] };

const THEMES: Theme[] = [
  {
    id: 'macro',
    category: 'Macro',
    weight: 24,
    terms: [
      'federal reserve', 'fed', 'fomc', 'central bank', 'ecb', 'bank of japan', 'boj',
      'bank of england', 'boe', 'pboc', 'interest rate', 'rate cut', 'rate hike', 'rates',
      'inflation', 'cpi', 'ppi', 'payrolls', 'jobs report', 'unemployment', 'gdp',
      'treasury yield', 'bond yield', 'monetary policy', 'stimulus', 'quantitative',
      'recession', 'deflation', 'fiscal', 'budget deficit', 'debt ceiling',
    ],
  },
  {
    id: 'earnings',
    category: 'Stocks',
    weight: 22,
    terms: [
      'earnings', 'quarterly results', 'quarterly profit', 'revenue', 'net profit',
      'guidance', 'beats estimates', 'misses estimates', 'profit warning', 'forecast',
      'outlook', 'ipo', 'merger', 'acquisition', 'takeover', 'buyback', 'stake',
      'spin-off', 'restructuring', 'profit', 'sales', 'margin',
    ],
  },
  {
    id: 'regulation',
    category: 'Stocks',
    weight: 17,
    terms: [
      'regulator', 'antitrust', 'sec ', 'doj', 'ftc', 'investigation', 'probe',
      'lawsuit', 'fine', 'penalty', 'tariff', 'sanctions', 'sanction', 'ban ',
      'approval', 'licence', 'license', 'compliance', 'class action', 'settlement',
      'policy', 'regulation', 'bill ', 'subsidy', 'tax',
    ],
  },
  {
    id: 'energy',
    category: 'Commodities',
    weight: 20,
    terms: [
      'oil', 'brent', 'wti', 'opec', 'crude', 'natural gas', 'lng', 'refinery',
      'pipeline', 'gas prices', 'gas supply', 'gas reserves', 'gas storage',
      'storage levels', 'gas', 'fuel', 'diesel', 'energy prices', 'power prices',
      'electricity', 'uranium', 'heating',
    ],
  },
  {
    id: 'metals',
    category: 'Commodities',
    weight: 20,
    terms: [
      'gold', 'silver', 'copper', 'lithium', 'platinum', 'iron ore', 'coal',
      'aluminium', 'aluminum', 'nickel', 'zinc', 'wheat', 'corn', 'cocoa',
      'commodity', 'commodities', 'precious metal', 'rare earth',
    ],
  },
  {
    id: 'crypto',
    category: 'Crypto',
    weight: 20,
    terms: [
      'bitcoin', 'ethereum', 'crypto', 'cryptocurrency', 'stablecoin', 'blockchain',
      'defi', 'token', 'binance', 'coinbase', 'etf inflow', 'digital asset', 'mining',
    ],
  },
  {
    id: 'geopolitics',
    category: 'Geopolitics',
    weight: 18,
    terms: [
      'war', 'conflict', 'invasion', 'military', 'ceasefire', 'sanctions', 'election',
      'coup', 'unrest', 'protest', 'terror', 'shipping lane', 'red sea', 'strait',
      'embargo', 'export ban', 'border', 'strike action', 'blockade',
    ],
  },
  {
    id: 'markets',
    category: 'Stocks',
    weight: 12,
    terms: [
      'stocks', 'shares', 'equities', 'index', 's&p', 'nasdaq', 'dow jones', 'ftse',
      'dax', 'nikkei', 'hang seng', 'bond', 'yield', 'currency', 'dollar', 'euro',
      'yen', 'volatility', 'selloff', 'sell-off', 'rally', 'market',
    ],
  },
];

// Articles that look like market news but carry no market impact.
const PENALTIES: { weight: number; terms: string[] }[] = [
  {
    weight: -32,
    terms: [
      'annual general meeting', 'agm', 'notice of meeting', 'to consider the ',
      'shareholder meeting', 'board meeting', 'agm notice', 'notice of agm',
      'results of agm', 'postal ballot',
    ],
  },
  {
    weight: -30,
    terms: [
      'opinion', 'analysis:', 'commentary', 'editorial', 'column', 'explainer',
      'what to know', 'newsletter', 'podcast', 'interview', 'q&a', 'poll',
    ],
  },
  {
    weight: -45,
    terms: [
      'celebrity', 'actor', 'actress', 'singer', 'wedding', 'royal family',
      'football', 'cricket', 'olympic', 'movie', 'box office', 'music', 'chef',
      'recipe', 'travel guide', 'tourism', 'horoscope', 'obituary', 'lottery',
      'fashion week', 'reality tv', 'streaming series',
    ],
  },
  {
    weight: -26,
    terms: ['best ', 'top 10', 'how to ', 'ways to ', 'review:', 'guide to', 'tips for'],
  },
  {
    weight: -18,
    terms: ['press release', 'appoints', 'appointment of', 'wins award', 'unveils', 'announces dividend'],
  },
];

const BULLISH_WORDS = [
  'surge', 'surges', 'soar', 'soars', 'rally', 'rallies', 'record high', 'all-time high',
  'beats', 'beat estimates', 'jump', 'jumps', 'gain', 'gains', 'rise', 'rises', 'climb',
  'upgrade', 'upgrades', 'profit', 'profits', 'strong', 'growth', 'expands', 'approval',
];
const BEARISH_WORDS = [
  'fall', 'falls', 'fell', 'drop', 'drops', 'plunge', 'plunges', 'slump', 'crash',
  'miss', 'misses', 'decline', 'declines', 'warn', 'warns', 'warning', 'cut', 'cuts',
  'downgrade', 'downgrades', 'loss', 'losses', 'risk', 'concern', 'shortage',
  'record low', 'lowest since', 'crisis', 'conflict', 'strike', 'strikes', 'hack',
  'hacked', 'breach', 'outage', 'layoff', 'layoffs', 'sanction', 'sanctions',
  'recession', 'default', 'bankruptcy', 'selloff', 'sell-off',
];

const REGION_KEYWORDS: Record<Exclude<NewsRegion, 'Global'>, string[]> = {
  US: ['fed', 'fomc', 'federal reserve', 'nasdaq', 's&p', 'dow', 'wall street', 'nyse',
    'sec ', 'treasury', 'powell', 'congress', 'washington', 'us economy', 'u.s.', 'silicon valley'],
  Europe: ['ecb', 'euro area', 'eurozone', 'dax', 'ftse', 'cac', 'lagarde', 'bank of england',
    'boe', 'european union', 'eu ', 'germany', 'france', 'britain', 'uk ', 'italy', 'spain',
    'netherlands', 'sweden', 'norway', 'switzerland', 'london', 'frankfurt', 'paris', 'brussels'],
  Asia: ['boj', 'bank of japan', 'pboc', 'nikkei', 'hang seng', 'shanghai', 'shenzhen', 'china',
    'japan', 'korea', 'hong kong', 'taiwan', 'tokyo', 'beijing', 'asia', 'india', 'singapore',
    'indonesia', 'vietnam', 'thailand', 'philippines', 'australia'],
  'Latin America': ['brazil', 'mexico', 'argentina', 'chile', 'colombia', 'peru', 'latin america',
    'latam', 'sao paulo', 'bovespa', 'banxico', 'real ', 'peso'],
  Africa: ['south africa', 'nigeria', 'kenya', 'egypt', 'morocco', 'ghana', 'africa', 'johannesburg',
    'nairobi', 'lagos', 'rand '],
  'Middle East': ['saudi', 'uae', 'dubai', 'abu dhabi', 'qatar', 'israel', 'iran', 'iraq', 'turkey',
    'kuwait', 'middle east', 'aramco', 'opec+'],
};

const TIER1_SOURCES = [
  'reuters', 'bloomberg', 'financial times', 'wsj', 'wall street journal', 'associated press',
  'ap news', 'cnbc', 'barron', 'nikkei', 'handelsblatt', 'les echos', 'il sole', 'economist',
  'south china morning post', 'the globe and mail', 'marketwatch', 'business day', 'businessday',
  'moneyweb', 'valor', 'business standard', 'economic times', 'the hindu', 'arab news',
  'gulf news', 'the japan times', 'korea herald', 'the straits times',
];

// Theme → the assets an article most likely touches when it names no ticker.
const THEME_AFFECTS: Record<string, { symbols: string[]; labels: string[] }> = {
  macro: { symbols: ['SPY', 'TLT'], labels: [] },
  earnings: { symbols: [], labels: [] },
  regulation: { symbols: [], labels: [] },
  energy: { symbols: ['USO', 'UNG'], labels: ['Crude oil', 'Natural gas'] },
  metals: { symbols: ['GLD', 'CPER'], labels: ['Gold', 'Copper'] },
  crypto: { symbols: ['BTC', 'ETH'], labels: [] },
  geopolitics: { symbols: ['SPY', 'GLD'], labels: [] },
  markets: { symbols: ['SPY'], labels: [] },
};

// ── HELPERS ────────────────────────────────────────────────────────────────
const lc = (v: unknown) => String(v || '').toLowerCase();
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function termHits(text: string, terms: string[]): number {
  let hits = 0;
  for (const term of terms) {
    if (new RegExp(`(^|[^a-z])${escapeRe(term)}([^a-z]|$)`, 'i').test(text)) hits += 1;
  }
  return hits;
}

const STOP_TOKENS = new Set([
  'the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'as', 'is', 'are',
  'was', 'were', 'be', 'been', 'with', 'from', 'by', 'after', 'over', 'into', 'its', 'it',
  'this', 'that', 'than', 'says', 'said', 'amid', 'about', 'up', 'down', 'new', 'will',
]);

function headlineTokens(title: string): Set<string> {
  return new Set(
    lc(title)
      .replace(/[^a-z0-9 ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_TOKENS.has(w)),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((t) => { if (b.has(t)) inter += 1; });
  return inter / (a.size + b.size - inter);
}

function isTier1(source: string): boolean {
  const s = lc(source);
  return TIER1_SOURCES.some((t) => s.includes(t));
}

function detectRegion(text: string, fallback: NewsRegion): NewsRegion {
  for (const [region, terms] of Object.entries(REGION_KEYWORDS)) {
    if (terms.some((t) => text.includes(t))) return region as NewsRegion;
  }
  return fallback;
}

/** Tickers named in the text, restricted to the app's universe. */
function extractSymbols(text: string): string[] {
  const found: string[] = [];
  const upperText = String(text || '');

  // 1. Explicit cashtags.
  const cashtags = upperText.match(/\$([A-Z]{2,6})\b/g) || [];
  for (const tag of cashtags) {
    const symbol = tag.slice(1).toUpperCase();
    if (ASSET_INDEX[symbol] && !found.includes(symbol)) found.push(symbol);
  }

  // 2. ALL-CAPS tokens (2-6 chars) that exist in the universe.
  const caps = upperText.match(/\b[A-Z]{2,6}\b/g) || [];
  for (const token of caps) {
    if (ASSET_INDEX[token] && !found.includes(token)) found.push(token);
  }

  // 3. Company / asset names — only distinctive ones (5+ chars, no common word).
  const lower = lc(upperText);
  for (const [symbol, meta] of Object.entries(ASSET_INDEX)) {
    if (found.length >= 6) break;
    const name = lc(meta.name);
    if (name.length < 5) continue;
    const base = name.split(' (')[0].split(' ')[0];
    if (base.length < 5) continue;
    if (new RegExp(`(^|[^a-z])${escapeRe(base)}([^a-z]|$)`).test(lower) && !found.includes(symbol)) {
      found.push(symbol);
    }
  }

  return found.slice(0, 4);
}

function sentimentFor(text: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
  const bull = termHits(text, BULLISH_WORDS);
  const bear = termHits(text, BEARISH_WORDS);
  const raw = bull > bear ? 'bullish' : bear > bull ? 'bearish' : 'neutral';
  const confidence = Math.min(90, 55 + Math.abs(bull - bear) * 9);
  return applySentimentGuard(raw, confidence, text).toUpperCase() as 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

function whyLine(themeId: string, text: string): string {
  const risk = /(shortage|record low|lowest since|crisis|conflict|strike|sanction|warn|cut)/.test(text);
  switch (themeId) {
    case 'macro': return 'Central-bank policy signal for rate-sensitive assets.';
    case 'earnings': return 'Company results and guidance for the quarter.';
    case 'regulation': return 'Regulatory action with sector-wide read-through.';
    case 'energy': return risk ? 'Supply concern for energy prices.' : 'Energy pricing signal for the session.';
    case 'metals': return risk ? 'Supply concern for industrial and precious metals.' : 'Commodity pricing signal for the session.';
    case 'crypto': return 'Crypto market structure development.';
    case 'geopolitics': return 'Geopolitical development with market spillover.';
    default: return 'Broad market pricing signal.';
  }
}

/** Score, category, region, sentiment and "affects" for one raw article. */
export function classifyArticle(raw: {
  title: string;
  summary?: string;
  source?: string;
  url?: string;
  image?: string | null;
  publishedAt?: string | null;
  regionHint?: NewsRegion;
}): ScoredArticle | null {
  const title = String(raw.title || '').trim();
  const url = String(raw.url || '').trim();
  if (!title || !url) return null;

  const text = lc(`${title} ${raw.summary || ''}`);

  // Themes
  const matched: { theme: Theme; hits: number }[] = [];
  for (const theme of THEMES) {
    const hits = termHits(text, theme.terms);
    if (hits > 0) matched.push({ theme, hits });
  }

  const themeScore = Math.min(58, matched.reduce((sum, m) => sum + m.theme.weight + (m.hits - 1) * 3, 0));
  const penalty = PENALTIES.reduce((sum, p) => sum + (termHits(text, p.terms) > 0 ? p.weight : 0), 0);
  const symbols = extractSymbols(title + ' ' + (raw.summary || ''));

  let score = 26 + themeScore + (symbols.length ? 14 : 0) + penalty;
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score < MIN_RELEVANCE) return null;

  // Category: the strongest theme, with macro and geopolitics taking precedence.
  const ranked = matched.slice().sort((a, b) => b.theme.weight - a.theme.weight);
  const primary = ranked.find((m) => m.theme.id === 'macro')
    || ranked.find((m) => m.theme.id === 'geopolitics')
    || ranked[0];
  const category: NewsCategory = primary ? primary.theme.category : 'Stocks';
  const primaryId = primary ? primary.theme.id : 'markets';

  const sentiment = sentimentFor(text);
  const region = detectRegion(text, raw.regionHint || 'Global');

  // Affects: named universe symbols first, then theme proxies.
  const affects: string[] = symbols.map((s) => `$${s}`);
  const themeAffects = THEME_AFFECTS[primaryId] || { symbols: [], labels: [] };
  const affectSymbols = new Set(symbols);
  const commodityLabels: string[] = [];
  if (/(gold)/.test(text)) commodityLabels.push('Gold');
  if (/(silver)/.test(text)) commodityLabels.push('Silver');
  if (/(copper)/.test(text)) commodityLabels.push('Copper');
  if (/(crude|brent|wti|\boil\b)/.test(text)) commodityLabels.push('Crude oil');
  if (/(natural gas|lng)/.test(text)) commodityLabels.push('Natural gas');
  if (/(wheat)/.test(text)) commodityLabels.push('Wheat');
  if (/(corn)/.test(text)) commodityLabels.push('Corn');
  if (/(uranium)/.test(text)) commodityLabels.push('Uranium');
  if (/(lithium)/.test(text)) commodityLabels.push('Lithium');

  for (const label of commodityLabels) {
    if (!affects.some((a) => a.replace('$', '') === label)) affects.push(label);
  }
  if (affects.length === 0) {
    themeAffects.symbols.forEach((s) => { if (ASSET_INDEX[s]) affectSymbols.add(s); });
    themeAffects.labels.slice(0, 2).forEach((l) => affects.push(l));
    themeAffects.symbols.slice(0, 2).forEach((s) => affects.push(`$${s}`));
  } else {
    // Keep the theme proxy in the symbol set so personalisation can still match.
    themeAffects.symbols.forEach((s) => { if (ASSET_INDEX[s]) affectSymbols.add(s); });
  }

  const assetType = category === 'Crypto' ? 'Crypto'
    : category === 'Commodities' ? 'Commodities'
      : category === 'Geopolitics' ? 'General'
        : 'Stocks';

  return {
    id: raw.url || title,
    title,
    summary: String(raw.summary || '').slice(0, 400),
    url,
    image: raw.image || null,
    source: String(raw.source || ''),
    publishedAt: raw.publishedAt || null,
    region,
    category,
    sentiment,
    tickers: symbols,
    affects: [...new Set(affects)].slice(0, 4),
    affectSymbols: [...affectSymbols].slice(0, 6),
    why: whyLine(primaryId, text),
    relevanceScore: score,
    assetType,
  };
}

// ── PROVIDERS ──────────────────────────────────────────────────────────────

async function finnhubCategory(category: string, key: string): Promise<any[]> {
  if (!key) return [];
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/news?category=${category}&token=${key}`,
      { signal: AbortSignal.timeout(7000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

/**
 * Regional editions of Google News (free, no key, one request per region).
 * GDELT stays in the mix for global events but its document API allows only
 * one request every five seconds and rejects multi-country filters, so it is
 * used for a single worldwide query rather than per-region ones.
 */
const REGION_FEEDS: { region: NewsRegion; url: string }[] = [
  { region: 'US', url: 'hl=en-US&gl=US&ceid=US:en' },
  { region: 'Europe', url: 'hl=en-GB&gl=GB&ceid=GB:en' },
  { region: 'Asia', url: 'hl=en-IN&gl=IN&ceid=IN:en' },
  { region: 'Latin America', url: 'hl=en-US&gl=BR&ceid=BR:en' },
  { region: 'Africa', url: 'hl=en-ZA&gl=ZA&ceid=ZA:en' },
  { region: 'Middle East', url: 'hl=en-AE&gl=AE&ceid=AE:en' },
];

const REGION_FEED_QUERY = 'markets OR stocks OR economy OR "central bank" OR inflation';

const GDELT_GLOBAL_QUERY = '(markets OR economy OR sanctions OR "interest rates") sourcelang:english';

function decodeEntities(text: string): string {
  return String(text || '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#\d+;/g, ' ')
    .replace(/<[^>]+>/g, '')
    .trim();
}

/** Google News puts the publisher at the end of the headline ("… - Reuters"). */
function splitHeadline(title: string): { title: string; source: string } {
  const idx = title.lastIndexOf(' - ');
  if (idx > 20) return { title: title.slice(0, idx).trim(), source: title.slice(idx + 3).trim() };
  return { title, source: '' };
}

function parseRss(xml: string) {
  const out: { title: string; source: string; url: string; publishedAt: string | null }[] = [];
  const items = String(xml || '').split('<item>').slice(1);
  for (const item of items) {
    const rawTitle = decodeEntities((item.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
    const link = decodeEntities((item.match(/<link>([\s\S]*?)<\/link>/) || [])[1]);
    const pub = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1];
    if (!rawTitle || !link) continue;
    const { title, source } = splitHeadline(rawTitle);
    const date = pub ? new Date(pub) : null;
    out.push({
      title,
      source,
      url: link,
      publishedAt: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
    });
  }
  return out;
}

async function fetchRegionFeed(region: NewsRegion, params: string, query: string) {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&${params}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(7000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
    });
    if (!res.ok) {
      console.warn(`[news] feed ${region} HTTP ${res.status}`);
      return [];
    }
    const xml = await res.text();
    console.log(`[news] feed ${region}: ${(xml.match(/<item>/g) || []).length} items`);
    return parseRss(xml).slice(0, 20).map((r) => ({
      title: r.title,
      summary: '',
      url: r.url,
      image: null as string | null,
      source: r.source,
      publishedAt: r.publishedAt,
      regionHint: region,
    }));
  } catch (error) {
    console.warn(`[news] feed ${region} failed: ${error.message}`);
    return [];
  }
}

function parseGdeltDate(seendate: string): string | null {
  const s = String(seendate || '');
  const m = s.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, se] = m;
  return `${y}-${mo}-${d}T${h}:${mi}:${se}Z`;
}

/** One worldwide GDELT query. Slow and rate-limited, so it is the only one. */
async function gdeltGlobal(query: string) {
  try {
    const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}`
      + `&mode=artlist&maxrecords=25&format=json&sort=datedesc&timespan=1d`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const data = await res.json().catch(() => ({}));
    const articles = Array.isArray(data?.articles) ? data.articles : [];
    return articles.map((a: any) => ({
      title: a.title,
      summary: '',
      url: a.url,
      image: null as string | null,
      source: a.domain,
      publishedAt: parseGdeltDate(a.seendate),
      regionHint: undefined as NewsRegion | undefined,
    }));
  } catch (_) {
    return [];
  }
}

// ── CACHE ──────────────────────────────────────────────────────────────────
const store = globalThis as any;
store.__tredioNews = store.__tredioNews || {
  pool: null as null | { articles: ScoredArticle[]; generatedAt: number },
  inflight: null as null | Promise<{ articles: ScoredArticle[]; generatedAt: number }>,
  regions: new Map<string, { articles: ScoredArticle[]; at: number }>(),
  symbols: new Map<string, { articles: ScoredArticle[]; at: number }>(),
  symbolInflight: new Map<string, Promise<ScoredArticle[]>>(),
};
const cache = store.__tredioNews;

/** Drop duplicate events — keep the best-regarded source for each one. */
function dedupeEvents(articles: ScoredArticle[]): ScoredArticle[] {
  const kept: { article: ScoredArticle; tokens: Set<string> }[] = [];

  const rank = (a: ScoredArticle) => a.relevanceScore + (isTier1(a.source) ? 12 : 0);

  for (const article of articles) {
    const tokens = headlineTokens(article.title);
    const duplicate = kept.find((k) => jaccard(k.tokens, tokens) >= 0.55);
    if (!duplicate) {
      kept.push({ article, tokens });
      continue;
    }
    if (rank(article) > rank(duplicate.article)) {
      duplicate.article = article;
      duplicate.tokens = tokens;
    }
  }

  return kept.map((k) => k.article);
}

async function buildPool(): Promise<{ articles: ScoredArticle[]; generatedAt: number }> {
  const finnhubKey = Deno.env.get('FINNHUB_API_KEY') || '';

  // 1. Finnhub: general (US + global), crypto, forex, M&A.
  const [general, crypto, forex, merger] = await Promise.all([
    finnhubCategory('general', finnhubKey),
    finnhubCategory('crypto', finnhubKey),
    finnhubCategory('forex', finnhubKey),
    finnhubCategory('merger', finnhubKey),
  ]);

  const finnhubRaw = [...general.slice(0, 40), ...crypto.slice(0, 15), ...forex.slice(0, 12), ...merger.slice(0, 10)]
    .map((a) => ({
      title: a.headline,
      summary: a.summary,
      url: a.url,
      image: a.image || null,
      source: a.source,
      publishedAt: a.datetime ? new Date(a.datetime * 1000).toISOString() : null,
      regionHint: undefined as NewsRegion | undefined,
    }));

  // 2. Worldwide coverage: one Google News feed per region, plus a single global
  //    GDELT query. A region that fails keeps its last good batch.
  // Sequential, not parallel: Google answers 503 to a burst from one IP, and a
  // failure keeps the region's last good batch instead of emptying it.
  const loadRegions = async (): Promise<ScoredArticle[][]> => {
    const batches: ScoredArticle[][] = [];
    for (const { region, url } of REGION_FEEDS) {
      let raw = await fetchRegionFeed(region, url, REGION_FEED_QUERY);
      if (raw.length === 0) {
        await new Promise((r) => setTimeout(r, 1200));
        raw = await fetchRegionFeed(region, url, REGION_FEED_QUERY);
      }
      const scored = raw.map((r) => classifyArticle(r)).filter(Boolean) as ScoredArticle[];
      if (scored.length > 0) {
        cache.regions.set(region, { articles: scored, at: Date.now() });
        batches.push(scored);
      } else {
        const previous = cache.regions.get(region);
        batches.push(previous && Date.now() - previous.at < REGION_TTL_MS ? previous.articles : []);
        if (!previous) cache.regions.delete(region);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
    return batches;
  };

  const [feedBatches, gdeltBatch] = await Promise.all([loadRegions(), gdeltGlobal(GDELT_GLOBAL_QUERY)]);

  const gdeltScored = gdeltBatch.map((r) => classifyArticle(r)).filter(Boolean) as ScoredArticle[];
  const regions = [...feedBatches, gdeltScored];

  // 3. Score Finnhub's batch, then merge everything.
  const scoredFinnhub = finnhubRaw.map((r) => classifyArticle(r)).filter(Boolean) as ScoredArticle[];
  const all = [...scoredFinnhub, ...regions.flat()];

  const deduped = dedupeEvents(all);
  deduped.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

  console.log(`[news] pool built: ${deduped.length} relevant articles `
    + `(finnhub ${scoredFinnhub.length}, gdelt ${regions.flat().length}); `
    + `regions ${regions.map((r) => r.length).join('/')}`);

  return { articles: deduped, generatedAt: Date.now() };
}

/** The shared, already-scored pool. Refreshed every 12 minutes, once. */
export async function getNewsPool(): Promise<{ articles: ScoredArticle[]; generatedAt: number }> {
  if (cache.pool && Date.now() - cache.pool.generatedAt < POOL_TTL_MS) return cache.pool;
  if (cache.inflight) return cache.inflight;

  cache.inflight = (async () => {
    try {
      const fresh = await buildPool();
      // Never lose a good pool to a bad refresh.
      if (fresh.articles.length > 0 || !cache.pool) cache.pool = fresh;
      return cache.pool || fresh;
    } catch (error) {
      console.error('[news] pool build failed:', error.message);
      return cache.pool || { articles: [], generatedAt: Date.now() };
    } finally {
      cache.inflight = null;
    }
  })();

  return cache.inflight;
}

/** Symbol-scoped news: company-news feed + the pool filtered by "affects". */
export async function getSymbolNews(symbol: string): Promise<ScoredArticle[]> {
  const sym = String(symbol || '').toUpperCase();
  if (!sym) return [];

  const cached = cache.symbols.get(sym);
  if (cached && Date.now() - cached.at < SYMBOL_TTL_MS) return cached.articles;
  const pending = cache.symbolInflight.get(sym);
  if (pending) return pending;

  const task = (async () => {
    const key = Deno.env.get('FINNHUB_API_KEY') || '';
    let companyRaw: any[] = [];
    if (key) {
      try {
        const to = new Date().toISOString().slice(0, 10);
        const from = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        const res = await fetch(
          `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(sym)}&from=${from}&to=${to}&token=${key}`,
          { signal: AbortSignal.timeout(7000) },
        );
        if (res.ok) {
          const data = await res.json();
          companyRaw = (Array.isArray(data) ? data : []).slice(0, 12).map((a: any) => ({
            title: a.headline,
            summary: a.summary,
            url: a.url,
            image: a.image || null,
            source: a.source,
            publishedAt: a.datetime ? new Date(a.datetime * 1000).toISOString() : null,
          }));
        }
      } catch (_) { /* fall through to the pool */ }
    }

    const pool = await getNewsPool();
    const related = pool.articles.filter((a) => a.affectSymbols.includes(sym));
    const scoredCompany = companyRaw.map((r) => classifyArticle(r)).filter(Boolean) as ScoredArticle[];

    // Company news for this symbol always belongs here, even when it scored low.
    const merged = dedupeEvents([...scoredCompany, ...related]);
    merged.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

    cache.symbols.set(sym, { articles: merged, at: Date.now() });
    if (cache.symbols.size > 80) {
      const oldest = [...cache.symbols.entries()].sort((a, b) => a[1].at - b[1].at)[0];
      if (oldest) cache.symbols.delete(oldest[0]);
    }
    return merged;
  })();

  cache.symbolInflight.set(sym, task);
  try {
    return await task;
  } finally {
    cache.symbolInflight.delete(sym);
  }
}