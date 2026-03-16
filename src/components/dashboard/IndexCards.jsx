import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function IndexCards({ indices }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3">
      {indices.map((item, i) => (
        <motion.div
          key={item.symbol}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.3 }}
          className="card-hover relative rounded-xl border border-white/[0.07] bg-[#111118] p-4 overflow-hidden cursor-pointer group"
        >
          {/* Subtle corner accent */}
          <div className={`absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-5 ${item.change >= 0 ? 'bg-chart-3' : 'bg-destructive'}`} />

          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-semibold tracking-[0.12em] text-white/40">{item.symbol}</span>
            {item.change >= 0
              ? <TrendingUp className="h-3 w-3 text-chart-3/60" />
              : <TrendingDown className="h-3 w-3 text-destructive/60" />
            }
          </div>

          <div className="text-[15px] font-mono font-bold text-white/90 tracking-tight">
            {item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className={`flex items-center gap-1 mt-1.5 text-[11px] font-mono font-semibold ${item.change >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
            {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
            <span className="text-white/30 font-normal ml-1 text-[10px]">
              {item.change >= 0 ? '+' : ''}{item.changeAmount?.toFixed(2)}
            </span>
          </div>

          <div className="text-[9px] font-medium text-white/25 mt-2 tracking-wide uppercase">{item.name}</div>
        </motion.div>
      ))}
    </div>
  );
}