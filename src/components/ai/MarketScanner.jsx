import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SCANNER_DATA = [
  { symbol: 'NVDA',  name: 'NVIDIA',        change: +4.82,  volume: '↑↑↑', signal: 'BUY',  score: 94 },
  { symbol: 'MSFT',  name: 'Microsoft',     change: +1.23,  volume: '↑',   signal: 'BUY',  score: 78 },
  { symbol: 'TSLA',  name: 'Tesla',         change: -2.14,  volume: '↑↑',  signal: 'SELL', score: 68 },
  { symbol: 'AAPL',  name: 'Apple',         change: +0.87,  volume: '→',   signal: 'HOLD', score: 61 },
  { symbol: 'AMZN',  name: 'Amazon',        change: +2.31,  volume: '↑↑',  signal: 'BUY',  score: 83 },
  { symbol: 'META',  name: 'Meta',          change: -0.55,  volume: '↓',   signal: 'HOLD', score: 55 },
  { symbol: 'JPM',   name: 'JPMorgan',      change: +1.90,  volume: '↑',   signal: 'BUY',  score: 77 },
  { symbol: 'BTC',   name: 'Bitcoin',       change: +3.44,  volume: '↑↑',  signal: 'BUY',  score: 88 },
];

const signalStyle = {
  BUY:  { color: 'text-chart-3', bg: 'bg-chart-3/10', border: 'border-chart-3/20' },
  SELL: { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
  HOLD: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20' },
};

export default function MarketScanner() {
  const [filter, setFilter] = useState('ALL');
  const filters = ['ALL', 'BUY', 'HOLD', 'SELL'];
  const filtered = filter === 'ALL' ? SCANNER_DATA : SCANNER_DATA.filter(d => d.signal === filter);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Market Scanner</span>
          <span className="h-1.5 w-1.5 rounded-full bg-chart-3 animate-pulse" />
        </div>
        <div className="flex gap-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all ${
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/30 hover:text-white/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-white/[0.04]">
        {filtered.map((item, i) => {
          const s = signalStyle[item.signal];
          const pos = item.change > 0;
          const neu = item.change === 0;
          return (
            <motion.div
              key={item.symbol}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="w-10 text-left">
                <span className="text-[11px] font-black font-mono text-white/90">{item.symbol}</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-white/35">{item.name}</span>
              </div>
              <div className="flex items-center gap-1 w-16 justify-end">
                {pos ? <TrendingUp className="h-3 w-3 text-chart-3" /> : neu ? <Minus className="h-3 w-3 text-white/30" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                <span className={`text-[11px] font-mono font-bold ${pos ? 'text-chart-3' : neu ? 'text-white/40' : 'text-destructive'}`}>
                  {pos ? '+' : ''}{item.change.toFixed(2)}%
                </span>
              </div>
              <div className="w-8 text-center">
                <span className="text-[9px] text-white/25 font-mono">{item.volume}</span>
              </div>
              {/* AI Score bar */}
              <div className="hidden sm:flex items-center gap-1.5 w-16">
                <div className="flex-1 h-0.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full bg-primary/70 rounded-full" style={{ width: `${item.score}%` }} />
                </div>
                <span className="text-[9px] font-mono text-white/30">{item.score}</span>
              </div>
              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${s.bg} ${s.color} ${s.border} w-9 text-center`}>
                {item.signal}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}