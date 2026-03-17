import React from 'react';
import { motion } from 'framer-motion';

const BRIEF_POINTS = [
  'Fed minutes signal rates on hold — bond yields pulling back, watch financials',
  'NVDA earnings beat driving tech sector momentum — AI theme accelerating',
  'Oil inventory data shows surprise draw — energy stocks positioned for upside',
];

export default function TrekDailyBrief() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <h2 className="text-sm font-bold mb-4" style={{ color: '#F59E0B' }}>⚡ TREK Daily Brief</h2>
      <ul className="space-y-2.5">
        {BRIEF_POINTS.map((point, i) => (
          <li key={i} className="text-xs text-white/60 leading-relaxed">
            • {point}
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-white/30 mt-3">Powered by TREK AI</p>
    </motion.div>
  );
}