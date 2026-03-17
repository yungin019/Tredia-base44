import React from 'react';
import { motion } from 'framer-motion';

const FILTERS = [
  { id: 'buy', label: '✓ BUY Signal', color: 'bg-chart-3/10 text-chart-3 border-chart-3/20' },
  { id: 'hold', label: '= HOLD', color: 'bg-white/5 text-white/50 border-white/10' },
  { id: 'sell', label: '✗ SELL Signal', color: 'bg-destructive/10 text-destructive border-destructive/20' },
];

export default function TrekScreener({ activeFilter, onFilterChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <h2 className="text-sm font-bold text-white/80 mb-3">🔍 TREK Screener</h2>
      <div className="flex gap-2">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(activeFilter === filter.id ? null : filter.id)}
            className={`px-4 py-2 rounded-lg text-[12px] font-bold border transition-all ${
              activeFilter === filter.id
                ? filter.color
                : 'bg-white/[0.03] text-white/40 border-white/[0.07] hover:bg-white/[0.05]'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </motion.div>
  );
}