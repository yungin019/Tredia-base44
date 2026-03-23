/**
 * Market Data Tiers - Three-tier refresh and caching strategy
 * 
 * TIER 1: Always-live core assets (refresh: 15s)
 * TIER 2: User-priority assets (refresh: 30s)
 * TIER 3: On-demand searchable (no global refresh, fetch-only)
 */

import { base44 } from '@/api/base44Client';
import { TIER1_ASSETS, TIER3_ALL, getAsset, getAssetClass, getProviderForAsset } from '@/lib/assetUniverse';

// ── CACHE LAYER ────────────────────────────────────────────────────────
const priceCache = new Map();
const CACHE_TTL = {
  TIER1: 15000,   // 15 seconds - always fresh
  TIER2: 30000,   // 30 seconds - watchlist priority
  TIER3: 300000,  // 5 minutes - background cache
};

const getCached = (symbol) => {
  const cached = priceCache.get(symbol);
  if (!cached) return null;
  
  const ttl = cached.tier === 1 ? CACHE_TTL.TIER1 : cached.tier === 2 ? CACHE_TTL.TIER2 : CACHE_TTL.TIER3;
  const age = Date.now() - cached.timestamp;
  
  if (age > ttl) {
    priceCache.delete(symbol);
    return null;
  }
  
  return cached.data;
};

const setCached = (symbol, data, tier = 3) => {
  priceCache.set(symbol, {
    data,
    tier,
    timestamp: Date.now(),
  });
};

// ── TIER 1: ALWAYS-LIVE CORE ASSETS ────────────────────────────────────
/**
 * Fetch Tier 1 assets (8 core symbols)
 * Runs every 15 seconds globally
 * Never skipped, always provider-backed
 */
export const fetchTier1Core = async () => {
  const symbols = TIER1_ASSETS.map(a => a.symbol);
  
  try {
    const res = await base44.functions.invoke('stockPrices', { symbols });
    
    if (!res?.data?.prices) {
      console.warn('[Tier1] No data from provider');
      return [];
    }

    const results = [];
    symbols.forEach(symbol => {
      const priceData = res.data.prices[symbol];
      if (priceData) {
        setCached(symbol, priceData, 1);
        results.push({ symbol, ...priceData });
      }
    });

    console.log(`[Tier1] ✓ Loaded ${results.length}/${symbols.length}`);
    return results;
  } catch (error) {
    console.error('[Tier1] ✗ Failed:', error.message);
    return [];
  }
};

// ── TIER 2: USER-PRIORITY ASSETS ───────────────────────────────────────
/**
 * Fetch Tier 2 assets (watchlist, recently viewed)
 * Upgraded from Tier 3 → Tier 2 when user adds to watchlist
 * Refresh: 30s
 */
export const fetchTier2Priority = async (watchlistSymbols = []) => {
  if (!watchlistSymbols || watchlistSymbols.length === 0) return [];

  try {
    // Batch in chunks of 10 to avoid overload
    const CHUNK_SIZE = 10;
    const results = [];

    for (let i = 0; i < watchlistSymbols.length; i += CHUNK_SIZE) {
      const chunk = watchlistSymbols.slice(i, i + CHUNK_SIZE);
      
      try {
        const res = await base44.functions.invoke('stockPrices', { symbols: chunk });
        
        if (res?.data?.prices) {
          chunk.forEach(symbol => {
            const priceData = res.data.prices[symbol];
            if (priceData) {
              setCached(symbol, priceData, 2);
              results.push({ symbol, ...priceData });
            }
          });
        }
      } catch (e) {
        console.error(`[Tier2] Chunk failed:`, e.message);
      }

      // Rate limit between chunks
      if (i + CHUNK_SIZE < watchlistSymbols.length) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    console.log(`[Tier2] ✓ Loaded ${results.length}/${watchlistSymbols.length}`);
    return results;
  } catch (error) {
    console.error('[Tier2] ✗ Failed:', error.message);
    return [];
  }
};

// ── TIER 3: ON-DEMAND SEARCHABLE UNIVERSE ──────────────────────────────
/**
 * Fetch Tier 3 assets on-demand (searched or opened)
 * No global polling
 * Single asset fetch for detail pages
 */
export const fetchTier3OnDemand = async (symbol) => {
  // Check cache first
  const cached = getCached(symbol);
  if (cached) {
    console.log(`[Tier3] Cache hit: ${symbol}`);
    return { symbol, ...cached };
  }

  // Validate symbol exists in universe
  const assetInfo = getAsset(symbol);
  if (!assetInfo) {
    console.warn(`[Tier3] Symbol not in universe: ${symbol}`);
    return null;
  }

  try {
    const res = await base44.functions.invoke('stockPrices', { symbols: [symbol] });
    
    if (res?.data?.prices?.[symbol]) {
      const priceData = res.data.prices[symbol];
      setCached(symbol, priceData, 3);
      console.log(`[Tier3] ✓ Fetched: ${symbol}`);
      return { symbol, ...priceData };
    }
    
    return null;
  } catch (error) {
    console.error(`[Tier3] ${symbol} failed:`, error.message);
    return null;
  }
};

/**
 * Batch fetch Tier 3 (for search results, market screens)
 * Chunks requests, respects rate limits
 */
export const fetchTier3Batch = async (symbols) => {
  if (!symbols || symbols.length === 0) return [];

  const CHUNK_SIZE = 15;
  const results = [];
  const toFetch = [];

  // Filter out cached symbols
  symbols.forEach(symbol => {
    const cached = getCached(symbol);
    if (cached) {
      results.push({ symbol, ...cached });
    } else {
      toFetch.push(symbol);
    }
  });

  // Fetch uncached in chunks
  for (let i = 0; i < toFetch.length; i += CHUNK_SIZE) {
    const chunk = toFetch.slice(i, i + CHUNK_SIZE);
    
    try {
      const res = await base44.functions.invoke('stockPrices', { symbols: chunk });
      
      if (res?.data?.prices) {
        chunk.forEach(symbol => {
          const priceData = res.data.prices[symbol];
          if (priceData) {
            setCached(symbol, priceData, 3);
            results.push({ symbol, ...priceData });
          }
        });
      }
    } catch (e) {
      console.error(`[Tier3] Batch chunk failed:`, e.message);
    }

    // Rate limit between chunks
    if (i + CHUNK_SIZE < toFetch.length) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  console.log(`[Tier3] ✓ Fetched ${results.length}/${symbols.length}`);
  return results;
};

// ── CACHE UTILITIES ────────────────────────────────────────────────────
export const getCacheStatus = () => {
  const status = {};
  priceCache.forEach((value, symbol) => {
    status[symbol] = {
      tier: value.tier,
      age: Math.round((Date.now() - value.timestamp) / 1000) + 's',
    };
  });
  return status;
};

export const clearCache = () => {
  priceCache.clear();
  console.log('[Cache] Cleared');
};

export const getCacheSize = () => priceCache.size;

// ── SYMBOL VALIDATION ──────────────────────────────────────────────────
/**
 * Check if symbol exists in searchable universe
 */
export const isValidSymbol = (symbol) => {
  return getAsset(symbol) !== undefined;
};

/**
 * Get asset metadata (name, type, sector, provider)
 */
export const getAssetMetadata = (symbol) => {
  const asset = getAsset(symbol);
  if (!asset) return null;
  
  return {
    symbol: asset.symbol,
    name: asset.name,
    type: asset.type,
    sector: asset.sector,
    providers: getProviderForAsset(symbol),
    isTier1: TIER1_ASSETS.some(a => a.symbol === symbol),
  };
};

export default {
  fetchTier1Core,
  fetchTier2Priority,
  fetchTier3OnDemand,
  fetchTier3Batch,
  getCached,
  setCached,
  getCacheStatus,
  clearCache,
  getCacheSize,
  isValidSymbol,
  getAssetMetadata,
};