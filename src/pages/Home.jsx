import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, Target, AlertTriangle, ChevronRight, Clock, ExternalLink, X } from 'lucide-react';
import { fetchFearGreed } from '@/api/marketData';
import TickerTape from '@/components/dashboard/TickerTape';
import { base44 } from '@/api/base44Client';
import ContextBanner from '@/components/ai/ContextBanner';
import PullToRefresh from '@/components/ui/PullToRefresh';

// ── ALERTS ──────────────────────────────────────────────────────────────────
const ALERTS = [
  { id: 1, type: 'BUY',  symbol: 'NVDA', note: 'alert.nvda', age: '7m', color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
  { id: 2, type: 'RISK', symbol: 'VIX',  note: 'alert.vix', age: '14m', color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  { id: 3, type: 'SELL', symbol: 'META', note: 'alert.meta', age: '31m', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
];

// ── FOR YOU ──────────────────────────────────────────────────────────────────
const FOR_YOU = [
  { symbol: 'NVDA', signal: 'BUY',   note: 'foryou.nvda', move: '+8.2%', color: '#22c55e' },
  { symbol: 'JPM',  signal: 'WATCH', note: 'foryou.jpm', move: '+7%', color: '#F59E0B' },
  { symbol: 'BTC',  signal: 'BUY',   note: 'foryou.btc', move: '+12%', color: '#22c55e' },
];

// ── RECOMMENDED ──────────────────────────────────────────────────────────────
const RECOMMENDED = [
  { symbol: 'NVDA', name: 'NVIDIA', price: 871.20, change: 5.1, signal: 'BUY', sector: 'Tech' },
  { symbol: 'AMZN', name: 'Amazon', price: 182.90, change: 3.2, signal: 'BUY', sector: 'E-Comm' },
  { symbol: 'JPM',  name: 'JPMorgan', price: 201.50, change: 1.5, signal: 'WATCH', sector: 'Finance' },
  { symbol: 'BTC',  name: 'Bitcoin', price: 67420, change: 4.8, signal: 'BUY', sector: 'Crypto' },
  { symbol: 'MSFT', name: 'Microsoft', price: 415.80, change: 1.8, signal: 'HOLD', sector: 'Tech' },
];

// ── LATEST JUMPS ─────────────────────────────────────────────────────────────
const JUMPS = [
  { symbol: 'SMCI', name: 'Supermicro',    change: +18.4, reason: 'jumps.smci' },
  { symbol: 'ARM',  name: 'ARM Holdings', change: +12.1, reason: 'jumps.arm' },
  { symbol: 'PLTR', name: 'Palantir',      change: +9.7,  reason: 'jumps.pltr' },
  { symbol: 'SOFI', name: 'SoFi',          change: +7.3,  reason: 'jumps.sofi' },
];

// ── RISK WARNINGS ────────────────────────────────────────────────────────────
const WARNINGS = [
  { symbol: 'TSLA', reason: 'warnings.tsla', severity: 'HIGH' },
  { symbol: 'META', reason: 'warnings.meta', severity: 'MEDIUM' },
  { symbol: 'RIVN', reason: 'warnings.rivn', severity: 'HIGH' },
];

// ── NEWS ─────────────────────────────────────────────────────────────────────
const NEWS = [
  {
    id: 1,
    headline: 'news.fed.headline',
    summary: 'news.fed.summary',
    sentiment: 'BULLISH',
    impact: 9.2,
    tickers: ['SPX', 'QQQ', 'TLT'],
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
    url: 'https://reuters.com',
    age: '2h',
  },
  {
    id: 2,
    headline: 'news.nvda.headline',
    summary: 'news.nvda.summary',
    sentiment: 'BULLISH',
    impact: 9.8,
    tickers: ['NVDA', 'AMD', 'SMCI'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
    url: 'https://reuters.com',
    age: '4h',
  },
  {
    id: 3,
    headline: 'news.china.headline',
    summary: 'news.china.summary',
    sentiment: 'BEARISH',
    impact: 7.4,
    tickers: ['BABA', 'JD', 'PDD'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
    url: 'https://reuters.com',
    age: '5h',
  },
  {
    id: 4,
    headline: 'news.bitcoin.headline',
    summary: 'news.bitcoin.summary',
    sentiment: 'BULLISH',
    impact: 8.1,
    tickers: ['BTC', 'ETH', 'COIN'],
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&q=80',
    url: 'https://reuters.com',
    age: '6h',
  },
];

// ── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function SectionTitle({ icon, label, sub, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <h2 className="text-[13px] font-black text-white/90 tracking-tight">{label}</h2>
        {sub && <span className="text-[10px] text-white/25">{sub}</span>}
      </div>
      {action && (
        <button onClick={onAction} className="flex items-center gap-1 text-[10px] font-bold text-primary/60 hover:text-primary transition-colors">
          {action} <ChevronRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function NewsModal({ article, onClose }) {
  if (!article) return null;
  const sentColor = article.sentiment === 'BULLISH' ? '#22c55e' : '#ef4444';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.4 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <img src={article.image} alt="" className="w-full h-40 object-cover" />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ color: sentColor, background: `${sentColor}15`, border: `1px solid ${sentColor}30` }}>
              {article.sentiment}
            </span>
            <span className="text-[9px] text-white/30 font-mono">Impact: {article.impact}/10</span>
            <span className="text-[9px] text-white/20 font-mono ml-auto">{article.age}</span>
          </div>
          <h3 className="text-[15px] font-black text-white/95 leading-snug mb-3">{article.headline}</h3>
          <p className="text-[12px] text-white/55 leading-relaxed mb-4">{article.summary}</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {article.tickers.map(t => (
              <span key={t} className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{t}</span>
            ))}
          </div>
          <div className="flex gap-3">
            <a href={article.url} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
              Read Full Article <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button onClick={onClose} className="px-4 py-3 rounded-xl border border-white/[0.08] text-white/40 hover:text-white/60 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fearGreed, setFearGreed] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsIdx, setNewsIdx] = useState(0);
  const [newsItems, setNewsItems] = useState(NEWS);

  useEffect(() => {
    fetchFearGreed().then(fg => { if (fg) setFearGreed(fg); });
  }, []);

  const loadNews = async () => {
    try {
      const res = await base44.functions.invoke('getMarketNews', {});
      const articles = res?.data?.articles;
      if (articles && articles.length > 0) {
        setNewsItems(articles.map((a, i) => ({
          id: i,
          headline: a.title,
          summary: a.summary || '',
          sentiment: 'NEUTRAL',
          impact: 7,
          tickers: [],
          image: a.image || NEWS[i % NEWS.length].image,
          url: a.url,
          age: a.seendate ? new Date(a.seendate).toLocaleDateString() : '',
        })));
      }
    } catch {
      // keep hardcoded fallback
    }
  };

  useEffect(() => { loadNews(); }, []); // eslint-disable-line

  const sentimentLabel = fearGreed
    ? fearGreed.value >= 70 ? 'GREED' : fearGreed.value >= 50 ? 'NEUTRAL' : fearGreed.value >= 30 ? 'FEAR' : 'EXTREME FEAR'
    : 'NEUTRAL';
  const sentimentColor = fearGreed
    ? fearGreed.value >= 70 ? '#22c55e' : fearGreed.value >= 50 ? '#F59E0B' : '#ef4444'
    : '#F59E0B';

  return (
    <PullToRefresh onRefresh={async () => {
      await fetchFearGreed().then(fg => { if (fg) setFearGreed(fg); });
      await loadNews();
    }}>
      <div className="w-full">
      <TickerTape />
      <div className="p-4 lg:p-6 space-y-6 max-w-[900px] mx-auto pb-24">
        {/* AI Context Banner */}
        <ContextBanner
          storageKey="home_v1"
          title={t('home.contextTitle')}
          body={t('home.contextBody')}
          actions={[{ label: t('home.contextAction'), onClick: () => {} }]}
          aiQuestion={t('home.contextAI')}
        />

        {/* ── TREK INSIGHT ── */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: 'linear-gradient(135deg, #0f0f1a, #111118)', border: '1px solid rgba(245,158,11,0.2)', borderLeft: '4px solid #F59E0B', borderRadius: 16, padding: '16px 18px', boxShadow: '0 0 40px rgba(245,158,11,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <Zap className="h-4 w-4 text-primary" />
            </motion.div>
            <span className="text-[11px] font-black text-primary uppercase tracking-[0.12em]">⚡ {t('trek.wow')}</span>
            <span className="ml-auto flex items-center gap-1 text-[9px] text-chart-3 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" /> {t('common.live')}
            </span>
          </div>
          <p className="text-[13px] text-white/75 leading-relaxed font-medium mb-3">
            {t('home.trekInsight')} <span style={{ color: sentimentColor, fontWeight: 800 }}>{sentimentLabel}</span> {t('home.territory')}
            {fearGreed ? ` (${fearGreed.value}/100)` : ''}. {t('home.aiDetects')}
            {t('home.vixFlag')}
          </p>
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Best Setup', value: 'NVDA BUY' },
              { label: 'Biggest Risk', value: 'VIX spike' },
              { label: t('trek.sentiment'), value: sentimentLabel },
            ].map(item => (
              <div key={item.label} className="rounded-lg px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-[9px] text-white/30 mb-0.5">{typeof item.label === 'string' && item.label.startsWith('home.') ? item.label : item.label}</p>
                <p className="text-[11px] font-black text-white/85 font-mono">{item.value}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── ALERTS ── */}
        <div>
          <SectionTitle icon="🚨" label={t('home.alerts')} sub={t('home.timeSensitive')} action={t('home.allSignals')} onAction={() => navigate('/AIInsights')} />
          <div className="space-y-2">
            {ALERTS.map((a, i) => (
               <motion.button
                 key={a.id}
                 initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                 onClick={() => navigate('/AIInsights')}
                 className="w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all hover:scale-[1.01] tap-feedback"
                 style={{ background: a.bg, border: `1px solid ${a.border}`, borderLeft: `3px solid ${a.color}` }}
               >
                 <span className="text-[9px] font-black px-2 py-0.5 rounded-full flex-shrink-0" style={{ color: a.color, background: `${a.color}20`, border: `1px solid ${a.color}40` }}>
                   {a.type}
                 </span>
                 <span className="font-mono font-black text-[12px] text-white/85 flex-shrink-0">{a.symbol}</span>
                 <span className="text-[11px] text-white/55 flex-1 truncate">{t(a.note)}</span>
                <span className="flex items-center gap-1 text-[9px] text-white/20 font-mono flex-shrink-0">
                  <Clock className="h-2.5 w-2.5" />{a.age}
                </span>
                <ChevronRight className="h-3.5 w-3.5 text-white/20 flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── FOR YOU ── */}
        <div>
          <SectionTitle icon="🎯" label={t('home.forYou')} sub={t('home.basedOnPortfolio')} action={t('home.seeAll')} onAction={() => navigate('/AIInsights')} />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FOR_YOU.map((s, i) => (
              <motion.button
                key={s.symbol}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                onClick={() => navigate(`/Asset/${s.symbol}`)}
                className="text-left rounded-xl p-4 transition-all hover:scale-[1.02] tap-feedback"
                style={{ background: '#0f0f18', border: `1px solid rgba(255,255,255,0.07)`, borderTop: `2px solid ${s.color}` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-black text-[14px] text-white/90">{s.symbol}</span>
                  <span className="text-[10px] font-black" style={{ color: s.color }}>{s.move}</span>
                </div>
                <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ color: s.color, background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                   {s.signal}
                 </span>
                 <p className="text-[10px] text-white/40 mt-2 leading-snug">{t(s.note)}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── RECOMMENDED ASSETS ── */}
        <div>
          <SectionTitle icon="📈" label={t('home.recommended')} sub={t('home.topOpportunities')} action={t('home.viewMarkets')} onAction={() => navigate('/Markets')} />
          <div className="space-y-2">
            {RECOMMENDED.map((s, i) => (
              <motion.button
                key={s.symbol}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/Asset/${s.symbol}`)}
                className="w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 transition-all hover:bg-white/[0.04] tap-feedback"
                style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="h-9 w-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-white/50 font-mono">{s.symbol.slice(0, 2)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-[13px] text-white/90">{s.symbol}</span>
                    <span className="text-[9px] text-white/30">{s.name}</span>
                  </div>
                  <span className="text-[9px] text-white/20">{s.sector}</span>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-mono font-bold text-[12px] text-white/80">${s.price.toLocaleString()}</div>
                  <div className={`text-[11px] font-bold font-mono ${s.change >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                    {s.change >= 0 ? '+' : ''}{s.change}%
                  </div>
                </div>
                <span className="text-[9px] font-black px-2 py-1 rounded-full flex-shrink-0"
                  style={{
                    color: s.signal === 'BUY' ? '#22c55e' : s.signal === 'SELL' ? '#ef4444' : '#F59E0B',
                    background: s.signal === 'BUY' ? 'rgba(34,197,94,0.1)' : s.signal === 'SELL' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                    border: `1px solid ${s.signal === 'BUY' ? 'rgba(34,197,94,0.25)' : s.signal === 'SELL' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                  }}>
                  {s.signal}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── LATEST JUMPS ── */}
        <div>
          <SectionTitle icon="🚀" label={t('home.latestJumps')} sub={t('home.strongSignals')} />
          <div className="grid grid-cols-2 gap-2">
            {JUMPS.map((j, i) => (
              <motion.button
                key={j.symbol}
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/Asset/${j.symbol}`)}
                className="text-left rounded-xl p-4 tap-feedback"
                style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.18)' }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-black text-[13px] text-white/90">{j.symbol}</span>
                  <span className="font-mono font-black text-[13px] text-chart-3">+{j.change}%</span>
                </div>
                <p className="text-[10px] text-white/35 leading-snug">{j.reason}</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── RISK WARNINGS ── */}
        <div>
          <SectionTitle icon="⚠️" label={t('home.riskWarnings')} sub={t('home.assetsToAvoid')} />
          <div className="space-y-2">
            {WARNINGS.map((w, i) => (
              <motion.button
                key={w.symbol}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/Asset/${w.symbol}`)}
                className="w-full text-left rounded-xl px-4 py-3 flex items-center gap-3 tap-feedback"
                style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.18)', borderLeft: '3px solid #ef4444' }}
              >
                <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono font-black text-[12px] text-white/85">{w.symbol}</span>
                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${w.severity === 'HIGH' ? 'bg-destructive/15 text-destructive border border-destructive/25' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                      {w.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-white/40 truncate">{t(w.reason)}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-white/20 flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── NEWS CAROUSEL ── */}
        <div>
          <SectionTitle icon="📰" label={t('home.marketNews')} sub={t('home.aiAnalyzed')} />
          <AnimatePresence mode="wait">
            <motion.button
              key={newsIdx}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSelectedNews(newsItems[newsIdx])}
              className="w-full text-left rounded-2xl overflow-hidden tap-feedback"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <img src={newsItems[newsIdx]?.image} alt="" className="w-full h-36 object-cover" style={{ opacity: 0.75 }} />
              <div className="p-4" style={{ background: '#111118' }}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                    style={{ color: newsItems[newsIdx]?.sentiment === 'BULLISH' ? '#22c55e' : newsItems[newsIdx]?.sentiment === 'BEARISH' ? '#ef4444' : '#F59E0B', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    {newsItems[newsIdx]?.sentiment}
                  </span>
                  <span className="text-[9px] text-white/25 font-mono">{t('common.impact')}: {newsItems[newsIdx]?.impact}/10</span>
                  <span className="text-[9px] text-white/20 font-mono ml-auto">{newsItems[newsIdx]?.age}</span>
                </div>
                <p className="text-[13px] font-bold text-white/90 leading-snug mb-2">{t(newsItems[newsIdx]?.headline)}</p>
                <p className="text-[11px] text-white/45 leading-relaxed mb-3">{t(newsItems[newsIdx]?.summary)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1.5">
                    {(newsItems[newsIdx]?.tickers || []).map(t => (
                      <span key={t} className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{t}</span>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-primary/60">Tap to read →</span>
                </div>
              </div>
            </motion.button>
          </AnimatePresence>
          <div className="flex items-center justify-center gap-2 mt-3">
            {newsItems.map((_, i) => (
              <button key={i} onClick={() => setNewsIdx(i)}
                className="rounded-full transition-all"
                style={{ width: i === newsIdx ? 20 : 6, height: 6, background: i === newsIdx ? '#F59E0B' : 'rgba(255,255,255,0.15)' }} />
            ))}
          </div>
        </div>

      </div>

      {/* News Modal */}
      <AnimatePresence>
        {selectedNews && <NewsModal article={selectedNews} onClose={() => setSelectedNews(null)} />}
      </AnimatePresence>
      </div>
    </PullToRefresh>
  );
}