import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, DollarSign, Shield, RefreshCw } from 'lucide-react';

const Stat = ({ label, value, color = 'text-white/90', sub }) => (
  <div>
    <div className="text-[9px] text-white/25 uppercase tracking-[0.1em] mb-0.5">{label}</div>
    <div className={`text-[15px] font-mono font-black ${color}`}>{value}</div>
    {sub && <div className="text-[9px] text-white/25 mt-0.5">{sub}</div>}
  </div>
);

const fmt = (v, decimals = 2) => parseFloat(v || 0).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export default function AccountOverview({ account, onRefresh, loading }) {
  if (!account) return null;

  const equity = parseFloat(account.equity || 0);
  const lastEquity = parseFloat(account.last_equity || 0);
  const dailyPL = equity - lastEquity;
  const dailyPLPct = lastEquity > 0 ? (dailyPL / lastEquity) * 100 : 0;
  const isPos = dailyPL >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-chart-3/20 bg-chart-3/5 overflow-hidden"
    >
      <div className="px-5 py-3 border-b border-chart-3/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-chart-3" />
          <span className="text-[11px] font-black text-chart-3 tracking-wide uppercase">Alpaca Account</span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${account.status === 'ACTIVE' ? 'bg-chart-3/15 text-chart-3' : 'bg-primary/15 text-primary'}`}>
            {account.status}
          </span>
          <span className="text-[9px] text-white/30 font-mono">{account.account_number}</span>
        </div>
        <button onClick={onRefresh} disabled={loading} className="text-white/20 hover:text-white/50 transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
        <Stat label="Portfolio Value" value={`$${fmt(account.portfolio_value)}`} color="text-white/90" />
        <Stat label="Equity" value={`$${fmt(account.equity)}`} />
        <Stat label="Buying Power" value={`$${fmt(account.buying_power)}`} color="text-chart-3" />
        <Stat label="Cash" value={`$${fmt(account.cash)}`} />
        <div>
          <div className="text-[9px] text-white/25 uppercase tracking-[0.1em] mb-0.5">Day P&L</div>
          <div className={`text-[15px] font-mono font-black ${isPos ? 'text-chart-3' : 'text-destructive'}`}>
            {isPos ? '+' : ''}${fmt(Math.abs(dailyPL))}
          </div>
          <div className={`text-[9px] font-semibold ${isPos ? 'text-chart-3/70' : 'text-destructive/70'}`}>
            {isPos ? '+' : ''}{dailyPLPct.toFixed(2)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}