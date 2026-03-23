import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function MarketPulse({ sentiment = 50 }) {
  const getSentimentLabel = (value) => {
    if (value >= 70) return 'Greed';
    if (value >= 50) return 'Neutral';
    if (value >= 30) return 'Fear';
    return 'Extreme Fear';
  };

  const getSentimentColor = (value) => {
    if (value >= 70) return 'text-gold';
    if (value >= 50) return 'text-primary';
    if (value >= 30) return 'text-warning';
    return 'text-destructive';
  };

  const label = getSentimentLabel(sentiment);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 glass-card border border-white/5 space-y-4"
    >
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-foreground">Market Regime</h3>
          <span className={`text-sm font-bold ${getSentimentColor(sentiment)}`}>{label}</span>
        </div>
        <div className="w-full bg-muted/20 rounded-full h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sentiment}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-primary to-gold rounded-full"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Market confidence: {sentiment}%</p>
      </div>

      <div className="bg-black/30 rounded-lg p-3 border border-white/5 space-y-3">
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-primary">Today's regime:</span> {label === 'Greed' ? 'Risk ON. Growth wins. Momentum works. Duration trades work.' : label === 'Fear' ? 'Risk OFF. Defensive wins. Quality only. Avoid beta.' : 'Balanced. Both long and short work. Pick your edge.'}
        </p>
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-primary">What this means:</span> {label === 'Greed' ? 'Trade bigger. Own growth. Sell defensives into rallies. Watch for yield reversal.' : label === 'Fear' ? 'Trade smaller. Sell bounces. Buy dips on quality only. Vol stays elevated.' : 'Use technicals. Support/resistance matter. No size assumptions.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success/10 border border-success/20 rounded-lg p-3">
          <p className="text-xs text-success font-semibold mb-2 flex items-center gap-1">
            <TrendingUp className="h-4 w-4" /> Strength
          </p>
          <p className="text-xs text-foreground leading-tight">Growth tech, emerging markets, yield-sensitive names</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-xs text-destructive font-semibold mb-2 flex items-center gap-1">
            <TrendingDown className="h-4 w-4" /> Weakness
          </p>
          <p className="text-xs text-foreground leading-tight">Utilities, bonds, defensive, energy plays</p>
        </div>
      </div>

      <div className="border-t border-white/5 pt-3">
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Drivers:</span> Fed pivot signals, inflation expectations, earnings season momentum
        </p>
      </div>
    </motion.div>
  );
}