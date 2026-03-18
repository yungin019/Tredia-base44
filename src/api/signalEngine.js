export function calculateSignalConfidence({ rsi, volumeRatio, newsSentiment, fngValue }) {
  const technical = (rsi >= 45 && rsi <= 65) ? 90 : rsi > 65 ? 60 : 40;
  const sentiment = newsSentiment === 'BULLISH' ? 85 : newsSentiment === 'BEARISH' ? 20 : 50;
  const volume = volumeRatio > 2 ? 90 : volumeRatio > 1.5 ? 70 : volumeRatio > 1 ? 50 : 30;
  const macro = (fngValue >= 40 && fngValue <= 70) ? 85 : fngValue < 25 ? 30 : fngValue > 80 ? 35 : 60;
  const overall = Math.round((technical + sentiment + volume + macro) / 4);

  return { technical, sentiment, volume, macro, overall };
}

export function detectJump({ rsi, volumeRatio, newsSentiment, fngValue, aboveMA50 }) {
  const conditions = [
    rsi >= 45 && rsi <= 65,
    volumeRatio > 1.5,
    newsSentiment === 'BULLISH',
    fngValue <= 75,
    aboveMA50 === true,
  ];
  const met = conditions.filter(Boolean).length;

  if (met === 5) return { detected: true, confidence: 'HIGH' };
  if (met >= 3) return { detected: true, confidence: 'WATCH' };
  return { detected: false, confidence: null };
}

export function detectLoss({ rsi, newsSentiment, fngValue, change24h }) {
  const conditions = [
    rsi > 75 || rsi < 30,
    newsSentiment === 'BEARISH',
    fngValue < 25 || fngValue > 80,
    change24h < -3,
  ];
  const met = conditions.filter(Boolean).length;

  if (met >= 3) return { detected: true, severity: 'HIGH' };
  if (met === 2) return { detected: true, severity: 'MEDIUM' };
  return { detected: false, severity: null };
}