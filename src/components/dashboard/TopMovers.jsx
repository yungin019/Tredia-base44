import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import MiniSparkline from './MiniSparkline';

export default function TopMovers({ stocks }) {
  const sorted = [...stocks].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 7);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/90">Top Movers</h3>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
          <span className="text-[9px] font-mono font-semibold text-chart-3/70 tracking-widest">LIVE</span>
        </div>
      </div>
      <div>
        {sorted.map((stock, i) => (
          <motion.div
            key={stock.symbol}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center justify-between px-5 py-3 border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors cursor-pointer last:border-0 group"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] font-black font-mono text-white/60 group-hover:border-primary/20 transition-colors">
                {stock.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="text-[12px] font-mono font-bold text-white/85">{stock.symbol}</div>
                <div className="text-[10px] text-white/30 truncate max-w-[90px]">{stock.name}</div>
              </div>
            </div>
            <MiniSparkline positive={stock.change >= 0} />
            <div className="text-right min-w-[70px]">
              <div className="text-[12px] font-mono font-bold text-white/85">${stock.price.toFixed(2)}</div>
              <div className={`flex items-center justify-end gap-0.5 text-[10px] font-mono font-semibold ${stock.change >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                {stock.change >= 0 ? <ArrowUpRight className="h-2.5 w-2.5" /> : <ArrowDownRight className="h-2.5 w-2.5" />}
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}