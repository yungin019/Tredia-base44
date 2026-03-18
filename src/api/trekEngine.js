import { buildMarketContext, fetchStockRSI, fetchStockPrice } from '@/api/marketContext';

const SYMBOLS = ['NVDA', 'AAPL', 'TSLA', 'SPY'];
const CRYPTO_IDS = { BTC: 'bitcoin', ETH: 'ethereum' };

export function calculateSignalConfidence(rsi, change24h) {
  let score = 50;
  if (rsi < 30) score += 20;
  else if (rsi < 40) score += 10;
  else if (rsi > 70) score -= 20;
  else if (rsi > 60) score -= 5;

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
  if (rsi < 35 || change24h > 4) return 'BUY';
  if (rsi > 68 || change24h < -4) return 'SELL';
  if (change24h > 1.5) return 'BUY';
  if (change24h < -1.5) return 'SELL';
  return 'HOLD';
}

function buildOneLiner(symbol, signal, rsi, change24h) {
  const chg = change24h != null ? `${change24h > 0 ? '+' : ''}${change24h.toFixed(2)}%` : 'N/A';
  if (signal === 'BUY') return `${symbol} showing momentum (RSI ${rsi}, ${chg}) — potential entry zone.`;
  if (signal === 'SELL') return `${symbol} showing weakness (RSI ${rsi}, ${chg}) — consider risk management.`;
  return `${symbol} in consolidation (RSI ${rsi}, ${chg}) — watch for breakout direction.`;
}

async function buildStockSignal(symbol) {
  const [rsi, quote] = await Promise.all([
    fetchStockRSI(symbol),
    fetchStockPrice(symbol),
  ]);
  const price = quote?.price ?? null;
  const change24h = quote?.change24h ?? 0;
  const signal = deriveSignal(rsi, change24h);
  const confidence = calculateSignalConfidence(rsi, change24h);
  return {
    symbol,
    price,
    change24h,
    rsi,
    signal,
    confidence,
    jumpDetected: detectJump(change24h),
    lossDetected: detectLoss(change24h),
    oneLiner: buildOneLiner(symbol, signal, rsi, change24h),
  };
}

function buildCryptoSignal(symbol, cryptoData, id) {
  const price = cryptoData?.[id]?.usd ?? null;
  const change24h = cryptoData?.[id]?.usd_24h_change ?? 0;
  const rsi = 55; // no RSI from CoinGecko free tier
  const signal = deriveSignal(rsi, change24h);
  const confidence = calculateSignalConfidence(rsi, change24h);
  return {
    symbol,
    price,
    change24h,
    rsi,
    signal,
    confidence,
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
  const cryptoData = {};
  if (ctx.btc_price) cryptoData['bitcoin'] = { usd: ctx.btc_price, usd_24h_change: ctx.btc_change_24h };
  if (ctx.eth_price) cryptoData['ethereum'] = { usd: ctx.eth_price, usd_24h_change: ctx.eth_change_24h };

  const signals = [
    ...stockSignals.map((r, i) =>
      r.status === 'fulfilled' ? r.value : {
        symbol: SYMBOLS[i], price: null, change24h: 0, rsi: 55,
        signal: 'HOLD', confidence: 50, jumpDetected: false, lossDetected: false,
        oneLiner: `${SYMBOLS[i]} data unavailable`,
      }
    ),
    buildCryptoSignal('BTC', cryptoData, 'bitcoin'),
    buildCryptoSignal('ETH', cryptoData, 'ethereum'),
  ];

  return {
    signals,
    marketContext: ctx,
    generatedAt: new Date().toISOString(),
  };
}