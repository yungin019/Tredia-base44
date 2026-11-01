// Signal → descriptive label. Internal codes (BUY/SELL/HOLD/WATCH/AVOID) stay
// in the logic; anything shown to a user reads as a market read, never an order.
const LABELS = {
  BUY: 'Bullish',
  'STRONG BUY': 'Bullish',
  BULLISH: 'Bullish',
  SELL: 'Bearish',
  'STRONG SELL': 'Bearish',
  AVOID: 'Bearish',
  BEARISH: 'Bearish',
  HOLD: 'Neutral',
  WAIT: 'Neutral',
  WATCH: 'Neutral',
  NEUTRAL: 'Neutral',
};

export function biasLabel(signal) {
  const key = String(signal || '').trim().toUpperCase();
  return LABELS[key] || 'Neutral';
}

export function biasSentiment(signal) {
  return biasLabel(signal).toUpperCase();
}