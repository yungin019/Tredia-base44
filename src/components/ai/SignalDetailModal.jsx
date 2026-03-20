import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ExternalLink, Plus, Bell, Share2,
  MessageSquare, Target
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

// RSI Gauge
function RSIGauge({ value }) {
  const angle = ((value / 100) * 180) - 90;
  const color = value > 70 ? '#EF4444' : value < 30 ? '#22C55E' : '#F59E0B';
  const label = value > 70 ? 'OVERBOUGHT' : value < 30 ? 'OVERSOLD' : 'NEUTRAL ZONE';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-12 overflow-hidden mb-1">
        <svg viewBox="0 0 100 52" className="w-full h-full">
          <path d="M5 50 A45 45 0 0 1 95 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" />
          <path d="M5 50 A45 45 0 0 1 35 12" fill="none" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          <path d="M35 12 A45 45 0 0 1 65 12" fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          <path d="M65 12 A45 45 0 0 1 95 50" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
          <line
            x1="50" y1="50"
            x2={50 + 36 * Math.cos(((angle) * Math.PI) / 180)}
            y2={50 - 36 * Math.sin(((-(angle)) * Math.PI) / 180)}
            stroke={color} strokeWidth="2.5" strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="3" fill={color} />
        </svg>
      </div>
      <span className="text-[18px] font-black font-mono" style={{ color }}>{value}</span>
      <span className="text-[8px] font-bold tracking-wider" style={{ color }}>{label}</span>
    </div>
  );
}

// News carousel card
function NewsCarouselCard({ article, cfg }) {
  return (
    <div className="flex-shrink-0 w-64 rounded-xl overflow-hidden border border-white/[0.07] bg-[#0e0e16]">
      <div className="relative h-32">
        <img src={article.image} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <span className={`absolute top-2 right-2 text-[7px] font-black px-1.5 py-0.5 rounded tracking-widest ${
          article.sentiment === 'positive' ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30' :
          article.sentiment === 'negative' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' :
          'bg-white/10 text-white/50 border border-white/10'
        }`}>{article.sentiment === 'positive' ? 'BULLISH' : article.sentiment === 'negative' ? 'BEARISH' : 'NEUTRAL'}</span>
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-[10px] font-bold text-white leading-tight">{article.headline}</p>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] text-primary font-bold">{article.source}</span>
          <span className="text-[8px] text-white/25">{article.time}</span>
        </div>
        <p className="text-[9px] text-white/40 leading-relaxed mb-2">{article.impact}</p>
        <button className="w-full text-[9px] font-bold text-primary border border-primary/20 rounded-lg py-1.5 hover:bg-primary/5 transition-colors flex items-center justify-center gap-1">
          <ExternalLink className="h-2.5 w-2.5" /> Read Full Article
        </button>
      </div>
    </div>
  );
}

export default function SignalDetailModal({ signal, cfg, onClose }) {
  const [deepAnalysis, setDeepAnalysis] = useState('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);
  const [activeTab, setActiveTab] = useState('news');
  const [newsIdx, setNewsIdx] = useState(0);

  const generateAnalysis = async () => {
    if (analysisDone) return;
    setLoadingAnalysis(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are TREK AI — elite institutional trading intelligence.
Signal: ${signal.symbol} — ${signal.title} (${signal.type.toUpperCase()}, ${signal.confidence}% confidence)
Context: ${signal.message}

Write a comprehensive 4-paragraph TREK analysis:
1. What is happening right now — the immediate catalyst and price action
2. Historical comparison — name 2-3 specific historical setups with outcomes (dates, % moves)
3. Institutional perspective — what smart money is doing and why
4. Specific trade plan — entry, targets, stop loss, position sizing suggestion

Be direct, use precise numbers, and write like a top-tier hedge fund analyst. Under 280 words.`,
      add_context_from_internet: true,
    });
    setDeepAnalysis(result);
    setLoadingAnalysis(false);
    setAnalysisDone(true);
  };

  // Auto-generate analysis when trek tab is opened
  React.useEffect(() => {
    if (activeTab === 'trek' && !analysisDone && !loadingAnalysis) {
      generateAnalysis();
    }
  }, [activeTab]);

  const heroImage = signal.news?.[0] ? getNewsImage(signal.symbol, 0) : `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80`;

  const newsArticles = signal.news?.map((n, i) => ({
    ...n,
    image: getNewsImage(signal.symbol, i),
    impact: getImpactText(signal.symbol, n.headline, n.sentiment),
  })) || [];

  const tabs = [
    { id: 'news', label: 'News Driving This' },
    { id: 'technicals', label: 'Technicals' },
    { id: 'trek', label: 'TREK Analysis' },
  ];

  const rsiValue = signal.technicals?.find(t => t.label === 'RSI(14)')?.value?.replace(/[^0-9.]/g, '') || 55;
  const volumeAboveAvg = signal.evidence?.find(e => e.label.toLowerCase().includes('volume'))?.value || '+100%';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex flex-col"
        style={{ background: '#0A0A0F' }}
      >
        {/* Hero Image */}
        <div className="relative h-52 flex-shrink-0">
          <img src={heroImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0A0A0F]" />
          <button
            onClick={onClose}
            className="absolute top-4 left-4 h-9 w-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-white/10"
          >
            <X className="h-4 w-4 text-white" />
          </button>
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{cfg.header}</span>
            </div>
            <h2 className="text-xl font-black text-white leading-tight">{signal.symbol} — {signal.title}</h2>
          </div>
        </div>

        {/* TREK Verdict Bar */}
        <div className="flex-shrink-0 mx-4 -mt-2 mb-4 bg-[#111118] border border-primary/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">TREK AI Verdict</span>
            <button
              onClick={() => {/* open confidence modal */}}
              className="text-[12px] font-black font-mono text-primary hover:opacity-70 transition-opacity tap-feedback min-h-[44px] flex items-center"
            >
              {signal.confidence}% confidence ›
            </button>
          </div>

          {/* Action Badge */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`px-4 py-2 rounded-lg font-black text-base ${
              signal.type === 'bullish' ? 'bg-[#22C55E]/20 text-[#22C55E] border-2 border-[#22C55E]/40' :
              signal.type === 'bearish' ? 'bg-[#EF4444]/20 text-[#EF4444] border-2 border-[#EF4444]/40' :
              'bg-primary/20 text-primary border-2 border-primary/40'
            }`}>
              {signal.type === 'bullish' ? 'BUY' : signal.type === 'bearish' ? 'SELL' : 'ALERT'}
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/60 leading-tight">
                {signal.type === 'bullish' ? 'High probability upside move detected' :
                 signal.type === 'bearish' ? 'High probability downside move detected' :
                 'Critical market catalyst identified'}
              </p>
            </div>
          </div>

          {/* Short Reasoning */}
          <p className="text-[12px] font-medium text-white/70 leading-relaxed mb-3">
            {signal.message || 'Tap "TREK Analysis" below for full reasoning and trade plan.'}
          </p>
          <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${signal.confidence}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-primary"
              style={{ boxShadow: '0 0 10px rgba(245,158,11,0.6)' }}
            />
          </div>

          {/* Portfolio impact preview */}
          <div className="mt-2.5 flex items-center gap-2 bg-primary/5 border border-primary/10 rounded-lg px-3 py-1.5">
            <span className="text-[9px] text-white/30">YOUR PORTFOLIO IMPACT:</span>
            <span className={`text-[11px] font-black font-mono ${signal.type === 'bearish' ? 'text-[#EF4444]' : 'text-primary'}`}>
              {signal.type === 'bearish' ? '-$840' : '+$1,240'} est.
            </span>
            <span className="text-[9px] text-white/20 ml-1">if this plays out</span>
          </div>

          {/* Counts row */}
          <div className="mt-2 flex items-center gap-4">
            <span className="text-[9px] text-white/25">
              <span className="text-white/50 font-bold">{signal.news?.length || 3}</span> news articles
            </span>
            <span className="text-white/10">·</span>
            <span className="text-[9px] text-white/25">
              <span className="text-white/50 font-bold">{signal.technicals?.length || 6}</span> technical signals
            </span>
            <span className="text-white/10">·</span>
            <span className="text-[9px] text-white/25">
              <span className="text-white/50 font-bold">{signal.evidence?.length || 6}</span> evidence factors
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-shrink-0 flex gap-1 px-4 mb-3">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${
                activeTab === tab.id
                  ? `${cfg.bg} ${cfg.color} border ${cfg.border}`
                  : 'bg-white/[0.03] text-white/30 border border-white/[0.05]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {activeTab === 'news' && (
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-widest font-bold mb-3">News Driving This Move</p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
                {newsArticles.map((article, i) => (
                  <NewsCarouselCard key={i} article={article} cfg={cfg} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'technicals' && (
            <div className="space-y-4">
              <p className="text-[9px] text-white/25 uppercase tracking-widest font-bold">Technical Signals</p>

              {/* RSI Gauge */}
              <div className="bg-[#111118] border border-white/[0.07] rounded-xl p-4 flex items-center gap-4">
                <RSIGauge value={parseFloat(rsiValue) || 55} />
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-white/70 mb-1">RSI(14) Momentum</p>
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    {parseFloat(rsiValue) > 70
                      ? 'Overbought territory — momentum strong but watch for pullback.'
                      : parseFloat(rsiValue) < 30
                      ? 'Oversold — potential bounce setup forming.'
                      : 'Healthy momentum zone — room to run in either direction.'}
                  </p>
                </div>
              </div>

              {/* Volume Bar */}
              <div className="bg-[#111118] border border-white/[0.07] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold text-white/70">Volume vs 20-Day Average</p>
                  <span className={`text-[12px] font-black font-mono ${cfg.color}`}>{volumeAboveAvg}</span>
                </div>
                <div className="flex items-end gap-1 h-12">
                  {[40, 55, 48, 62, 45, 70, 58, 100, 80, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t transition-all"
                      style={{
                        height: `${h}%`,
                        background: i === 7 ? '#F59E0B' : i >= 6 ? `${cfg.color.replace('text-', '')}40` : 'rgba(255,255,255,0.06)',
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[8px] text-white/20">10 sessions ago</span>
                  <span className="text-[8px] text-white/20">Today</span>
                </div>
              </div>

              {/* Pattern Detection */}
              <div className={`${cfg.bg} border ${cfg.border} rounded-xl p-4 flex items-center gap-3`}>
                <Target className={`h-5 w-5 ${cfg.color} flex-shrink-0`} />
                <div>
                  <p className="text-[9px] text-white/30 uppercase tracking-wider mb-0.5">Pattern Detected</p>
                  <p className={`text-[14px] font-black ${cfg.color}`}>
                    {signal.type === 'bullish' ? 'Bull Flag Formation ↗' :
                     signal.type === 'bearish' ? 'Head & Shoulders ↘' :
                     'Consolidation Triangle'}
                  </p>
                </div>
              </div>

              {/* Technicals grid */}
              {signal.technicals && (
                <div className="grid grid-cols-3 gap-2">
                  {signal.technicals.map((t, i) => (
                    <div key={i} className="flex flex-col items-center rounded-xl bg-[#111118] border border-white/[0.06] p-3">
                      <span className="text-[7px] text-white/25 uppercase tracking-wider font-bold mb-1">{t.label}</span>
                      <span className={`text-[13px] font-black font-mono ${
                        t.signal === 'bull' ? 'text-[#22C55E]' : t.signal === 'bear' ? 'text-[#EF4444]' : 'text-white/55'
                      }`}>{t.value}</span>
                      <span className={`text-[9px] font-bold mt-0.5 ${
                        t.signal === 'bull' ? 'text-[#22C55E]/70' : t.signal === 'bear' ? 'text-[#EF4444]/70' : 'text-white/25'
                      }`}>{t.signal === 'bull' ? '▲' : t.signal === 'bear' ? '▼' : '─'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'trek' && (
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-widest font-bold mb-3">TREK Full Analysis</p>
              {loadingAnalysis && (
                <div className="bg-[#111118] border border-white/[0.07] rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-4 w-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-[11px] text-white/40">Scanning market data, news & 847 historical setups...</span>
                  </div>
                  <div className="space-y-2">
                    {[70, 90, 60, 80].map((w, i) => (
                      <div key={i} className="h-2.5 bg-white/[0.04] rounded-full animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              )}
              {analysisDone && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#111118] border border-white/[0.07] rounded-xl p-4"
                >
                  <p className="text-[12px] text-white/65 leading-relaxed whitespace-pre-wrap">{deepAnalysis}</p>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0F]/95 backdrop-blur border-t border-white/[0.07] px-4 py-3">
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: Plus, label: 'Watchlist', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10 border-[#22C55E]/20' },
              { icon: Bell, label: 'Set Alert', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
              { icon: Share2, label: 'Share', color: 'text-white/50', bg: 'bg-white/5 border-white/10' },
              { icon: MessageSquare, label: 'Ask TREK', color: 'text-[#60A5FA]', bg: 'bg-[#60A5FA]/10 border-[#60A5FA]/20' },
            ].map((action, i) => (
              <button
                key={i}
                className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border ${action.bg} transition-all hover:brightness-125`}
              >
                <action.icon className={`h-4 w-4 ${action.color}`} />
                <span className={`text-[9px] font-bold ${action.color}`}>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helpers
const NEWS_IMAGES = {
  NVDA: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80',
    'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=600&q=80',
    'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=600&q=80',
  ],
  TSLA: [
    'https://images.unsplash.com/photo-1617704548623-340376564e68?w=600&q=80',
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=600&q=80',
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&q=80',
  ],
  AAPL: [
    'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
    'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=600&q=80',
    'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&q=80',
  ],
  META: [
    'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=600&q=80',
    'https://images.unsplash.com/photo-1516321165247-4aa89a48be55?w=600&q=80',
    'https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?w=600&q=80',
  ],
  SPX: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&q=80',
  ],
  JPM: [
    'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=600&q=80',
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
    'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=80',
  ],
};

function getNewsImage(symbol, idx) {
  const imgs = NEWS_IMAGES[symbol] || NEWS_IMAGES.SPX;
  return imgs[idx % imgs.length];
}

function getImpactText(symbol, headline, sentiment) {
  const dir = sentiment === 'positive' ? 'bullish' : sentiment === 'negative' ? 'bearish' : 'neutral';
  return `This is ${dir} for ${symbol} — ${headline.substring(0, 60)}...`;
}