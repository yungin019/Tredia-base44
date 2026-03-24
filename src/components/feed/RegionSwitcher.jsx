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

// Exported for use in feed header badge
export const REGION_LABELS = {
  Global: 'Global', US: 'US', EU: 'Europe', APAC: 'Asia', Africa: 'Africa', LatAm: 'LatAm',
};

export default function RegionSwitcher({ activeRegion, onChange }) {
  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1 px-1"
      style={{
        background: 'rgba(6,14,32,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(100,220,255,0.08)',
        borderRadius: '999px',
        boxShadow: 'inset 0 1px 0 rgba(100,220,255,0.05), 0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      {REGIONS.map((r) => {
        const isActive = activeRegion === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all min-h-0 min-w-0"
            style={isActive ? {
              background: 'rgba(14,200,220,0.15)',
              border: '1px solid rgba(14,200,220,0.35)',
              color: 'rgb(120,230,245)',
              boxShadow: '0 0 12px rgba(14,200,220,0.2), inset 0 1px 0 rgba(14,200,220,0.15)',
            } : {
              background: 'transparent',
              border: '1px solid transparent',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            <span className="text-sm leading-none">{r.flag}</span>
            <span>{r.label}</span>
            {isActive && (
              <motion.span
                layoutId="region-active-dot"
                className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full"
                style={{ background: 'rgb(14,200,220)', boxShadow: '0 0 6px rgba(14,200,220,0.8)' }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}