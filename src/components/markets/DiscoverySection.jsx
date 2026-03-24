import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Compass } from 'lucide-react';

/**
 * DiscoverySection
 *
 * Renders curated horizontally-scrollable rows of asset cards.
 * DATA: static metadata ONLY — no quotes, no backend calls, no polling.
 * Tapping a card navigates to /Asset/:symbol where quotes are fetched on demand.
 */

// ── CURATED MANIFESTS (static metadata only) ────────────────────────────────

export const POPULAR_STOCKS = [
  { symbol: 'MSFT',  name: 'Microsoft',   type: 'Stock',  sector: 'Technology',     desc: 'Cloud & AI leader' },
  { symbol: 'META',  name: 'Meta',         type: 'Stock',  sector: 'Social Media',   desc: 'Ads & metaverse' },
  { symbol: 'GOOGL', name: 'Alphabet',     type: 'Stock',  sector: 'Technology',     desc: 'Search & cloud' },
  { symbol: 'NFLX',  name: 'Netflix',      type: 'Stock',  sector: 'Streaming',      desc: 'Content platform' },
  { symbol: 'AMD',   name: 'AMD',          type: 'Stock',  sector: 'Semiconductors', desc: 'AI chips & CPUs' },
  { symbol: 'COIN',  name: 'Coinbase',     type: 'Stock',  sector: 'FinTech',        desc: 'Crypto exchange' },
  { symbol: 'PLTR',  name: 'Palantir',     type: 'Stock',  sector: 'Software',       desc: 'AI data analytics' },
  { symbol: 'UBER',  name: 'Uber',         type: 'Stock',  sector: 'Mobility',       desc: 'Rides & delivery' },
  { symbol: 'ABNB',  name: 'Airbnb',       type: 'Stock',  sector: 'Travel',         desc: 'Short-term rentals' },
  { symbol: 'SNOW',  name: 'Snowflake',    type: 'Stock',  sector: 'Cloud',          desc: 'Data cloud platform' },
];

export const POPULAR_CRYPTO = [
  { symbol: 'SOL',   name: 'Solana',    type: 'Crypto', sector: 'Layer 1',   desc: 'High-speed L1' },
  { symbol: 'XRP',   name: 'Ripple',    type: 'Crypto', sector: 'Payments',  desc: 'Global payments' },
  { symbol: 'DOGE',  name: 'Dogecoin',  type: 'Crypto', sector: 'Meme',      desc: 'Meme coin OG' },
  { symbol: 'ADA',   name: 'Cardano',   type: 'Crypto', sector: 'Layer 1',   desc: 'Academic blockchain' },
  { symbol: 'AVAX',  name: 'Avalanche', type: 'Crypto', sector: 'DeFi',      desc: 'DeFi ecosystem' },
  { symbol: 'LINK',  name: 'Chainlink', type: 'Crypto', sector: 'Oracle',    desc: 'Oracle network' },
  { symbol: 'DOT',   name: 'Polkadot',  type: 'Crypto', sector: 'Multi-chain', desc: 'Multi-chain relay' },
  { symbol: 'LTC',   name: 'Litecoin',  type: 'Crypto', sector: 'Payments',  desc: 'Digital silver' },
];

export const MAJOR_ETFS = [
  { symbol: 'VOO',  name: 'Vanguard S&P 500', type: 'ETF', sector: 'Index',        desc: 'Broad market' },
  { symbol: 'IWM',  name: 'Russell 2000',      type: 'ETF', sector: 'Small Cap',    desc: 'Small-cap US' },
  { symbol: 'ARKK', name: 'ARK Innovation',    type: 'ETF', sector: 'Growth',       desc: 'Disruptive tech' },
  { symbol: 'GLD',  name: 'Gold Trust',        type: 'ETF', sector: 'Commodities',  desc: 'Gold exposure' },
  { symbol: 'XLK',  name: 'Tech Select',       type: 'ETF', sector: 'Technology',   desc: 'US tech sector' },
  { symbol: 'XLF',  name: 'Finance Select',    type: 'ETF', sector: 'Finance',      desc: 'US financials' },
  { symbol: 'TLT',  name: 'Long Treasury',     type: 'ETF', sector: 'Fixed Income', desc: '20+ yr T-bonds' },
  { symbol: 'SCHD', name: 'Schwab Dividend',   type: 'ETF', sector: 'Dividend',     desc: 'High dividends' },
];

export const COMMODITIES_SNAPSHOT = [
  { symbol: 'GLD',  name: 'Gold',       type: 'Commodity', sector: 'Precious Metal', desc: 'Safe haven asset',      accent: '#F59E0B' },
  { symbol: 'SLV',  name: 'Silver',     type: 'Commodity', sector: 'Precious Metal', desc: 'Industrial & store',    accent: '#9CA3AF' },
  { symbol: 'USO',  name: 'Crude Oil',  type: 'Commodity', sector: 'Energy',          desc: 'WTI oil exposure',      accent: '#EF4444' },
  { symbol: 'UNG',  name: 'Nat. Gas',   type: 'Commodity', sector: 'Energy',          desc: 'Natural gas ETF',       accent: '#3B82F6' },
  { symbol: 'CORN', name: 'Corn',       type: 'Commodity', sector: 'Agriculture',     desc: 'Grain commodity',       accent: '#10B981' },
  { symbol: 'WEAT', name: 'Wheat',      type: 'Commodity', sector: 'Agriculture',     desc: 'Global food staple',    accent: '#F97316' },
];

// ── TYPE COLORS ───────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  Stock: { bg: 'rgba(59,130,246,0.12)', text: '#60A5FA', dot: '#3B82F6' },
  Crypto: { bg: 'rgba(245,158,11,0.12)', text: '#FBBF24', dot: '#F59E0B' },
  ETF: { bg: 'rgba(16,185,129,0.12)', text: '#34D399', dot: '#10B981' },
  Commodity: { bg: 'rgba(239,68,68,0.12)', text: '#F87171', dot: '#EF4444' },
};

// ── DISCOVERY CARD ─────────────────────────────────────────────────────────────
function DiscoveryCard({ item, index }) {
  const navigate = useNavigate();
  const colors = TYPE_COLORS[item.type] || TYPE_COLORS.Stock;
  // commodity items can override accent dot color
  const dotColor = item.accent || colors.dot;

  return (
    <motion.button
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.035, ease: 'easeOut' }}
      onClick={() => navigate(`/Asset/${item.symbol}`)}
      className="flex-shrink-0 w-[140px] rounded-xl text-left tap-feedback"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="p-3">
        {/* Row 1: symbol + type badge */}
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono font-black text-white/90 text-sm tracking-tight leading-none">
            {item.symbol}
          </span>
          <span
            className="text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wide uppercase"
            style={{ background: colors.bg, color: colors.text }}
          >
            {item.type}
          </span>
        </div>

        {/* Row 2: full name */}
        <div className="text-[11px] font-semibold text-white/55 mb-1 truncate leading-tight">
          {item.name}
        </div>

        {/* Row 3: descriptor */}
        <div className="text-[10px] text-white/30 leading-snug mb-2.5 line-clamp-2">
          {item.desc}
        </div>

        {/* Row 4: sector pill */}
        <div
          className="text-[9px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
          style={{ background: `${dotColor}14`, color: `${dotColor}BB` }}
        >
          <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: dotColor }} />
          {item.sector}
        </div>
      </div>

      {/* Bottom tap cue */}
      <div
        className="flex items-center justify-end px-3 pb-2"
        style={{ color: 'rgba(255,255,255,0.15)' }}
      >
        <span className="text-[9px] font-medium">Tap to explore</span>
        <ChevronRight className="h-2.5 w-2.5 ml-0.5" />
      </div>
    </motion.button>
  );
}

// ── SECTION COMPONENT ─────────────────────────────────────────────────────────
export default function DiscoverySection({ title, items }) {
  return (
    <div>
      {/* Section header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5">
          <Compass className="h-3.5 w-3.5 text-white/30" />
          <h3 className="text-[13px] font-bold text-white/70">{title}</h3>
        </div>
        <span className="text-[10px] text-white/20">{items.length} assets</span>
      </div>

      {/* Horizontal scroll row */}
      <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-hide -mx-1 px-1">
        {items.map((item, i) => (
          <DiscoveryCard key={item.symbol} item={item} index={i} />
        ))}
      </div>
    </div>
  );
}