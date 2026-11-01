/**
 * Cross-language event merging for the news feed.
 *
 * One story reaches us in several languages from several publishers, so
 * comparing raw headlines only catches the English versions: the Swedish and
 * English reports of the same crypto hack share no words at all. Every headline
 * is therefore normalized first — Nordic finance vocabulary maps onto its
 * English equivalent ("kryptobörs" → "crypto exchange", "kupp" → "hack") — and
 * two articles count as one event when, inside a 24-hour window, they share
 * entities, figures or tickers as well as wording. One slot per event, and the
 * best source wins it: official first, then tier-1, then the highest score.
 */

import { isOfficial, isTier1 } from './newsSourceRank.ts';

const LEXICON: Record<string, string> = {
  kryptobörs: 'crypto exchange', kryptobörsen: 'crypto exchange', kryptobörser: 'crypto exchange',
  kryptovaluta: 'crypto', krypto: 'crypto', börs: 'market', börsen: 'market',
  stöld: 'hack', stölden: 'hack', stölderna: 'hack', stulna: 'stolen', stulet: 'stolen',
  kupp: 'hack', kuppen: 'hack', miljardkupp: 'billion hack', hackad: 'hack', hackade: 'hack',
  hackades: 'hack', intrång: 'breach', attack: 'attack', attacken: 'attack', attacker: 'attack',
  raffinaderi: 'refinery', raffinaderiet: 'refinery', brand: 'fire', branden: 'fire', brinner: 'fire',
  konkurs: 'bankruptcy', brist: 'shortage', bristen: 'shortage', kris: 'crisis', krisen: 'crisis',
  sanktion: 'sanctions', sanktioner: 'sanctions', krig: 'war', konflikt: 'conflict', strejk: 'strike',
  styrränta: 'policy rate', styrräntan: 'policy rate', ränta: 'rate', räntan: 'rate',
  räntebesked: 'rate decision', inflation: 'inflation', arbetslöshet: 'unemployment',
  tillväxt: 'growth', vinst: 'profit', vinsten: 'profit', omsättning: 'revenue',
  rapport: 'results', rapporten: 'results', kvartal: 'quarter', kvartalet: 'quarter',
  aktier: 'stocks', aktie: 'stock', olja: 'oil', oljepris: 'oil price', guld: 'gold', gas: 'gas',
  elpris: 'power price', elpriserna: 'power price', miljard: 'billion', miljarder: 'billion',
  miljon: 'million', miljoner: 'million', återbetalat: 'repaid',
  nordkorea: 'north korea', ryssland: 'russia', ryska: 'russia', ryskt: 'russia',
  kina: 'china', kinesiska: 'china', tyskland: 'germany', tyska: 'germany',
  sverige: 'sweden', svenska: 'sweden', norge: 'norway', danmark: 'denmark',
  företag: 'company', företaget: 'company', bolag: 'company', bolaget: 'company',
  stiger: 'rise', faller: 'fall', sänker: 'cut', höjer: 'raise',
};

/** Entities whose presence in both headlines identifies the same subject. */
const ENTITY_TOKENS = new Set([
  'korea', 'russia', 'china', 'germany', 'japan', 'iran', 'israel', 'ukraine', 'saudi',
  'india', 'nigeria', 'turkey', 'brazil', 'mexico', 'argentina', 'opec', 'federal',
  'reserve', 'ecb', 'riksbank', 'powell', 'trump', 'apple', 'nvidia', 'tesla', 'microsoft',
  'amazon', 'meta', 'google', 'bitcoin', 'ethereum', 'binance', 'bybit', 'coinbase',
  'openai', 'sec', 'fbi', 'fed', 'eu',
]);

const STOP_TOKENS = new Set([
  'the', 'a', 'an', 'and', 'or', 'for', 'to', 'of', 'in', 'on', 'at', 'as', 'is', 'are',
  'was', 'were', 'be', 'been', 'with', 'from', 'by', 'after', 'over', 'into', 'its', 'it',
  'this', 'that', 'than', 'says', 'said', 'amid', 'about', 'up', 'down', 'new', 'will',
]);

const MERGE_WINDOW_MS = 24 * 60 * 60 * 1000;

/** The fields the merger needs — satisfied by ScoredArticle. */
export type MergeableArticle = {
  title: string;
  source?: string;
  publishedAt?: string | null;
  relevanceScore: number;
  affectSymbols: string[];
};

const lc = (value: unknown) => String(value || '').toLowerCase();

function canonicalTokens(title: string): Set<string> {
  const words = lc(title).replace(/[^\p{L}\p{N} ]+/gu, ' ').split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const word of words) {
    const mapped = LEXICON[word];
    if (mapped) { out.push(...mapped.split(' ')); continue; }
    if (word.length > 2 && !STOP_TOKENS.has(word)) out.push(word);
  }
  return new Set(out);
}

function numbersIn(title: string): Set<string> {
  const out = new Set<string>();
  for (const match of lc(title).match(/\d[\d.,]*/g) || []) {
    const digits = match.replace(/[^\d]/g, '');
    if (digits.length >= 2) out.add(digits);
  }
  return out;
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  a.forEach((token) => { if (b.has(token)) intersection += 1; });
  return intersection / (a.size + b.size - intersection);
}

function sharedEntities(a: Set<string>, b: Set<string>): number {
  let hits = 0;
  a.forEach((token) => { if (ENTITY_TOKENS.has(token) && b.has(token)) hits += 1; });
  return hits;
}

type EventShape<T> = { article: T; tokens: Set<string>; numbers: Set<string>; time: number };

function sameEvent<T extends MergeableArticle>(a: EventShape<T>, b: EventShape<T>): boolean {
  const similarity = jaccard(a.tokens, b.tokens);
  if (similarity >= 0.55) return true;
  if (Math.abs(a.time - b.time) > MERGE_WINDOW_MS) return false;
  if (a.article.affectSymbols.some((s) => b.article.affectSymbols.includes(s)) && similarity >= 0.2) return true;
  if ([...a.numbers].some((n) => b.numbers.has(n)) && similarity >= 0.2) return true;
  if (sharedEntities(a.tokens, b.tokens) >= 1 && similarity >= 0.3) return true;
  return false;
}

/** One article per event; the best source keeps the slot. */
export function dedupeEvents<T extends MergeableArticle>(articles: T[]): T[] {
  const kept: EventShape<T>[] = [];
  const rank = (a: T) =>
    a.relevanceScore + (isOfficial(a.source || '') ? 20 : 0) + (isTier1(a.source || '') ? 12 : 0);

  for (const article of articles) {
    const shape: EventShape<T> = {
      article,
      tokens: canonicalTokens(article.title),
      numbers: numbersIn(article.title),
      time: article.publishedAt ? new Date(article.publishedAt).getTime() : Date.now(),
    };
    const duplicate = kept.find((k) => sameEvent(k, shape));
    if (!duplicate) {
      kept.push(shape);
      continue;
    }
    if (rank(article) > rank(duplicate.article)) Object.assign(duplicate, shape);
  }

  return kept.map((k) => k.article);
}