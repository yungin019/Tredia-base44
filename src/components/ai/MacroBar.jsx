import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { fetchCoreAssets } from '@/api/marketDataClient';

// Only markets we actually have provider quotes for. Anything missing is shown
// as unavailable — never a stand-in number.
const MACRO = [
  { symbol: 'SPY', label: 'S&P 500' },
  { symbol: 'QQQ', label: 'NASDAQ' },
  { symbol: 'AAPL', label: 'APPLE' },
  { symbol: 'NVDA', label: 'NVIDIA' },
  { symbol: 'TSLA', label: 'TESLA' },
  { symbol: 'AMZN', label: 'AMAZON' },
  { symbol: 'BTC', label: 'BTC' },
  { symbol: 'ETH', label: 'ETH' },
];

export default function MacroBar() {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const assets = await fetchCoreAssets();
        if (cancelled) return;
        const map = {};
        assets.forEach(a => { map[a.symbol] = a; });
        setQuotes(map);
      } catch (_) {
        if (!cancelled) setQuotes({});
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const iv = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-white/[0.05] flex items-center justify-between">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.12em]">Market Overview</span>
        <span className="text-[9px] text-white/25">Live provider quotes</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 divide-x divide-y divide-white/[0.04]">
        {MACRO.map((m) => {
          const q = quotes[m.symbol];
          const live = q && typeof q.price === 'number' && typeof q.changePct === 'number';
          const pos = live && q.changePct > 0;
          return (
            <div key={m.symbol} className="px-3 py-2.5 flex flex-col gap-0.5">
              <span className="text-[8px] font-bold text-white/30 uppercase tracking-wider">{m.label}</span>
              {live ? (
                <>
                  <span className="text-[12px] font-black font-mono text-white/90">
                    ${q.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center gap-1">
                    {pos ? <TrendingUp className="h-2.5 w-2.5 text-chart-3" /> : <TrendingDown className="h-2.5 w-2.5 text-destructive" />}
                    <span className={`text-[9px] font-mono font-bold ${pos ? 'text-chart-3' : 'text-destructive'}`}>
                      {pos ? '+' : ''}{q.changePct.toFixed(2)}%
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-[12px] font-black font-mono text-white/30">{loading ? '···' : '—'}</span>
                  <div className="flex items-center gap-1">
                    {!loading && <AlertCircle className="h-2.5 w-2.5 text-white/25" />}
                    <span className="text-[9px] text-white/25">{loading ? 'Loading' : 'Unavailable'}</span>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}