import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchCoreAssets } from '@/api/marketDataClient';

export default function TickerTape() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const assets = await fetchCoreAssets();
        if (cancelled) return;
        // Real quotes only — anything without a live price is dropped, never faked.
        setItems(assets.filter(a => typeof a.price === 'number' && typeof a.changePct === 'number'));
      } catch (_) {
        if (!cancelled) setItems([]);
      }
    };

    load();
    const iv = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  // No live data → show nothing rather than invented prices.
  if (items.length === 0) return null;

  const loop = [...items, ...items];

  return (
    <div className="w-full bg-gradient-to-r from-background via-background to-background overflow-hidden border-b border-white/[0.05] py-3 sticky top-0 z-10">
      <div className="ticker-animate flex gap-8 px-4">
        {loop.map((item, i) => (
          <div key={`${item.symbol}-${i}`} className="flex items-center gap-3 whitespace-nowrap flex-shrink-0">
            <span className="font-mono font-bold text-white/90 text-sm">{item.symbol}</span>
            <span className="font-mono text-white/60 text-xs">${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <div className={`flex items-center gap-1 text-xs font-semibold ${item.changePct >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
              {item.changePct >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(item.changePct).toFixed(2)}%</span>
            </div>
            <span className="text-white/30 text-xs">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}