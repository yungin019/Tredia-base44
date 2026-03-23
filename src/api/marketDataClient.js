/**
 * TREDIO Market Data Client - Production Architecture
 * 
 * Data Tiers:
 * - Tier 1: Core assets (Home feed, Next Opportunity, Asset Detail) - REAL-TIME
 * - Tier 2: Watchlist / Selected assets - Frequent refresh (30s)
 * - Tier 3: Market universe - On-demand only
 * 
 * Providers (priority order):
 * 1. Alpaca (FREE real-time US stocks) - PRIMARY
 * 2. Polygon (US stocks + ETFs) - FALLBACK
 * 3. Twelve Data (International/Forex) - FALLBACK
 * 4. CoinGecko (Crypto) - PRIMARY for crypto
 */

import { base44 } from '@/api/base44Client';

// Cache management
const priceCache = new Map();
const CACHE_TTL = {
  TIER1: 5000,    // 5 seconds for core assets
  TIER2: 30000,   // 30 seconds for watchlist
  TIER3: 300000,  // 5 minutes for market scan
};

// Tier 1 priority symbols (Home feed, Next Opportunity)
const TIER1_SYMBOLS = ['NVDA', 'AAPL', 'TSLA', 'META', 'MSFT', 'AMZN', 'GOOGL', 'SPY', 'QQQ'];

// Cache helper
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

const setCached = (symbol, data, tier) => {
  priceCache.set(symbol, {
    data,
    tier,
    timestamp: Date.now(),
    isReal: true
  });
};

/**
 * Fetch Tier 1 core assets (REAL-TIME PRIORITY)
 * Used by: Home feed, Next Opportunity detector, Dashboard
 */
export const fetchTier1Assets = async () => {
  try {
    // Check cache first
    const cached = getCached(TIER1_SYMBOLS[0]);
    if (cached && cached.isReal) {
      // If we have fresh tier 1 data, return it
      const allCached = TIER1_SYMBOLS.every(s => getCached(s));
      if (allCached) {
        console.log('[Tier1] Returning cached data');
        return TIER1_SYMBOLS.map(s => getCached(s));
      }
    }

    // Fetch from Alpaca (primary - FREE real-time)
    console.log('[Tier1] Fetching real-time data from Alpaca');
    const res = await base44.functions.invoke('stockPrices', { 
      symbols: TIER1_SYMBOLS 
    });
    
    if (res?.data?.prices) {
      const prices = TIER1_SYMBOLS
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
            source: 'alpaca'
          };
          setCached(s, priceData, 1);
          return priceData;
        });
      
      console.log(`[Tier1] Fetched ${prices.length} real-time prices`);
      return prices;
    }
    
    throw new Error('No real-time data available');
  } catch (error) {
    console.error('[Tier1] Error fetching core assets:', error.message);
    // Return cached data if available (even if stale)
    const fallback = TIER1_SYMBOLS.map(s => getCached(s)).filter(Boolean);
    if (fallback.length > 0) {
      console.log('[Tier1] Returning stale cache after error');
      return fallback;
    }
    return [];
  }
};

/**
 * Fetch watchlist assets with live prices
 * Used by: WatchlistPanel, WatchlistQuick
 */
export const fetchWatchlistPrices = async (watchlistItems) => {
  if (!watchlistItems || watchlistItems.length === 0) return [];
  
  const symbols = watchlistItems.map(item => item.symbol);
  
  try {
    const res = await base44.functions.invoke('stockPrices', { symbols });
    if (res?.data?.prices) {
      return watchlistItems.map(item => {
        const priceData = res.data.prices[item.symbol];
        if (priceData && priceData.price > 0) {
          const change = priceData.prevClose ? ((priceData.price - priceData.prevClose) / priceData.prevClose) * 100 : 0;
          const result = {
            ...item,
            price: priceData.price,
            change: parseFloat(change.toFixed(2)),
            timestamp: Date.now(),
            isReal: true
          };
          setCached(item.symbol, result, 2);
          return result;
        }
        // No live data - return item without price
        return { ...item, price: null, change: null };
      }).filter(item => item.price !== null);
    }
  } catch (error) {
    console.error('[Watchlist] Error fetching prices:', error.message);
    // Return items without prices
    return watchlistItems.map(item => ({ ...item, price: null, change: null }));
  }
  
  return [];
};

/**
 * Fetch single asset detail (REAL-TIME)
 * Used by: AssetDetail page
 */
export const fetchAssetDetail = async (symbol) => {
  try {
    // Check cache
    const cached = getCached(symbol);
    if (cached && cached.isReal && Date.now() - cached.timestamp < 10000) {
      console.log(`[AssetDetail] Returning cached data for ${symbol}`);
      return cached;
    }

    // Fetch real-time
    console.log(`[AssetDetail] Fetching real-time data for ${symbol}`);
    const res = await base44.functions.invoke('stockPrices', { symbols: [symbol] });
    
    if (res?.data?.prices?.[symbol]) {
      const data = res.data.prices[symbol];
      const change = data.prevClose ? ((data.price - data.prevClose) / data.prevClose) * 100 : 0;
      const priceData = {
        symbol,
        price: data.price,
        prevClose: data.prevClose || data.price,
        change: parseFloat(change.toFixed(2)),
        timestamp: Date.now(),
        isReal: true,
        source: data.source || 'alpaca'
      };
      setCached(symbol, priceData, 1);
      return priceData;
    }
    
    throw new Error('No data available');
  } catch (error) {
    console.error(`[AssetDetail] Error for ${symbol}:`, error.message);
    return null;
  }
};

/**
 * Fetch market scan data (ON-DEMAND, not auto-refreshed)
 * Used by: Markets page expanded list
 * Strategy: Fetch only visible/searched assets, not entire universe
 */
export const fetchMarketScan = async (symbols, tier = 3) => {
  if (!symbols || symbols.length === 0) return [];
  
  // Batch fetch in chunks of 20 to avoid rate limits
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
            const change = data.prevClose ? ((data.price - data.prevClose) / data.prevClose) * 100 : 0;
            const priceData = {
              symbol: s,
              price: data.price,
              change: parseFloat(change.toFixed(2)),
              timestamp: Date.now(),
              isReal: true
            };
            setCached(s, priceData, tier);
            results.push(priceData);
          }
        });
      }
    } catch (error) {
      console.error(`[MarketScan] Error for chunk ${i}:`, error.message);
    }
    
    // Small delay between chunks to avoid rate limits
    if (i + CHUNK_SIZE < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  return results;
};

/**
 * Get crypto prices (CoinGecko - FREE tier)
 * Refresh: 60 seconds (CoinGecko free tier limit)
 */
export const fetchCryptoPrices = async () => {
  const cryptoIds = {
    'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
    'ADA': 'cardano', 'DOGE': 'dogecoin', 'MATIC': 'matic-network',
    'AVAX': 'avalanche-2', 'LINK': 'chainlink', 'UNI': 'uniswap'
  };
  
  try {
    const ids = Object.values(cryptoIds).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
    );
    
    if (!response.ok) {
      if (response.status === 429) {
        console.warn('[Crypto] CoinGecko rate limited');
        // Return cached crypto data
        const cached = Object.keys(cryptoIds).map(s => getCached(s)).filter(Boolean);
        return cached.length > 0 ? cached : [];
      }
      throw new Error('CoinGecko error');
    }
    
    const data = await response.json();
    const results = [];
    
    Object.entries(cryptoIds).forEach(([symbol, id]) => {
      if (data[id] && data[id].usd) {
        const change = data[id].usd_24h_change || 0;
        const prevClose = data[id].usd / (1 + change / 100);
        const priceData = {
          symbol,
          price: data[id].usd,
          change: parseFloat(change.toFixed(2)),
          prevClose,
          timestamp: Date.now(),
          isReal: true,
          source: 'coingecko'
        };
        setCached(symbol, priceData, 1);
        results.push(priceData);
      }
    });
    
    return results;
  } catch (error) {
    console.error('[Crypto] Error:', error.message);
    // Return cached crypto
    return Object.keys(cryptoIds).map(s => getCached(s)).filter(Boolean);
  }
};

/**
 * Clear cache (useful for manual refresh)
 */
export const clearCache = () => {
  priceCache.clear();
  console.log('[Cache] Cleared');
};

/**
 * Get cache status for debugging
 */
export const getCacheStatus = () => {
  const status = {};
  priceCache.forEach((value, key) => {
    status[key] = {
      age: Math.round((Date.now() - value.timestamp) / 1000) + 's',
      tier: value.tier,
      isReal: value.isReal
    };
  });
  return status;
};