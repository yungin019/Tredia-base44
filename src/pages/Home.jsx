import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, TrendingUp, TrendingDown, AlertTriangle, ChevronRight, Clock, ExternalLink, X, Sparkles, ArrowUpRight } from 'lucide-react';
import { fetchFearGreed } from '@/api/marketData';
import TickerTape from '@/components/dashboard/TickerTape';
import IndexCardsSection from '@/components/markets/IndexCardsSection';
import { base44 } from '@/api/base44Client';
import ContextBanner from '@/components/ai/ContextBanner';
import PullToRefresh from '@/components/ui/PullToRefresh';

const ALERTS = [
  { id: 1, type: 'BUY',  symbol: 'NVDA', note: 'Momentum breakout above $870 — volume 3.2× average', age: '7m', color: 'hsl(142, 86%, 28%)', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  { id: 2, type: 'RISK', symbol: 'VIX',  note: 'VIX term structure inversion — elevated market risk', age: '14m', color: 'hsl(0, 84%, 60%)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  { id: 3, type: 'SELL', symbol: 'META', note: 'Pre-earnings sentiment deteriorating — put/call 1.4', age: '31m', color: 'hsl(45, 93%, 47%)', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
];

const FOR_YOU = [
  { symbol: 'NVDA', signal: 'BUY',   note: 'Institutional accumulation detected. Strong breakout setup.', move: '+8.2%', color: 'hsl(142, 86%, 28%)' },
  { symbol: 'JPM',  signal: 'WATCH', note: 'Financial sector rotation. Rate curve steepening.', move: '+7%', color: 'hsl(45, 93%, 47%)' },
  { symbol: 'BTC',  signal: 'BUY',   note: 'Spot ETF inflows at record. Halving cycle momentum.', move: '+12%', color: 'hsl(142, 86%, 28%)' },
];

const RECOMMENDED = [
  { symbol: 'NVDA', name: 'NVIDIA', price: 871.20, change: 5.1, signal: 'BUY', sector: 'Tech' },
  { symbol: 'AMZN', name: 'Amazon', price: 182.90, change: 3.2, signal: 'BUY', sector: 'E-Comm' },
  { symbol: 'JPM',  name: 'JPMorgan', price: 201.50, change: 1.5, signal: 'WATCH', sector: 'Finance' },
  { symbol: 'BTC',  name: 'Bitcoin', price: 67420, change: 4.8, signal: 'BUY', sector: 'Crypto' },
  { symbol: 'MSFT', name: 'Microsoft', price: 415.80, change: 1.8, signal: 'HOLD', sector: 'Tech' },
];

const JUMPS = [
  { symbol: 'SMCI', name: 'Supermicro',    change: +18.4, reason: 'AI server demand surge — NVIDIA GPU allocation confirmed' },
  { symbol: 'ARM',  name: 'ARM Holdings', change: +12.1, reason: 'New chip licensing deal with major hyperscaler' },
  { symbol: 'PLTR', name: 'Palantir',      change: +9.7,  reason: 'DoD contract expansion — AI platform adoption' },
  { symbol: 'SOFI', name: 'SoFi',          change: +7.3,  reason: 'Student loan refinancing demand up 40% QoQ' },
];

const WARNINGS = [
  { symbol: 'TSLA', reason: 'Delivery miss risk + margin compression. Bearish divergence on daily.', severity: 'HIGH' },
  { symbol: 'META', reason: 'Ad revenue uncertainty. 3 analyst downgrades in 72h. Put/call elevated.', severity: 'MEDIUM' },
  { symbol: 'RIVN', reason: 'Cash burn accelerating. Production ramp below target. EV demand softening.', severity: 'HIGH' },
];

const NEWS = [
  {
    id: 1,
    headline: 'Fed signals higher-for-longer rates — market digests hawkish pivot',
    summary: 'Federal Reserve officials indicated rates will remain elevated through mid-year, citing persistent core inflation above 3%. Bond markets reacted with a sharp yield curve shift.',
    sentiment: 'BULLISH',
    impact: 9,
    tickers: ['SPX', 'QQQ', 'TLT'],
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
    url: 'https://reuters.com',
    age: '2h',
  },
  {
    id: 2,
    headline: 'NVIDIA ships Blackwell GPUs ahead of schedule — data center demand surges',
    summary: 'NVIDIA confirmed early delivery of next-gen Blackwell accelerators to hyperscalers. Cloud capex guidance raised across Microsoft, Google, and AWS.',
    sentiment: 'BULLISH',
    impact: 8,
    tickers: ['NVDA', 'AMD', 'SMCI'],
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
    url: 'https://reuters.com',
    age: '4h',
  },
  {
    id: 3,
    headline: 'China trade tensions escalate — new tariffs threaten tech supply chain',
    summary: 'Beijing announced retaliatory measures on semiconductor imports. US tech stocks with heavy China exposure face earnings risk heading into Q2.',
    sentiment: 'BEARISH',
    impact: 6,
    tickers: ['BABA', 'JD', 'PDD'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80',
    url: 'https://reuters.com',
    age: '5h',
  },
  {
    id: 4,
    headline: 'Bitcoin spot ETFs record $1.2B inflows — halving cycle momentum builds',
    summary: 'Institutional Bitcoin demand hit record levels as spot ETF inflows accelerated. On-chain data confirms whale accumulation phase ahead of the April halving.',
    sentiment: 'BULLISH',
    impact: 7,
    tickers: ['BTC', 'ETH', 'COIN'],
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&q=80',
    url: 'https://reuters.com',
    age: '6h',
  },
];

function SectionTitle({ icon, label, sub, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{icon}</span>
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">{label}</h2>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group"
        >
          {action}
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}

function NewsModal({ article, onClose }) {
  const { t } = useTranslation();
  if (!article) return null;
  const sentColor = article.sentiment === 'BULLISH' ? 'hsl(142, 86%, 28%)' : article.sentiment === 'BEARISH' ? 'hsl(0, 84%, 60%)' : 'hsl(45, 93%, 47%)';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden border border-border shadow-2xl"
        style={{ background: 'hsl(var(--card))', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-48 overflow-hidden">
          <img src={article.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-xs font-bold px-3 py-1 rounded-full"
              style={{
                color: sentColor,
                background: `${sentColor}15`,
                border: `1px solid ${sentColor}30`
              }}
            >
              {article.sentiment}
            </span>
            <span className="text-xs text-muted-foreground font-mono">Impact: {article.impact}/10</span>
            <span className="text-xs text-muted-foreground/60 font-mono ml-auto">{article.age}</span>
          </div>

          <h3 className="text-xl font-bold text-foreground leading-tight">{article.headline}</h3>

          <p className="text-sm text-muted-foreground leading-relaxed">{article.summary}</p>

          <div className="flex flex-wrap gap-2">
            {article.tickers.map(t => (
              <span key={t} className="text-xs font-bold font-mono px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                {t}
              </span>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-primary to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Read Full Article <ExternalLink className="h-4 w-4" />
            </a>
            <button
              onClick={onClose}
              className="px-4 py-3 rounded-xl border-2 border-border hover:border-border/50 text-foreground/60 hover:text-foreground transition-all hover:bg-card/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fearGreed, setFearGreed] = useState(null);
  const [selectedNews, setSelectedNews] = useState(null);
  const [newsItems, setNewsItems] = useState(NEWS);

  useEffect(() => {
    fetchFearGreed().then(fg => { if (fg) setFearGreed(fg); });
  }, []);

  const loadNews = async () => {
    try {
      const res = await base44.functions.invoke('getMarketNews', {});
      const articles = res?.data?.articles;
      if (articles && articles.length > 0) {
        setNewsItems(articles.map((a, i) => {
          const baseImpact = Math.floor((i % 4) + 6);
          return {
            id: i,
            headline: a.title,
            summary: a.summary || '',
            sentiment: a.sentiment || 'NEUTRAL',
            impact: baseImpact,
            tickers: [],
            image: a.image || NEWS[i % NEWS.length].image,
            url: a.url,
            age: a.seendate ? new Date(a.seendate).toLocaleDateString() : '',
          };
        }));
      }
    } catch {
    }
  };

  useEffect(() => { loadNews(); }, []);

  const sentimentLabel = fearGreed
    ? fearGreed.value >= 70 ? t('trek.greed') : fearGreed.value >= 50 ? t('common.neutral') : fearGreed.value >= 30 ? t('trek.fear') : t('trek.extremeFear')
    : t('common.neutral');

  return (
    <PullToRefresh onRefresh={async () => {
      await fetchFearGreed().then(fg => { if (fg) setFearGreed(fg); });
      await loadNews();
    }}>
      <div className="w-full min-h-screen bg-gradient-to-b from-background via-background to-card/20">
        <TickerTape />
        <IndexCardsSection />

        <div className="p-4 lg:p-6 space-y-6 max-w-[900px] mx-auto pb-24">
          <ContextBanner
            storageKey="home_v1"
            title={t('home.contextTitle')}
            body={t('home.contextBody')}
            actions={[{ label: t('home.contextAction'), onClick: () => {} }]}
            aiQuestion={t('home.contextAI')}
          />

          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-3xl p-6 glass-card border-2 border-primary/20"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />

            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg"
                  >
                    <Zap className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5" />
                      TREK Intelligence
                    </h3>
                    <p className="text-xs text-muted-foreground">AI Market Analysis</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 text-xs text-success font-semibold px-3 py-1 rounded-full bg-success/10 border border-success/20">
                  <span className="h-2 w-2 rounded-full bg-success live-pulse" />
                  LIVE
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-base font-bold text-gradient-primary">
                    {fearGreed?.value < 20 ? 'EXTREME FEAR' : fearGreed?.value < 40 ? 'FEAR' : fearGreed?.value < 60 ? 'NEUTRAL' : fearGreed?.value < 80 ? 'GREED' : 'EXTREME GREED'} territory ({fearGreed?.value || 50}/100)
                  </span>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/40 border border-border/50">
                    <span className="text-xs font-bold text-primary/70 min-w-[60px]">Why:</span>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {fearGreed?.value < 20
                        ? 'Fed hawkish stance + tech selloff driving institutional exit. VIX spiking.'
                        : fearGreed?.value < 40
                        ? 'Market uncertainty as earnings disappoint. Volatility elevated.'
                        : fearGreed?.value < 60
                        ? 'Mixed signals across sectors. Awaiting clearer direction.'
                        : 'Optimism driven by strong earnings and AI momentum. Dip-buying active.'}
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-background/40 border border-border/50">
                    <span className="text-xs font-bold text-warning/70 min-w-[60px]">At Risk:</span>
                    <p className="text-xs text-foreground/80 leading-relaxed">
                      {fearGreed?.value < 20
                        ? 'Tech, Growth stocks, Crypto'
                        : fearGreed?.value < 40
                        ? 'Small-caps, Consumer Discretionary'
                        : fearGreed?.value < 60
                        ? 'Balanced exposure'
                        : 'Defensive sectors lagging'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20">
                    <div className="flex items-start gap-2.5">
                      <span className="text-sm font-bold text-primary">TREK says:</span>
                      <p className="text-sm text-foreground leading-relaxed font-medium">
                        {fearGreed?.value < 20
                          ? 'Reduce exposure, hold cash, watch for reversal signals.'
                          : fearGreed?.value < 40
                          ? 'Tighten stops, avoid new longs. Defensive posture.'
                          : fearGreed?.value < 60
                          ? 'Stay selective. Quality over quantity.'
                          : 'Lean long on momentum, set trailing stops. Ride the wave.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div>
            <SectionTitle
              icon="🎯"
              label={t('home.forYou')}
              sub={t('home.basedOnPortfolio')}
              action={t('home.seeAll')}
              onAction={() => navigate('/AIInsights')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FOR_YOU.map((s, i) => (
                <motion.button
                  key={s.symbol}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => navigate(`/Asset/${s.symbol}`)}
                  className="group text-left rounded-2xl p-5 transition-all hover:scale-[1.03] active:scale-[0.98] glass-card border border-border hover:border-primary/30 card-shadow"
                  style={{ borderTop: `3px solid ${s.color}` }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono font-black text-base text-foreground">{s.symbol}</span>
                    <span className="text-xs font-bold" style={{ color: s.color }}>{s.move}</span>
                  </div>
                  <span
                    className="inline-flex text-xs font-bold px-3 py-1 rounded-lg"
                    style={{
                      color: s.color,
                      background: `${s.color}15`,
                      border: `1px solid ${s.color}30`
                    }}
                  >
                    {s.signal}
                  </span>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{s.note}</p>
                  <ArrowUpRight className="absolute top-4 right-4 h-4 w-4 text-foreground/20 group-hover:text-primary/60 transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle
              icon="📈"
              label={t('home.recommended')}
              sub={t('home.topOpportunities')}
              action={t('home.viewMarkets')}
              onAction={() => navigate('/Markets')}
            />
            <div className="space-y-2">
              {RECOMMENDED.map((s, i) => (
                <motion.button
                  key={s.symbol}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => navigate(`/Asset/${s.symbol}`)}
                  className="w-full text-left rounded-2xl px-5 py-4 flex items-center gap-4 transition-all hover:scale-[1.01] active:scale-[0.99] glass-card border border-border hover:border-primary/30 card-shadow group"
                >
                  <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <span className="text-xs font-black text-primary font-mono">{s.symbol.slice(0, 2)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-sm text-foreground">{s.symbol}</span>
                      <span className="text-xs text-muted-foreground">{s.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground/70">{s.sector}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-mono font-bold text-sm text-foreground">${s.price.toLocaleString()}</div>
                    <div className={`text-xs font-bold font-mono ${s.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {s.change >= 0 ? <TrendingUp className="inline h-3 w-3 mr-0.5" /> : <TrendingDown className="inline h-3 w-3 mr-0.5" />}
                      {s.change >= 0 ? '+' : ''}{s.change}%
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                    style={{
                      color: s.signal === 'BUY' ? 'hsl(142, 86%, 28%)' : s.signal === 'SELL' ? 'hsl(0, 84%, 60%)' : 'hsl(45, 93%, 47%)',
                      background: s.signal === 'BUY' ? 'rgba(16,185,129,0.1)' : s.signal === 'SELL' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                      border: `1px solid ${s.signal === 'BUY' ? 'rgba(16,185,129,0.25)' : s.signal === 'SELL' ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.2)'}`,
                    }}
                  >
                    {s.signal}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle icon="🚀" label={t('home.latestJumps')} sub={t('home.strongSignals')} />
            <div className="grid grid-cols-2 gap-3">
              {JUMPS.map((j, i) => (
                <motion.button
                  key={j.symbol}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => navigate(`/Asset/${j.symbol}`)}
                  className="text-left rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98] glass-card border border-success/20 bg-success/5 hover:border-success/30 card-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-black text-sm text-foreground">{j.symbol}</span>
                    <span className="font-mono font-black text-sm text-success">+{j.change}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{j.reason}</p>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle
              icon="🚨"
              label={t('home.alerts')}
              sub={t('home.timeSensitive')}
              action={t('home.allSignals')}
              onAction={() => navigate('/AIInsights')}
            />
            <div className="space-y-2">
              {ALERTS.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => navigate('/AIInsights')}
                  className="w-full text-left rounded-2xl px-5 py-4 flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] glass-card card-shadow group"
                  style={{
                    background: a.bg,
                    border: `2px solid ${a.border}`,
                    borderLeft: `4px solid ${a.color}`
                  }}
                >
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-lg flex-shrink-0"
                    style={{
                      color: a.color,
                      background: `${a.color}20`,
                      border: `1px solid ${a.color}40`
                    }}
                  >
                    {a.type}
                  </span>
                  <span className="font-mono font-black text-sm text-foreground flex-shrink-0">{a.symbol}</span>
                  <span className="text-xs text-foreground/70 flex-1 truncate">{a.note}</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground/60 font-mono flex-shrink-0">
                    <Clock className="h-3 w-3" />{a.age}
                  </span>
                  <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-primary/60 flex-shrink-0 transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle icon="📰" label={t('home.marketNews')} sub={t('home.aiAnalyzed')} />
            <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-4 pb-2">
                {newsItems.map((article, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => setSelectedNews(article)}
                    className="flex-shrink-0 text-left rounded-3xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] glass-card border border-border hover:border-border/50 card-shadow group"
                    style={{ width: '320px', maxWidth: '85vw' }}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img src={article.image} alt="" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />
                    </div>

                    <div className="p-5 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-lg"
                          style={{
                            color: article.sentiment === 'BULLISH' ? 'hsl(142, 86%, 28%)' : article.sentiment === 'BEARISH' ? 'hsl(0, 84%, 60%)' : 'hsl(45, 93%, 47%)',
                            background: article.sentiment === 'BULLISH' ? 'rgba(16,185,129,0.1)' : article.sentiment === 'BEARISH' ? 'rgba(239,68,68,0.1)' : 'rgba(251,191,36,0.1)',
                            border: `1px solid ${article.sentiment === 'BULLISH' ? 'rgba(16,185,129,0.2)' : article.sentiment === 'BEARISH' ? 'rgba(239,68,68,0.2)' : 'rgba(251,191,36,0.2)'}`
                          }}
                        >
                          {article.sentiment}
                        </span>
                        <span className="text-xs text-muted-foreground/60 font-mono">Impact: {article.impact}/10</span>
                        <span className="text-xs text-muted-foreground/40 font-mono ml-auto">{article.age}</span>
                      </div>

                      <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">{article.headline}</p>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{article.summary}</p>

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex gap-1.5 flex-wrap">
                          {(article.tickers || []).slice(0, 3).map(t => (
                            <span key={t} className="text-xs font-bold font-mono px-2 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                              {t}
                            </span>
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-primary/70 group-hover:text-primary flex items-center gap-1 transition-colors">
                          Read <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <SectionTitle icon="⚠️" label={t('home.riskWarnings')} sub={t('home.assetsToAvoid')} />
            <div className="space-y-2">
              {WARNINGS.map((w, i) => (
                <motion.button
                  key={w.symbol}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => navigate(`/Asset/${w.symbol}`)}
                  className="w-full text-left rounded-2xl px-5 py-4 flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] glass-card border-2 card-shadow group"
                  style={{
                    background: 'rgba(239,68,68,0.05)',
                    borderColor: 'rgba(239,68,68,0.2)',
                    borderLeft: '4px solid hsl(0, 84%, 60%)'
                  }}
                >
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" strokeWidth={2.5} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-sm text-foreground">{w.symbol}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${w.severity === 'HIGH' ? 'bg-destructive/15 text-destructive border border-destructive/25' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                        {w.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{w.reason}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-destructive/60 flex-shrink-0 transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {selectedNews && <NewsModal article={selectedNews} onClose={() => setSelectedNews(null)} />}
        </AnimatePresence>
      </div>
    </PullToRefresh>
  );
}
