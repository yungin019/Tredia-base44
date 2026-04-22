import React from 'react';

const REGIONS = [
  { id: 'Global', label: 'Global' },
  { id: 'US',     label: 'US' },
  { id: 'EU',     label: 'Europe' },
  { id: 'APAC',   label: 'Asia' },
  { id: 'Africa', label: 'Africa' },
  { id: 'LatAm',  label: 'LatAm' },
];

// Exported for use in feed header badge
export const REGION_LABELS = {
  Global: 'Global', US: 'US', EU: 'Europe', APAC: 'Asia', Africa: 'Africa', LatAm: 'LatAm',
};

export default function RegionSwitcher({ activeRegion, onChange }) {
  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-2 px-1"
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
            className="flex items-center px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all"
            style={isActive ? {
              background: 'rgba(14,200,220,0.15)',
              border: '1px solid rgba(14,200,220,0.35)',
              color: 'rgb(120,230,245)',
              boxShadow: '0 0 12px rgba(14,200,220,0.2)',
            } : {
              background: 'transparent',
              border: '1px solid transparent',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            {r.label}

          </button>
        );
      })}
    </div>
  );
}