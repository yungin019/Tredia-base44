import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity } from 'lucide-react';

const INTEL_ITEMS = [
  { id: 1, text: 'TSLA insider sold $2.3M shares', tag: 'INSIDER', ticker: 'TSLA', type: 'bearish' },
  { id: 2, text: 'NVDA unusual call options — 340% above avg volume', tag: 'OPTIONS', ticker: 'NVDA', type: 'bullish' },
  { id: 3, text: 'China PMI beats estimates at 51.2 vs 49.8 expected', tag: 'MACRO', ticker: 'EEM', type: 'bullish' },
  { id: 4, text: 'Fed speaker Waller turns hawkish — rate cuts pushed to Q4', tag: 'FED', ticker: 'TLT', type: 'bearish' },
  { id: 5, text: 'Whale moved 1,200 BTC to exchange wallets — sell pressure', tag: 'CRYPTO', ticker: 'BTC', type: 'bearish' },
  { id: 6, text: 'JPM upgrades semiconductor sector to Overweight', tag: 'ANALYST', ticker: 'SOXX', type: 'bullish' },
  { id: 7, text: 'AAPL App Store revenue up 18% QoQ per App Annie data', tag: 'DATA', ticker: 'AAPL', type: 'bullish' },
  { id: 8, text: 'Treasury 10Y yield spikes to 4.48% — tech sector pressure', tag: 'RATES', ticker: 'QQQ', type: 'bearish' },
];

const tagColors = {
  bullish: 'text-[#22C55E]',
  bearish: 'text-[#EF4444]',
};

export default function LiveIntelligenceRibbon() {
  const [activeDetail, setActiveDetail] = useState(null);
  const [fngData, setFngData] = useState(null);

  useEffect(() => {
    const fetchFng = async () => {
      try {
        const res = await fetch('https://api.alternative.me/fng/?limit=1');
        const data = await res.json();
        if (data.data && data.data[0]) {
          setFngData({
            value: parseInt(data.data[0].value),
            label: data.data[0].value_classification,
          });
        }
      } catch (e) {
        // fallback
        setFngData({ value: 55, label: 'Neutral' });
      }
    };
    fetchFng();
    const iv = setInterval(fetchFng, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(iv);
  }, []);

  const repeated = [...INTEL_ITEMS, ...INTEL_ITEMS, ...INTEL_ITEMS];

  return (
    <>
      {/* Fear & Greed Header */}
      {fngData && (
        <div style={{
          background: fngData.value > 75 ? 'linear-gradient(135deg, #13120a, #0e0e14)' : 'linear-gradient(135deg, #111118, #1a1a2e)',
          border: fngData.value > 75 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(245,158,11,0.3)',
          borderLeft: fngData.value > 75 ? '3px solid #EF4444' : '3px solid #F59E0B',
          borderRadius: 16,
          padding: '10px 14px',
          marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: '0.1em' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: fngData.value > 75 ? '#EF4444' : '#F59E0B', animation: 'livePulse 2s ease-in-out infinite' }} />
            <span style={{ color: fngData.value > 75 ? '#EF4444' : '#F59E0B' }}>Fear & Greed: {fngData.value} — {fngData.label.toUpperCase()}</span>
          </div>
        </div>
      )}

      <div className="relative overflow-hidden bg-[#0e0e16] border border-white/[0.07] rounded-xl h-8 flex items-center">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0e0e16] to-transparent z-10 flex items-center justify-center">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0e0e16] to-transparent z-10" />

        <div className="flex items-center gap-0 ticker-animate whitespace-nowrap pl-10">
          {repeated.map((item, i) => (
            <button
              key={i}
              onClick={() => setActiveDetail(item)}
              className="flex items-center gap-2 px-4 hover:opacity-80 transition-opacity"
            >
              <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded ${
                item.type === 'bullish' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'
              }`}>{item.tag}</span>
              <span className="text-[10px] text-white/50 font-medium">{item.text}</span>
              <span className={`text-[9px] font-mono font-bold ${tagColors[item.type]}`}>${item.ticker}</span>
              <span className="text-white/10 mx-1">·</span>
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeDetail && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full left-0 right-0 mt-1 z-50 mx-4"
          >
            <div className="bg-[#111118] border border-primary/20 rounded-xl p-4 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded mb-2 inline-block ${
                    activeDetail.type === 'bullish' ? 'bg-[#22C55E]/10 text-[#22C55E]' : 'bg-[#EF4444]/10 text-[#EF4444]'
                  }`}>{activeDetail.tag}</span>
                  <p className="text-[12px] text-white/80 font-medium mt-1">{activeDetail.text}</p>
                  <p className="text-[10px] text-white/30 mt-1">Tap for full analysis on <span className="text-primary font-mono">${activeDetail.ticker}</span></p>
                </div>
                <button onClick={() => setActiveDetail(null)} className="text-white/30 hover:text-white/60 transition-colors ml-4">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}