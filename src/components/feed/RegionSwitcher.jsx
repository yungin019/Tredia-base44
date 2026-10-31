import React from 'react';

// Only regions with real signal coverage are offered. Regional signal engines
// for Europe/Asia/Africa/LatAm are not live yet, so those tabs stay hidden
// rather than showing US signals under a European label.
const REGIONS = [
  { id: 'Global', label: 'Global' },
  { id: 'US',     label: 'US' },
];

// The only regions this feed can show. Labels are derived from this list, so a
// header badge can never name a region the filter does not offer.
export const REGION_IDS = REGIONS.map(r => r.id);
export const DEFAULT_REGION = 'Global';
export const REGION_LABELS = Object.fromEntries(REGIONS.map(r => [r.id, r.label]));

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