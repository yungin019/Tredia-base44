import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, AlertCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const SENTIMENT = {
  BULLISH: { text: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', label: 'Bullish tone' },
  BEARISH: { text: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', label: 'Bearish tone' },
  NEUTRAL: { text: 'text-white/40', bg: 'bg-white/5', label: 'Neutral tone' },
};

function relativeTime(date) {
  if (!date) return null;
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/**
 * Market News — real published headlines only. Every card carries the
 * original article link and its own publish time; nothing is hardcoded.
 */
export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await base44.functions.invoke('getMarketNews', {});
        if (cancelled) return;
        const raw = res?.data?.articles || [];
        setArticles(raw
          .filter(n => n.title && n.url)
          .map((n, i) => ({
            ...n,
            id: n.url || i,
            publishedAt: n.publishedAt ? new Date(n.publishedAt) : null,
          }))
          .slice(0, 8));
      } catch (_) {
        if (!cancelled) setArticles([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const iv = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(iv); };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-primary" />
        <h2 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.12em]">Market News</h2>
        {articles.length > 0 && (
          <span className="text-[9px] font-mono text-white/20">{articles.length} articles</span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-16 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/[0.07] bg-[#111118] text-[11px] text-white/35">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Headlines unavailable right now</span>
        </div>
      ) : (
        <div className="space-y-2">
          {articles.map(article => {
            const tone = SENTIMENT[article.sentiment] || SENTIMENT.NEUTRAL;
            const time = relativeTime(article.publishedAt);
            return (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-[#111118] border border-white/[0.07] rounded-xl p-3 hover:border-white/[0.14] transition-colors"
              >
                <p className="text-[12px] font-bold text-white/85 leading-snug mb-1.5">{article.title}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[8px] font-bold text-primary uppercase">{article.source || 'News'}</span>
                  {time && (
                    <>
                      <span className="text-white/15">·</span>
                      <span className="text-[8px] text-white/30">{time}</span>
                    </>
                  )}
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${tone.bg} ${tone.text}`}>{tone.label}</span>
                  {(article.tickers || []).slice(0, 3).map(t => (
                    <span key={t} className="text-[8px] font-mono font-black px-1.5 py-0.5 rounded bg-white/[0.06] text-white/45">${t}</span>
                  ))}
                  <ExternalLink className="h-2.5 w-2.5 text-white/20 ml-auto flex-shrink-0" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}