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
          <span className="font-semibold text-gold">Here's what happened:</span> CPI came in cooler than expected this morning. Bond yields collapsed. The Fed looks less aggressive. Classic result: dollar weakness, commodities rally, tech outperforms, risk-off trades get crushed.
        </p>
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold text-gold">So what?</span> This is a broad risk-ON day. Growth > Value. Tech > Defensive. Duration matters. Your NVDA/AMZN longs benefit. Your energy shorts are up. This momentum usually runs for 2-3 days minimum.
        </p>
      </div>

      <div className="border-t border-white/5 pt-3 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <span className="text-primary font-bold mt-0.5">→</span>
          <p className="text-foreground"><span className="font-semibold">Your edge:</span> Play growth longs today. Avoid chasing defensive plays. Watch for the 10Y to hold above 4.1%—if it bounces back, this reverses.</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-warning font-bold mt-0.5">⚠</span>
          <p className="text-muted-foreground"><span className="font-semibold">The risk:</span> If economic data turns hot again (jobs, spending), we pivot back to rate hikes and this trade dies. Dollar reversal kills commodities fast.</p>
        </div>
      </div>
    </motion.div>
  );
}