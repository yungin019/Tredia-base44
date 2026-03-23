import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronRight } from 'lucide-react';

export default function MarketAlert() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 glass-card border-2 border-gold/30 bg-gold/5 card-shadow"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">Oil slides on geopolitical tensions easing</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Crude down 3.2% after diplomacy signals. Energy sector pullback likely continues.
          </p>
          <div className="bg-black/30 rounded-lg p-3 mb-3 border border-gold/10">
            <p className="text-xs text-foreground leading-relaxed">
              <span className="font-semibold">TREK says:</span> Energy weakness + dollar strength = headwind for commodities. Sector likely finds support ~$3 lower. Watch for buyers at support or pivot to financials.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold">Watch:</span> Energy ETF (XLE) support levels, dollar strength, Fed guidance
          </p>
        </div>
      </div>
    </motion.div>
  );
}