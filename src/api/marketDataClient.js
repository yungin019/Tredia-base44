/**
 * TREDIO Market Data Client
 *
 * ALL market data flows through backend only.
 * Frontend NEVER calls Polygon, CoinGecko, or any provider directly.
 *
 * Two operations:
 *  fetchCoreAssets()          → GET core 8 assets from cache (<1s)
 *  searchAssets(query)        → search + live quotes (≤2.5s)
 *  fetchSingleAsset(symbol)   → single asset live quote (≤2.5s)
 */

import { base44 } from '@/api/base44Client';

// ── FRONTEND CACHE (avoids re-fetching on tab switch) ─────────────────────
const clientCache = new Map();
const CLIENT_CACHE_TTL_MS = 15000; // 15s on frontend

function getClientCached(key) {
  const entry = clientCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CLIENT_CACHE_TTL_MS) {
    clientCache.delete(key);
    return null;
  }
  return entry.data;
}

function setClientCached(key, data) {
  clientCache.set(key, { data, ts: Date.now() });
}

// ── CORE ASSETS ────────────────────────────────────────────────────────────
/**
 * Fetch 8 core assets from backend cache.
 * Should respond in <1s (no provider calls on hot path).
 * Returns array of:
 *   { symbol, name, type, sector, status: "live"|"unavailable", price?, changePct?, timestamp? }
 */
export async function fetchCoreAssets() {
  const cached = getClientCached('core');
  if (cached) return cached;

  const res = await base44.functions.invoke('marketCore', { action: 'core' });
  const assets = res?.data?.assets || [];
  if (assets.length > 0) setClientCached('core', assets);
  return assets;
}

// ── SEARCH ─────────────────────────────────────────────────────────────────
/**
 * Search assets by ticker or name. Fetches live quotes for matches.
 * Returns array of:
 *   { symbol, name, type, sector, status: "live"|"unavailable", price?, changePct?, timestamp? }
 */
export async function searchAssets(query) {
  if (!query || query.trim().length < 1) return [];

  const q = query.trim().toUpperCase();
  const cached = getClientCached(`search:${q}`);
  if (cached) return cached;

  const res = await base44.functions.invoke('marketCore', { action: 'search', query });
  const results = res?.data?.results || [];
  if (results.length > 0) setClientCached(`search:${q}`, results);
  return results;
}

// ── SINGLE ASSET ────────────────────────────────────────────────────────────
/**
 * Fetch a single asset quote (for detail page).
 * Returns { symbol, name, type, sector, status, price?, changePct?, timestamp? }
 */
export async function fetchSingleAsset(symbol) {
  if (!symbol) return null;

  const cached = getClientCached(`asset:${symbol}`);
  if (cached) return cached;

  const res = await base44.functions.invoke('marketCore', { action: 'search', query: symbol });
  const results = res?.data?.results || [];
  const match = results.find(r => r.symbol === symbol.toUpperCase());

  if (match) {
    setClientCached(`asset:${symbol}`, match);
    return match;
  }
  return { symbol, name: symbol, type: 'stock', sector: 'Unknown', status: 'unavailable' };
}

// ── CACHE UTILS ─────────────────────────────────────────────────────────────
export function clearClientCache() {
  clientCache.clear();
}

export function getClientCacheSize() {
  return clientCache.size;
}