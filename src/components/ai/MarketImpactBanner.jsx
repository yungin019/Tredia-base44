import React from 'react';

const IMPACTS = [
  { cause: 'Fed rate decision', effects: ['Bonds ↑', 'Gold ↑', 'Tech ↓', 'USD ↑'] },
  { cause: 'China PMI beat', effects: ['EEM ↑', 'Copper ↑', 'USD ↓'] },
  { cause: 'NVDA earnings beat', effects: ['Semis ↑', 'AI stocks ↑', 'Short squeeze'] },
  { cause: 'Oil supply cut', effects: ['Energy ↑', 'Airlines ↓', 'USD ↑', 'Inflation ↑'] },
];

export default function MarketImpactBanner() {
  const repeated = [...IMPACTS, ...IMPACTS, ...IMPACTS];
  return (
    <div className="relative overflow-hidden bg-primary/5 border border-primary/15 rounded-xl h-7 flex items-center">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0a0f] to-transparent z-10 flex items-center pl-2">
        <span className="text-[8px] font-black text-primary/60 uppercase tracking-widest whitespace-nowrap">IMPACT</span>
      </div>
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0f] to-transparent z-10" />
      <div className="flex items-center ticker-animate whitespace-nowrap pl-14">
        {repeated.map((item, i) => (
          <span key={i} className="flex items-center gap-1.5 px-4">
            <span className="text-[9px] text-white/40">Due to</span>
            <span className="text-[9px] font-bold text-primary">{item.cause}</span>
            <span className="text-white/15 mx-0.5">→</span>
            {item.effects.map((e, j) => (
              <span key={j} className={`text-[9px] font-bold ${e.includes('↑') ? 'text-[#22C55E]' : e.includes('↓') ? 'text-[#EF4444]' : 'text-white/50'}`}>{e}</span>
            ))}
            <span className="text-white/10 ml-4">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}