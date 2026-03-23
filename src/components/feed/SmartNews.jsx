import React from 'react';
import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';

const NEWS_ITEMS = [
  {
    headline: 'Fed signals "higher for longer" on inflation concerns',
    whatHappened: 'Hawkish language in latest policy statement',
    trekTake: 'Headwind for growth stocks, tailwind for financials. Yields up = bond bounces delayed.',
  },
  {
    headline: 'Nvidia beats Q1 guidance, raises full-year outlook',
    whatHappened: 'AI demand stronger than expected across all segments',
    trekTake: 'Bullish for entire chip ecosystem. Watch for TSMC guidance next week.',
  },
  {
    headline: 'Oil drops on diplomatic progress in Middle East',
    whatHappened: 'Geopolitical risk premium fades',
    trekTake: 'Energy sector headwind. Rotation out of defensive. Inflation pressure easing.',
  },
];

export default function SmartNews() {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
        <Newspaper className="h-5 w-5" /> Smart News
      </h2>
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
              <span className="font-semibold">What:</span> {item.whatHappened}
            </p>
            <div className="bg-black/30 rounded-lg p-2 border border-white/5">
              <p className="text-xs text-primary leading-relaxed">
                <span className="font-semibold">TREK:</span> {item.trekTake}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}