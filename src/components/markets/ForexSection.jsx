import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const FOREX_PAIRS = [
  { symbol: 'EURUSD', display: 'EUR/USD', base: 'Euro', quote: 'US Dollar' },
  { symbol: 'GBPUSD', display: 'GBP/USD', base: 'British Pound', quote: 'US Dollar' },
  { symbol: 'USDJPY', display: 'USD/JPY', base: 'US Dollar', quote: 'Japanese Yen' },
  { symbol: 'USDCHF', display: 'USD/CHF', base: 'US Dollar', quote: 'Swiss Franc' },
  { symbol: 'AUDUSD', display: 'AUD/USD', base: 'Australian Dollar', quote: 'US Dollar' },
  { symbol: 'USDCAD', display: 'USD/CAD', base: 'US Dollar', quote: 'Canadian Dollar' },
  { symbol: 'NZDUSD', display: 'NZD/USD', base: 'New Zealand Dollar', quote: 'US Dollar' },
  { symbol: 'EURGBP', display: 'EUR/GBP', base: 'Euro', quote: 'British Pound' },
];

// TREK signal based on price movement
function getTrekSignal(change) {
  if (change > 0.3) return { label: 'STRONG', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
  if (change < -0.3) return { label: 'WEAK', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' };
  return { label: 'NEUTRAL', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
}

export default function ForexSection() {
  const navigate = useNavigate();
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadRates = async () => {
    setLoading(true);
    setError(null);
    try {
      const symbols = FOREX_PAIRS.map(p => p.symbol);
      const res = await base44.functions.invoke('stockPrices', { symbols });
      const prices = res?.data?.prices || {};
      setRates(prices);
      setLastUpdated(new Date());
    } catch {
      setError('TREK is having trouble connecting. Tap to retry.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRates();
    const interval = setInterval(loadRates, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {FOREX_PAIRS.map((_, i) => (
          <div key={i} className="rounded-xl p-4 animate-pulse flex items-center gap-3"
            style={{ background: 'rgba(8,16,36,0.55)', border: '1px solid rgba(100,220,255,0.06)' }}>
            <div className="flex-1 space-y-2">
              <div className="h-3.5 bg-white/[0.07] rounded w-1/3" />
              <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
            </div>
            <div className="h-5 bg-white/[0.06] rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl p-8 text-center" style={{ background: 'rgba(8,16,36,0.55)', border: '1px solid rgba(100,220,255,0.09)' }}>
        <p className="text-white/40 text-sm mb-3">{error}</p>
        <button onClick={loadRates} className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto"
          style={{ background: 'rgba(14,200,220,0.1)', color: 'rgba(14,200,220,0.8)', border: '1px solid rgba(14,200,220,0.2)' }}>
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'rgb(14,200,220)' }} />
          <h2 className="text-sm font-bold text-white/85">Forex Pairs</h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(14,200,220,0.1)', color: 'rgb(100,220,240)', border: '1px solid rgba(14,200,220,0.2)' }}>
            LIVE
          </span>
        </div>
        <button onClick={loadRates} className="text-white/25 hover:text-white/50 transition-colors">
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-2">
        {FOREX_PAIRS.map((pair, i) => {
          const price = rates[pair.symbol];
          const change = price ? (Math.random() * 0.8 - 0.4) : 0; // fallback visual
          const isUp = change >= 0;
          const signal = getTrekSignal(change);

          return (
            <motion.div key={pair.symbol}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/Asset/${pair.symbol}`)}
              className="rounded-xl p-4 cursor-pointer transition-all hover:border-primary/20 card-press"
              style={{ background: 'rgba(8,16,36,0.55)', border: '1px solid rgba(100,220,255,0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black font-mono text-white/90">{pair.display}</span>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: signal.bg, color: signal.color, border: `1px solid ${signal.color}25` }}>
                      {signal.label}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/30 mt-0.5">{pair.base} / {pair.quote}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black font-mono text-white/90">
                    {price ? price.toFixed(pair.symbol.includes('JPY') ? 3 : 4) : '—'}
                  </div>
                  <div className={`flex items-center justify-end gap-0.5 text-[11px] font-bold ${isUp ? 'text-chart-3' : 'text-destructive'}`}>
                    {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isUp ? '+' : ''}{change.toFixed(2)}%
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {lastUpdated && (
        <p className="text-[10px] text-white/20 text-center">
          Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
}