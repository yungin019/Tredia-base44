import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

const NEWS_ITEMS = [
  {
    headline: 'CPI comes in soft → 10Y yields drop 8bp',
    context: 'Inflation fear easing. Fed less likely to stay hawkish.',
    trekTake: 'This is WHY we\'re in risk-ON mode. Growth > Value today. Longer duration = better. Short bonds if they bounce.',
  },
  {
    headline: 'Oil up 2.8% on easing geopolitical tensions',
    context: 'Middle East diplomacy improving. Risk premium fading.',
    trekTake: 'Oil rally is a BOUNCE, not a trend. Energy stocks are NOT following (see Watch Out). Means structural weakness. Don\'t chase energy longs here.',
  },
  {
    headline: 'Nvidia guidance strong, AI demand accelerating',
    context: 'Hyperscaler capex remains robust. Blackwell chip orders record.',
    trekTake: 'This is the structural tailwind for NVDA. But cyclical rallies are dangerous—take profits on 4-5% moves. Entry still good at $870-885.',
  },
];

export default function SmartNews() {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-1 flex items-center gap-2">
        <Newspaper className="h-5 w-5" /> Smart News
      </h2>
      <p className="text-xs text-muted-foreground mb-4">Real news + what it means for YOUR trades.</p>
      <div className="space-y-3">
        {NEWS_ITEMS.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl p-4 glass-card border border-white/5 space-y-2"
          >
            <h4 className="text-sm font-bold text-foreground leading-snug">{item.headline}</h4>
            
            <p className="text-xs text-muted-foreground">
              {item.context}
            </p>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5">
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-semibold text-primary">What it means:</span> {item.trekTake}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}