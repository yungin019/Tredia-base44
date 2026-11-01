import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronRight, Globe2 } from 'lucide-react';
import { getUniverseByRegion } from '@/lib/assetUniverse';
import RegionFilter from './RegionFilter';

const PAGE_SIZE = 48;

const TYPE_STYLE = {
  stock: { label: 'Stock', color: '#60A5FA', bg: 'rgba(59,130,246,0.12)' },
  etf: { label: 'ETF', color: '#34D399', bg: 'rgba(16,185,129,0.12)' },
  crypto: { label: 'Crypto', color: '#FBBF24', bg: 'rgba(245,158,11,0.12)' },
  commodity: { label: 'Commodity', color: '#F87171', bg: 'rgba(239,68,68,0.12)' },
  forex: { label: 'FX', color: '#A78BFA', bg: 'rgba(139,92,246,0.12)' },
};

/**
 * Searchable universe browser with the region filter.
 * Metadata only — no quotes are fetched here; tapping a row opens the asset page,
 * where the existing shared quote cache takes over.
 */
export default function UniverseBrowser({ region, onRegionChange }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const matches = useMemo(() => {
    const base = getUniverseByRegion(region);
    const q = query.trim().toUpperCase();
    if (!q) return base;
    return base.filter((a) => a.symbol.includes(q) || a.name.toUpperCase().includes(q));
  }, [region, query]);

  const shown = matches.slice(0, visible);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Globe2 className="h-3.5 w-3.5 text-white/30" />
        <h3 className="text-[13px] font-bold text-white/70">Global Universe</h3>
        <span className="text-[10px] text-white/20 ml-auto">{matches.length} assets</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setVisible(PAGE_SIZE); }}
          placeholder="Search any symbol or company…"
          className="w-full pl-9 pr-3 py-2.5 rounded-xl text-[13px] text-white/85 placeholder:text-white/25 outline-none"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        />
      </div>

      <RegionFilter value={region} onChange={(r) => { onRegionChange(r); setVisible(PAGE_SIZE); }} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {shown.map((asset) => {
          const type = TYPE_STYLE[asset.type] || TYPE_STYLE.stock;
          return (
            <button
              key={asset.symbol}
              onClick={() => navigate(`/Asset/${asset.symbol}`)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-white/[0.04]"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="font-mono font-black text-white/90 text-[13px] w-[62px] flex-shrink-0">
                {asset.symbol}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-semibold text-white/55 truncate">{asset.name}</span>
                <span className="block text-[9px] text-white/25 truncate">
                  {asset.sector}{asset.instrument ? ` · ${asset.instrument}` : ''}
                </span>
              </span>
              <span
                className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0"
                style={{ background: type.bg, color: type.color }}
              >
                {type.label}
              </span>
              <ChevronRight className="h-3 w-3 text-white/15 flex-shrink-0" />
            </button>
          );
        })}
      </div>

      {matches.length === 0 && (
        <p className="text-center py-6 text-[11px] text-white/25">No asset matches “{query}”</p>
      )}

      {visible < matches.length && (
        <button
          onClick={() => setVisible((v) => v + PAGE_SIZE)}
          className="w-full py-2.5 rounded-xl text-[11px] font-bold text-white/45 hover:text-white/70 transition-colors"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          Show more ({matches.length - visible} left)
        </button>
      )}
    </div>
  );
}