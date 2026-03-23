/**
 * Symbol Search API - Efficient searchable universe discovery
 * 
 * Supports 150+ assets across stocks, ETFs, and crypto
 * Optimized for typeahead, minimal latency
 */

import { searchAssets, ALL_ASSETS, TIER1_ASSETS, getAsset } from '@/lib/assetUniverse';

/**
 * Search for assets by symbol or name
 * Returns up to N results, prioritizes exact symbol matches
 */
export const searchSymbols = (query, limit = 15) => {
  if (!query || query.length < 1) return [];

  const q = query.toUpperCase().trim();
  const results = [];
  const seen = new Set();

  // 1. EXACT SYMBOL MATCH (highest priority)
  const exactAsset = getAsset(q);
  if (exactAsset) {
    results.push(formatSearchResult(exactAsset, 'exact-symbol'));
    seen.add(exactAsset.symbol);
  }

  // 2. SYMBOL STARTS WITH (high priority)
  ALL_ASSETS.forEach(asset => {
    if (!seen.has(asset.symbol) && asset.symbol.startsWith(q) && results.length < limit) {
      results.push(formatSearchResult(asset, 'symbol-match'));
      seen.add(asset.symbol);
    }
  });

  // 3. NAME CONTAINS (medium priority)
  ALL_ASSETS.forEach(asset => {
    if (!seen.has(asset.symbol) && asset.name.toUpperCase().includes(q) && results.length < limit) {
      results.push(formatSearchResult(asset, 'name-match'));
      seen.add(asset.symbol);
    }
  });

  // 4. FUZZY / PARTIAL MATCH (if still space)
  if (results.length < limit) {
    const fuzzyResults = ALL_ASSETS
      .filter(a => !seen.has(a.symbol) && 
        (a.symbol.includes(q) || a.name.toUpperCase().includes(q)))
      .slice(0, limit - results.length)
      .map(a => formatSearchResult(a, 'fuzzy-match'));
    results.push(...fuzzyResults);
  }

  return results.slice(0, limit);
};

/**
 * Format search result with metadata
 */
const formatSearchResult = (asset, matchType) => ({
  symbol: asset.symbol,
  name: asset.name,
  type: asset.type,
  sector: asset.sector,
  isTier1: TIER1_ASSETS.some(a => a.symbol === asset.symbol),
  matchType, // For sorting/analytics
});

/**
 * Get popular searches (Tier 1 + frequently viewed)
 */
export const getPopularAssets = () => {
  return TIER1_ASSETS.map(a => formatSearchResult(a, 'tier1-default'));
};

/**
 * Get assets by category
 */
export const getAssetsByType = (type) => {
  return ALL_ASSETS
    .filter(a => a.type === type)
    .map(a => formatSearchResult(a, type));
};

export const getAssetsByCategory = (category) => {
  const categoryMap = {
    'Technology': ['Technology'],
    'Finance': ['Finance'],
    'Healthcare': ['Healthcare'],
    'Energy': ['Energy'],
    'Crypto': ['Crypto'],
    'Commodities': ['Commodities', 'Gold'],
  };

  const sectors = categoryMap[category] || [];
  return ALL_ASSETS
    .filter(a => sectors.includes(a.sector))
    .map(a => formatSearchResult(a, category));
};

/**
 * Get trending / hot assets (manually curated)
 */
export const getTrendingAssets = () => {
  const trending = ['NVDA', 'AAPL', 'TSLA', 'META', 'COIN', 'ARKK', 'BTC', 'ETH'];
  return trending
    .map(s => getAsset(s))
    .filter(Boolean)
    .map(a => formatSearchResult(a, 'trending'));
};

/**
 * Get recent/history from user data (stored in User entity)
 * This would be called by components with user's recent viewing history
 */
export const getRecentAssets = (recentSymbols = []) => {
  return recentSymbols
    .map(s => getAsset(s))
    .filter(Boolean)
    .map(a => formatSearchResult(a, 'recent'));
};

/**
 * Symbol autocomplete (for input fields)
 * Optimized for fast typeahead
 */
export const autocompleteSymbol = (prefix, limit = 10) => {
  if (!prefix || prefix.length < 1) {
    return getPopularAssets().slice(0, limit);
  }

  const q = prefix.toUpperCase();
  const matches = ALL_ASSETS
    .filter(a => a.symbol.startsWith(q) || a.name.toUpperCase().startsWith(q))
    .slice(0, limit)
    .map(a => ({
      symbol: a.symbol,
      name: a.name,
    }));

  return matches;
};

/**
 * Validate symbol and return metadata
 */
export const validateAndGetMetadata = (symbol) => {
  const asset = getAsset(symbol);
  if (!asset) return null;

  return {
    symbol: asset.symbol,
    name: asset.name,
    type: asset.type,
    sector: asset.sector,
    isTier1: TIER1_ASSETS.some(a => a.symbol === asset.symbol),
    isSearchable: true,
  };
};

export default {
  searchSymbols,
  getPopularAssets,
  getAssetsByType,
  getAssetsByCategory,
  getTrendingAssets,
  getRecentAssets,
  autocompleteSymbol,
  validateAndGetMetadata,
};