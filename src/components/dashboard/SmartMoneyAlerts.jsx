import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, Waves, BarChart2, ArrowRight } from 'lucide-react';

const ALERTS = [
  {
    symbol: 'NVDA',
    type: 'Unusual call volume',
    detail: '+340% above 30-day avg · $900 strike · Exp. Apr 19',
    time: '1h ago',
    icon: BarChart2,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.2)',
  },
  {
    symbol: 'BTC',
    type: 'Whale movement',
    detail: '1,200 BTC transferred to exchange · Possible sell pressure',
    time: '32m ago',
    icon: Waves,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    symbol: 'TSLA',
    type: 'Insider selling',
    detail: 'Director sold $2.3M · 3rd transaction this quarter',
    time: '2h ago',
    icon: TrendingDown,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
  },
  {
    symbol: 'META',
    type: 'Unusual put activity',
    detail: '$10M in protective puts · June expiry · Hedge or bearish bet',
    time: '45m ago',
    icon: AlertTriangle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.18)',
  },
];

export default function SmartMoneyAlerts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">Smart Money</h2>
        <span className="flex items-center gap-1.5 text-[9px] text-white/20 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-primary live-pulse" />
          LIVE
        </span>
      </div>
      <div className="space-y-2">
        {ALERTS.map((alert, i) => {
          const Icon = alert.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:opacity-80 transition-opacity"
              style={{ background: alert.bg, borderColor: alert.border }}
            >
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${alert.color}20`, border: `1px solid ${alert.color}30` }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: alert.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-black font-mono text-white/85">{alert.symbol}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: alert.color }}>{alert.type}</span>
                </div>
                <p className="text-[10px] text-white/35 leading-tight truncate">{alert.detail}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[9px] text-white/25 font-mono">{alert.time}</span>
                <ArrowRight className="h-3 w-3 text-white/15" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}