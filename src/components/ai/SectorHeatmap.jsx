import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { invokeFunction } from '@/api/functionsClient';

// Sector ETFs whose live quotes drive every tile.
const SECTOR_ETFS = [
  { symbol: 'XLK', name: 'Technology', size: 'col-span-2 row-span-2' },
  { symbol: 'XLF', name: 'Financials', size: 'col-span-2' },
  { symbol: 'XLV', name: 'Healthcare', size: 'col-span-2' },
  { symbol: 'XLY', name: 'Consumer Disc.', size: 'col-span-2' },
  { symbol: 'XLE', name: 'Energy', size: 'col-span-1' },
  { symbol: 'XLI', name: 'Industrials', size: 'col-span-1' },
  { symbol: 'XLC', name: 'Comm. Services', size: 'col-span-1' },
  { symbol: 'XLU', name: 'Utilities', size: 'col-span-1' },
  { symbol: 'XLB', name: 'Materials', size: 'col-span-1' },
  { symbol: 'XLRE', name: 'Real Estate', size: 'col-span-1' },
  { symbol: 'XLP', name: 'Consumer Staples', size: 'col-span-1' },
];

function getColor(v) {
  if (v > 1.5) return { bg: 'bg-chart-3/30', border: 'border-chart-3/40', text: 'text-chart-3' };
  if (v > 0)   return { bg: 'bg-chart-3/12', border: 'border-chart-3/20', text: 'text-chart-3' };
  if (v > -1)  return { bg: 'bg-destructive/10', border: 'border-destructive/15', text: 'text-destructive' };
  return              { bg: 'bg-destructive/22', border: 'border-destructive/30', text: 'text-destructive' };
}

export default function SectorHeatmap() {
  const [quotes, setQuotes] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await invokeFunction('stockPrices', { symbols: SECTOR_ETFS.map(s => s.symbol) });
        if (!cancelled) setQuotes(res?.prices || {});
      } catch (_) {
        if (!cancelled) setQuotes({});
      }
    };
    load();
    const iv = setInterval(load, 2 * 60 * 1000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  const tiles = SECTOR_ETFS.map(s => {
    const q = quotes[s.symbol];
    const price = Number(q?.price);
    const prev = Number(q?.prevClose);
    const pct = price > 0 && prev > 0 ? ((price - prev) / prev) * 100 : null;
    return { ...s, changePct: pct };
  }).filter(s => s.changePct != null);

  // Nothing live to show: hide the block rather than invent sector moves.
  if (tiles.length === 0) return null;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.12em]">Sector Heatmap · Today</span>
        <span className="text-[8px] font-mono text-white/25 uppercase">Finnhub</span>
      </div>
      <div className="p-3 grid grid-cols-4 gap-1.5">
        {tiles.map((s, i) => {
          const c = getColor(s.changePct);
          return (
            <motion.div
              key={s.symbol}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`${s.size} ${c.bg} border ${c.border} rounded-lg p-2 flex flex-col justify-between min-h-[52px]`}
            >
              <span className="text-[9px] font-semibold text-white/50 leading-tight">
                {s.name}
                <span className="block text-[7px] font-mono text-white/25">{s.symbol}</span>
              </span>
              <span className={`text-[12px] font-black font-mono ${c.text}`}>
                {s.changePct > 0 ? '+' : ''}{s.changePct.toFixed(2)}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}