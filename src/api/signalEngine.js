// Signal Engine: Derives BUY/SELL/WATCH/AVOID signals from live market data
// Uses price action, momentum, volatility, and trend context
// CANONICAL SIGNALS: BUY, SELL, WATCH, AVOID (normalized at source, never in UI)

export function deriveSignal(asset, priceData, context = {}) {
  const { price, prevClose, change24h, high24h, low24h } = priceData;
  
  // Handle missing data gracefully
  if (!price || price === null) {
    return {
      signal: 'WATCH',
      confidence: 0,
      reason: 'Price data unavailable',
      isLiveDerived: false
    };
  }

  // Calculate metrics
  const dailyChange = prevClose ? ((price - prevClose) / prevClose) * 100 : (change24h || 0);
  const dailyRange = high24h && low24h ? ((high24h - low24h) / low24h) * 100 : 0;
  const volatility = dailyRange > 5 ? 'HIGH' : dailyRange > 2 ? 'MEDIUM' : 'LOW';
  
  // Momentum score (-10 to +10)
  let momentumScore = 0;
  
  // Price vs previous close (weight: 40%)
  if (dailyChange > 3) momentumScore += 4;
  else if (dailyChange > 1) momentumScore += 2;
  else if (dailyChange < -3) momentumScore -= 4;
  else if (dailyChange < -1) momentumScore -= 2;
  
  // Absolute change magnitude (weight: 30%)
  if (Math.abs(dailyChange) > 5) momentumScore += dailyChange > 0 ? 3 : -3;
  else if (Math.abs(dailyChange) > 2) momentumScore += dailyChange > 0 ? 1.5 : -1.5;
  
  // Context adjustments (weight: 30%)
  if (context.marketSentiment === 'BULLISH') momentumScore += 2;
  else if (context.marketSentiment === 'BEARISH') momentumScore -= 2;
  
  if (asset.sector === 'Technology' && context.techTrend === 'UP') momentumScore += 1;
  else if (asset.sector === 'Energy' && context.oilTrend === 'UP') momentumScore += 1;
  
  // Derive signal from momentum score
  let signal, confidence, reason;
  
  if (momentumScore >= 6) {
    signal = 'BUY';
    confidence = Math.min(85 + (momentumScore - 6) * 3, 95);
    reason = dailyChange > 3 
      ? `Strong momentum: +${dailyChange.toFixed(1)}% with ${volatility.toLowerCase()} volatility`
      : `Positive momentum in ${asset.sector} sector`;
  } else if (momentumScore >= 2) {
    signal = 'BUY';
    confidence = 65 + (momentumScore - 2) * 5;
    reason = dailyChange > 0
      ? `Moderate uptick: +${dailyChange.toFixed(1)}%, watch for continuation`
      : `Consolidating near support, potential bounce`;
  } else if (momentumScore <= -6) {
    signal = 'SELL';
    confidence = Math.min(85 + Math.abs(momentumScore + 6) * 3, 95);
    reason = dailyChange < -3
      ? `Weakness: ${dailyChange.toFixed(1)}% decline, ${volatility.toLowerCase()} volatility`
      : `Selling pressure in ${asset.sector} sector`;
  } else if (momentumScore <= -2) {
    signal = 'SELL';
    confidence = 65 + Math.abs(momentumScore + 2) * 5;
    reason = dailyChange < 0
      ? `Moderate decline: ${dailyChange.toFixed(1)}%, monitor support`
      : `Underperforming sector, caution advised`;
  } else {
    signal = 'WATCH';
    confidence = 50 + Math.abs(momentumScore) * 8;
    reason = Math.abs(dailyChange) < 1
      ? `Sideways action: ${dailyChange.toFixed(1)}% change, low volatility`
      : `Mixed signals: ${dailyChange.toFixed(1)}% in ${volatility.toLowerCase()} volatility`;
  }
  
  // Special handling for crypto (higher volatility threshold)
  if (asset.sector === 'Crypto') {
    if (Math.abs(dailyChange) > 8) {
      confidence = Math.min(confidence + 5, 95);
      reason = `Crypto volatility: ${dailyChange > 0 ? '+' : ''}${dailyChange.toFixed(1)}% - ${dailyChange > 0 ? 'bullish' : 'bearish'} momentum`;
    }
  }
  
  // Special handling for ETFs (lower confidence on single-day moves)
  if (asset.sector === 'ETF') {
    confidence = Math.max(confidence - 10, 45);
    if (signal === 'BUY' || signal === 'SELL') {
      reason += ' (broad market exposure)';
    }
  }
  
  return {
    signal,
    confidence: Math.round(confidence),
    reason,
    isLiveDerived: true,
    metrics: {
      momentumScore: Math.round(momentumScore * 10) / 10,
      dailyChange: Math.round(dailyChange * 100) / 100,
      volatility
    }
  };
}

export function batchDeriveSignals(assets, priceDataMap, context = {}) {
  const signals = {};
  assets.forEach(asset => {
    const priceData = priceDataMap[asset.symbol] || {};
    signals[asset.symbol] = deriveSignal(asset, priceData, context);
  });
  return signals;
}