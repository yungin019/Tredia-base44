import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, TrendingUp, Target, Award } from 'lucide-react';

const STATS = [
  { label: 'Signal Accuracy', value: '72%', sub: 'Last 20 signals', color: '#22c55e', icon: ShieldCheck },
  { label: 'Avg Return', value: '+6.4%', sub: 'Per winning trade', color: '#22c55e', icon: TrendingUp },
  { label: 'Win Rate', value: '14/20', sub: 'Closed signals', color: '#F59E0B', icon: Target },
  { label: 'Best Signal', value: '+31%', sub: 'NVDA · Mar 2025', color: '#F59E0B', icon: Award },
];

const RECENT = [
  { symbol: 'NVDA', signal: 'BUY', result: '+12.4%', outcome: 'WIN', date: 'Mar 12' },
  { symbol: 'AAPL', signal: 'BUY', result: '+5.8%', outcome: 'WIN', date: 'Mar 8' },
  { symbol: 'META', signal: 'SELL', result: '+9.1%', outcome: 'WIN', date: 'Mar 5' },
  { symbol: 'TSLA', signal: 'BUY', result: '-3.2%', outcome: 'LOSS', date: 'Feb 28' },
  { symbol: 'SPX', signal: 'WATCH', result: '+2.1%', outcome: 'WIN', date: 'Feb 22' },
  { symbol: 'BTC', signal: 'BUY', result: '+18.6%', outcome: 'WIN', date: 'Feb 14' },
];

export default function AITrackRecord() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <ShieldCheck className="h-3.5 w-3.5 text-chart-3" />
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">AI Track Record</h2>
        <span className="text-[9px] font-mono text-white/20 ml-auto">Last 20 signals</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        {STATS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-center"
          >
            <s.icon className="h-3.5 w-3.5 mx-auto mb-2" style={{ color: s.color }} />
            <div className="text-[16px] font-black font-mono" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] text-white/50 font-semibold mt-0.5">{s.label}</div>
            <div className="text-[8px] text-white/20 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Win/Loss visual bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[9px] text-white/30 mb-1.5">
          <span>14 wins</span>
          <span>6 losses</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden bg-white/[0.05] flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '70%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-chart-3 rounded-l-full"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '30%' }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
            className="h-full bg-destructive/80 rounded-r-full"
          />
        </div>
      </div>

      {/* Recent signals */}
      <div className="space-y-1">
        <p className="text-[9px] font-bold text-white/25 uppercase tracking-[0.1em] mb-2">Recent Signals</p>
        {RECENT.map((r, i) => (
          <div key={i} className="flex items-center gap-3 text-[10px]">
            <span className="font-mono font-black text-white/70 w-10">{r.symbol}</span>
            <span className="text-white/30 w-10">{r.signal}</span>
            <span className={`font-mono font-bold ${r.outcome === 'WIN' ? 'text-chart-3' : 'text-destructive'}`}>{r.result}</span>
            <span className={`ml-auto text-[8px] font-bold px-1.5 py-0.5 rounded-full ${r.outcome === 'WIN' ? 'bg-chart-3/10 text-chart-3 border border-chart-3/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
              {r.outcome}
            </span>
            <span className="text-white/15 font-mono text-[8px] w-12 text-right">{r.date}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}