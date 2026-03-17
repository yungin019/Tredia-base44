import React from 'react';
import { motion } from 'framer-motion';

const EARNINGS = [
  { symbol: 'AAPL', day: 'Wed', expected: '±4.2%', prediction: 'Beat', color: 'bg-chart-3/10 text-chart-3' },
  { symbol: 'TSLA', day: 'Thu', expected: '±8.1%', prediction: 'Miss', color: 'bg-destructive/10 text-destructive' },
  { symbol: 'MSFT', day: 'Fri', expected: '±3.5%', prediction: 'In-Line', color: 'bg-white/5 text-white/50' },
];

export default function EarningsCalendar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <h2 className="text-sm font-bold mb-4">📅 Earnings This Week</h2>
      <div className="space-y-3">
        {EARNINGS.map((e, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
            <div>
              <div className="text-xs font-bold text-white/80">
                {e.symbol} <span className="text-white/40 font-normal">{e.day}</span>
              </div>
              <div className="text-[10px] text-white/30 mt-0.5">Expected {e.expected}</div>
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${e.color}`}>
              TREK: {e.prediction}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}