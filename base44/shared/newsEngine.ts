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
const MIN_RELEVANCE = 50;

export type NewsRegion =
  | 'US' | 'Nordics' | 'Europe' | 'Asia' | 'Latin America' | 'Africa' | 'Middle East' | 'Global';
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
  importance: number;
  via?: string;
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
      'styrränta', 'räntebesked', 'konjunktur', 'arbetslöshet', 'riksbanken',
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
      'delårsrapport', 'vinstvarning', 'orderingång', 'omsättning', 'vinst',
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
      'finansinspektionen', 'myndighet', 'tillsyn', 'böter',
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
      'electricity', 'uranium', 'heating', 'elpris', 'elpriser', 'energipriser',
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
      'guld', 'koppar', 'stål', 'malm',
    ],
  },
  {
    id: 'crypto',
    category: 'Crypto',
    weight: 20,
    terms: [
      'bitcoin', 'ethereum', 'crypto', 'cryptocurrency', 'stablecoin', 'blockchain',
      'defi', 'token', 'binance', 'coinbase', 'etf inflow', 'digital asset', 'mining',
      'krypto', 'kryptovaluta',
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
      'krig', 'sanktioner', 'strejk',
    ],
  },
  {
    id: 'markets',
    category: 'Stocks',
    weight: 12,
    terms: [
      'stocks', 'shares', 'equities', 'index', 's&p', 'nasdaq', 'dow jones', 'ftse',
      'dax', 'nikkei', 'hang seng', 'bond', 'bond sale', 'yield', 'currency', 'dollar',
      'euro', 'yen', 'volatility', 'selloff', 'sell-off', 'rally', 'market',
      'economy', 'economic', 'growth', 'debt', 'loan', 'rating', 'capital',
      'funding', 'trade', 'exports', 'imports', 'budget', 'investment',
      // Swedish / Nordic business vocabulary (the Nordic feeds publish in Swedish)
      'börsen', 'börs', 'aktier', 'aktiemarknad', 'obligationer', 'valuta',
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
    weight: -30,
    terms: [
      'penny stocks', 'do you own', 'slideshow', 'multibagger', 'stocks to buy',
      'stocks to watch', 'should you buy', 'is it time to buy', 'buy or sell',
    ],
  },
  {
    weight: -20,
    terms: ['police', 'protest camp', 'housing protest', 'squatters'],
  },
  {
    weight: -34,
    terms: [
      'doctors', 'nurses', 'bereavement', 'trauma', 'families', 'children',
      'wounded', 'killed', 'funeral', 'refugees', 'survivors', 'patients',
      'teachers', 'students', 'in pictures', 'photos of', 'life and times',
    ],
  },
  {
    weight: -14,
    terms: ["what would", 'what does', "here's how", "here's what", 'explained', 'why it matters', 'five things'],
  },
  {
    weight: -18,
    terms: ['press release', 'appoints', 'appointment of', 'wins award', 'unveils', 'announces dividend'],
  },
  {
    // Scheduling and listicles: a calendar, a preview or a "stocks to buy" list
    // carries no event, so it never earns a slot in the feed.
    weight: -45,
    terms: [
      'factors to watch', 'things to watch', 'what to watch', 'to watch this week', 'week ahead',
      'day ahead', 'month ahead', 'economic calendar', 'earnings calendar', 'dividend calendar',
      'ipo calendar', 'calendar', 'ex-date', 'ex date', 'ex-dividend', 'record date',
      'stocks to buy', 'top picks', 'top stocks', 'best stocks', 'shares to buy',
      'preview', 'preview:', 'outlook:', 'a look ahead', 'street watch',
    ],
  },
];

const BULLISH_WORDS = [
  'surge', 'surges', 'soar', 'soars', 'rally', 'rallies', 'record high', 'all-time high',
  'beats', 'beat estimates', 'jump', 'jumps', 'gain', 'gains', 'rise', 'rises', 'climb',
  'upgrade', 'upgrades', 'profit', 'profits', 'strong', 'growth', 'expands', 'approval',
  'stiger', 'rusar', 'höjs', 'ökar', 'rekordhög',
];
const BEARISH_WORDS = [
  'fall', 'falls', 'fell', 'drop', 'drops', 'plunge', 'plunges', 'slump', 'crash',
  'miss', 'misses', 'decline', 'declines', 'warn', 'warns', 'warning', 'cut', 'cuts',
  'downgrade', 'downgrades', 'loss', 'losses', 'risk', 'concern', 'shortage',
  'record low', 'lowest since', 'crisis', 'conflict', 'strike', 'strikes', 'hack',
  'hacked', 'breach', 'outage', 'layoff', 'layoffs', 'sanction', 'sanctions',
  'recession', 'default', 'bankruptcy', 'selloff', 'sell-off',
  'faller', 'rasar', 'sänks', 'minskar', 'rekordlåg',
];

/**
 * Region is where the market impact lands, not where a country happens to be
 * named. Impact markers (a central bank, a benchmark index, a policy body)
 * decide the region at double weight; a country mentioned in passing counts
 * for one. Two impact markers, or two mentions, is the threshold.
 */
const REGION_IMPACT: Record<Exclude<NewsRegion, 'Global'>, string[]> = {
  US: ['fomc', 'federal reserve', 'wall street', 'nasdaq', 's&p', 'dow jones', 'nyse',
    'treasury yield', 'sec ', 'us economy', 'u.s. economy', 'powell', 'nonfarm', 'cme'],
  Nordics: ['riksbank', 'omxs30', 'nasdaq stockholm', 'norges bank', 'oslo bors', 'oslo børs',
    'osebx', 'omxc25', 'nasdaq copenhagen', 'omxh25', 'helsinki', 'nordic', 'norden',
    'stockholm', 'swedish krona', 'norwegian krone', 'danish krone'],
  Europe: ['ecb', 'european central bank', 'euro area', 'eurozone', 'dax', 'ftse', 'cac 40',
    'lagarde', 'bank of england', 'eurostat', 'european commission'],
  Asia: ['boj', 'bank of japan', 'pboc', 'nikkei', 'hang seng', 'shanghai composite', 'shenzhen',
    'nifty', 'sensex', 'dalal street', 'rbi', 'reserve bank of india'],
  'Latin America': ['banxico', 'bovespa', 'ibovespa', 'latin america', 'latam', 'banco central'],
  Africa: ['sarb', 'south african reserve bank', 'jse', 'ngx', 'central bank of nigeria', 'cbn'],
  'Middle East': ['opec', 'aramco', 'saudi arabia', 'saudi vision 2030', 'uae central bank'],
};

const REGION_MENTION: Record<Exclude<NewsRegion, 'Global'>, string[]> = {
  US: ['america', 'u.s.', 'united states', 'washington', 'congress', 'silicon valley', 'new york'],
  Nordics: ['sweden', 'swedish', 'norway', 'norwegian', 'denmark', 'danish', 'finland', 'finnish',
    'iceland', 'copenhagen', 'oslo', 'helsinki'],
  Europe: ['germany', 'france', 'britain', 'uk ', 'italy', 'spain', 'netherlands', 'switzerland',
    'london', 'frankfurt', 'paris', 'brussels', 'portugal', 'ireland', 'belgium', 'austria',
    'poland', 'greece', 'romania', 'czech', 'hungary', 'lisbon', 'madrid', 'milan', 'amsterdam'],
  Asia: ['china', 'japan', 'korea', 'hong kong', 'taiwan', 'tokyo', 'beijing', 'asia', 'india',
    'singapore', 'indonesia', 'vietnam', 'thailand', 'philippines', 'australia'],
  'Latin America': ['brazil', 'mexico', 'argentina', 'chile', 'colombia', 'peru', 'sao paulo',
    'real ', 'peso'],
  Africa: ['south africa', 'nigeria', 'kenya', 'egypt', 'morocco', 'ghana', 'africa', 'johannesburg',
    'nairobi', 'lagos'],
  'Middle East': ['saudi', 'uae', 'dubai', 'abu dhabi', 'qatar', 'israel', 'iran', 'iraq', 'turkey',
    'kuwait', 'middle east'],
};

const TIER1_SOURCES = [
  'reuters', 'bloomberg', 'financial times', 'wsj', 'wall street journal', 'associated press',
  'ap news', 'cnbc', 'barron', 'nikkei', 'handelsblatt', 'les echos', 'il sole', 'economist',
  'south china morning post', 'the globe and mail', 'marketwatch', 'business day', 'businessday',
  'moneyweb', 'valor', 'business standard', 'economic times', 'the hindu', 'arab news',
  'gulf news', 'the japan times', 'korea herald', 'the straits times',
];

/**
 * Indian benchmark wrap-ups ("Nifty, Sensex extend gains") are Indian equity
 * stories. The single Indian instrument the app can trade is INDA, and the
 * story belongs in Stocks (or Macro when the headline is about policy), never
 * in Commodities just because the body mentions metal or oil stocks.
 */
const INDIA_INDEX_TERMS = [
  'nifty', 'sensex', 'bank nifty', 'dalal street', 'bse', 'nse',
  'indian stocks', 'indian shares', 'indian market', 'indian equities',
];

function isIndiaIndex(headline: string): boolean {
  return termHits(headline, INDIA_INDEX_TERMS) > 0;
}

/** The commodity an article is literally about, taken from its headline. */
const COMMODITY_LABELS: { label: string; re: RegExp }[] = [
  { label: 'Gold', re: /\bgold\b/ },
  { label: 'Silver', re: /\bsilver\b/ },
  { label: 'Copper', re: /\bcopper\b/ },
  { label: 'Crude oil', re: /\b(crude|brent|wti|oil)\b/ },
  { label: 'Natural gas', re: /\b(natural gas|lng)\b/ },
  { label: 'Wheat', re: /\bwheat\b/ },
  { label: 'Corn', re: /\bcorn\b/ },
  { label: 'Uranium', re: /\buranium\b/ },
  { label: 'Lithium', re: /\blithium\b/ },
];

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

function detectRegion(text: string, fallback: NewsRegion, category: NewsCategory): NewsRegion {
  // A token hack, a depeg or a bitcoin move is a global market event, wherever
  // the exchange or the victims happen to be.
  if (category === 'Crypto') return 'Global';

  let best: { region: NewsRegion; score: number } = { region: 'Global', score: 0 };
  for (const region of Object.keys(REGION_IMPACT) as Exclude<NewsRegion, 'Global'>[]) {
    // Word boundaries, not substring: "tearing down homes" is not the Dow.
    const score = termHits(text, REGION_IMPACT[region]) * 2 + termHits(text, REGION_MENTION[region]);
    if (score > best.score) best = { region, score };
  }
  if (best.score >= 2) return best.region;

  // Oil, gold and wars price globally; nothing local to attribute.
  if (category === 'Commodities' || category === 'Geopolitics') return 'Global';
  return fallback || 'Global';
}

/**
 * Company names as they actually appear in headlines, mapped to their symbol.
 * Scanning all 600 universe names was wrong ("southern Lebanon" tagged
 * Southern Company), so name matching runs off this curated list instead;
 * cashtags and ALL-CAPS tickers still cover everything else.
 */
const NAME_ALIASES: Record<string, string> = {
  apple: 'AAPL', microsoft: 'MSFT', nvidia: 'NVDA', alphabet: 'GOOGL', google: 'GOOGL',
  amazon: 'AMZN', meta: 'META', facebook: 'META', tesla: 'TSLA', broadcom: 'AVGO',
  jpmorgan: 'JPM', 'eli lilly': 'LLY', costco: 'COST', netflix: 'NFLX',
  salesforce: 'CRM', oracle: 'ORCL', chevron: 'CVX', exxon: 'XOM', 'exxon mobil': 'XOM',
  pfizer: 'PFE', intel: 'INTC', qualcomm: 'QCOM', micron: 'MU', 'advanced micro devices': 'AMD',
  boeing: 'BA', caterpillar: 'CAT', walmart: 'WMT', nike: 'NKE', starbucks: 'SBUX',
  mcdonald: 'MCD', disney: 'DIS', uber: 'UBER', airbnb: 'ABNB', palantir: 'PLTR',
  coinbase: 'COIN', microstrategy: 'MSTR', robinhood: 'HOOD', crowdstrike: 'CRWD',
  snowflake: 'SNOW', datadog: 'DDOG', shopify: 'SHOP', paypal: 'PYPL', spotify: 'SPOT',
  goldman: 'GS', 'morgan stanley': 'MS', 'bank of america': 'BAC', citigroup: 'C',
  blackrock: 'BLK', 'wells fargo': 'WFC', mastercard: 'MA', 'berkshire hathaway': 'BRK.B',
  'johnson & johnson': 'JNJ', moderna: 'MRNA', 'ford motor': 'F', 'general motors': 'GM',
  'general electric': 'GE', 'lockheed martin': 'LMT', 'home depot': 'HD',
  'procter & gamble': 'PG', 'coca-cola': 'KO', pepsi: 'PEP', 'philip morris': 'PM',
  altria: 'MO', 'delta air lines': 'DAL', 'united airlines': 'UAL',
  'southwest airlines': 'LUV', conocophillips: 'COP', occidental: 'OXY',
  halliburton: 'HAL', freeport: 'FCX', newmont: 'NEM', albemarle: 'ALB',
  // Global
  asml: 'ASML', sap: 'SAP', 'novo nordisk': 'NVO', novartis: 'NVS', astrazeneca: 'AZN',
  gsk: 'GSK', sanofi: 'SNY', shell: 'SHEL', totalenergies: 'TTE', eni: 'E',
  equinor: 'EQNR', hsbc: 'HSBC', ubs: 'UBS', 'deutsche bank': 'DB', allianz: 'ALIZY',
  stellantis: 'STLA', volkswagen: 'VWAGY', bmw: 'BMWYY', mercedes: 'MBGYY',
  lvmh: 'LVMUY', siemens: 'SIEGY', bayer: 'BAYRY', basf: 'BASFY', adidas: 'ADDYY',
  ericsson: 'ERIC', nokia: 'NOK', philips: 'PHG', heineken: 'HEINY', diageo: 'DEO',
  'british american tobacco': 'BTI', reckitt: 'RKT', ryanair: 'RYAAY',
  'deutsche telekom': 'DTEGY', iberdrola: 'IBE', enel: 'ENEL', engie: 'ENGIY',
  volvo: 'VLVLY', maersk: 'MAERSK', ferrovial: 'FER', prosus: 'PRX',
  tsmc: 'TSM', 'taiwan semiconductor': 'TSM', toyota: 'TM', sony: 'SONY', honda: 'HMC',
  'mitsubishi ufj': 'MUFG', 'sumitomo mitsui': 'SMFG', mizuho: 'MFG', nomura: 'NMR',
  alibaba: 'BABA', 'pdd holdings': 'PDD', 'jd.com': 'JD', netease: 'NTES', baidu: 'BIDU',
  tencent: 'TCEHY', bilibili: 'BILI', 'yum china': 'YUMC', 'li auto': 'LI', nio: 'NIO',
  xpeng: 'XPEV', 'hdfc bank': 'HDB', 'icici bank': 'IBN', infosys: 'INFY', wipro: 'WIT',
  posco: 'PKX', 'sea limited': 'SE', grab: 'GRAB', coupang: 'CPNG',
  'ase technology': 'ASX', 'united microelectronics': 'UMC', 'saudi aramco': 'KSA',
  'mercado libre': 'MELI', mercadolibre: 'MELI',
  // Latin America / Africa / Middle East
  vale: 'VALE', petrobras: 'PBR', bradesco: 'BBD', ambev: 'ABEV', 'nu holdings': 'NU',
  nubank: 'NU', pagseguro: 'PAGS', stoneco: 'STNE', suzano: 'SUZ', femsa: 'FMX',
  'coca-cola femsa': 'KOF', 'américa móvil': 'AMX', cemex: 'CX', globant: 'GLOB',
  sasol: 'SSL', 'gold fields': 'GFI', 'anglogold ashanti': 'AU',
  'sibanye-stillwater': 'SBSW', naspers: 'NPSNY', 'mtn group': 'MTNOY',
  'standard bank': 'SBKJY', teva: 'TEVA', 'check point': 'CHKP', 'wix': 'WIX',
  // Crypto and commodities (named assets, not tickers)
  bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', dogecoin: 'DOGE', cardano: 'ADA',
  ripple: 'XRP', 'shiba inu': 'SHIB', avalanche: 'AVAX', chainlink: 'LINK',
  polkadot: 'DOT', litecoin: 'LTC', uniswap: 'UNI', 'the sandbox': 'SAND',
  decentraland: 'MANA', 'the graph': 'GRT', 'internet computer': 'ICP',
};

const NAME_TERMS = Object.keys(NAME_ALIASES);

/**
 * Alias words that are also ordinary English ("grab gains", "shell companies",
 * "meta data"). They are never enough on their own to say an article is about
 * that company, so they are not used for tagging.
 */
const AMBIGUOUS_ALIASES = new Set(['shell', 'grab', 'meta', 'sap', 'vale', 'one']);

/**
 * Tickers named in the text, restricted to the app's universe.
 *
 * Deliberately strict: an asset is tagged only when the text names it — a
 * cashtag, an exchange-qualified ticker, or a full company name. Bare
 * ALL-CAPS words are NOT tickers here ("AI", "IT", "NSE" would all tag a
 * company that has nothing to do with the story). No match means no tag.
 */
function extractSymbols(text: string): string[] {
  const found: string[] = [];
  const body = String(text || '');
  const lower = body.toLowerCase();

  // 1. Explicit cashtags: $BTC, $VALE.
  const cashtags = body.match(/\$([A-Za-z]{1,7})\b/g) || [];
  for (const tag of cashtags) {
    const symbol = tag.slice(1).toUpperCase();
    if (ASSET_INDEX[symbol] && !found.includes(symbol)) found.push(symbol);
  }

  // 2. Exchange-qualified tickers only: (NASDAQ:NVDA), NYSE: C, NSE:INFY.
  const qualified = body.match(
    /(?:\(|\b)(?:nasdaq|nyse|amex|nse|bse|lse|tsx|asx|hkex|euronext|otc)\s*:\s*([A-Za-z][A-Za-z.\-]{0,6})\b/gi,
  ) || [];
  for (const raw of qualified) {
    const symbol = raw.split(':')[1].trim().toUpperCase();
    if (ASSET_INDEX[symbol] && !found.includes(symbol)) found.push(symbol);
  }

  // 3. Company and asset names from the curated alias list.
  for (const term of NAME_TERMS) {
    if (found.length >= 4) break;
    if (AMBIGUOUS_ALIASES.has(term)) continue;
    const symbol = NAME_ALIASES[term];
    if (!ASSET_INDEX[symbol] || found.includes(symbol)) continue;
    if (new RegExp(`(^|[^a-z])${escapeRe(term)}([^a-z]|$)`).test(lower)) found.push(symbol);
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

// A hard, quotable fact: a percentage, a money amount, a ratio.
const FIGURE_RE = new RegExp([
  '[+\\-−]?\\d[\\d.,]*\\s?(?:%|percent|per cent|pc\\b|bps|basis points|points)',
  '(?:\\$|₹|€|£|rs\\.?)\\s?\\d[\\d.,]*\\s?(?:bn|billion|mn|million|trillion|crore|lakh|cr\\b)?',
  '[+\\-−]?\\d[\\d.,]*\\s?(?:bn|billion|mn|million|trillion|crore|lakh|cr\\b)',
  '\\b\\d+\\s?:\\s?\\d+\\b',
  '\\b\\d+\\s?(?:x|times)\\b',
].join('|'), 'i');

const WHY_METRICS = [
  'net profit', 'profit', 'revenue', 'sales', 'margin', 'earnings', 'income', 'ebitda', 'eps',
  'dividend', 'bonus issue', 'output', 'production', 'shipments', 'orders', 'inflation',
  'repo rate', 'interest rate', 'rate', 'gdp', 'jobs', 'payrolls', 'unemployment', 'tariff',
  'fine', 'penalty', 'stake', 'holdings', 'capacity', 'guidance', 'forecast', 'loss', 'losses',
  'growth', 'volume', 'barrels', 'tonnes', 'users', 'subscribers', 'capex', 'investment',
  'deposits', 'loans', 'deals', 'hack', 'stolen', 'outage', 'cut',
];

/**
 * The "Why" line: the headline's own concrete fact, said as tightly as it can
 * be said — "Profit jumps 55% as data demand drives earnings growth". A figure
 * is required, because without one the line can only be a template ("Company
 * results and guidance for the quarter") and a template is worse than nothing:
 * it then returns '' and the UI hides the row.
 */
function specificWhy(title: string): string {
  const clean = String(title || '').replace(/^(exclusive|breaking|update \d+|analysis)\s*[:\-]\s*/i, '');
  // Split into clauses without cutting a number in half ("Rs 30,106 cr").
  const guarded = clean.replace(/(\d),(\d)/g, '$1\u0000$2');
  const clauses = guarded.split(/[,;:—–]|\s-\s/)
    .map((c) => c.replace(/\u0000/g, ',').trim())
    .filter(Boolean);

  for (const clause of clauses) {
    const figure = clause.match(FIGURE_RE);
    if (!figure || figure.index === undefined) continue;

    const lower = lc(clause);
    const metricAt = WHY_METRICS
      .map((m) => lower.indexOf(m))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b)[0];
    if (metricAt === undefined) continue;

    // Drop the company name in front of the metric ("ITC Q2 Results: Profit …"),
    // but only when the number survives the cut.
    let core = metricAt > 0 ? clause.slice(metricAt) : clause;
    if (core.split(/\s+/).length < 3 || !FIGURE_RE.test(core)) core = clause;

    core = core.replace(/^[^A-Za-z0-9$₹€£+\-\d]+/, '').replace(/\s+/g, ' ').trim();
    if (core.length > 120) continue;

    // A line that only repeats the headline adds nothing — hide it.
    const norm = (v: string) => lc(v).replace(/[^a-z0-9 %.$-]/g, '').trim();
    const coreNorm = norm(core);
    const titleNorm = norm(clean);
    if (titleNorm.startsWith(coreNorm) && coreNorm.length / titleNorm.length > 0.7) continue;

    const line = core.charAt(0).toUpperCase() + core.slice(1);
    return `${line.replace(/[.,;:\s]+$/, '')}.`;
  }
  return '';
}

/**
 * Importance is a different question from relevance: not "is this about the
 * market" but "how much does it move". A rate decision, an inflation or jobs
 * print, a mega-cap's earnings, a major regulatory action, or a war touching
 * energy prices outranks a routine results note even when both are relevant.
 */
const MEGA_CAPS = new Set([
  'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'AVGO', 'BRK.B',
  'LLY', 'JPM', 'TSM', 'V', 'UNH', 'XOM',
]);

const IMPORTANCE_MARKERS: { weight: number; terms: string[] }[] = [
  {
    weight: 26,
    terms: [
      'fomc', 'federal reserve', 'rate decision', 'rate cut', 'rate hike', 'interest rate decision',
      'ecb', 'riksbank', 'riksbanken', 'bank of japan', 'boj', 'bank of england', 'pboc',
      'central bank', 'monetary policy', 'styrränta', 'räntebesked',
    ],
  },
  {
    weight: 22,
    terms: [
      'inflation', 'cpi', 'ppi', 'payrolls', 'jobs report', 'nonfarm', 'unemployment', 'gdp',
      'retail sales', 'pmi', 'consumer confidence',
    ],
  },
  {
    weight: 20,
    terms: ['antitrust', 'sec ', 'doj', 'ftc', 'lawsuit', 'tariff', 'tariffs', 'sanction', 'sanctions',
      'regulation', 'probe', 'investigation', 'ban ', 'embargo', 'export controls'],
  },
  {
    weight: 20,
    terms: ['war', 'invasion', 'conflict', 'escalation', 'blockade', 'military', 'ceasefire'],
  },
  {
    weight: 14,
    terms: ['default', 'bankruptcy', 'bailout', 'contagion', 'crash', 'halted', 'emergency'],
  },
];

function importanceFor(
  title: string,
  summary: string | undefined,
  symbols: string[],
  category: NewsCategory,
  score: number,
  source: string | undefined,
): number {
  const text = lc(`${title} ${summary || ''}`);
  let importance = Math.round(score * 0.35);

  for (const marker of IMPORTANCE_MARKERS) {
    if (termHits(text, marker.terms) > 0) importance += marker.weight;
  }

  // A war or a sanction set matters most when it touches energy supply.
  const energy = termHits(text, ['oil', 'crude', 'gas', 'energy', 'shipping', 'red sea', 'pipeline']);
  if (energy > 0 && (category === 'Commodities' || termHits(text, ['war', 'conflict', 'sanction', 'sanctions']) > 0)) {
    importance += 18;
  }

  // Mega-cap earnings move indexes, not just one ticker.
  const mega = symbols.some((s) => MEGA_CAPS.has(s));
  if (mega && termHits(text, ['earnings', 'results', 'revenue', 'profit', 'guidance', 'forecast']) > 0) {
    importance += 24;
  }

  if (isTier1(source || '')) importance += 6;
  return Math.max(0, Math.min(100, Math.round(importance)));
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
  via?: string;
  /** First-party sources (filings, central-bank releases) start above zero. */
  boost?: number;
}): ScoredArticle | null {
  const title = String(raw.title || '').trim();
  const url = String(raw.url || '').trim();
  if (!title || !url) return null;

  const headline = lc(title);
  const indiaIndex = isIndiaIndex(headline);
  const text = lc(`${title} ${raw.summary || ''}`);

  // Themes
  const matched: { theme: Theme; hits: number }[] = [];
  for (const theme of THEMES) {
    const hits = termHits(text, theme.terms);
    if (hits > 0) matched.push({ theme, hits });
  }

  const themeScore = Math.min(58, matched.reduce((sum, m) => sum + m.theme.weight + (m.hits - 1) * 3, 0));
  const penalty = PENALTIES.reduce((sum, p) => sum + (termHits(text, p.terms) > 0 ? p.weight : 0), 0);
  // Tagging reads the headline only: a company mentioned in passing in the body
  // is not what the article is about.
  const symbols = extractSymbols(title);

  // Feature, long-read, photo and video sections are not market reporting.
  const urlPenalty = /\/features\/|\/longform\/|\/photos?\/|\/gallery\/|\/video\/|\/slideshow\//.test(lc(url)) ? -26 : 0;
  // A question headline is nearly always analysis rather than news.
  const questionPenalty = /[?]$/.test(title.trim()) ? -12 : 0;
  // A weak theme with no named asset is not market-relevant enough on its own.
  const weakThemePenalty = themeScore < 20 && symbols.length === 0 ? -10 : 0;

  // A benchmark story is market news even when the headline uses no theme word.
  let score = 26 + themeScore + (symbols.length ? 14 : 0) + penalty + urlPenalty
    + questionPenalty + weakThemePenalty + (indiaIndex ? 18 : 0) + (raw.boost || 0);
  score = Math.max(0, Math.min(100, Math.round(score)));

  if (score < MIN_RELEVANCE) return null;

  // Category comes from the HEADLINE (the subject). Words in the body must not
  // reclassify a story: "Nifty, Sensex extend gains" is not a commodity piece
  // just because the wrap-up lists oil stocks.
  const rankThemes = (pool: { theme: Theme; hits: number }[]) => {
    const ranked = pool.slice().sort((a, b) => b.theme.weight - a.theme.weight);
    const specific = ranked.find((m) => m.theme.id !== 'geopolitics' && m.theme.id !== 'markets');
    return ranked.find((m) => m.theme.id === 'macro')
      || specific
      || ranked.find((m) => m.theme.id === 'geopolitics')
      || ranked[0];
  };
  const headlineThemes = THEMES
    .map((theme) => ({ theme, hits: termHits(headline, theme.terms) }))
    .filter((m) => m.hits > 0);

  const primary = rankThemes(headlineThemes) || rankThemes(matched);
  let category: NewsCategory = primary ? primary.theme.category : 'Stocks';

  if (indiaIndex) {
    const macroTheme = THEMES.find((t) => t.id === 'macro');
    const macroInHeadline = macroTheme ? termHits(headline, macroTheme.terms) > 0 : false;
    category = macroInHeadline ? 'Macro' : 'Stocks';
  }

  const sentiment = sentimentFor(text);
  const region = indiaIndex
    ? ('Asia' as NewsRegion)
    : detectRegion(text, raw.regionHint || 'Global', category);

  // Affects: only assets this headline actually names. A theme proxy ("markets
  // → SPY") produced confident nonsense, and no line beats a wrong line.
  const affects: string[] = symbols.map((s) => `$${s}`);
  const affectSymbols = new Set(symbols);
  if (indiaIndex && ASSET_INDEX['INDA'] && !affects.includes('$INDA')) {
    affects.push('$INDA');
    affectSymbols.add('INDA');
  }
  // A commodity label only when the headline names that commodity — and never
  // on an index wrap-up, where "metal and oil stocks" means sectors, not crude.
  if (!indiaIndex) {
    for (const { label, re } of COMMODITY_LABELS) {
      if (re.test(headline) && !affects.includes(label)) affects.push(label);
    }
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
    why: specificWhy(title),
    relevanceScore: score,
    importance: importanceFor(title, raw.summary, symbols, category, score, raw.source),
    via: raw.via,
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
 * Worldwide publisher feeds — free, no key, no rate limit worth managing, and
 * each answers in well under a second from the function runtime.
 *
 * Google News answers 503 to server-side requests, so the worldwide coverage is
 * built from publisher feeds and official institutions instead: one or two per
 * region, each published as headline + link (the form we display).
 */
const FEEDS: { region: NewsRegion; url: string; source?: string }[] = [
  { region: 'US', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },
  { region: 'US', url: 'https://feeds.content.dowjones.io/public/rss/mw_topstories' },
  { region: 'Europe', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
  { region: 'Asia', url: 'https://www.scmp.com/rss/92/feed' },
  { region: 'Asia', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
  { region: 'Nordics', url: 'https://www.di.se/rss' },
  { region: 'Nordics', url: 'https://www.svt.se/nyheter/ekonomi/rss.xml' },
  { region: 'Latin America', url: 'https://www.riotimesonline.com/feed/' },
  { region: 'Latin America', url: 'https://latinfinance.com/feed/' },
  { region: 'Africa', url: 'https://businessday.ng/feed/' },
  { region: 'Africa', url: 'https://www.moneyweb.co.za/feed/' },
  { region: 'Africa', url: 'https://african.business/feed/' },
  { region: 'Africa', url: 'https://www.businesslive.co.za/rss/business/' },
  { region: 'Middle East', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  // Official first-party releases: the source is the institution itself.
  { region: 'US', url: 'https://www.federalreserve.gov/feeds/press_all.xml', source: 'Federal Reserve' },
  { region: 'Europe', url: 'https://www.ecb.europa.eu/rss/press.html', source: 'ECB' },
  { region: 'Nordics', url: 'https://www.riksbank.se/en-gb/rss/press-releases/', source: 'Sveriges Riksbank' },
];

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
  const out: { title: string; summary: string; source: string; url: string; publishedAt: string | null }[] = [];
  // <item> may carry attributes (Riksbank writes <item xml:base="…">), so split
  // on the tag name rather than the literal opening tag.
  const items = String(xml || '').split(/<item\b/).slice(1);
  for (const item of items) {
    const rawTitle = decodeEntities((item.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
    const link = decodeEntities((item.match(/<link>([\s\S]*?)<\/link>/) || [])[1])
      || decodeEntities((item.match(/<guid[^>]*>([\s\S]*?)<\/guid>/) || [])[1]);
    const summary = decodeEntities((item.match(/<description>([\s\S]*?)<\/description>/) || [])[1]).slice(0, 300);
    const pub = (item.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [])[1]
      || (item.match(/<dc:date>([\s\S]*?)<\/dc:date>/) || [])[1];
    if (!rawTitle || !link) continue;
    const { title, source } = splitHeadline(rawTitle);
    const date = pub ? new Date(pub) : null;
    out.push({
      title,
      summary,
      source,
      url: link,
      publishedAt: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
    });
  }
  return out;
}

function publisherFromUrl(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    const known: Record<string, string> = {
      'cnbc.com': 'CNBC', 'feeds.a.dj.com': 'WSJ', 'feeds.content.dowjones.io': 'MarketWatch',
      'feeds.bbci.co.uk': 'BBC', 'scmp.com': 'SCMP', 'economictimes.indiatimes.com': 'Economic Times',
      'riotimesonline.com': 'Rio Times', 'businessday.ng': 'BusinessDay', 'moneyweb.co.za': 'Moneyweb',
      'aljazeera.com': 'Al Jazeera',
    };
    for (const [domain, name] of Object.entries(known)) {
      if (host.endsWith(domain)) return name;
    }
    return host;
  } catch (_) {
    return 'News';
  }
}

import { logDiag } from './diagLog.ts';

async function fetchFeed(region: NewsRegion, url: string, sourceOverride?: string) {
  try {
    const startedAt = Date.now();
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        Accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
      },
    });
    if (!res.ok) {
      logDiag({ type: 'news_error', source: publisherFromUrl(url), ok: false, durationMs: Date.now() - startedAt, detail: `HTTP ${res.status}` });
      return [];
    }
    const xml = await res.text();
    const publisher = publisherFromUrl(url);
    logDiag({ type: 'news_ok', source: publisher, ok: true, durationMs: Date.now() - startedAt });
    return parseRss(xml).slice(0, 18).map((r) => ({
      title: r.title,
      summary: r.summary,
      url: r.url,
      image: null as string | null,
      source: sourceOverride || r.source || publisher,
      publishedAt: r.publishedAt,
      regionHint: region,
      boost: sourceOverride ? 24 : 0,
    }));
  } catch (error) {
    logDiag({ type: 'news_error', source: publisherFromUrl(url), ok: false, detail: error.message });
    return [];
  }
}



/**
 * SEC EDGAR — a company's own 8-K (material event) filing. First-party,
 * official and free; SEC asks only for a descriptive User-Agent with a contact
 * address. Only filings from companies in the app's universe are kept, and the
 * headline is written in plain English so the feed reads like news.
 */
const EDGAR_UA = 'TREDIO market news admin@tredio.app';

function companySymbols(company: string): string[] {
  const name = lc(company)
    .replace(/\b(inc|corp|corporation|co|company|ltd|plc|holdings|group|the)\b\.?/g, ' ')
    .replace(/[^a-z0-9& ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const hits: string[] = [];
  for (const [alias, symbol] of Object.entries(NAME_ALIASES)) {
    if (AMBIGUOUS_ALIASES.has(alias)) continue;
    if (!ASSET_INDEX[symbol] || hits.includes(symbol)) continue;
    if (name === alias || name.startsWith(`${alias} `) || name.includes(` ${alias} `)) hits.push(symbol);
  }
  return hits;
}

async function edgarFilings() {
  try {
    const res = await fetch(
      'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&company=&dateb=&owner=include&count=40&output=atom',
      {
        headers: { 'User-Agent': EDGAR_UA, Accept: 'application/atom+xml' },
        signal: AbortSignal.timeout(9000),
      },
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const out: any[] = [];
    for (const entry of xml.split(/<entry\b/).slice(1)) {
      // "8-K - APPLE INC (0000320193) (Filer)"
      const raw = decodeEntities((entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1]);
      const href = (entry.match(/<link[^>]*href="([^"]+)"/) || [])[1];
      const updated = (entry.match(/<updated>([\s\S]*?)<\/updated>/) || [])[1];
      if (!raw || !href) continue;
      const form = (raw.match(/^(\d+-[A-Z]+)/) || [])[1] || '8-K';
      const company = raw.replace(/^\d+-[A-Z]+\s*-\s*/, '').replace(/\s*\([^)]*\)/g, ' ').trim();
      if (!company || companySymbols(company).length === 0) continue;
      const label = company.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase());
      out.push({
        title: `${label} files ${form} filing`,
        summary: `New ${form} on file with the SEC — a material corporate event for ${label}.`,
        url: href.startsWith('http') ? href : `https://www.sec.gov${href}`,
        source: 'SEC EDGAR',
        publishedAt: updated ? new Date(updated).toISOString() : null,
        regionHint: 'US' as NewsRegion,
        boost: 34,
      });
    }
    return out.slice(0, 8);
  } catch (_) {
    return [];
  }
}

/** GDELT's seendate is 20261101T093000Z. */
function gdeltDate(value: string): string | null {
  const m = String(value || '').match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/);
  if (!m) return null;
  return new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z`).toISOString();
}

/**
 * GDELT — the global event index, used with attribution ("Source: GDELT").
 * Its document API serves one request every five seconds, so this issues
 * exactly one query per pool build and treats a refusal as "nothing this
 * cycle" rather than failing the feed.
 */
async function gdeltArticles() {
  try {
    const query = '(markets OR inflation OR "central bank" OR earnings OR tariffs)';
    const url = 'https://api.gdeltproject.org/api/v2/doc/doc'
      + `?query=${encodeURIComponent(query)}&mode=artlist&maxrecords=25&format=json&timespan=6h&sort=hybridrel`;
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) return [];
    const data = await res.json().catch(() => null);
    const list = Array.isArray(data?.articles) ? data.articles : [];
    return list.slice(0, 15).map((a: any) => ({
      title: a.title,
      summary: '',
      url: a.url,
      image: a.socialimage || null,
      source: String(a.domain || 'GDELT'),
      publishedAt: gdeltDate(a.seendate),
      via: 'GDELT',
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

  // 1b. Official and index sources: SEC 8-K filings for our universe, and the
  //     single GDELT query for the cycle.
  const [filings, gdelt] = await Promise.all([edgarFilings(), gdeltArticles()]);
  const scoredFilings = filings.map((r) => classifyArticle(r)).filter(Boolean) as ScoredArticle[];
  const scoredGdelt = gdelt.map((r) => classifyArticle(r)).filter(Boolean) as ScoredArticle[];

  // 2. Worldwide coverage: one publication feed per region, plus official
  //    central-bank releases. Each feed is a different host, so they run in
  //    parallel, and a feed that fails keeps its own last good batch.
  const feedBatches = await Promise.all(
    FEEDS.map(async ({ region, url, source }) => {
      const raw = await fetchFeed(region, url, source);
      const scored = raw.map((r) => classifyArticle(r)).filter(Boolean) as ScoredArticle[];
      if (scored.length > 0) {
        cache.regions.set(url, { articles: scored, at: Date.now() });
        return scored;
      }
      const previous = cache.regions.get(url);
      return previous && Date.now() - previous.at < REGION_TTL_MS ? previous.articles : [];
    }),
  );

  const regions = feedBatches;

  // 3. Score Finnhub's batch, then merge everything.
  const scoredFinnhub = finnhubRaw.map((r) => classifyArticle(r)).filter(Boolean) as ScoredArticle[];
  const all = [...scoredFinnhub, ...scoredFilings, ...scoredGdelt, ...regions.flat()];

  const deduped = dedupeEvents(all);
  deduped.sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));

  console.log(`[news] pool built: ${deduped.length} relevant articles `
    + `(finnhub ${scoredFinnhub.length}, sec ${scoredFilings.length}, `
    + `gdelt ${scoredGdelt.length}, feeds ${regions.flat().length}); `
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