import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, TrendingUp, BarChart3, DollarSign, Wallet } from 'lucide-react';

const stats = [
  { label: 'Total Portfolio Value', value: '$284,529', sub: '.40', change: '+12.4%', positive: true, icon: Wallet, detail: 'vs. last month' },
  { label: "Today's P&L", value: '+$3,847', sub: '.20', change: '+1.37%', positive: true, icon: TrendingUp, detail: 'since open' },
  { label: 'Total Return', value: '+$42,180', sub: '.00', change: '+17.4%', positive: true, icon: BarChart3, detail: 'all time' },
  { label: 'Cash Available', value: '$18,420', sub: '.60', change: null, positive: true, icon: DollarSign, detail: 'ready to deploy' },
];

export default function PortfolioSummary() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="card-hover rounded-xl border border-white/[0.07] bg-[#111118] p-4 relative overflow-hidden"
        >
          {/* Gold accent line */}
          {i === 0 && <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />}

          <div className="flex items-start justify-between mb-3">
            <span className="text-[10px] font-medium text-white/35 uppercase tracking-[0.1em]">{stat.label}</span>
            <div className="h-7 w-7 rounded-lg bg-white/[0.04] flex items-center justify-center">
              <stat.icon className="h-3.5 w-3.5 text-white/30" />
            </div>
          </div>

          <div className="flex items-baseline gap-0.5">
            <span className="text-xl font-bold font-mono text-white/95">{stat.value}</span>
            <span className="text-sm font-mono text-white/40">{stat.sub}</span>
          </div>

          <div className="flex items-center justify-between mt-2">
            {stat.change ? (
              <div className={`flex items-center gap-1 text-[11px] font-mono font-semibold ${stat.positive ? 'text-chart-3' : 'text-destructive'}`}>
                <ArrowUpRight className="h-3 w-3" />
                {stat.change}
              </div>
            ) : (
              <div />
            )}
            <span className="text-[9px] text-white/20 font-medium">{stat.detail}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}