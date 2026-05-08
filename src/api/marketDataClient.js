/**
 * TREDIO Market Data Client
 *
 * Calls marketCore backend function directly via HTTP (no SDK auth required).
 * The function is public-safe — no user auth needed on the backend.
 */

import { invokeFunction } from '@/api/functionsClient';

const invokeMarketCore = (body) => invokeFunction('marketCore', body);

// ── FRONTEND CACHE (avoids re-fetching on tab switch) ─────────────────────
const clientCache = new Map();
const CLIENT_CACHE_TTL_MS = 60000; // 60s

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

export async function fetchCoreAssets() {
  const cached = getClientCached('core');
  if (cached) return cached;

  const data = await invokeMarketCore({ action: 'core' });
  const assets = data?.assets || [];
  if (assets.length > 0) setClientCached('core', assets);
  return assets;
}

export async function searchAssets(query) {
  if (!query || query.trim().length < 1) return [];

  const q = query.trim().toUpperCase();
  const cached = getClientCached(`search:${q}`);
  if (cached) return cached;

  const data = await invokeMarketCore({ action: 'search', query });
  const results = data?.results || [];
  if (results.length > 0) setClientCached(`search:${q}`, results);
  return results;
}

export async function fetchSingleAsset(symbol) {
  if (!symbol) return null;

  const cached = getClientCached(`asset:${symbol}`);
  if (cached) return cached;

  const data = await invokeMarketCore({ action: 'search', query: symbol });
  const results = data?.results || [];
  const match = results.find(r => r.symbol === symbol.toUpperCase());

  if (match) {
    setClientCached(`asset:${symbol}`, match);
    return match;
  }
  return { symbol, name: symbol, type: 'stock', sector: 'Unknown', status: 'unavailable' };
}

export function clearClientCache() {
  clientCache.clear();
}

export function getClientCacheSize() {
  return clientCache.size;
}