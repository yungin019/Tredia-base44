import React from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';

export default function PositionsTable({ positions, onRefresh, loading }) {
  const totalPL = (Array.isArray(positions) ? positions : []).reduce((sum, p) => sum + parseFloat(p.unrealized_pl || 0), 0);
  const totalValue = (Array.isArray(positions) ? positions : []).reduce((sum, p) => sum + parseFloat(p.market_value || 0), 0);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-chart-3" />
          <h3 className="text-sm font-bold text-white/80">Open Positions</h3>
          <span className="text-[10px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">{(Array.isArray(positions) ? positions : []).length}</span>
        </div>
        <div className="flex items-center gap-4">
          {(Array.isArray(positions) ? positions : []).length > 0 && (
            <div className="text-right">
              <div className="text-[9px] text-white/25 uppercase tracking-[0.1em]">Total Unrealized P&L</div>
              <div className={`text-[13px] font-mono font-black ${totalPL >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                {totalPL >= 0 ? '+' : ''}${Math.abs(totalPL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          )}
          <button onClick={onRefresh} disabled={loading} className="text-white/20 hover:text-white/50 transition-colors">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {(!Array.isArray(positions) || positions.length === 0) ? (
        <div className="p-12 text-center">
          <TrendingUp className="h-10 w-10 text-white/8 mx-auto mb-3" />
          <p className="text-[12px] text-white/20">No open positions</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Symbol', 'Side', 'Qty', 'Avg Entry', 'Current', 'Mkt Value', 'Unrealized P&L', 'P&L %'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[9px] font-semibold tracking-[0.1em] text-white/25 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(positions) ? positions : []).map((pos) => {
                const pl = parseFloat(pos.unrealized_pl || 0);
                const plPct = parseFloat(pos.unrealized_plpc || 0) * 100;
                const isPos = pl >= 0;
                const fmt = (v, d = 2) => parseFloat(v || 0).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
                return (
                  <tr key={pos.symbol} className="border-b border-white/[0.04] hover:bg-white/[0.015] last:border-0 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-mono font-black text-[13px] text-white/90">{pos.symbol}</div>
                      <div className="text-[9px] text-white/25">{pos.asset_class}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${pos.side === 'long' ? 'text-chart-3 bg-chart-3/10' : 'text-destructive bg-destructive/10'}`}>
                        {pos.side?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-white/65">{pos.qty}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-white/65">${fmt(pos.avg_entry_price)}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-white/80">${fmt(pos.current_price)}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-white/65">${fmt(pos.market_value)}</td>
                    <td className={`px-4 py-3 font-mono text-[12px] font-bold ${isPos ? 'text-chart-3' : 'text-destructive'}`}>
                      {isPos ? '+' : ''}${fmt(Math.abs(pl))}
                    </td>
                    <td className={`px-4 py-3 font-mono text-[12px] font-bold ${isPos ? 'text-chart-3' : 'text-destructive'}`}>
                      {isPos ? '+' : ''}{plPct.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}