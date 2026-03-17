import React from 'react';

const SCENARIOS = [
  { label: '2008 Financial Crisis', pct: '-42%' },
  { label: '2020 COVID Crash', pct: '-28%' },
  { label: '2022 Rate Hike Cycle', pct: '-19%' },
];

export default function StressTestCard() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30 mb-4">
        Stress Test: What if 2008 happened?
      </div>
      <div className="space-y-3">
        {SCENARIOS.map(({ label, pct }) => (
          <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
            <span className="text-sm text-white/60">{label}</span>
            <span className="text-sm font-black font-mono text-red-400">{pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}