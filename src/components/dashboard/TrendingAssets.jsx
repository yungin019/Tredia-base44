import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import MiniSparkline from './MiniSparkline';

const TRENDING = [
  { symbol: 'NVDA', name: 'Nvidia', price: 875.40, change: +3.82, signal: 'BUY' },
  { symbol: 'AAPL', name: 'Apple', price: 213.18, change: +1.14, signal: 'WATCH' },
  { symbol: 'TSLA', name: 'Tesla', price: 178.22, change: -2.31, signal: 'SELL' },
  { symbol: 'BTC', name: 'Bitcoin', price: 71240, change: +2.18, signal: 'BUY' },
  { symbol: 'ETH', name: 'Ethereum', price: 3812, change: +1.55, signal: 'BUY' },
  { symbol: 'SPY', name: 'S&P 500', price: 522.80, change: +0.72, signal: 'WATCH' },
  { symbol: 'META', name: 'Meta', price: 484.10, change: +1.93, signal: 'BUY' },
];

const SIGNAL_STYLE = {
  BUY:   { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)' },
  SELL:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)' },
  WATCH: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
};

export default function TrendingAssets({ stocks = [] }) {
  // Merge live stock data if available
  const assets = TRENDING.map(t => {
    const live = stocks.find(s => s.symbol === t.symbol);
    return live ? { ...t, price: live.price, change: live.change } : t;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.12em]">Trending</h3>
        <span className="text-[9px] text-white/20 font-mono">scroll →</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {assets.map((asset, i) => {
          const sig = SIGNAL_STYLE[asset.signal] || SIGNAL_STYLE.WATCH;
          const isUp = asset.change >= 0;
          return (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex-shrink-0 rounded-xl border bg-[#111118] p-4 cursor-pointer hover:border-white/[0.15] transition-all"
              style={{ minWidth: 130, borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-black font-mono text-white/90">{asset.symbol}</span>
                <span
                  className="text-[8px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wider"
                  style={{ color: sig.color, background: sig.bg, borderColor: sig.border }}
                >
                  {asset.signal}
                </span>
              </div>

              <div className="text-[11px] text-white/30 mb-2">{asset.name}</div>

              <div className="h-8 mb-2">
                <MiniSparkline positive={isUp} />
              </div>

              <div className="text-[13px] font-mono font-bold text-white/85">
                ${asset.price >= 10000
                  ? asset.price.toLocaleString(undefined, { maximumFractionDigits: 0 })
                  : asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-mono font-bold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                {isUp ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {isUp ? '+' : ''}{asset.change.toFixed(2)}%
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}