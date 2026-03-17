import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchFearGreed } from '@/api/marketData';

const MOODS = {
  '😱': { label: 'EXTREME FEAR', range: [0, 25], color: 'text-destructive' },
  '😨': { label: 'FEAR', range: [26, 45], color: 'text-orange-500' },
  '😐': { label: 'NEUTRAL', range: [46, 54], color: 'text-muted-foreground' },
  '😏': { label: 'GREED', range: [55, 74], color: 'text-chart-3' },
  '🤑': { label: 'EXTREME GREED', range: [75, 100], color: 'text-green-500' },
};

export default function TrekMoodIndicator() {
  const [mood, setMood] = useState('😐');
  const [label, setLabel] = useState('NEUTRAL');
  const [color, setColor] = useState('text-muted-foreground');
  const [value, setValue] = useState(50);

  useEffect(() => {
    const load = async () => {
      const fg = await fetchFearGreed();
      if (fg?.value) {
        const v = fg.value;
        setValue(v);
        const entry = Object.entries(MOODS).find(([_, m]) => v >= m.range[0] && v <= m.range[1]);
        if (entry) {
          setMood(entry[0]);
          setLabel(entry[1].label);
          setColor(entry[1].color);
        }
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/30 mb-4">Market Mood</h2>
      <div className="flex items-end gap-3">
        <div className="text-5xl">{mood}</div>
        <div>
          <div className={`text-xl font-black ${color}`}>{label}</div>
          <div className="text-[10px] text-white/25 mt-0.5">Fear & Greed: {value.toFixed(0)}</div>
        </div>
      </div>
    </motion.div>
  );
}