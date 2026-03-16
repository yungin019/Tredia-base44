import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import MiniSparkline from './MiniSparkline';

export default function TopMovers({ stocks }) {
  const sorted = [...stocks].sort((a, b) => Math.abs(b.change) - Math.abs(a.change)).slice(0, 6);

  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Top Movers</h3>
        <span className="text-[10px] text-muted-foreground font-mono live-pulse">● LIVE</span>
      </div>
      <div className="divide-y divide-border/30">
        {sorted.map((stock, i) => (
          <motion.div
            key={stock.symbol}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold font-mono text-foreground">
                {stock.symbol.slice(0, 2)}
              </div>
              <div>
                <div className="text-sm font-medium">{stock.symbol}</div>
                <div className="text-[11px] text-muted-foreground truncate max-w-[100px]">{stock.name}</div>
              </div>
            </div>
            <MiniSparkline positive={stock.change >= 0} />
            <div className="text-right">
              <div className="text-sm font-mono font-medium">${stock.price.toFixed(2)}</div>
              <div className={`flex items-center justify-end gap-0.5 text-xs font-mono ${stock.change >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {stock.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {stock.change >= 0 ? '+' : ''}{stock.change}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}