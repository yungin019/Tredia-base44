import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, AlertCircle } from 'lucide-react';
import { fetchMarketNews } from '@/api/newsData';

/**
 * Ticker ribbon of real published headlines. Nothing is rendered when the
 * news feed returns nothing — no invented stories.
 */
export default function LiveIntelligenceRibbon() {
  const [activeDetail, setActiveDetail] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const news = await fetchMarketNews();
        if (cancelled) return;
        setItems((news || []).filter(n => n.title).slice(0, 10).map((n, i) => ({
          id: `${n.url || i}`,
          text: n.title,
          tag: n.domain || 'NEWS',
          ticker: n.tickers?.[0] || null,
          url: n.url,
          type: n.sentiment === 'BEARISH' ? 'bearish' : 'bullish',
          neutral: n.sentiment === 'NEUTRAL',
        })));
      } catch (_) {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const iv = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  if (items.length === 0) {
    if (loading) return null;
    return (
      <div className="flex items-center gap-2 px-4 h-8 rounded-xl border border-white/[0.07] bg-[#0e0e16] text-[10px] text-white/30">
        <AlertCircle className="h-3 w-3" />
        <span>Headlines unavailable right now</span>
      </div>
    );
  }

  const repeated = [...items, ...items, ...items];

  return (
    <>
      <div className="relative overflow-hidden bg-[#0e0e16] border border-white/[0.07] rounded-xl h-8 flex items-center">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0e0e16] to-transparent z-10 flex items-center justify-center">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0e0e16] to-transparent z-10" />

        <div className="flex items-center gap-0 ticker-animate whitespace-nowrap pl-10">
          {repeated.map((item, i) => (
            <button
              key={`${item.id}-${i}`}
              onClick={() => setActiveDetail(item)}
              className="flex items-center gap-2 px-4 hover:opacity-80 transition-opacity"
            >
              <span className="text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded bg-white/[0.06] text-white/40 max-w-[80px] truncate">
                {item.tag}
              </span>
              <span className="text-[10px] text-white/50 font-medium">{item.text}</span>
              {item.ticker && <span className="text-[9px] font-mono font-bold text-primary">${item.ticker}</span>}
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
                  <span className="text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded mb-2 inline-block bg-white/[0.06] text-white/40">
                    {activeDetail.tag}
                  </span>
                  <p className="text-[12px] text-white/80 font-medium mt-1">{activeDetail.text}</p>
                  {activeDetail.url && (
                    <a
                      href={activeDetail.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-primary mt-2 inline-block"
                    >
                      Read the original story →
                    </a>
                  )}
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