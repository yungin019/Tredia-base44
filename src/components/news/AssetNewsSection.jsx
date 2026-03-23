import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X, Newspaper } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SENTIMENT_STYLE = {
  BULLISH: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
  BEARISH: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  NEUTRAL: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
};

const REGION_FLAGS = { US: '🇺🇸', Europe: '🇪🇺', Asia: '🌏', Global: '🌐', Crypto: '₿' };

export default function AssetNewsSection({ symbol }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setArticles([]);
    base44.functions.invoke('getMarketNews', { symbol, limit: 8 })
      .then(res => setArticles(res?.data?.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, [symbol]);

  if (loading) {
    return (
      <div className="rounded-xl p-4" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="h-3.5 w-3.5 text-white/30" />
          <span className="text-[11px] font-black text-white/40 uppercase tracking-wider">Related News</span>
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-xl shimmer" />)}
        </div>
      </div>
    );
  }

  if (articles.length === 0) return null;

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="rounded-xl p-4" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Newspaper className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-black text-white/60 uppercase tracking-wider">Related News</span>
          <span className="ml-auto text-[9px] text-white/20 font-mono">{articles.length} stories</span>
        </div>

        <div className="space-y-2">
          {articles.map((a, i) => {
            const s = SENTIMENT_STYLE[a.sentiment] || SENTIMENT_STYLE.NEUTRAL;
            return (
              <motion.button
                key={a.id || i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(a)}
                className="w-full text-left rounded-xl p-3 transition-all hover:bg-white/[0.03] active:scale-[0.99]"
                style={{ border: `1px solid rgba(255,255,255,0.04)` }}
              >
                <div className="flex items-start gap-3">
                  {/* Sentiment stripe */}
                  <div className="flex-shrink-0 w-1 self-stretch rounded-full mt-0.5" style={{ background: s.color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold text-white/85 leading-snug line-clamp-2 mb-1.5">{a.title}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ color: s.color, background: s.bg }}>
                        {a.sentiment}
                      </span>
                      <span className="text-[9px] text-white/25">
                        {REGION_FLAGS[a.region] || ''} {a.region}
                      </span>
                      <span className="text-[9px] text-white/20 font-mono ml-auto">{a.age}</span>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.12, duration: 0.4 }}
              className="w-full max-w-lg rounded-3xl p-6 space-y-4 border border-white/[0.08]"
              style={{ background: '#111118', maxHeight: '80vh', overflowY: 'auto' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-[15px] font-bold text-white/92 leading-snug flex-1">{selected.title}</h3>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-white/[0.06] flex-shrink-0">
                  <X className="h-4 w-4 text-white/40" />
                </button>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {(() => {
                  const s = SENTIMENT_STYLE[selected.sentiment] || SENTIMENT_STYLE.NEUTRAL;
                  return (
                    <span className="text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                      {selected.sentiment}
                    </span>
                  );
                })()}
                <span className="text-[10px] px-2 py-1 rounded-full bg-white/[0.05] text-white/40">
                  {REGION_FLAGS[selected.region] || '🌐'} {selected.region}
                </span>
                <span className="text-[10px] text-white/25 font-mono ml-auto">{selected.age}</span>
              </div>

              {selected.summary && (
                <p className="text-[13px] text-white/55 leading-relaxed">{selected.summary}</p>
              )}

              <a href={selected.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-black"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                Read Full Article <ExternalLink className="h-3.5 w-3.5" />
              </a>

              {selected.source && (
                <p className="text-[10px] text-white/20 text-center">Source: {selected.source}</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}