import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function IndexCards({ indices }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {indices.map((item, i) => (
        <motion.div
          key={item.symbol}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`rounded-xl border p-3 transition-all hover:scale-[1.02] cursor-pointer ${
            item.change >= 0
              ? 'border-primary/20 bg-primary/5 glow-green'
              : 'border-destructive/20 bg-destructive/5 glow-red'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono text-muted-foreground">{item.symbol}</span>
            {item.change >= 0 ? (
              <TrendingUp className="h-3 w-3 text-primary" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
          </div>
          <div className="text-sm font-semibold font-mono">{item.price.toLocaleString()}</div>
          <div className={`text-xs font-mono mt-0.5 ${item.change >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {item.change >= 0 ? '+' : ''}{item.change}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 truncate">{item.name}</div>
        </motion.div>
      ))}
    </div>
  );
}