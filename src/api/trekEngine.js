import { buildMarketContext, fetchStockRSI, fetchStockPrice } from '@/api/marketContext';

const SYMBOLS = ['NVDA', 'AAPL', 'TSLA', 'SPY'];

export function calculateSignalConfidence(rsi, change24h) {
  let score = 50;
  if (Number.isFinite(rsi)) {
    if (rsi < 30) score += 20;
    else if (rsi < 40) score += 10;
    else if (rsi > 70) score -= 20;
    else if (rsi > 60) score -= 5;
  }

  const chg = change24h ?? 0;
  if (chg > 3) score += 15;
  else if (chg > 1) score += 8;
  else if (chg < -3) score -= 15;
  else if (chg < -1) score -= 8;

  return Math.min(99, Math.max(20, Math.round(score)));
}

export function detectJump(change24h) {
  return Math.abs(change24h ?? 0) > 4;
}

export function detectLoss(change24h) {
  return (change24h ?? 0) < -3;
}

function deriveSignal(rsi, change24h) {
  const chg = change24h ?? 0;
  if (Number.isFinite(rsi) && rsi < 35) return 'BUY';
  if (Number.isFinite(rsi) && rsi > 68) return 'SELL';
  if (chg > 4) return 'BUY';
  if (chg < -4) return 'SELL';
  if (chg > 1.5) return 'BUY';
  if (chg < -1.5) return 'SELL';
  return 'WATCH';
}

function buildOneLiner(symbol, signal, rsi, change24h) {
  const chg = change24h != null ? `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%` : 'N/A';
  // RSI is only quoted when the provider actually returned one.
  const basis = Number.isFinite(rsi) ? `RSI ${rsi}, ${chg}` : `${chg} in 24h`;
  if (signal === 'BUY') return `${symbol} showing momentum (${basis}) — potential entry zone.`;
  if (signal === 'SELL') return `${symbol} showing weakness (${basis}) — consider risk management.`;
  if (signal === 'AVOID') return `${symbol} showing weakness (${basis}) — avoid entry.`;
  return `${symbol} in consolidation (${basis}) — watch for breakout direction.`;
}

async function buildStockSignal(symbol) {
  const [rsi, quote] = await Promise.all([
    fetchStockRSI(symbol),
    fetchStockPrice(symbol),
  ]);
  const price = quote?.price ?? null;
  // No price means no signal. A placeholder card is worse than no card.
  if (price == null) return null;

  const change24h = quote?.change24h ?? 0;
  const signal = deriveSignal(rsi, change24h);
  return {
    symbol,
    price,
    change24h,
    rsi,
    signal,
    confidence: calculateSignalConfidence(rsi, change24h),
    jumpDetected: detectJump(change24h),
    lossDetected: detectLoss(change24h),
    oneLiner: buildOneLiner(symbol, signal, rsi, change24h),
  };
}

function buildCryptoSignal(symbol, marketContext, priceKey, changeKey) {
  const price = marketContext?.[priceKey] ?? null;
  if (price == null) return null;

  const change24h = marketContext?.[changeKey] ?? 0;
  // The crypto provider gives no RSI, so none is invented or reported.
  const rsi = null;
  const signal = deriveSignal(rsi, change24h);
  return {
    symbol,
    price,
    change24h,
    rsi,
    signal,
    confidence: calculateSignalConfidence(rsi, change24h),
    jumpDetected: detectJump(change24h),
    lossDetected: detectLoss(change24h),
    oneLiner: buildOneLiner(symbol, signal, rsi, change24h),
  };
}

export async function runTREKEngine() {
  const [marketContext, ...stockSignals] = await Promise.allSettled([
    buildMarketContext(),
    ...SYMBOLS.map(sym => buildStockSignal(sym)),
  ]);

  const ctx = marketContext.status === 'fulfilled' ? marketContext.value : {};

  const signals = [
    ...stockSignals.map(r => (r.status === 'fulfilled' ? r.value : null)),
    buildCryptoSignal('BTC', ctx, 'btc_price', 'btc_change_24h'),
    buildCryptoSignal('ETH', ctx, 'eth_price', 'eth_change_24h'),
  ].filter(Boolean);

  return {
    signals,
    marketContext: ctx,
    generatedAt: new Date().toISOString(),
  };
}