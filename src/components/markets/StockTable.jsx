import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';
import MiniSparkline from '../dashboard/MiniSparkline';

export default function StockTable({ stocks, onAddWatchlist }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase">Symbol</th>
              <th className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase hidden sm:table-cell">Company</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase">Price</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase">Change</th>
              <th className="text-center px-4 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase hidden md:table-cell">7D</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase hidden lg:table-cell">Volume</th>
              <th className="text-right px-4 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/30 uppercase hidden lg:table-cell">Mkt Cap</th>
              <th className="w-10"></th>
            </tr>
          </thead>
          <tbody>
            {stocks.map((stock, i) => (
              <motion.tr
                key={stock.symbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors cursor-pointer group last:border-0"
              >
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] font-black font-mono text-white/50 group-hover:border-primary/20 transition-colors">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <span className="font-mono font-bold text-[13px] text-white/85">{stock.symbol}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[11px] text-white/35 hidden sm:table-cell truncate max-w-[140px]">
                  {stock.name}
                </td>
                <td className="px-4 py-3 text-right font-mono font-bold text-[13px] text-white/85">
                  ${stock.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className={`inline-flex items-center gap-0.5 font-mono text-[11px] font-semibold px-2 py-1 rounded-md ${
                    stock.change >= 0
                      ? 'text-chart-3 bg-chart-3/8'
                      : 'text-destructive bg-destructive/8'
                  }`}>
                    {stock.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex justify-center">
                    <MiniSparkline positive={stock.change >= 0} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-[11px] text-white/35 hidden lg:table-cell">
                  {(stock.volume / 1000000).toFixed(1)}M
                </td>
                <td className="px-4 py-3 text-right font-mono text-[11px] text-white/35 hidden lg:table-cell">
                  ${stock.marketCap}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddWatchlist?.(stock); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-primary/10"
                  >
                    <Star className="h-3.5 w-3.5 text-white/30 hover:text-primary transition-colors" />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}