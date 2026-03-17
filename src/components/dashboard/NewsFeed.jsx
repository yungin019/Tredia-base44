import React, { useState, useEffect } from 'react';
import { fetchMarketNews } from '../../api/newsData';

const SENTIMENT_MARKET_IMPACT = {
  BULLISH: 'Markets may react positively — risk-on assets could see upward pressure.',
  BEARISH: 'Markets may face selling pressure — defensive assets could outperform.',
  NEUTRAL: 'Limited directional impact expected — watch for follow-through volume.',
};

function formatDate(seendate) {
  if (!seendate) return '';
  // Format: 20240317T120000Z
  try {
    const s = String(seendate);
    const year = s.slice(0, 4);
    const month = s.slice(4, 6);
    const day = s.slice(6, 8);
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

const SENTIMENT_STYLES = {
  BULLISH: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/20' },
  BEARISH: { bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/20' },
  NEUTRAL: { bg: 'bg-white/[0.06]', text: 'text-white/40', border: 'border-white/10' },
};

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchMarketNews();
        setArticles(data);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.12em]">Live Market News</h2>
        <span className="text-[9px] font-mono text-white/20 uppercase tracking-wider">GDELT · auto-refresh 60s</span>
      </div>

      {loading && articles.length === 0 ? (
        <div className="flex items-center gap-2 text-white/25 text-xs py-6">
          <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
          Loading news…
        </div>
      ) : articles.length === 0 ? (
        <p className="text-xs text-white/25 py-4">No articles available.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {articles.map((a, i) => {
            const s = SENTIMENT_STYLES[a.sentiment];
            return (
              <a
                key={i}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-white/[0.05] bg-[#111118] p-4 flex flex-col gap-2 hover:border-white/[0.12] transition-colors"
              >
                {/* Sentiment badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${s.bg} ${s.text} ${s.border}`}>
                    {a.sentiment}
                  </span>
                  {a.tickers.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {a.tickers.slice(0, 4).map(t => (
                        <span key={t} className="text-[8px] font-black px-1.5 py-0.5 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#F59E0B] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Title */}
                <p className="text-sm font-bold text-white/90 leading-snug line-clamp-2">{a.title}</p>

                {/* Market impact */}
                <p className="text-[10px] text-white/35 leading-relaxed">
                  <span className="text-white/20 font-semibold">How this affects markets: </span>
                  {SENTIMENT_MARKET_IMPACT[a.sentiment]}
                </p>

                {/* Source + date */}
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <span className="text-[10px] text-gray-400 font-medium truncate">{a.domain}</span>
                  {a.seendate && (
                    <>
                      <span className="text-white/10">·</span>
                      <span className="text-[10px] text-gray-400 font-mono">{formatDate(a.seendate)}</span>
                    </>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}