import React from 'react';
import { motion } from 'framer-motion';

const TIMEFRAMES = ['1D', '1W', '1M', '3M', '1Y'];

export default function TimeframeSelector({ timeframe, onTimeframeChange }) {
  return (
    <div className="flex gap-1.5 bg-white/[0.03] rounded-lg p-1">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf}
          onClick={() => onTimeframeChange(tf)}
          className={`px-3 py-1.5 rounded text-xs font-bold transition-all relative ${
            timeframe === tf ? 'text-primary' : 'text-white/40 hover:text-white/60'
          }`}
        >
          {timeframe === tf && (
            <motion.div
              layoutId="tf-bg"
              className="absolute inset-0 rounded bg-primary/10 border border-primary/20"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
            />
          )}
          <span className="relative z-10">{tf}</span>
        </button>
      ))}
    </div>
  );
}