/**
 * TREDIO Market Data Client - Production Architecture v2
 * 
 * OPTIMIZED FOR: Trust, Speed, Reliability
 * 
 * Data Tiers:
 * - Tier 1: Core 30-50 assets (Home, Next Opportunity) - REAL-TIME 15s
 * - Tier 2: Watchlist/Portfolio - On-demand 30s
 * - Tier 3: Market Universe (200+) - On-demand ONLY
 * 
 * CRITICAL CHANGES:
 * - NO fallback/fake prices anywhere
 * - Honest loading/unavailable states
 * - Aggressive caching (server-side ready)
 * - Batch requests (20 symbols max per call)
 */

import { base44 } from '@/api/base44Client';

// ── CACHE LAYER ─────────────────────────────────────────────
const priceCache = new Map();
const CACHE_TTL = {
  TIER1: 15000,   // 15 seconds for core (fast refresh)
  TIER2: 30000,   // 30 seconds for watchlist
  TIER3: 300000,  // 5 minutes for market scan
};

// Tier 1: CORE LIVE LAYER (30-50 assets max)
const TIER1_STOCKS = [
  'NVDA', 'AAPL', 'TSLA', 'META', 'MSFT', 'AMZN', 'GOOGL', 
  'SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'VOO', 'SCHD', 'ARKK'
];

const TIER1_CRYPTO = [
  'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'DOGE', 'MATIC', 
  'AVAX', 'LINK', 'UNI', 'DOT', 'ATOM'
];

const TIER1_SYMBOLS = [...TIER1_STOCKS, ...TIER1_CRYPTO];

// Cache helpers
const getCached = (symbol) => {
  const cached = priceCache.get(symbol);
  if (!cached) return null;
  const ttl = cached.tier === 1 ? CACHE_TTL.TIER1 : cached.tier === 2 ? CACHE_TTL.TIER2 : CACHE_TTL.TIER3;
  if (Date.now() - cached.timestamp > ttl) {
    priceCache.delete(symbol);
    return null;
  }
  return cached.data;
};

const setCached = (symbol, data, tier, source = 'unknown') => {
  priceCache.set(symbol, {
    data,
    tier,
    timestamp: Date.now(),
    isReal: true,
    source
  });
};

// ── TIER 1: CORE LIVE LAYER ─────────────────────────────────
/**
 * Fetch Tier 1 core assets (30-50 symbols)
 * NEVER fails - always returns real provider data or empty array
 * Refresh: every 15 seconds
 */
export const fetchTier1Assets = async () => {
  try {
    const res = await base44.functions.invoke('stockPrices', { 
      symbols: TIER1_STOCKS 
    });
    
    if (!res?.data?.prices) {
      console.warn('[Tier1] No data from provider');
      return [];
    }
    
    const stocks = TIER1_STOCKS
      .filter(s => res.data.prices[s] && res.data.prices[s].price > 0)
      .map(s => {
        const data = res.data.prices[s];
        const change = data.prevClose ? ((data.price - data.prevClose) / data.prevClose) * 100 : 0;
        const priceData = {
          symbol: s,
          price: data.price,
          prevClose: data.prevClose || data.price,
          change: parseFloat(change.toFixed(2)),
          timestamp: data.timestamp || Date.now(),
          isReal: true,
          source: data.source || 'alpaca'
        };
        setCached(s, priceData, 1, priceData.source);
        return priceData;
      });
    
    console.log(`[Tier1] ✓ ${stocks.length}/${TIER1_STOCKS.length} stocks loaded`);
    return stocks;
  } catch (error) {
    console.error('[Tier1] ✗ Failed:', error.message);
    return []; // NO fallback - let UI show loading
  }
};

/**
 * Fetch crypto (CoinGecko)
 * Refresh: 60 seconds (rate limit aware)
 */
export const fetchCryptoPrices = async () => {
  const cryptoIds = {
    'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
    'ADA': 'cardano', 'DOGE': 'dogecoin', 'MATIC': 'matic-network',
    'AVAX': 'avalanche-2', 'LINK': 'chainlink', 'UNI': 'uniswap',
    'DOT': 'polkadot', 'ATOM': 'cosmos'
  };
  
  try {
    const ids = Object.values(cryptoIds).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn('[Crypto] Rate limited - using cache');
        return TIER1_CRYPTO.map(s => getCached(s)).filter(Boolean);
      }
      throw new Error(`CoinGecko ${response.status}`);
    }
    
    const data = await response.json();
    const results = [];
    
    Object.entries(cryptoIds).forEach(([symbol, id]) => {
      if (data[id] && data[id].usd) {
        const change = data[id].usd_24h_change || 0;
        const prevClose = data[id].usd / (1 + change / 100);
        const priceData = {
          symbol,
          price: parseFloat(data[id].usd.toFixed(2)),
          change: parseFloat(change.toFixed(2)),
          prevClose: parseFloat(prevClose.toFixed(2)),
          timestamp: Date.now(),
          isReal: true,
          source: 'coingecko'
        };
        setCached(symbol, priceData, 1, 'coingecko');
        results.push(priceData);
      }
    });
    
    console.log(`[Crypto] ✓ ${results.length}/${TIER1_CRYPTO.length} loaded`);
    return results;
  } catch (error) {
    console.error('[Crypto] ✗ Failed:', error.message);
    return TIER1_CRYPTO.map(s => getCached(s)).filter(Boolean);
  }
};

// ── TIER 2: WATCHLIST / SELECTED ────────────────────────────
/**
 * Fetch watchlist assets
 * On-demand + 30s background refresh
 */
export const fetchWatchlistPrices = async (watchlistItems) => {
  if (!watchlistItems || watchlistItems.length === 0) return [];
  
  const symbols = watchlistItems.map(item => item.symbol);
  
  try {
    const res = await base44.functions.invoke('stockPrices', { symbols });
    if (!res?.data?.prices) return [];
    
    return watchlistItems
      .map(item => {
        const priceData = res.data.prices[item.symbol];
        if (!priceData || priceData.price <= 0) return null;
        
        const change = priceData.prevClose ? 
          ((priceData.price - priceData.prevClose) / priceData.prevClose) * 100 : 0;
        
        const result = {
          ...item,
          price: priceData.price,
          change: parseFloat(change.toFixed(2)),
          timestamp: Date.now(),
          isReal: true
        };
        setCached(item.symbol, result, 2, priceData.source);
        return result;
      })
      .filter(item => item !== null);
  } catch (error) {
    console.error('[Watchlist] ✗ Failed:', error.message);
    return [];
  }
};

// ── TIER 3: MARKET UNIVERSE (ON-DEMAND) ─────────────────────
/**
 * Fetch market scan data (200+ assets)
 * STRATEGY: On-demand ONLY - no auto-refresh
 * Batch in chunks of 20 to avoid rate limits
 */
export const fetchMarketScan = async (symbols, tier = 3) => {
  if (!symbols || symbols.length === 0) return [];
  
  const CHUNK_SIZE = 20;
  const results = [];
  
  for (let i = 0; i < symbols.length; i += CHUNK_SIZE) {
    const chunk = symbols.slice(i, i + CHUNK_SIZE);
    try {
      const res = await base44.functions.invoke('stockPrices', { symbols: chunk });
      if (res?.data?.prices) {
        chunk.forEach(s => {
          const data = res.data.prices[s];
          if (data && data.price > 0) {
            const change = data.prevClose ? 
              ((data.price - data.prevClose) / data.prevClose) * 100 : 0;
            const priceData = {
              symbol: s,
              price: data.price,
              change: parseFloat(change.toFixed(2)),
              timestamp: Date.now(),
              isReal: true,
              source: data.source
            };
            setCached(s, priceData, tier, priceData.source);
            results.push(priceData);
          }
        });
      }
    } catch (error) {
      console.error(`[MarketScan] Chunk ${i} failed:`, error.message);
    }
    
    // Rate limit protection
    if (i + CHUNK_SIZE < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  console.log(`[MarketScan] ✓ ${results.length}/${symbols.length} loaded`);
  return results;
};

// ── SINGLE ASSET ────────────────────────────────────────────
/**
 * Fetch single asset detail (REAL-TIME)
 * Used by: AssetDetail page
 */
export const fetchAssetDetail = async (symbol) => {
  try {
    const res = await base44.functions.invoke('stockPrices', { symbols: [symbol] });
    if (!res?.data?.prices?.[symbol]) return null;
    
    const data = res.data.prices[symbol];
    const change = data.prevClose ? 
      ((data.price - data.prevClose) / data.prevClose) * 100 : 0;
    
    const priceData = {
      symbol,
      price: data.price,
      prevClose: data.prevClose || data.price,
      change: parseFloat(change.toFixed(2)),
      timestamp: Date.now(),
      isReal: true,
      source: data.source
    };
    setCached(symbol, priceData, 1, priceData.source);
    return priceData;
  } catch (error) {
    console.error(`[AssetDetail] ${symbol} failed:`, error.message);
    return null;
  }
};

// ── UTILITIES ───────────────────────────────────────────────
export const clearCache = () => {
  priceCache.clear();
  console.log('[Cache] Cleared');
};

export const getCacheStatus = () => {
  const status = {};
  priceCache.forEach((value, key) => {
    status[key] = {
      age: Math.round((Date.now() - value.timestamp) / 1000) + 's',
      tier: value.tier,
      source: value.source,
      isReal: value.isReal
    };
  });
  return status;
};

export const getCacheSize = () => priceCache.size;

// Export symbols for UI components
export { TIER1_SYMBOLS, TIER1_STOCKS, TIER1_CRYPTO };