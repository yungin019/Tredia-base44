/**
 * Asset Universe - Comprehensive searchable asset manifest
 * 
 * TIERS:
 * - Tier 1: Always-live core assets (8 default)
 * - Tier 2: User-priority assets (watchlist, recently viewed)
 * - Tier 3: On-demand searchable universe (150+ assets)
 */

// ── TIER 1: CORE LIVE ASSETS ────────────────────────────────────────────
export const TIER1_ASSETS = [
  { symbol: 'NVDA', name: 'NVIDIA', type: 'stock', sector: 'Technology', provider: 'coingecko|fallback' },
  { symbol: 'AAPL', name: 'Apple', type: 'stock', sector: 'Technology', provider: 'coingecko|fallback' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'stock', sector: 'Technology', provider: 'coingecko|fallback' },
  { symbol: 'TSLA', name: 'Tesla', type: 'stock', sector: 'Automotive', provider: 'coingecko|fallback' },
  { symbol: 'AMZN', name: 'Amazon', type: 'stock', sector: 'Technology', provider: 'coingecko|fallback' },
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'etf', sector: 'Index', provider: 'coingecko|fallback' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', sector: 'Crypto', provider: 'coingecko' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', sector: 'Crypto', provider: 'coingecko' },
];

// ── TIER 3: SEARCHABLE UNIVERSE ─────────────────────────────────────────
// Organized by category for efficient routing

export const TIER3_STOCKS = [
  // Mega cap (>$500B)
  { symbol: 'GOOGL', name: 'Google', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms', sector: 'Technology' },
  { symbol: 'NFLX', name: 'Netflix', sector: 'Media' },
  { symbol: 'MAGN', name: 'Magna International', sector: 'Automotive' },
  
  // Large cap tech
  { symbol: 'CRM', name: 'Salesforce', sector: 'Software' },
  { symbol: 'ADBE', name: 'Adobe', sector: 'Software' },
  { symbol: 'INTC', name: 'Intel', sector: 'Technology' },
  { symbol: 'AMD', name: 'AMD', sector: 'Technology' },
  { symbol: 'QCOM', name: 'Qualcomm', sector: 'Technology' },
  
  // Large cap finance
  { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Finance' },
  { symbol: 'BAC', name: 'Bank of America', sector: 'Finance' },
  { symbol: 'GS', name: 'Goldman Sachs', sector: 'Finance' },
  { symbol: 'BLK', name: 'BlackRock', sector: 'Finance' },
  
  // Large cap healthcare
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare' },
  { symbol: 'PFE', name: 'Pfizer', sector: 'Healthcare' },
  { symbol: 'ABBV', name: 'AbbVie', sector: 'Healthcare' },
  { symbol: 'MRK', name: 'Merck', sector: 'Healthcare' },
  
  // Large cap consumer
  { symbol: 'WMT', name: 'Walmart', sector: 'Retail' },
  { symbol: 'KO', name: 'Coca-Cola', sector: 'Beverages' },
  { symbol: 'PEP', name: 'PepsiCo', sector: 'Food & Beverage' },
  { symbol: 'MCD', name: 'McDonald\'s', sector: 'Restaurant' },
  
  // Growth stocks
  { symbol: 'SNOW', name: 'Snowflake', sector: 'Software' },
  { symbol: 'COIN', name: 'Coinbase', sector: 'Crypto' },
  { symbol: 'UPST', name: 'Upstart', sector: 'FinTech' },
  { symbol: 'RBLX', name: 'Roblox', sector: 'Gaming' },
  
  // Mid cap
  { symbol: 'TSM', name: 'TSMC', sector: 'Semiconductors' },
  { symbol: 'ARM', name: 'Arm Holdings', sector: 'Semiconductors' },
  { symbol: 'SMCI', name: 'Super Micro Computer', sector: 'Hardware' },
  { symbol: 'DDOG', name: 'Datadog', sector: 'Software' },
];

export const TIER3_ETFS = [
  // Broad indices
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', sector: 'Index' },
  { symbol: 'DIA', name: 'Dow Jones ETF', sector: 'Index' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', sector: 'Index' },
  { symbol: 'VTI', name: 'Vanguard Total Stock', sector: 'Index' },
  { symbol: 'SCHB', name: 'Schwab US Broad', sector: 'Index' },
  
  // Sector
  { symbol: 'XLK', name: 'Tech Select Sector', sector: 'Technology' },
  { symbol: 'XLF', name: 'Finance Select', sector: 'Finance' },
  { symbol: 'XLH', name: 'Healthcare Select', sector: 'Healthcare' },
  { symbol: 'XLE', name: 'Energy Select', sector: 'Energy' },
  { symbol: 'XLV', name: 'Health Care Select', sector: 'Healthcare' },
  
  // Themed
  { symbol: 'ARKK', name: 'Ark Innovation', sector: 'Growth' },
  { symbol: 'ARKF', name: 'Ark Fintech', sector: 'FinTech' },
  { symbol: 'ARKW', name: 'Ark Web 3.0', sector: 'Technology' },
  { symbol: 'GLD', name: 'Gold Trust', sector: 'Commodities' },
  { symbol: 'TLT', name: 'Long Treasury', sector: 'Fixed Income' },
];

export const TIER3_CRYPTO = [
  // Major
  { symbol: 'SOL', name: 'Solana', sector: 'Crypto', provider: 'coingecko', coinId: 'solana' },
  { symbol: 'XRP', name: 'Ripple', sector: 'Crypto', provider: 'coingecko', coinId: 'ripple' },
  { symbol: 'ADA', name: 'Cardano', sector: 'Crypto', provider: 'coingecko', coinId: 'cardano' },
  { symbol: 'DOGE', name: 'Dogecoin', sector: 'Crypto', provider: 'coingecko', coinId: 'dogecoin' },
  { symbol: 'MATIC', name: 'Polygon', sector: 'Crypto', provider: 'coingecko', coinId: 'matic-network' },
  
  // Layer 2 / Infra
  { symbol: 'AVAX', name: 'Avalanche', sector: 'Crypto', provider: 'coingecko', coinId: 'avalanche-2' },
  { symbol: 'LINK', name: 'Chainlink', sector: 'Crypto', provider: 'coingecko', coinId: 'chainlink' },
  { symbol: 'UNI', name: 'Uniswap', sector: 'Crypto', provider: 'coingecko', coinId: 'uniswap' },
  { symbol: 'AAVE', name: 'Aave', sector: 'Crypto', provider: 'coingecko', coinId: 'aave' },
  
  // Layer 1 / Ecosystem
  { symbol: 'DOT', name: 'Polkadot', sector: 'Crypto', provider: 'coingecko', coinId: 'polkadot' },
  { symbol: 'ATOM', name: 'Cosmos', sector: 'Crypto', provider: 'coingecko', coinId: 'cosmos' },
  { symbol: 'FIL', name: 'Filecoin', sector: 'Crypto', provider: 'coingecko', coinId: 'filecoin' },
];

// ── COMBINED UNIVERSES ──────────────────────────────────────────────────
export const TIER3_ALL = [...TIER3_STOCKS, ...TIER3_ETFS, ...TIER3_CRYPTO];

export const ALL_ASSETS = [...TIER1_ASSETS, ...TIER3_ALL];

// ── HELPER: SYMBOL LOOKUP ──────────────────────────────────────────────
const assetMap = new Map();
ALL_ASSETS.forEach(asset => assetMap.set(asset.symbol.toUpperCase(), asset));

export const getAsset = (symbol) => assetMap.get(symbol?.toUpperCase());

export const searchAssets = (query) => {
  const q = query.toUpperCase();
  return ALL_ASSETS.filter(asset =>
    asset.symbol.includes(q) || asset.name.toUpperCase().includes(q)
  );
};

// ── ASSET CLASS MAPPING ────────────────────────────────────────────────
export const getAssetClass = (symbol) => {
  const asset = getAsset(symbol);
  return asset?.type || 'unknown';
};

// ── PROVIDER ROUTING BY ASSET CLASS ────────────────────────────────────
export const getProviderForAsset = (symbol) => {
  const assetClass = getAssetClass(symbol);
  switch (assetClass) {
    case 'crypto':
      return 'coingecko';
    case 'stock':
    case 'etf':
    default:
      return 'polygon';
  }
};

// ── STATISTICS ────────────────────────────────────────────────────────
export const getUniverseStats = () => ({
  tier1Count: TIER1_ASSETS.length,
  tier3Count: TIER3_ALL.length,
  totalSupported: ALL_ASSETS.length,
  breakdown: {
    stocks: TIER3_STOCKS.length,
    etfs: TIER3_ETFS.length,
    crypto: TIER3_CRYPTO.length,
  }
});

export default {
  TIER1_ASSETS,
  TIER3_STOCKS,
  TIER3_ETFS,
  TIER3_CRYPTO,
  TIER3_ALL,
  ALL_ASSETS,
  getAsset,
  searchAssets,
  getAssetClass,
  getProviderForAsset,
  getUniverseStats,
};