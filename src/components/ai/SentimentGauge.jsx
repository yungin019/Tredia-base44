import React from 'react';

const ZONES = [
  { label: 'EXTREME FEAR', color: '#EF4444', range: [0, 20] },
  { label: 'FEAR', color: '#F97316', range: [20, 40] },
  { label: 'NEUTRAL', color: '#EAB308', range: [40, 60] },
  { label: 'GREED', color: '#84CC16', range: [60, 80] },
  { label: 'EXTREME GREED', color: '#22C55E', range: [80, 100] },
];

export default function SentimentGauge({ value = 62, label = 'Market Sentiment' }) {
  const angle = -90 + (value / 100) * 180;
  const zone = ZONES.find(z => value >= z.range[0] && value < z.range[1]) || ZONES[4];

  const polarToCartesian = (cx, cy, r, deg) => {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const arcPath = (cx, cy, r, startDeg, endDeg) => {
    const s = polarToCartesian(cx, cy, r, startDeg);
    const e = polarToCartesian(cx, cy, r, endDeg);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const cx = 60, cy = 60, r = 44;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 120 70" className="w-full max-w-[160px]">
        {/* Background arc */}
        <path d={arcPath(cx, cy, r, -90, 90)} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" strokeLinecap="round" />
        {/* Colored zones */}
        {ZONES.map((z, i) => (
          <path
            key={i}
            d={arcPath(cx, cy, r, -90 + z.range[0] * 1.8, -90 + z.range[1] * 1.8)}
            fill="none"
            stroke={z.color}
            strokeWidth="10"
            strokeLinecap="butt"
            opacity="0.25"
          />
        ))}
        {/* Active fill */}
        <path
          d={arcPath(cx, cy, r, -90, -90 + value * 1.8)}
          fill="none"
          stroke={zone.color}
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.9"
        />
        {/* Needle */}
        <line
          x1={cx} y1={cy}
          x2={cx + 36 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={cy + 36 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle cx={cx} cy={cy} r="3" fill="white" opacity="0.9" />
        {/* Value */}
        <text x={cx} y={cy + 14} textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="monospace">{value}</text>
      </svg>
      <span className="text-[9px] font-bold tracking-widest mt-0.5" style={{ color: zone.color }}>{zone.label}</span>
      <span className="text-[9px] text-white/30 mt-0.5">{label}</span>
    </div>
  );
}