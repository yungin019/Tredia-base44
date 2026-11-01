import React from 'react';
import { REGION_IDS } from '@/lib/assetUniverse';

/**
 * Region filter chips for the Markets universe: All · US · Europe · Asia ·
 * Latin America · Africa · Global. Controlled — the parent owns the value.
 */
export default function RegionFilter({ value, onChange }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
      {REGION_IDS.map((region) => {
        const selected = value === region;
        return (
          <button
            key={region}
            onClick={() => onChange(region)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all"
            style={{
              background: selected ? 'rgba(14,200,220,0.15)' : 'rgba(255,255,255,0.04)',
              color: selected ? 'rgb(120,230,245)' : 'rgba(255,255,255,0.35)',
              border: `1px solid ${selected ? 'rgba(14,200,220,0.3)' : 'transparent'}`,
            }}
          >
            {region}
          </button>
        );
      })}
    </div>
  );
}