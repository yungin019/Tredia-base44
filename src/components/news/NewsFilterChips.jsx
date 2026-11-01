import React from 'react';
import { NEWS_CATEGORIES, NEWS_REGIONS, NEWS_REGION_SHORT } from '@/lib/newsFeed';

/**
 * Category + region filter chips for any news surface. Purely controlled —
 * the parent owns the state and asks the endpoint for that slice.
 */

function ChipRow({ label, options, value, onChange, accent }) {
  const active = accent === 'gold'
    ? { bg: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' }
    : { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' };
  const idle = { bg: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.35)', border: '1px solid transparent' };

  return (
    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
      <span className="flex-shrink-0 text-[9px] font-bold uppercase tracking-wider text-white/20 self-center pr-1">
        {label}
      </span>
      {options.map((option) => {
        const selected = value === option;
        const style = selected ? active : idle;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all"
            style={{ background: style.bg, color: style.color, border: style.border }}
          >
            {NEWS_REGION_SHORT[option] || option}
          </button>
        );
      })}
    </div>
  );
}

export default function NewsFilterChips({ category, onCategory, region, onRegion }) {
  return (
    <div className="space-y-1.5">
      <ChipRow
        label="Category"
        options={['All', ...NEWS_CATEGORIES]}
        value={category}
        onChange={onCategory}
        accent="green"
      />
      <ChipRow
        label="Region"
        options={['All', ...NEWS_REGIONS]}
        value={region}
        onChange={onRegion}
        accent="gold"
      />
    </div>
  );
}