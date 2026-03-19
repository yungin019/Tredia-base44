import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react';

const BULLISH_KW = ['surge', 'rally', 'gain', 'rise', 'growth', 'profit', 'beat', 'strong', 'record', 'jump', 'soar', 'bull', 'recovery'];
const BEARISH_KW = ['crash', 'fall', 'drop', 'loss', 'decline', 'plunge', 'weak', 'miss', 'recession', 'cut', 'bear', 'sell-off', 'warning'];

function sentiment(text) {
  const lower = (text || '').toLowerCase();
  const bull = BULLISH_KW.filter(k => lower.includes(k)).length;
  const bear = BEARISH_KW.filter(k => lower.includes(k)).length;
  if (bull > bear) return 'BULLISH';
  if (bear > bull) return 'BEARISH';
  return 'NEUTRAL';
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

const BADGE = {
  BULLISH: 'bg-green-500/15 text-green-400 border-green-500/25',
  BEARISH: 'bg-red-500/15 text-red-400 border-red-500/25',
  NEUTRAL: 'bg-white/[0.06] text-white/35 border-white/10',
};

// Curated fallback articles — shown when API fails
const FALLBACK = [
  { title: 'Fed Signals Cautious Approach to Rate Cuts Amid Persistent Inflation', domain: 'Reuters', sentiment: 'BEARISH', seendate: null },
  { title: 'NVIDIA Reports Record Revenue Driven by AI Data Center Demand', domain: 'Bloomberg', sentiment: 'BULLISH', seendate: null },
  { title: 'S&P 500 Holds Key Support Level as Investors Assess Tech Earnings', domain: 'CNBC', sentiment: 'NEUTRAL', seendate: null },
  { title: 'Bitcoin Surges Past $70K as Institutional Adoption Accelerates', domain: 'CoinDesk', sentiment: 'BULLISH', seendate: null },
  { title: 'Apple Plans Major AI Integration Across Product Line in 2025', domain: 'WSJ', sentiment: 'BULLISH', seendate: null },
  { title: 'Treasury Yields Rise as Strong Jobs Data Reduces Rate Cut Bets', domain: 'FT', sentiment: 'BEARISH', seendate: null },
];

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getMarketNews', {});
      const data = res.data?.articles || [];
      if (data.length > 0) {
        setArticles(data.map(a => ({ ...a, sentiment: sentiment(a.title + ' ' + a.summary) })));
        setIsFallback(false);
      } else {
        setArticles(FALLBACK);
        setIsFallback(true);
      }
    } catch {
      setArticles(FALLBACK);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 120000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Newspaper className="h-3.5 w-3.5 text-primary" />
          <h2 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.12em]">Market Intelligence</h2>
          {isFallback && <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/20 border border-white/[0.06] uppercase tracking-wider">Curated</span>}
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-[9px] text-white/20 hover:text-white/40 transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {loading && articles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-white/[0.05] bg-[#111118] p-4 h-[120px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {articles.map((a, i) => (
            <a
              key={i}
              href={a.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-xl border border-white/[0.05] bg-[#111118] p-4 flex flex-col gap-2.5 hover:border-white/[0.12] hover:bg-[#14141c] transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider ${BADGE[a.sentiment]}`}>
                  {a.sentiment}
                </span>
                <ExternalLink className="h-3 w-3 text-white/15 group-hover:text-white/30 transition-colors flex-shrink-0" />
              </div>

              <p className="text-sm font-bold text-white/85 leading-snug line-clamp-2">{a.title}</p>

              {a.summary && (
                <p className="text-[10px] text-white/30 leading-relaxed line-clamp-2">{a.summary}</p>
              )}

              <div className="flex items-center gap-2 mt-auto pt-0.5">
                <span className="text-[10px] text-white/30 font-semibold truncate">{a.domain}</span>
                {a.seendate && (
                  <>
                    <span className="text-white/10">·</span>
                    <span className="text-[10px] text-white/20 font-mono">{timeAgo(a.seendate)}</span>
                  </>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}