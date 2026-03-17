import React from 'react';
import { motion } from 'framer-motion';

const SECTORS = [
  { name: 'Technology',         change: +2.41, size: 'lg' },
  { name: 'Financials',         change: +1.12, size: 'md' },
  { name: 'Healthcare',         change: -0.33, size: 'md' },
  { name: 'Energy',             change: +0.77, size: 'sm' },
  { name: 'Consumer Disc.',     change: -1.05, size: 'md' },
  { name: 'Industrials',        change: +0.44, size: 'sm' },
  { name: 'Comm. Services',     change: +1.88, size: 'sm' },
  { name: 'Utilities',          change: -0.21, size: 'xs' },
  { name: 'Materials',          change: +0.53, size: 'xs' },
  { name: 'Real Estate',        change: -0.88, size: 'xs' },
  { name: 'Consumer Staples',   change: +0.19, size: 'xs' },
];

const sizeClass = { lg: 'col-span-2 row-span-2', md: 'col-span-2', sm: 'col-span-1', xs: 'col-span-1' };

function getColor(v) {
  if (v > 1.5) return { bg: 'bg-chart-3/30', border: 'border-chart-3/40', text: 'text-chart-3' };
  if (v > 0)   return { bg: 'bg-chart-3/12', border: 'border-chart-3/20', text: 'text-chart-3' };
  if (v > -1)  return { bg: 'bg-destructive/10', border: 'border-destructive/15', text: 'text-destructive' };
  return              { bg: 'bg-destructive/22', border: 'border-destructive/30', text: 'text-destructive' };
}

export default function SectorHeatmap() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.05]">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.12em]">Sector Heatmap · Today</span>
      </div>
      <div className="p-3 grid grid-cols-4 gap-1.5">
        {SECTORS.map((s, i) => {
          const c = getColor(s.change);
          return (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              className={`${sizeClass[s.size]} ${c.bg} border ${c.border} rounded-lg p-2 flex flex-col justify-between min-h-[52px] cursor-pointer hover:brightness-125 transition-all`}
            >
              <span className="text-[9px] font-semibold text-white/50 leading-tight">{s.name}</span>
              <span className={`text-[12px] font-black font-mono ${c.text}`}>
                {s.change > 0 ? '+' : ''}{s.change.toFixed(2)}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}