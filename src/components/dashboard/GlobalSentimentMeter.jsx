import React from 'react';
import { motion } from 'framer-motion';

function getSentimentColor(value) {
  if (value <= 25) return { barColor: 'rgb(239, 68, 68)', label: 'EXTREME FEAR' };
  if (value <= 45) return { barColor: 'rgb(249, 115, 22)', label: 'FEAR' };
  if (value <= 54) return { barColor: 'rgb(107, 114, 128)', label: 'NEUTRAL' };
  if (value <= 74) return { barColor: 'rgb(132, 204, 22)', label: 'GREED' };
  return { barColor: 'rgb(34, 197, 94)', label: 'EXTREME GREED' };
}

export default function GlobalSentimentMeter({ fearGreed }) {
  const value = fearGreed?.value || 50;
  const { barColor, label } = getSentimentColor(value);
  const percentage = (value / 100) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/30 mb-4">Fear & Greed Index</h2>
      
      {/* Gradient Bar */}
      <div className="mb-4">
        <div className="h-3 rounded-full overflow-hidden bg-white/[0.05]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(90deg, rgb(239, 68, 68), rgb(249, 115, 22), rgb(107, 114, 128), rgb(132, 204, 22), rgb(34, 197, 94))`,
            }}
          />
        </div>
      </div>

      {/* Value and Label */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-black font-mono" style={{ color: barColor }}>
            {value.toFixed(0)}
          </div>
          <div className="text-[11px] font-bold text-white/40 mt-1">{label}</div>
        </div>
        <div className="text-[10px] text-white/25">/100</div>
      </div>
    </motion.div>
  );
}