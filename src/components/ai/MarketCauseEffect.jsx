import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, DollarSign, ArrowRight, Zap } from 'lucide-react';

const NODES = [
  { label: 'Fed Hawkish', icon: TrendingDown, color: 'text-destructive' },
  { label: 'Bond Selloff', icon: TrendingDown, color: 'text-orange-500' },
  { label: 'Gold Rise', icon: DollarSign, color: 'text-[#F59E0B]' },
];

export default function MarketCauseEffect() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <h2 className="text-sm font-bold mb-4">⚡ Market Cause & Effect</h2>
      <div className="flex items-center justify-between">
        {NODES.map((node, i) => (
          <div key={node.label} className="flex items-center gap-2">
            <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-3 flex flex-col items-center gap-2">
              <node.icon className={`h-4 w-4 ${node.color}`} />
              <div className="text-[10px] font-bold text-center text-white/70">{node.label}</div>
            </div>
            {i < NODES.length - 1 && (
              <div className="flex flex-col items-center gap-1 px-2">
                <ArrowRight className={`h-3 w-3 ${i === 0 ? 'text-destructive' : 'text-[#F59E0B]'}`} />
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}