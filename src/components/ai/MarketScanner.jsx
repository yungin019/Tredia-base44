import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Radar, TrendingUp, TrendingDown, Minus, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchCoreAssets } from '@/api/marketDataClient';

/**
 * Live movers table. Every row is a real provider quote — there is no
 * BUY/SELL score here because we do not compute one for these symbols.
 */
export default function MarketScanner() {
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchCoreAssets();
        if (cancelled) return;
        setAssets(data.filter(a => typeof a.price === 'number' && typeof a.changePct === 'number'));
      } catch (_) {
        if (!cancelled) setAssets([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const iv = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  const moves = useMemo(() => {
    const list = filter === 'UP'
      ? assets.filter(a => a.changePct > 0)
      : filter === 'DOWN'
        ? assets.filter(a => a.changePct < 0)
        : assets;
    return [...list].sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
  }, [assets, filter]);

  const filters = ['ALL', 'UP', 'DOWN'];

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-4 py-3 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">Market Movers</span>
        </div>
        <div className="flex gap-1">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all ${
                filter === f ? 'bg-primary text-primary-foreground' : 'text-white/30 hover:text-white/60'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {moves.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-6 text-[11px] text-white/30">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>{loading ? 'Loading live quotes…' : 'No live quotes available right now'}</span>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.04]">
          {moves.map((item, i) => {
            const pos = item.changePct > 0;
            const neu = item.changePct === 0;
            return (
              <motion.button
                key={item.symbol}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => navigate(`/Asset/${item.symbol}`)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors text-left"
              >
                <div className="w-12 text-left">
                  <span className="text-[11px] font-black font-mono text-white/90">{item.symbol}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-white/35">{item.name}</span>
                </div>
                <div className="flex items-center gap-1 w-16 justify-end">
                  {pos ? <TrendingUp className="h-3 w-3 text-chart-3" /> : neu ? <Minus className="h-3 w-3 text-white/30" /> : <TrendingDown className="h-3 w-3 text-destructive" />}
                  <span className={`text-[11px] font-mono font-bold ${pos ? 'text-chart-3' : neu ? 'text-white/40' : 'text-destructive'}`}>
                    {pos ? '+' : ''}{item.changePct.toFixed(2)}%
                  </span>
                </div>
                <div className="w-20 text-right">
                  <span className="text-[10px] font-mono text-white/50">
                    ${item.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                  </span>
                </div>
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/20 w-14 text-right">
                  {item.provider || '—'}
                </span>
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}