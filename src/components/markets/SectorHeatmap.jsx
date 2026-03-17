import React from 'react';
import { motion } from 'framer-motion';

const SECTORS = [
  { name: 'Technology', change: 2.4 },
  { name: 'Healthcare', change: -0.8 },
  { name: 'Energy', change: 1.2 },
  { name: 'Financials', change: 0.3 },
  { name: 'Consumer', change: -1.1 },
  { name: 'Industrials', change: 0.9 },
  { name: 'Materials', change: 1.8 },
  { name: 'Utilities', change: -0.5 },
  { name: 'Real Estate', change: -0.2 },
];

function getSectorColor(change) {
  if (change > 2) return 'bg-green-900/60';
  if (change > 1) return 'bg-green-800/50';
  if (change > 0) return 'bg-green-700/40';
  if (change > -1) return 'bg-red-700/40';
  if (change > -2) return 'bg-red-800/50';
  return 'bg-red-900/60';
}

function getTextColor(change) {
  if (change > 1) return 'text-green-300';
  if (change > -1) return 'text-white/70';
  return 'text-red-300';
}

export default function SectorHeatmap() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <h2 className="text-sm font-bold text-white/80 mb-4">📊 Sector Performance</h2>
      <div className="grid grid-cols-3 gap-3">
        {SECTORS.map((sector, i) => (
          <motion.div
            key={sector.name}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 + i * 0.02 }}
            className={`rounded-lg p-3 text-center border border-white/[0.05] ${getSectorColor(sector.change)}`}
          >
            <div className="text-[11px] font-bold text-white/70 mb-1">{sector.name}</div>
            <div className={`text-sm font-black ${getTextColor(sector.change)}`}>
              {sector.change > 0 ? '+' : ''}{sector.change}%
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}