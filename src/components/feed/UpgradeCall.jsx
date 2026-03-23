import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';

export default function UpgradeCall({ onUpgrade }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 bg-gradient-to-r from-primary/20 to-gold/10 border border-primary/30 card-shadow"
    >
      <div className="flex items-start gap-3">
        <Zap className="h-5 w-5 text-gold flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-1">Get Full Trade Plans + Mentor Guidance</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Stop guessing. TREK Elite gives you complete entry/exit strategies + risk management for every signal.
          </p>
          <button
            onClick={onUpgrade}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-primary-foreground font-semibold text-sm transition-colors"
          >
            View Premium
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}