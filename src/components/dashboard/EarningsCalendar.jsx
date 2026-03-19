import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const EARNINGS = [
  { symbol: 'AAPL', name: 'Apple', day: 'Wed', date: 'Mar 26', eps_est: '$1.62', expected_move: '±4.2%', prediction: 'Beat', conf: 78, color: '#22c55e' },
  { symbol: 'TSLA', name: 'Tesla', day: 'Thu', date: 'Mar 27', eps_est: '$0.47', expected_move: '±8.1%', prediction: 'Miss', conf: 72, color: '#ef4444' },
  { symbol: 'MSFT', name: 'Microsoft', day: 'Fri', date: 'Mar 28', eps_est: '$3.21', expected_move: '±3.5%', prediction: 'In-Line', conf: 65, color: '#6b7280' },
  { symbol: 'META', name: 'Meta', day: 'Mon', date: 'Mar 31', eps_est: '$4.72', expected_move: '±5.8%', prediction: 'Beat', conf: 81, color: '#22c55e' },
];

const PRED_ICON = { Beat: TrendingUp, Miss: TrendingDown, 'In-Line': Minus };

export default function EarningsCalendar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-white/30" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">Earnings This Week</h2>
        </div>
        <span className="text-[9px] text-white/20 font-mono">TREK Forecast</span>
      </div>
      <div className="space-y-2">
        {EARNINGS.map((e, i) => {
          const PredIcon = PRED_ICON[e.prediction] || Minus;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              {/* Symbol */}
              <div className="h-9 w-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-black font-mono text-white/60">{e.symbol.slice(0, 2)}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-black font-mono text-white/85">{e.symbol}</span>
                  <span className="text-[9px] text-white/30 font-mono">{e.date}</span>
                </div>
                <div className="text-[9px] text-white/25">EPS est. {e.eps_est} · Move {e.expected_move}</div>
              </div>

              {/* Prediction */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold"
                  style={{ color: e.color, background: `${e.color}15`, borderColor: `${e.color}30` }}
                >
                  <PredIcon className="h-2.5 w-2.5" />
                  {e.prediction}
                </div>
                <span className="text-[8px] font-mono text-white/20">{e.conf}% conf</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}