import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const RISKS = [
  {
    symbol: 'TSLA',
    level: 'HIGH',
    why: "Growth rally is on. TSLA should rally. It's NOT. Delivery misses + margin concerns = real weakness.",
    action: 'Stay out. Do NOT catch this falling knife.',
    fails: 'If TSLA bounces 4%+ with heavy volume, this thesis breaks. But odds favor more downside.',
  },
  {
    symbol: 'META',
    level: 'MEDIUM',
    why: 'Tech rally is lifting most names. META is lagging. Ad revenue fears + 3 cuts this week. Smart money is exiting.',
    action: 'No edge here. Wait for capitulation or clear support.',
    fails: 'If it holds $500 and bounces with earnings catalyst, could reverse. But not today.',
  },
  {
    symbol: 'XLE',
    level: 'MEDIUM',
    why: 'Oil up 2.8% today. Energy stocks NOT following. This divergence = structural weakness, not a bounce.',
    action: "Don't buy here. This is a trap.",
    fails: 'If oil stays above $90 and energy reverses, could work. But odds favor 5-8% more downside first.',
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
            
            <div className="bg-destructive/10 rounded-lg p-2.5 border border-destructive/20">
              <p className="text-xs text-foreground">
                <span className="font-semibold text-destructive">Do this:</span> {risk.action}
              </p>
            </div>

            <div className="bg-black/30 rounded-lg p-2 border border-white/5">
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Could work if:</span> {risk.fails}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}