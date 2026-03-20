import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { ExternalLink, Newspaper, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const BULLISH_KW = ['surge', 'rally', 'gain', 'rise', 'growth', 'profit', 'beat', 'strong', 'record', 'jump', 'soar', 'bull', 'recovery', 'buy', 'upgrade'];
const BEARISH_KW = ['crash', 'fall', 'drop', 'loss', 'decline', 'plunge', 'weak', 'miss', 'recession', 'cut', 'bear', 'sell-off', 'warning', 'downgrade', 'risk'];

const TICKER_MAP = {
  'AAPL': ['Apple', 'AAPL'],
  'TSLA': ['Tesla', 'TSLA'],
  'NVDA': ['Nvidia', 'NVDA'],
  'MSFT': ['Microsoft', 'MSFT'],
  'GOOGL': ['Google', 'Alphabet', 'GOOGL'],
  'AMZN': ['Amazon', 'AMZN'],
  'META': ['Meta', 'Facebook', 'META'],
  'BTC': ['Bitcoin', 'BTC'],
  'ETH': ['Ethereum', 'ETH'],
  'FED': ['Fed', 'Federal Reserve', 'Powell'],
  'SPY': ['S&P', 'SPX', 'SPY', 'market'],
};

function analyzeSentiment(text) {
  const lower = (text || '').toLowerCase();
  const bull = BULLISH_KW.filter(k => lower.includes(k)).length;
  const bear = BEARISH_KW.filter(k => lower.includes(k)).length;
  if (bull > bear) return 'BULLISH';
  if (bear > bull) return 'BEARISH';
  return 'NEUTRAL';
}

function getAffectedTickers(text) {
  const matched = [];
  for (const [ticker, kws] of Object.entries(TICKER_MAP)) {
    if (kws.some(k => text.includes(k))) matched.push(ticker);
  }
  return matched.slice(0, 3);
}

function getImpactScore(text) {
  const high = ['Fed', 'Federal Reserve', 'earnings', 'crash', 'record', 'bankruptcy', 'merger', 'acquisition', 'rate'];
  const med = ['upgrade', 'downgrade', 'analyst', 'forecast', 'outlook', 'report'];
  const lower = text.toLowerCase();
  if (high.some(k => lower.includes(k.toLowerCase()))) return { score: 'HIGH', color: '#ef4444' };
  if (med.some(k => lower.includes(k.toLowerCase()))) return { score: 'MED', color: '#F59E0B' };
  return { score: 'LOW', color: '#6b7280' };
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return 'just now';
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

const SENTIMENT_CONFIG = {
  BULLISH: { label: 'Bullish', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', Icon: TrendingUp },
  BEARISH: { label: 'Bearish', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', Icon: TrendingDown },
  NEUTRAL: { label: 'Neutral', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)', Icon: Minus },
};

const FALLBACK = [
  { title: 'Fed Signals Cautious Approach to Rate Cuts Amid Persistent Inflation', domain: 'Reuters', seendate: null },
  { title: 'NVIDIA Reports Record Revenue Driven by AI Data Center Demand', domain: 'Bloomberg', seendate: null },
  { title: 'S&P 500 Holds Key Support Level as Investors Assess Tech Earnings', domain: 'CNBC', seendate: null },
  { title: 'Bitcoin Surges Past $70K as Institutional Adoption Accelerates', domain: 'CoinDesk', seendate: null },
  { title: 'Apple Plans Major AI Integration Across Product Line in 2025', domain: 'WSJ', seendate: null },
  { title: 'Treasury Yields Rise as Strong Jobs Data Reduces Rate Cut Bets', domain: 'FT', seendate: null },
];

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('getMarketNews', {});
      const data = res.data?.articles || [];
      const enriched = (data.length > 0 ? data : FALLBACK).map(a => ({
        ...a,
        sentiment: analyzeSentiment(a.title + ' ' + (a.summary || '')),
        tickers: getAffectedTickers(a.title + ' ' + (a.summary || '')),
        impact: getImpactScore(a.title + ' ' + (a.summary || '')),
      }));
      setArticles(enriched);
    } catch {
      setArticles(FALLBACK.map(a => ({
        ...a,
        sentiment: analyzeSentiment(a.title),
        tickers: getAffectedTickers(a.title),
        impact: getImpactScore(a.title),
      })));
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
            <div key={i} className="rounded-xl border border-white/[0.05] bg-[#111118] p-4 h-[130px] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {articles.map((a, i) => {
            const sc = SENTIMENT_CONFIG[a.sentiment] || SENTIMENT_CONFIG.NEUTRAL;
            const Icon = sc.Icon;
            return (
              <a
                key={i}
                href={a.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-2.5 rounded-xl border bg-[#111118] p-4 hover:border-white/[0.14] hover:bg-[#14141c] transition-all cursor-pointer"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                {/* Top row: sentiment + impact + external */}
                <div className="flex items-center gap-2">
                  <span
                    className="flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider flex-shrink-0"
                    style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}
                  >
                    <Icon className="h-2.5 w-2.5" />
                    {sc.label}
                  </span>
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider"
                    style={{ color: a.impact.color, background: `${a.impact.color}15`, borderColor: `${a.impact.color}30` }}
                  >
                    {a.impact.score} IMPACT
                  </span>
                  <ExternalLink className="h-3 w-3 text-white/10 group-hover:text-white/25 transition-colors ml-auto flex-shrink-0" />
                </div>

                {/* Headline */}
                <p className="text-[12px] font-bold text-white/85 leading-snug line-clamp-2">{a.title}</p>

                {/* Summary if available */}
                {a.summary && a.summary !== a.title && (
                  <p className="text-[10px] text-white/30 leading-relaxed line-clamp-2">{a.summary}</p>
                )}

                {/* Affected tickers */}
                {a.tickers?.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] text-white/20 uppercase tracking-wider">Affects:</span>
                    {a.tickers.map((ticker, tickerIdx) => (
                      <span key={`${i}-${tickerIdx}`} className="text-[8px] font-black font-mono px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-white/45">
                        {ticker}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-2 mt-auto">
                  <span className="text-[9px] text-white/30 font-semibold truncate">{a.domain}</span>
                  {a.seendate && (
                    <>
                      <span className="text-white/10">·</span>
                      <span className="text-[9px] text-white/20 font-mono">{timeAgo(a.seendate)}</span>
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