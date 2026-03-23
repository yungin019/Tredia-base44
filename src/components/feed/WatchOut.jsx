import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight } from 'lucide-react';

const RISKS = [
  {
    symbol: 'TSLA',
    level: 'HIGH',
    reason: 'Delivery miss risk + margin compression. Bearish divergence on daily.',
  },
  {
    symbol: 'META',
    level: 'MEDIUM',
    reason: 'Ad revenue uncertainty + 3 downgrades in 72h. Put/call skew elevated.',
  },
  {
    symbol: 'RIVN',
    level: 'HIGH',
    reason: 'Cash burn accelerating. Production ramp below target.',
  },
];

export default function WatchOut() {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
        <span>⚠️</span> Don't Get Caught Here
      </h2>
      <div className="space-y-2">
        {RISKS.map((risk, i) => (
          <motion.button
            key={risk.symbol}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="w-full text-left rounded-lg px-4 py-3 glass-card border-l-4 border-destructive bg-destructive/5 hover:bg-destructive/10 transition-colors group"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-mono font-bold text-foreground">{risk.symbol}</span>
              <span className={`text-xs font-bold ${risk.level === 'HIGH' ? 'text-destructive' : 'text-warning'}`}>
                {risk.level}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{risk.reason}</p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}