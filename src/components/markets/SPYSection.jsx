import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function SPYSection() {
  const [spy, setSpy] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await base44.functions.invoke('spyQuote', {});
        setSpy(res?.data?.spy || null);
      } catch {
        setSpy(null);
      } finally {
        setLoaded(true);
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!loaded) return null;
  if (!spy) return null;

  const isUp = spy.changePct > 0.05;
  const isDown = spy.changePct < -0.05;
  const accentColor = isUp ? '#22c55e' : isDown ? '#ef4444' : '#94a3b8';
  const bgColor = isUp ? 'rgba(34,197,94,0.08)' : isDown ? 'rgba(239,68,68,0.08)' : 'rgba(148,163,184,0.06)';
  const borderColor = isUp ? 'rgba(34,197,94,0.2)' : isDown ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.15)';
  const TrendIcon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl px-5 py-4"
      style={{ background: bgColor, border: `1px solid ${borderColor}`, backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: accentColor }}>
            S&amp;P 500 · SPY
          </span>
        </div>
        <span className="text-[9px] text-white/25 font-mono">
          {new Date(spy.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="font-mono font-black text-2xl text-white/95 tracking-tight leading-none">
            ${spy.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1.5">
            <TrendIcon className="h-3.5 w-3.5" style={{ color: accentColor }} />
            <span className="text-sm font-bold" style={{ color: accentColor }}>
              {spy.changePct >= 0 ? '+' : ''}{spy.changePct.toFixed(2)}%
            </span>
            <span className="text-xs text-white/35 font-mono">
              ({spy.change >= 0 ? '+' : ''}{spy.change.toFixed(2)})
            </span>
          </div>
        </div>

        {(spy.high || spy.low) && (
          <div className="text-right space-y-1">
            {spy.high && (
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[9px] text-white/25 uppercase font-bold">H</span>
                <span className="text-xs font-mono text-white/60">${spy.high.toFixed(2)}</span>
              </div>
            )}
            {spy.low && (
              <div className="flex items-center justify-end gap-1.5">
                <span className="text-[9px] text-white/25 uppercase font-bold">L</span>
                <span className="text-xs font-mono text-white/60">${spy.low.toFixed(2)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <p className="text-[11px] text-white/45 leading-snug">
          {isUp
            ? `SPY holding above ${(spy.low || spy.price * 0.995).toFixed(0)} — buying pressure intact. Watch ${(spy.price * 1.005).toFixed(0)} as intraday resistance.`
            : isDown
            ? `SPY breaking below ${(spy.high || spy.price * 1.005).toFixed(0)} — sellers in control. ${(spy.low || spy.price * 0.995).toFixed(0)} is next support to watch.`
            : `SPY flat near ${spy.price.toFixed(0)} — range-bound. Break of ${(spy.price * 1.003).toFixed(0)} or ${(spy.price * 0.997).toFixed(0)} sets next direction.`
          }
        </p>
      </div>
    </motion.div>
  );
}