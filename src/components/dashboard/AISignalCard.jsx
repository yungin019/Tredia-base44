import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Eye, ChevronRight, Clock, ShieldAlert, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

const SIGNALS = [
  {
    action: 'BUY',
    symbol: 'NVDA',
    message: 'Momentum breakout above $870. RSI 67 + volume 2.4× avg. AI infrastructure demand accelerating.',
    whyNow: 'RSI just broke 60 after 3 weeks of consolidation. Volume 2.4× avg detected in last 2h.',
    confidence: 92,
    expectedMove: '+8.2%',
    timeframe: '2W',
    entry: '871',
    target: '942',
    stop: '848',
    riskPct: '2.6',
    detectedAgo: '7m ago',
    conviction: 'HIGH',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.2)',
    Icon: TrendingUp,
  },
  {
    action: 'WATCH',
    symbol: 'TSLA',
    message: 'Approaching $175 key support. Unusual options activity — 340% above 20-day avg.',
    whyNow: 'Options flow spike detected in last 2 hours. Dark pool prints elevated.',
    confidence: 75,
    expectedMove: '±6.1%',
    timeframe: '1W',
    entry: null,
    target: null,
    stop: null,
    riskPct: '4.8',
    detectedAgo: '19m ago',
    conviction: 'MEDIUM',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
    Icon: Eye,
  },
  {
    action: 'SELL',
    symbol: 'SPX',
    message: 'VIX term structure inversion. 73% probability of elevated volatility next 5 sessions.',
    whyNow: 'VIX term inversion just triggered — first time since October. Historically 73% bearish within 5 sessions.',
    confidence: 78,
    expectedMove: '-2.4%',
    timeframe: '5D',
    entry: '5220',
    target: '5080',
    stop: '5280',
    riskPct: '1.2',
    detectedAgo: '31m ago',
    conviction: 'MEDIUM',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
    Icon: TrendingDown,
  },
];

const CONVICTION_COLORS = {
  HIGH: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
  MEDIUM: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  LOW: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.15)' },
};

export default function AISignalCard() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/80">Live Signals</h3>
          <span className="flex items-center gap-1 text-[8px] font-bold text-chart-3/70 bg-chart-3/10 border border-chart-3/20 rounded-full px-2 py-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
            LIVE
          </span>
        </div>
        <Link to="/AIInsights" className="flex items-center gap-1 text-[10px] font-bold text-primary/70 hover:text-primary transition-colors">
          All signals <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1">
        {SIGNALS.map((s, i) => {
          const cv = CONVICTION_COLORS[s.conviction] || CONVICTION_COLORS.MEDIUM;
          const isOpen = openIdx === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="border-b border-white/[0.04] last:border-0"
              style={{ borderLeft: `3px solid ${s.color}` }}
            >
              {/* Main row */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  {/* Icon */}
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                    <s.Icon className="h-3.5 w-3.5" style={{ color: s.color }} />
                  </div>
                  <span className="text-[13px] font-black font-mono text-white/90">{s.symbol}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider" style={{ color: s.color, background: s.bg, borderColor: s.border }}>
                    {s.action}
                  </span>
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border" style={{ color: cv.color, background: cv.bg, borderColor: cv.border }}>
                    {s.conviction}
                  </span>
                  <span className="text-[10px] font-black font-mono ml-auto" style={{ color: s.color }}>{s.expectedMove}</span>
                </div>

                {/* Why now snippet */}
                <p className="text-[10px] text-white/35 leading-snug mb-2 ml-10">{s.whyNow}</p>

                {/* Bottom row: time + risk + view plan */}
                <div className="flex items-center gap-3 ml-10">
                  <span className="flex items-center gap-1 text-[9px] text-white/20 font-mono">
                    <Clock className="h-2.5 w-2.5" />
                    {s.detectedAgo}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-mono" style={{ color: '#ef4444' }}>
                    <ShieldAlert className="h-2.5 w-2.5" />
                    Risk -{s.riskPct}%
                  </span>
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : i)}
                    className="ml-auto flex items-center gap-1 text-[10px] font-bold rounded-full px-3 py-1 transition-all tap-feedback"
                    style={{
                      color: s.color,
                      background: isOpen ? s.bg : 'transparent',
                      border: `1px solid ${isOpen ? s.border : 'transparent'}`,
                    }}
                  >
                    <Target className="h-3 w-3" />
                    {isOpen ? 'Close' : 'View Plan'}
                  </button>
                </div>
              </div>

              {/* Expandable trade plan */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-4 pb-4">
                      {s.entry && (
                        <div className="grid grid-cols-3 gap-3 p-3 rounded-xl border border-white/[0.07] bg-white/[0.02] mb-2">
                          {[
                            { label: 'Entry', value: `$${s.entry}`, color: 'rgba(255,255,255,0.8)' },
                            { label: 'Target', value: `$${s.target}`, color: '#22c55e' },
                            { label: 'Stop', value: `$${s.stop}`, color: '#ef4444' },
                          ].map(item => (
                            <div key={item.label} className="text-center">
                              <p className="text-[8px] text-white/25 uppercase tracking-wider mb-1">{item.label}</p>
                              <p className="text-[14px] font-mono font-black" style={{ color: item.color }}>{item.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="p-2.5 rounded-lg border border-primary/15 bg-primary/5">
                        <p className="text-[9px] font-bold text-primary/70 uppercase tracking-wider mb-1">⚡ Why Now?</p>
                        <p className="text-[10px] text-white/45 leading-relaxed">{s.whyNow}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}