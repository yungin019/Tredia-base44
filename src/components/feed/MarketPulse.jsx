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
    if (value >= 70) return 'text-destructive';
    if (value >= 50) return 'text-muted-foreground';
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
          <h3 className="text-sm font-bold text-foreground">Market Sentiment</h3>
          <span className={`text-sm font-bold ${getSentimentColor(sentiment)}`}>{label}</span>
        </div>
        <div className="w-full bg-muted/20 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${sentiment}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-primary to-gold rounded-full"
          />
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-3 border border-white/5">
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold">TREK says:</span> {label === 'Greed' && 'Markets euphoric. Consider taking profits on winners. Watch for consolidation.'}
          {label === 'Neutral' && 'Market in balance. Both long and short opportunities exist. Focus on technicals.'}
          {label === 'Fear' && 'Risk-off mood. Defensive plays outperforming. Quality stocks on sale.'}
          {label === 'Extreme Fear' && 'Panic selling creates opportunity. Look for reversal setups. Support levels key.'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success/10 border border-success/20 rounded-lg p-3">
          <p className="text-xs text-success font-semibold mb-1 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" /> Strong
          </p>
          <p className="text-xs text-foreground">Tech, Financials</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-xs text-destructive font-semibold mb-1 flex items-center gap-1">
            <TrendingDown className="h-3 w-3" /> Weak
          </p>
          <p className="text-xs text-foreground">Energy, Materials</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        <span className="font-semibold">Key drivers:</span> Fed policy signals, earnings season momentum, geopolitical risk
      </p>
    </motion.div>
  );
}