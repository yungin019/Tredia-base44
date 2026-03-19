import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TradeHistory() {
  const { data: trades = [], isLoading } = useQuery({
    queryKey: ['tradelog'],
    queryFn: () => base44.entities.TradeLog.list('-created_date', 50),
  });

  if (isLoading) {
    return <div className="p-8 text-center text-white/25 text-[12px]">Loading trade history...</div>;
  }

  if (trades.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center text-center gap-3">
        <div className="h-14 w-14 rounded-2xl border border-white/[0.06] bg-white/[0.03] flex items-center justify-center">
          <ArrowUpRight className="h-7 w-7 text-white/20" />
        </div>
        <div>
          <p className="text-sm font-bold text-white/60 mb-1">No trades yet</p>
          <p className="text-[11px] text-white/25 max-w-xs">Your paper trading history will appear here after you execute trades.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.05]">
            {['Date', 'Symbol', 'Action', 'Shares', 'Price', 'Total', 'Status'].map((h, i) => (
              <th key={i} className={`${i === 0 || i === 1 ? 'text-left px-5' : 'text-right px-4'} py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((trade, i) => {
            const isBuy = trade.action === 'buy';
            const date = trade.created_date ? new Date(trade.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' }) : '—';
            return (
              <motion.tr
                key={trade.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0"
              >
                <td className="px-5 py-3 text-[11px] text-white/30 font-mono">{date}</td>
                <td className="px-5 py-3">
                  <div className="font-mono font-black text-[13px] text-white/85">{trade.symbol}</div>
                  {trade.name && <div className="text-[10px] text-white/30">{trade.name}</div>}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full ${
                    isBuy ? 'bg-chart-3/10 text-chart-3' : 'bg-destructive/10 text-destructive'
                  }`}>
                    {isBuy ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {trade.action.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-mono text-[12px] text-white/60">{trade.shares}</td>
                <td className="px-4 py-3 text-right font-mono text-[12px] text-white/80">${trade.price?.toFixed(2) ?? '—'}</td>
                <td className="px-4 py-3 text-right font-mono text-[12px] font-bold text-white/70">
                  ${(trade.total ?? (trade.price * trade.shares))?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    trade.status === 'executed' ? 'bg-chart-3/10 text-chart-3' :
                    trade.status === 'cancelled' ? 'bg-destructive/10 text-destructive' :
                    'bg-white/5 text-white/40'
                  }`}>
                    {trade.status || 'executed'}
                  </span>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}