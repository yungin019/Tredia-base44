import React from 'react';
import { motion } from 'framer-motion';

const ZONES = [
  { label: 'Extreme Fear', max: 25, color: '#ef4444' },
  { label: 'Fear', max: 45, color: '#f97316' },
  { label: 'Neutral', max: 55, color: '#6b7280' },
  { label: 'Greed', max: 75, color: '#84cc16' },
  { label: 'Extreme Greed', max: 100, color: '#22c55e' },
];

function getZone(value) {
  return ZONES.find(z => value <= z.max) || ZONES[ZONES.length - 1];
}

export default function GlobalSentimentMeter({ fearGreed }) {
  const value = fearGreed?.value || 71;
  const zone = getZone(value);
  const percentage = (value / 100) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.04 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5 flex flex-col justify-between"
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">Fear & Greed</h2>
        <span className="text-[9px] text-white/20 font-mono">CNN Index</span>
      </div>

      {/* Big number */}
      <div className="flex items-end gap-3 mb-4">
        <div className="text-5xl font-black font-mono leading-none" style={{ color: zone.color }}>
          {Math.round(value)}
        </div>
        <div className="pb-1">
          <div className="text-[13px] font-bold text-white/70">{zone.label}</div>
          <div className="text-[10px] text-white/25">out of 100</div>
        </div>
      </div>

      {/* Gradient bar */}
      <div className="relative mb-3">
        <div className="h-2.5 rounded-full overflow-hidden"
          style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f97316 25%, #6b7280 50%, #84cc16 75%, #22c55e 100%)' }}
        >
          {/* Track overlay */}
          <div className="absolute inset-0 rounded-full" style={{ background: 'rgba(0,0,0,0.2)' }} />
        </div>
        {/* Needle */}
        <motion.div
          initial={{ left: '50%' }}
          animate={{ left: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-2 rounded-sm shadow-lg"
          style={{ background: 'white', border: '1.5px solid rgba(0,0,0,0.4)' }}
        />
      </div>

      {/* Zone labels */}
      <div className="flex justify-between mt-1">
        {ZONES.map(z => (
          <span
            key={z.label}
            className="text-[8px] font-semibold uppercase tracking-wide"
            style={{ color: value <= z.max && value > (ZONES[ZONES.indexOf(z) - 1]?.max ?? 0) ? z.color : 'rgba(255,255,255,0.15)' }}
          >
            {z.label === 'Extreme Fear' ? 'Fear' : z.label === 'Extreme Greed' ? 'Greed' : z.label}
          </span>
        ))}
      </div>
    </motion.div>
  );
}