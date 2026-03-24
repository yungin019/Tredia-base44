import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * DiscoverySection
 *
 * Renders a horizontally-scrollable row of asset cards.
 * DATA MODEL: metadata-only (symbol, name, sector, description).
 * NO quotes fetched. NO backend calls made here.
 * Clicking a card navigates to /Asset/:symbol where AssetDetail handles quote fetching.
 */

// ── CURATED MANIFESTS (static metadata only) ────────────────────────────────

export const POPULAR_STOCKS = [
  { symbol: 'MSFT',  name: 'Microsoft',   sector: 'Technology',    desc: 'Cloud & AI leader' },
  { symbol: 'META',  name: 'Meta',         sector: 'Social Media',  desc: 'Ads & metaverse' },
  { symbol: 'GOOGL', name: 'Alphabet',     sector: 'Technology',    desc: 'Search & cloud' },
  { symbol: 'NFLX',  name: 'Netflix',      sector: 'Streaming',     desc: 'Content platform' },
  { symbol: 'AMD',   name: 'AMD',          sector: 'Semiconductors',desc: 'AI chips & CPUs' },
  { symbol: 'COIN',  name: 'Coinbase',     sector: 'FinTech',       desc: 'Crypto exchange' },
  { symbol: 'PLTR',  name: 'Palantir',     sector: 'Software',      desc: 'AI data analytics' },
  { symbol: 'UBER',  name: 'Uber',         sector: 'Mobility',      desc: 'Rides & delivery' },
  { symbol: 'ABNB',  name: 'Airbnb',       sector: 'Travel',        desc: 'Short-term rentals' },
  { symbol: 'SNOW',  name: 'Snowflake',    sector: 'Cloud',         desc: 'Data cloud platform' },
];

export const POPULAR_CRYPTO = [
  { symbol: 'SOL',   name: 'Solana',    sector: 'Crypto', desc: 'High-speed L1' },
  { symbol: 'XRP',   name: 'Ripple',    sector: 'Crypto', desc: 'Payments network' },
  { symbol: 'DOGE',  name: 'Dogecoin',  sector: 'Crypto', desc: 'Meme coin OG' },
  { symbol: 'ADA',   name: 'Cardano',   sector: 'Crypto', desc: 'Academic blockchain' },
  { symbol: 'AVAX',  name: 'Avalanche', sector: 'Crypto', desc: 'DeFi ecosystem' },
  { symbol: 'LINK',  name: 'Chainlink', sector: 'Crypto', desc: 'Oracle network' },
  { symbol: 'DOT',   name: 'Polkadot',  sector: 'Crypto', desc: 'Multi-chain' },
  { symbol: 'LTC',   name: 'Litecoin',  sector: 'Crypto', desc: 'Digital silver' },
];

export const MAJOR_ETFS = [
  { symbol: 'VOO',  name: 'Vanguard S&P 500', sector: 'Index',       desc: 'Broad market exposure' },
  { symbol: 'IWM',  name: 'Russell 2000',      sector: 'Small Cap',   desc: 'Small-cap US stocks' },
  { symbol: 'ARKK', name: 'ARK Innovation',    sector: 'Growth',      desc: 'Disruptive innovation' },
  { symbol: 'GLD',  name: 'Gold Trust',        sector: 'Commodities', desc: 'Gold exposure' },
  { symbol: 'XLK',  name: 'Tech Select',       sector: 'Technology',  desc: 'US tech sector' },
  { symbol: 'XLF',  name: 'Finance Select',    sector: 'Finance',     desc: 'US financial sector' },
  { symbol: 'TLT',  name: 'Long Treasury',     sector: 'Fixed Income',desc: '20+ yr T-bonds' },
  { symbol: 'SCHD', name: 'Schwab Dividend',   sector: 'Dividend',    desc: 'High-quality dividends' },
];

export const COMMODITIES_SNAPSHOT = [
  { symbol: 'GLD',  name: 'Gold',        sector: 'Precious Metal', desc: 'Safe haven asset',     color: '#F59E0B' },
  { symbol: 'SLV',  name: 'Silver',      sector: 'Precious Metal', desc: 'Industrial & store of value', color: '#9CA3AF' },
  { symbol: 'USO',  name: 'Crude Oil',   sector: 'Energy',         desc: 'WTI oil exposure',     color: '#EF4444' },
  { symbol: 'UNG',  name: 'Nat. Gas',    sector: 'Energy',         desc: 'Natural gas ETF',      color: '#3B82F6' },
  { symbol: 'CORN', name: 'Corn',        sector: 'Agriculture',    desc: 'Grain commodity',      color: '#10B981' },
  { symbol: 'WEAT', name: 'Wheat',       sector: 'Agriculture',    desc: 'Global food staple',   color: '#F97316' },
];

// ── SECTOR COLOR MAP ─────────────────────────────────────────────────────────
const SECTOR_COLORS = {
  Technology: '#3B82F6',
  'Social Media': '#8B5CF6',
  Streaming: '#EF4444',
  Semiconductors: '#06B6D4',
  FinTech: '#10B981',
  Software: '#6366F1',
  Mobility: '#F59E0B',
  Travel: '#F97316',
  Cloud: '#0EA5E9',
  Crypto: '#F59E0B',
  Index: '#10B981',
  'Small Cap': '#34D399',
  Growth: '#A78BFA',
  Commodities: '#FCD34D',
  Finance: '#60A5FA',
  'Fixed Income': '#94A3B8',
  Dividend: '#4ADE80',
  'Precious Metal': '#F59E0B',
  Energy: '#EF4444',
  Agriculture: '#22C55E',
};

function DiscoveryCard({ item, index }) {
  const navigate = useNavigate();
  const color = item.color || SECTOR_COLORS[item.sector] || '#6B7280';

  return (
    <motion.button
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      onClick={() => navigate(`/Asset/${item.symbol}`)}
      className="flex-shrink-0 w-36 rounded-xl border border-white/5 bg-white/[0.03] p-3 text-left hover:bg-white/[0.07] hover:border-white/10 transition-all tap-feedback"
    >
      {/* Symbol + sector dot */}
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono font-black text-white text-sm tracking-tight">{item.symbol}</span>
        <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}60` }} />
      </div>
      {/* Name */}
      <div className="text-[11px] font-semibold text-white/70 mb-1 truncate">{item.name}</div>
      {/* Description */}
      <div className="text-[10px] text-white/35 leading-tight truncate">{item.desc}</div>
      {/* Sector badge */}
      <div className="mt-2 text-[9px] font-medium px-1.5 py-0.5 rounded-full inline-block"
        style={{ background: `${color}18`, color: `${color}CC` }}>
        {item.sector}
      </div>
    </motion.button>
  );
}

export default function DiscoverySection({ title, items, accent }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-white/80">{title}</h2>
        <span className="text-[10px] text-white/25 flex items-center gap-0.5">
          {items.length} assets <ChevronRight className="h-3 w-3" />
        </span>
      </div>
      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {items.map((item, i) => (
          <DiscoveryCard key={item.symbol} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}