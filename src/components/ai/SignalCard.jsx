import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Brain, Newspaper, BarChart2,
  Activity, AlertCircle, TrendingUp, TrendingDown,
  Loader2, Zap, Eye, Target, ShieldAlert
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import SignalDetailModal from './SignalDetailModal';
import ConfidenceBreakdownModal from './ConfidenceBreakdownModal';

const typeConfig = {
  bullish: { label: 'BULLISH',  header: '🚀 NEXT JUMP DETECTED',     color: 'text-chart-3',     bg: 'bg-chart-3/8',     border: 'border-chart-3/15',     bar: 'bg-chart-3',     glow: 'shadow-[0_0_20px_rgba(34,197,94,0.08)]' },
  alert:   { label: 'ALERT',   header: '⚡ CATALYST ALERT',          color: 'text-primary',     bg: 'bg-primary/8',     border: 'border-primary/15',     bar: 'bg-primary',     glow: 'shadow-[0_0_20px_rgba(245,158,11,0.08)]' },
  hedge:   { label: 'HEDGE',   header: '🛡️ HEDGE SIGNAL',            color: 'text-chart-2',     bg: 'bg-chart-2/8',     border: 'border-chart-2/15',     bar: 'bg-chart-2',     glow: 'shadow-[0_0_20px_rgba(96,165,250,0.08)]' },
  bearish: { label: 'BEARISH', header: '📉 LOSS RISK DETECTED',      color: 'text-destructive', bg: 'bg-destructive/8', border: 'border-destructive/15', bar: 'bg-destructive', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.08)]' },
};

function EvidencePillar({ label, value, score, color }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="text-[9px] text-white/35 uppercase tracking-wider font-semibold">{label}</span>
        <span className={`text-[9px] font-mono font-bold ${color}`}>{value}</span>
      </div>
      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color.replace('text-', 'bg-')}`}
        />
      </div>
    </div>
  );
}

function NewsItem({ headline, source, sentiment }) {
  const sentColor = sentiment === 'positive' ? 'text-chart-3' : sentiment === 'negative' ? 'text-destructive' : 'text-white/35';
  const sentDot = sentiment === 'positive' ? 'bg-chart-3' : sentiment === 'negative' ? 'bg-destructive' : 'bg-white/30';
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-white/[0.04] last:border-0">
      <div className={`h-1.5 w-1.5 rounded-full ${sentDot} mt-1.5 flex-shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-white/55 leading-snug">{headline}</p>
        <span className={`text-[8px] font-bold uppercase tracking-wider ${sentColor}`}>{source}</span>
      </div>
    </div>
  );
}

function AIDeepDive({ signal, cfg }) {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const generate = async () => {
    if (done) return;
    setLoading(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are TREDIA AI — elite institutional trading intelligence.
Signal: ${signal.symbol} — ${signal.title} (${signal.type.toUpperCase()}, ${signal.confidence}% confidence)
Context: ${signal.message}

Write a precise 3-paragraph deep-dive analysis explaining WHY this signal matters RIGHT NOW:
1. The technical setup (price action, indicators, key levels)
2. The fundamental / macro catalyst driving this
3. The specific risk factors and what would invalidate this signal

Use precise numbers, price levels, and probabilities. Be direct. Under 220 words total.`,
      add_context_from_internet: true,
    });
    setAnalysis(result);
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">AI Deep-Dive Analysis</span>
      </div>
      {!done && !loading && (
        <button
          onClick={generate}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border ${cfg.border} ${cfg.bg} hover:brightness-125 transition-all`}
        >
          <Zap className={`h-3.5 w-3.5 ${cfg.color}`} />
          <span className={`text-[10px] font-bold ${cfg.color}`}>Generate Full Analysis</span>
        </button>
      )}
      {loading && (
        <div className="flex items-center gap-2.5 py-3">
          <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
          <span className="text-[10px] text-white/30">Scanning market data, news &amp; technicals...</span>
          <div className="flex gap-1 ml-auto">
            {[0,1,2,3].map(i => (
              <div key={i} className="h-0.5 w-3 bg-primary/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3"
        >
          <p className="text-[11px] text-white/60 leading-relaxed whitespace-pre-wrap">{analysis}</p>
        </motion.div>
      )}
    </div>
  );
}

export default function SignalCard({ signal, index }) {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);
  const cfg = typeConfig[signal.type];
  const isNew = index < 2;

  return (
    <>
      {showModal && <SignalDetailModal signal={signal} cfg={cfg} onClose={() => setShowModal(false)} />}
      {showConfidence && <ConfidenceBreakdownModal confidence={signal.confidence} symbol={signal.symbol} onClose={() => setShowConfidence(false)} />}

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07 }}
        className={`rounded-xl border bg-[#0e0e16] overflow-hidden transition-all duration-300 ${
          expanded
            ? `border-white/[0.14] ${cfg.glow}`
            : isNew
            ? `border-primary/30 ${cfg.glow}`
            : 'border-white/[0.07] hover:border-white/[0.11]'
        }`}
      >
        {isNew && (
          <div className="flex items-center gap-1.5 px-4 pt-2.5">
            <div className="h-1.5 w-1.5 rounded-full bg-primary live-pulse" />
            <span className="text-[8px] font-black text-primary/70 uppercase tracking-widest">
              LIVE — detected {index === 0 ? '4' : '9'} minutes ago
            </span>
          </div>
        )}

        {/* Colored top strip */}
        <div className={`${cfg.bar} opacity-60 transition-all duration-300 ${expanded ? 'h-[3px]' : 'h-[2px]'}`} />

        {/* Collapsed header */}
        <div
          className="p-4 cursor-pointer select-none"
          onClick={() => setExpanded(e => !e)}
        >
          {/* Detection header */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[10px] font-black tracking-widest uppercase ${cfg.color}`}>{cfg.header}</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-white/30">{signal.time}</span>
              {expanded
                ? <ChevronUp className={`h-3.5 w-3.5 ${cfg.color} opacity-70`} />
                : <ChevronDown className="h-3.5 w-3.5 text-white/20" />
              }
            </div>
          </div>

          {/* Ticker row */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`h-9 w-9 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
              <signal.icon className={`h-4 w-4 ${cfg.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black font-mono text-[18px] text-white/95 leading-none">{signal.symbol}</span>
                <span className="text-white/20 text-[12px]">·</span>
                <span className={`text-[13px] font-black font-mono ${cfg.color}`}>
                  {signal.expectedPct > 0 ? '+' : ''}{signal.expectedPct ?? (signal.confidence * 0.18 | 0)}%
                </span>
                <span className="text-white/20 text-[12px]">·</span>
                <span className="text-[11px] font-mono text-white/40">{signal.expectedDays || '7-14d'}</span>
                <span className={`text-[8px] px-1.5 py-0.5 rounded font-black tracking-widest ${cfg.bg} ${cfg.color} border ${cfg.border} ml-1`}>
                  {signal.sector}
                </span>
              </div>
              <p className="text-[10px] text-white/40 mt-0.5 truncate">{signal.title}</p>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-white/25 uppercase tracking-wider font-semibold">AI Confidence</span>
              <button
                onClick={e => { e.stopPropagation(); setShowConfidence(true); }}
                className="text-[10px] font-mono font-black text-primary hover:opacity-70 transition-opacity"
              >
                {signal.confidence}% &rsaquo;
              </button>
            </div>
            <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${signal.confidence}%` }}
                transition={{ delay: index * 0.07 + 0.3, duration: 0.9, ease: 'easeOut' }}
                className="h-full bg-primary rounded-full"
                style={{ boxShadow: '0 0 8px rgba(245,158,11,0.5)' }}
              />
            </div>
          </div>

          {/* Portfolio impact + SEE WHY */}
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-white/[0.03] border border-white/[0.05] rounded-lg px-2.5 py-1.5">
              <span className="text-[8px] text-white/25">Portfolio impact: </span>
              <span className={`text-[10px] font-black font-mono ${signal.type === 'bearish' ? 'text-[#EF4444]' : 'text-primary'}`}>
                {signal.type === 'bearish' ? '-$840' : '+$1,240'}
              </span>
            </div>
            <button
              onClick={e => { e.stopPropagation(); setShowModal(true); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${cfg.border} ${cfg.bg} hover:brightness-125 transition-all`}
            >
              <Eye className={`h-3 w-3 ${cfg.color}`} />
              <span className={`text-[9px] font-black ${cfg.color} whitespace-nowrap`}>SEE WHY</span>
            </button>
          </div>
        </div>

        {/* Expanded panel */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-5 space-y-5 border-t border-white/[0.05]">

                <div className="pt-4">
                  <p className="text-[11px] text-white/55 leading-relaxed">{signal.message}</p>
                </div>

                {signal.targets && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Target className={`h-3 w-3 ${cfg.color}`} />
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Price Levels</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {signal.targets.map((tgt, i) => (
                        <div key={i} className={`rounded-lg ${cfg.bg} border ${cfg.border} p-2.5 flex flex-col`}>
                          <span className="text-[8px] text-white/30 uppercase tracking-wider font-semibold">{tgt.label}</span>
                          <span className={`text-[13px] font-black font-mono mt-0.5 ${cfg.color}`}>{tgt.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {signal.evidence && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <BarChart2 className={`h-3 w-3 ${cfg.color}`} />
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Evidence Factors</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
                      {signal.evidence.map((e, i) => (
                        <EvidencePillar key={i} {...e} color={cfg.color} />
                      ))}
                    </div>
                  </div>
                )}

                {signal.risks && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldAlert className="h-3 w-3 text-destructive/70" />
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Risk Factors</span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {signal.risks.map((r, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertCircle className="h-3 w-3 text-destructive/50 flex-shrink-0 mt-0.5" />
                          <span className="text-[10px] text-white/40 leading-snug">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {signal.news && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Newspaper className={`h-3 w-3 ${cfg.color}`} />
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">News Context</span>
                    </div>
                    <div className="rounded-lg bg-white/[0.02] border border-white/[0.05] px-3 py-1">
                      {signal.news.map((n, i) => <NewsItem key={i} {...n} />)}
                    </div>
                  </div>
                )}

                {signal.technicals && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Activity className={`h-3 w-3 ${cfg.color}`} />
                      <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Technical Snapshot</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {signal.technicals.map((t, i) => (
                        <div key={i} className="flex flex-col items-center rounded-lg bg-white/[0.03] border border-white/[0.05] p-2">
                          <span className="text-[7px] text-white/25 uppercase tracking-wider font-bold">{t.label}</span>
                          <span className={`text-[11px] font-black font-mono mt-0.5 ${
                            t.signal === 'bull' ? 'text-chart-3' : t.signal === 'bear' ? 'text-destructive' : 'text-white/55'
                          }`}>{t.value}</span>
                          <span className={`text-[7px] font-bold mt-0.5 ${
                            t.signal === 'bull' ? 'text-chart-3/70' : t.signal === 'bear' ? 'text-destructive/70' : 'text-white/25'
                          }`}>{t.signal === 'bull' ? '▲' : t.signal === 'bear' ? '▼' : '─'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <AIDeepDive signal={signal} cfg={cfg} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}