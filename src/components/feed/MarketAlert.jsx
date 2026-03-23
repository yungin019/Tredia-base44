import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export default function MarketAlert() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 glass-card border-2 border-gold/30 bg-gold/5 card-shadow space-y-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-foreground">USD weakens on soft inflation data → growth rally</h3>
          <p className="text-sm text-muted-foreground mt-1">
            10Y yields down 8bp, commodities rally (+2.8% oil, +1.4% gold), EM strength building.
          </p>
        </div>
      </div>

      <div className="bg-black/30 rounded-lg p-3 border border-gold/10 space-y-2">
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-gold">What happened:</span> CPI cooler than expected. Bond yields down 8bp. Fed looks less aggressive. Result: dollar weakness, commodities rally, tech outperforms.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-success/10 border border-success/20 rounded-lg p-3">
          <p className="text-xs text-success font-semibold mb-2">Do this</p>
          <p className="text-xs text-foreground leading-tight">Buy growth (NVDA/AMZN). Hold longs. This runs 2-3 days minimum.</p>
        </div>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
          <p className="text-xs text-destructive font-semibold mb-2">Don't do this</p>
          <p className="text-xs text-foreground leading-tight">Chase defensives or energy. This is a growth day, not safe.</p>
        </div>
      </div>

      <div className="border-t border-white/5 pt-3">
        <p className="text-xs text-foreground">
          <span className="font-semibold text-destructive">This breaks if:</span> Economic data turns hot (jobs, spending) or 10Y bounces above 4.3%. Then pivot back to rate hike trades. Watch 10Y closely.
        </p>
      </div>
    </motion.div>
  );
}