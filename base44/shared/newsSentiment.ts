// Shared news sentiment guard — keeps a directional read honest.
// Used by newsInterpreter so a headline carrying a known negative term, or a
// low-confidence read, is never published as bullish.

const RISK_TERMS = [
  'lawsuit', 'investigation', 'probe', 'fraud', 'recall', 'downgrade',
  'bankruptcy', 'insolvent', 'default', 'sanction', 'halted', 'delisted',
  'warns', 'warning', 'misses', 'cuts guidance', 'layoff', 'resign',
  'strike', 'outage', 'breach', 'penalty', 'short seller', 'selloff',
];

export type Bias = 'bullish' | 'bearish' | 'neutral';

export function hasRiskTerm(text: unknown): boolean {
  const haystack = String(text || '').toLowerCase();
  return RISK_TERMS.some((term) => haystack.includes(term));
}

export function applySentimentGuard(rawBias: unknown, rawConfidence: unknown, text: unknown): Bias {
  const bias = String(rawBias || 'neutral').toLowerCase();
  const base: Bias = bias === 'bullish' || bias === 'bearish' ? bias : 'neutral';
  const confidence = Number(rawConfidence);

  // A headline that names a known risk term is never published as bullish.
  if (hasRiskTerm(text)) return base === 'bearish' ? 'bearish' : 'neutral';

  // Too uncertain to be directional.
  if (!Number.isFinite(confidence) || confidence < 60) return 'neutral';

  return base;
}