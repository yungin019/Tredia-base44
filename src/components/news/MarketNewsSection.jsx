import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X, RefreshCw } from 'lucide-react';
import { invokeFunction } from '@/api/functionsClient';
import NewsFilterChips from '@/components/news/NewsFilterChips';
import { orderForUser, affectsLine, NEWS_REGION_FLAGS } from '@/lib/newsFeed';
import useMyAssets from '@/hooks/useMyAssets';

const SENTIMENT_STYLE = {
  BULLISH: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  BEARISH: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  NEUTRAL: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
};

const FALLBACK_IMAGES = {
  Crypto: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&q=80',
  Forex: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
  Commodities: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400&q=80',
  Stocks: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
  General: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
};

function NewsDetailModal({ article, onClose }) {
  if (!article) return null;
  const s = SENTIMENT_STYLE[article.sentiment] || SENTIMENT_STYLE.NEUTRAL;
  const img = article.image || FALLBACK_IMAGES[article.assetType] || FALLBACK_IMAGES.General;
  const affects = affectsLine(article);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl"
        style={{ background: '#111118', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-44 overflow-hidden">
          <img src={img} alt="" className="w-full h-full object-cover" onError={e => { e.target.src = FALLBACK_IMAGES.General; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111118] via-transparent to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm">
            <X className="h-4 w-4 text-white/70" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
              {article.sentiment}
            </span>
            <span className="text-xs px-2 py-1 rounded-full bg-white/[0.05] text-white/40 font-mono">
              {NEWS_REGION_FLAGS[article.region] || '🌐'} {article.region}
            </span>
            {article.category && (
              <span className="text-xs px-2 py-1 rounded-full bg-white/[0.05] text-white/35">
                {article.category}
              </span>
            )}
            {article.isYours && (
              <span className="text-[10px] font-black px-2 py-1 rounded-full bg-primary/15 text-primary">
                Your assets
              </span>
            )}
            <span className="text-[10px] text-white/25 font-mono ml-auto">{article.age}</span>
          </div>

          <h3 className="text-lg font-bold text-white/92 leading-snug">{article.title}</h3>
          {article.summary && <p className="text-sm text-white/50 leading-relaxed">{article.summary}</p>}

          {affects && (
            <p className="text-[11px] font-semibold text-white/45">{affects}</p>
          )}
          {article.why && (
            <p className="text-[11px] text-white/35 leading-relaxed">{article.why}</p>
          )}

          {article.tickers?.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {article.tickers.map(t => (
                <span key={t} className="text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <a href={article.url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-black"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}>
              Read Full Article <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          {article.source && (
            <p className="text-[10px] text-white/20 text-center">Source: {article.source}</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function NewsCard({ article, onClick }) {
  const s = SENTIMENT_STYLE[article.sentiment] || SENTIMENT_STYLE.NEUTRAL;
  const img = article.image || FALLBACK_IMAGES[article.assetType] || FALLBACK_IMAGES.General;
  const affects = affectsLine(article);

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="w-full text-left rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/[0.12] transition-all tap-feedback"
      style={{ background: '#0E1119' }}
    >
      <div className="relative h-36 overflow-hidden">
        <img src={img} alt="" className="w-full h-full object-cover opacity-80"
          onError={e => { e.target.src = FALLBACK_IMAGES.General; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E1119] via-[#0E1119]/40 to-transparent" />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md" style={{ color: s.color, background: `${s.bg}`, border: `1px solid ${s.border}` }}>
            {article.sentiment}
          </span>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white/50">
            {NEWS_REGION_FLAGS[article.region] || '🌐'} {article.region}
          </span>
          {article.isYours && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary/25 backdrop-blur-md text-primary">
              Your assets
            </span>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <p className="text-[12px] font-bold text-white/90 leading-snug line-clamp-2">{article.title}</p>
        {affects && <p className="text-[9px] font-semibold text-white/40">{affects}</p>}
        {article.why && <p className="text-[9px] text-white/30 leading-snug line-clamp-2">{article.why}</p>}
        <div className="flex items-center justify-between">
          <span className="text-[9px] text-white/25 font-mono">{article.source}</span>
          <span className="text-[9px] text-white/25 font-mono">{article.age}</span>
        </div>
        {article.tickers?.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            {article.tickers.slice(0, 3).map(t => (
              <span key={t} className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.button>
  );
}

/**
 * Market Intelligence — the Markets screen's news feed. 20 relevant articles,
 * newest first, scored and tagged once by the shared backend cache. Category and
 * region chips filter that same cache, so filtering costs no extra provider call.
 */
export default function MarketNewsSection() {
  const [category, setCategory] = useState('All');
  const [region, setRegion] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const mySymbols = useMyAssets();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invokeFunction('getMarketNews', { category, region, limit: 20 });
      setArticles(res?.articles || []);
    } catch {
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [category, region]);

  useEffect(() => { load(); }, [load]);

  const ordered = orderForUser(articles, mySymbols);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-base font-bold text-white/90 tracking-tight">📰 Market Intelligence</h2>
          <p className="text-[10px] text-white/30">Scored · Deduplicated · Worldwide</p>
        </div>
        <button onClick={load} disabled={loading} className="p-1.5 rounded-lg hover:bg-white/[0.05] transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 text-white/30 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="mb-4">
        <NewsFilterChips
          category={category}
          onCategory={setCategory}
          region={region}
          onRegion={setRegion}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-52 rounded-2xl shimmer" />
          ))}
        </div>
      ) : ordered.length === 0 ? (
        <div className="text-center py-10 text-white/25 text-sm">No market-relevant news for this filter</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ordered.map((a, i) => (
            <NewsCard key={a.id || i} article={a} onClick={() => setSelected(a)} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && <NewsDetailModal article={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}