import React from 'react';
import { motion } from 'framer-motion';

const MOODS = [
  { label: 'PANIC', emoji: '😱', color: '#EF4444', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/20', range: [0, 15] },
  { label: 'FEAR', emoji: '😰', color: '#F97316', bg: 'bg-[#F97316]/10', border: 'border-[#F97316]/20', range: [15, 35] },
  { label: 'NEUTRAL', emoji: '😐', color: '#94A3B8', bg: 'bg-white/5', border: 'border-white/10', range: [35, 55] },
  { label: 'OPTIMISM', emoji: '🙂', color: '#60A5FA', bg: 'bg-[#60A5FA]/10', border: 'border-[#60A5FA]/20', range: [55, 72] },
  { label: 'GREED', emoji: '😏', color: '#22C55E', bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/20', range: [72, 88] },
  { label: 'EUPHORIA', emoji: '🤑', color: '#F59E0B', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/20', range: [88, 100] },
];

// Current fear & greed index: 62 = OPTIMISM
const CURRENT_VALUE = 62;

function getMood(value) {
  return MOODS.find(m => value >= m.range[0] && value < m.range[1]) || MOODS[2];
}

export default function TrekMoodIndicator() {
  const mood = getMood(CURRENT_VALUE);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${mood.bg} ${mood.border}`}
    >
      <span className="text-xl">{mood.emoji}</span>
      <div>
        <p className="text-[8px] text-white/25 uppercase tracking-widest font-bold">TREK Mood</p>
        <p className="text-[12px] font-black tracking-wide" style={{ color: mood.color }}>{mood.label}</p>
      </div>
      <div className="ml-auto flex flex-col items-end">
        <span className="text-[18px] font-black font-mono" style={{ color: mood.color }}>{CURRENT_VALUE}</span>
        <span className="text-[8px] text-white/20 font-mono">/ 100</span>
      </div>
    </motion.div>
  );
}