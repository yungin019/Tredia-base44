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
      className="flex items-center overflow-x-auto scrollbar-hide"
      style={{
        background: 'rgba(6,14,32,0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(100,220,255,0.08)',
        borderRadius: '999px',
        boxShadow: 'inset 0 1px 0 rgba(100,220,255,0.05), 0 4px 16px rgba(0,0,0,0.3)',
        padding: '4px',
        gap: '2px',
      }}
    >
      {REGIONS.map((r) => {
        const isActive = activeRegion === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 12px',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 700,
              whiteSpace: 'nowrap',
              border: 'none',
              outline: 'none',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.2s ease',
              background: isActive ? 'rgba(14,200,220,0.18)' : 'transparent',
              boxShadow: isActive ? '0 0 0 1px rgba(14,200,220,0.4), 0 0 12px rgba(14,200,220,0.15)' : 'none',
              color: isActive ? 'rgb(120,230,245)' : 'rgba(255,255,255,0.4)',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                flexShrink: 0,
                background: isActive ? 'rgb(14,200,220)' : 'rgba(255,255,255,0.25)',
                boxShadow: isActive ? '0 0 6px rgba(14,200,220,0.9)' : 'none',
              }}
            />
            {r.label}
          </button>
        );
      })}
    </div>
  );
}