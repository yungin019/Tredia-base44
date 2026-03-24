import React from 'react';
import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';

const REGIONS = [
  { id: 'Global', label: 'Global', flag: '🌍' },
  { id: 'US',     label: 'US',     flag: '🇺🇸' },
  { id: 'EU',     label: 'Europe', flag: '🇪🇺' },
  { id: 'APAC',   label: 'Asia',   flag: '🌏' },
  { id: 'Africa', label: 'Africa', flag: '🌍' },
  { id: 'LatAm',  label: 'LatAm',  flag: '🌎' },
];

export default function RegionSwitcher({ activeRegion, onChange }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
      {REGIONS.map((r) => {
        const isActive = activeRegion === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all min-h-0 min-w-0 ${
              isActive
                ? 'bg-primary/15 text-primary border border-primary/30'
                : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:text-white/70 hover:bg-white/[0.07]'
            }`}
          >
            <span className="text-sm leading-none">{r.flag}</span>
            <span>{r.label}</span>
            {isActive && (
              <motion.span
                layoutId="region-active-dot"
                className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}