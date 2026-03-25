import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';

// Sector ETFs — real tradeable symbols
const SECTORS = [
  { name: 'Technology',   short: 'TECH',   etf: 'XLK',  weight: 2 },
  { name: 'Healthcare',   short: 'HLTH',   etf: 'XLV',  weight: 1.5 },
  { name: 'Financials',   short: 'FIN',    etf: 'XLF',  weight: 1.5 },
  { name: 'Energy',       short: 'ENRG',   etf: 'XLE',  weight: 1 },
  { name: 'Consumer',     short: 'CONS',   etf: 'XLY',  weight: 1 },
  { name: 'Industrials',  short: 'INDS',   etf: 'XLI',  weight: 1 },
  { name: 'Materials',    short: 'MATL',   etf: 'XLB',  weight: 1 },
  { name: 'Utilities',    short: 'UTIL',   etf: 'XLU',  weight: 1 },
  { name: 'Real Estate',  short: 'REIT',   etf: 'XLRE', weight: 1 },
];

function getBgStyle(change) {
  const abs = Math.abs(change);
  if (change > 2)   return { background: 'rgba(14,200,120,0.22)', border: '1px solid rgba(14,200,120,0.3)' };
  if (change > 1)   return { background: 'rgba(14,200,120,0.13)', border: '1px solid rgba(14,200,120,0.18)' };
  if (change > 0)   return { background: 'rgba(14,200,120,0.06)', border: '1px solid rgba(14,200,120,0.1)' };
  if (change > -1)  return { background: 'rgba(239,68,68,0.06)',  border: '1px solid rgba(239,68,68,0.1)' };
  if (change > -2)  return { background: 'rgba(239,68,68,0.13)', border: '1px solid rgba(239,68,68,0.18)' };
  return              { background: 'rgba(239,68,68,0.22)',  border: '1px solid rgba(239,68,68,0.3)' };
}

function getChangeColor(change) {
  if (change >= 1)  return '#0ec878';
  if (change >= 0)  return 'rgba(14,200,120,0.7)';
  if (change > -1)  return 'rgba(239,68,68,0.7)';
  return '#ef4444';
}

function getBias(change) {
  if (change > 1.5)  return { label: 'STRONG BUY', color: '#0ec878' };
  if (change > 0.3)  return { label: 'BULLISH',     color: '#0ec878' };
  if (change > -0.3) return { label: 'NEUTRAL',     color: 'rgba(255,255,255,0.3)' };
  if (change > -1.5) return { label: 'BEARISH',     color: '#ef4444' };
  return               { label: 'AVOID',        color: '#ef4444' };
}

function BarMini({ change }) {
  const max = 3;
  const pct = Math.min(Math.abs(change) / max, 1) * 100;
  const color = change >= 0 ? '#0ec878' : '#ef4444';
  return (
    <div className="w-full h-0.5 rounded-full mt-1.5" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{
          width: `${pct}%`,
          background: color,
          marginLeft: change >= 0 ? '50%' : `calc(50% - ${pct / 2}%)`,
          opacity: 0.8,
        }}
      />
    </div>
  );
}

function SectorTile({ sector, data, index, onClick }) {
  const change = data?.change ?? null;
  const price = data?.price ?? null;
  const loading = data === undefined;
  const bgStyle = change !== null ? getBgStyle(change) : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' };
  const bias = change !== null ? getBias(change) : null;
  const isLarge = sector.weight >= 2;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.93 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.04 + index * 0.03, duration: 0.25 }}
      onClick={() => onClick(sector.etf)}
      className={`rounded-2xl p-3.5 text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${isLarge ? 'row-span-2' : ''}`}
      style={{ ...bgStyle, minHeight: isLarge ? 120 : 88 }}
    >
      {loading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-2.5 w-16 rounded bg-white/10" />
          <div className="h-4 w-12 rounded bg-white/10" />
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {sector.short}
              </span>
              {change !== null && (
                change >= 0
                  ? <TrendingUp style={{ width: 10, height: 10, color: '#0ec878', opacity: 0.7 }} />
                  : <TrendingDown style={{ width: 10, height: 10, color: '#ef4444', opacity: 0.7 }} />
              )}
            </div>
            <div className="text-[11px] font-bold text-white/60 leading-tight">{sector.name}</div>
          </div>

          <div>
            {change !== null ? (
              <div className="font-mono font-black text-base leading-none mt-1.5" style={{ color: getChangeColor(change) }}>
                {change > 0 ? '+' : ''}{change.toFixed(2)}%
              </div>
            ) : (
              <div className="text-xs text-white/20 mt-1.5">—</div>
            )}
            {price && (
              <div className="text-[9px] font-mono text-white/25 mt-0.5">{sector.etf} ${price.toFixed(2)}</div>
            )}
            {bias && (
              <div className="text-[8px] font-black uppercase tracking-wider mt-1.5" style={{ color: bias.color, opacity: 0.8 }}>
                {bias.label}
              </div>
            )}
            {change !== null && <BarMini change={change} />}
          </div>
        </div>
      )}
    </motion.button>
  );
}

export default function SectorHeatmap() {
  const navigate = useNavigate();
  const [sectorData, setSectorData] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSectors = async () => {
    try {
      const symbols = SECTORS.map(s => s.etf);
      const res = await base44.functions.invoke('stockPrices', { symbols });
      if (res?.data?.prices) {
        const mapped = {};
        SECTORS.forEach(s => {
          const d = res.data.prices[s.etf];
          if (d && d.price > 0) {
            const change = d.prevClose ? ((d.price - d.prevClose) / d.prevClose) * 100 : 0;
            mapped[s.etf] = { price: d.price, change: parseFloat(change.toFixed(2)) };
          }
        });
        setSectorData(mapped);
        setLastUpdated(new Date());
      }
    } catch (e) {
      // silent fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
    const interval = setInterval(fetchSectors, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sort by change descending for ranking display
  const ranked = [...SECTORS].sort((a, b) => {
    const ca = sectorData[a.etf]?.change ?? 0;
    const cb = sectorData[b.etf]?.change ?? 0;
    return cb - ca;
  });

  const topSector = ranked[0];
  const bottomSector = ranked[ranked.length - 1];
  const topChange = sectorData[topSector?.etf]?.change;
  const bottomChange = sectorData[bottomSector?.etf]?.change;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(6,12,30,0.8)', border: '1px solid rgba(100,220,255,0.08)' }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between border-b border-white/[0.05]">
        <div>
          <h2 className="text-sm font-black text-white/85 tracking-tight">Sector Heatmap</h2>
          <p className="text-[9px] text-white/30 mt-0.5 uppercase tracking-wider">Live ETF performance · Click to explore</p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[9px] text-white/20 flex items-center gap-1">
              <RefreshCw style={{ width: 9, height: 9 }} />
              {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      {/* Leaders strip */}
      {!loading && topSector && topChange !== undefined && (
        <div className="flex gap-0 border-b border-white/[0.04]">
          <div className="flex-1 px-4 py-2.5" style={{ background: 'rgba(14,200,120,0.05)' }}>
            <span className="text-[8px] font-black text-white/25 uppercase tracking-widest">Leading</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingUp style={{ width: 10, height: 10, color: '#0ec878' }} />
              <span className="text-xs font-black text-white/80">{topSector.name}</span>
              <span className="text-xs font-mono font-black" style={{ color: '#0ec878' }}>+{topChange?.toFixed(2)}%</span>
            </div>
          </div>
          <div className="w-px bg-white/[0.05]" />
          <div className="flex-1 px-4 py-2.5" style={{ background: 'rgba(239,68,68,0.05)' }}>
            <span className="text-[8px] font-black text-white/25 uppercase tracking-widest">Lagging</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <TrendingDown style={{ width: 10, height: 10, color: '#ef4444' }} />
              <span className="text-xs font-black text-white/80">{bottomSector.name}</span>
              <span className="text-xs font-mono font-black" style={{ color: '#ef4444' }}>{bottomChange?.toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="p-3 grid grid-cols-3 gap-2">
        {SECTORS.map((sector, i) => (
          <SectorTile
            key={sector.etf}
            sector={sector}
            data={loading ? undefined : sectorData[sector.etf] ?? null}
            index={i}
            onClick={(etf) => navigate(`/Asset/${etf}`)}
          />
        ))}
      </div>
    </motion.div>
  );
}