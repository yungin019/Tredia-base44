/**
 * Safe Data Validation & Rendering
 * Ensures no undefined, NaN, or object values ever reach the UI
 */

export const validatePrice = (value) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? null : num;
};

export const formatPrice = (value, decimals = 2) => {
  const validated = validatePrice(value);
  if (validated === null) return null;
  
  if (Math.abs(validated) >= 1000000) {
    return (validated / 1000000).toFixed(1) + 'M';
  }
  if (Math.abs(validated) >= 1000) {
    return (validated / 1000).toFixed(1) + 'K';
  }
  
  // Dynamic decimals: more for small prices, fewer for large
  const actualDecimals = validated < 10 ? Math.max(2, decimals) : Math.min(0, decimals - 1);
  return validated.toFixed(actualDecimals);
};

export const validatePercent = (value) => {
  if (value === null || value === undefined) return null;
  const num = Number(value);
  return isNaN(num) || !isFinite(num) ? null : num;
};

export const formatPercent = (value, decimals = 2) => {
  const validated = validatePercent(value);
  if (validated === null) return null;
  
  const sign = validated > 0 ? '+' : validated === 0 ? '' : '';
  return `${sign}${validated.toFixed(decimals)}%`;
};

export const validateSignal = (signal) => {
  const validSignals = ['BUY', 'SELL', 'WATCH', 'AVOID'];
  if (!signal || typeof signal !== 'string') return 'WATCH';
  return validSignals.includes(signal.toUpperCase()) ? signal.toUpperCase() : 'WATCH';
};

export const validateConfidence = (value) => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  if (isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
};

export const safeRender = (value, fallback = '—') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return fallback;
  if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) return fallback;
  return value;
};

export const isDataReady = (data) => {
  return data !== null && data !== undefined && typeof data !== 'object';
};

export const validateAssetData = (asset) => {
  return {
    symbol: safeRender(asset?.symbol, 'N/A'),
    name: safeRender(asset?.name, ''),
    price: validatePrice(asset?.price),
    change: validatePercent(asset?.change),
    prevClose: validatePrice(asset?.prevClose)
  };
};