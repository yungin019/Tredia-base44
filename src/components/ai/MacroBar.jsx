import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const MACRO = [
  { label: 'FED RATE',    value: '5.25%',    change: null,    note: 'On hold' },
  { label: '10Y YIELD',   value: '4.34%',    change: +0.03,   note: '↑ Rising' },
  { label: 'DXY',         value: '104.8',    change: -0.22,   note: 'USD Index' },
  { label: 'GOLD',        value: '$2,318',   change: +0.48,   note: 'Safe haven' },
  { label: 'OIL (WTI)',   value: '$82.4',    change: -0.31,   note: 'Crude' },
  { label: 'VIX',         value: '14.2',     change: -1.8,    note: 'Fear index' },
  { label: 'BTC',         value: '$68.4K',   change: +3.44,   note: 'Crypto' },
  { label: 'EUR/USD',     value: '1.0847',   change: -0.09,   note: 'FX' },
];

export default function MacroBar() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/[0.05]">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.12em]">Macro Overview</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-x divide-y divide-white/[0.04]">
        {MACRO.map((m) => {
          const pos = m.change > 0;
          const neg = m.change < 0;
          return (
            <div key={m.label} className="px-3 py-2.5 flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-wider">{m.label}</span>
              <span className="text-[12px] font-black font-mono text-white/90">{m.value}</span>
              <div className="flex items-center gap-1">
                {m.change !== null ? (
                  <>
                    {pos ? <TrendingUp className="h-2.5 w-2.5 text-chart-3" /> : <TrendingDown className="h-2.5 w-2.5 text-destructive" />}
                    <span className={`text-[9px] font-mono font-bold ${pos ? 'text-chart-3' : 'text-destructive'}`}>
                      {pos ? '+' : ''}{m.change}%
                    </span>
                  </>
                ) : (
                  <span className="text-[9px] text-white/25">{m.note}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}