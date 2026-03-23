import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const RISKS = [
  {
    symbol: 'TSLA',
    level: 'HIGH',
    why: 'In a growth rally, TSLA usually participates. NOT today—suggests weakness ahead. Delivery misses piling up. If this trend breaks, downside is fast (8-10% gap down possible).',
    action: 'Avoid. Do NOT catch this falling knife.',
  },
  {
    symbol: 'META',
    level: 'MEDIUM',
    why: 'Ad revenue concerns + 3 analyst cuts this week. Tech rally usually lifts META, but it is lagging. Means smart money sees a problem here.',
    action: 'Watch for capitulation. Only buy if it breaks below $485 with heavy volume.',
  },
  {
    symbol: 'XLE',
    level: 'MEDIUM',
    why: 'Oil rallying (+2.8%) but energy stocks NOT following. This divergence warns that energy weakness is structural, not just a bounce. Catch the falling knife risk.',
    action: 'Short here if you\'re brave. Long entries safer after a 5-8% pullback.',
  },
];

export default function WatchOut() {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-1">Watch Out (Real Risks)</h2>
      <p className="text-xs text-muted-foreground mb-4">Trades that look good but have hidden problems. What to avoid OR when to enter.</p>
      <div className="space-y-3">
        {RISKS.map((risk, i) => (
          <motion.div
            key={risk.symbol}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-lg p-4 glass-card border-l-4 border-destructive bg-destructive/5 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
                <span className="font-mono font-bold text-lg text-foreground">{risk.symbol}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                  risk.level === 'HIGH' 
                    ? 'bg-destructive/15 text-destructive' 
                    : 'bg-warning/15 text-warning'
                }`}>
                  {risk.level}
                </span>
              </div>
            </div>

            <p className="text-sm text-foreground leading-relaxed">{risk.why}</p>
            
            <div className="bg-black/30 rounded-lg p-2 border border-white/5">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">What to do:</span> {risk.action}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}