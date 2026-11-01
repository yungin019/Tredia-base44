// Shared news sentiment guard — keeps a directional read honest.
// Used by newsInterpreter so a headline that names a shortage, a record low, a
// conflict, a strike or a crisis is never published as bullish, and an attack or
// data breach is always bearish.

// Always bearish, whatever the model suggested.
const BEARISH_TERMS = [
  'hack', 'hacked', 'hacking', 'hacker', 'hacks', 'breach', 'breached', 'ransomware',
  'cyberattack', 'cyber attack', 'exploit', 'exploited', 'data leak', 'leaked',
  'malware', 'stolen', 'outage', 'attack', 'attacks',
];

// Swedish/Nordic forms, matched as substrings because these languages build
// compounds ("kryptobörsen", "hackades", "attacken").
const BEARISH_TERMS_LOCAL = [
  'hack', 'hackad', 'hackade', 'hackades', 'hackat', 'hackare',
  'attack', 'attacken', 'attacker', 'intrång', 'dataintrång',
];

// Never bullish: neutral unless the model already read it as bearish.
const RISK_TERMS = [
  'lawsuit', 'investigation', 'probe', 'fraud', 'recall', 'downgrade',
  'bankruptcy', 'insolvent', 'default', 'sanction', 'sanctions', 'halted', 'delisted',
  'warns', 'warning', 'misses', 'cuts guidance', 'layoff', 'layoffs', 'resign',
  'strike', 'strikes', 'walkout', 'shortage', 'shortages', 'shortfall',
  'record low', 'record lows', 'lowest since', 'crisis', 'conflict', 'war',
  'invasion', 'escalation', 'attack', 'selloff', 'sell-off', 'glitch', 'penalty',
  'short seller', 'delay', 'delays', 'halt', 'impairment', 'write-down', 'writedown',
];

// Never bullish, in Swedish/Danish/Norwegian: a theft, a fire, a crisis, a
// shortage, a bankruptcy or a sanction set is never a reason to be positive.
const RISK_TERMS_LOCAL = [
  'stöld', 'stölden', 'stulna', 'stulet', 'stulen', 'kupp', 'kuppen',
  'brand', 'branden', 'brann', 'brinner', 'kris', 'krisen',
  'brist', 'bristen', 'konkurs', 'konkursen', 'sanktion', 'sanktioner',
  'krig', 'konflikt', 'strejk', 'vinstvarning', 'nedskrivning',
];

export type Bias = 'bullish' | 'bearish' | 'neutral';

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toRegex = (terms: string[]) => new RegExp(`\\b(${terms.map(escape).join('|')})\\b`, 'i');

const BEARISH_RE = toRegex(BEARISH_TERMS);
const RISK_RE = toRegex(RISK_TERMS);

const hasAny = (body: string, terms: string[]) => terms.some((t) => body.includes(t));

export function hasBearishTerm(text: unknown): boolean {
  const body = String(text || '').toLowerCase();
  return BEARISH_RE.test(body) || hasAny(body, BEARISH_TERMS_LOCAL);
}

export function hasRiskTerm(text: unknown): boolean {
  const body = String(text || '').toLowerCase();
  return RISK_RE.test(body) || hasAny(body, RISK_TERMS_LOCAL);
}

export function applySentimentGuard(rawBias: unknown, rawConfidence: unknown, text: unknown): Bias {
  const bias = String(rawBias || 'neutral').toLowerCase();
  const base: Bias = bias === 'bullish' || bias === 'bearish' ? bias : 'neutral';
  const body = String(text || '');
  const confidence = Number(rawConfidence);

  // An attack, breach or outage is bearish — never neutral, never bullish.
  if (hasBearishTerm(body)) return 'bearish';

  // Shortages, record lows, conflicts, strikes and crises are never bullish.
  if (hasRiskTerm(body)) return base === 'bearish' ? 'bearish' : 'neutral';

  // Too uncertain to be directional.
  if (!Number.isFinite(confidence) || confidence < 60) return 'neutral';

  return base;
}