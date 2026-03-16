import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, BarChart3, DollarSign } from 'lucide-react';

const stats = [
  { label: 'Total Value', value: '$284,529.40', change: '+12.4%', positive: true, icon: Wallet },
  { label: "Today's P&L", value: '+$3,847.20', change: '+1.37%', positive: true, icon: TrendingUp },
  { label: 'Total Return', value: '+$42,180.00', change: '+17.4%', positive: true, icon: BarChart3 },
  { label: 'Cash Balance', value: '$18,420.60', change: null, positive: true, icon: DollarSign },
];

export default function PortfolioSummary() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="rounded-xl border border-border/50 bg-card p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{stat.label}</span>
            <stat.icon className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <div className="text-lg font-bold font-mono">{stat.value}</div>
          {stat.change && (
            <div className={`flex items-center gap-1 text-xs font-mono mt-1 ${stat.positive ? 'text-primary' : 'text-destructive'}`}>
              {stat.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {stat.change}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}