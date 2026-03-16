import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Star } from 'lucide-react';
import MiniSparkline from '../dashboard/MiniSparkline';

export default function StockTable({ stocks, onAddWatchlist }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground text-xs">
              <th className="text-left px-4 py-3 font-medium">Symbol</th>
              <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Name</th>
              <th className="text-right px-4 py-3 font-medium">Price</th>
              <th className="text-right px-4 py-3 font-medium">Change</th>
              <th className="text-center px-4 py-3 font-medium hidden md:table-cell">Chart</th>
              <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Volume</th>
              <th className="text-right px-4 py-3 font-medium hidden lg:table-cell">Mkt Cap</th>
              <th className="text-center px-4 py-3 font-medium w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {stocks.map((stock, i) => (
              <motion.tr
                key={stock.symbol}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="hover:bg-secondary/30 transition-colors cursor-pointer group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center text-[10px] font-bold font-mono">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <span className="font-mono font-semibold text-sm">{stock.symbol}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs hidden sm:table-cell truncate max-w-[150px]">
                  {stock.name}
                </td>
                <td className="px-4 py-3 text-right font-mono font-medium">
                  ${stock.price.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center gap-0.5 font-mono text-xs ${stock.change >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {stock.change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stock.change >= 0 ? '+' : ''}{stock.change}%
                  </span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex justify-center">
                    <MiniSparkline positive={stock.change >= 0} />
                  </div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground hidden lg:table-cell">
                  {(stock.volume / 1000000).toFixed(1)}M
                </td>
                <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground hidden lg:table-cell">
                  ${stock.marketCap}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); onAddWatchlist?.(stock); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className="h-3.5 w-3.5 text-muted-foreground hover:text-chart-4 transition-colors" />
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