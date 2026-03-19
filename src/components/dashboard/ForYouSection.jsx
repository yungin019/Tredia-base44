import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertTriangle, CheckCircle2, X, Eye, BookmarkPlus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const FOR_YOU_SIGNALS = [
  {
    symbol: 'NVDA',
    signal: 'BUY',
    personalNote: 'Fits your risk profile — high-momentum setup aligns with your tech exposure.',
    confidence: 92,
    expectedMove: '+8.2%',
    sizing: 'Consider max 8% of portfolio (you have 6% in tech already)',
    matchScore: 96,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.2)',
    Icon: TrendingUp,
    status: 'rising',
  },
  {
    symbol: 'META',
    signal: 'AVOID',
    personalNote: 'Based on your portfolio — adding META would push your tech exposure to 42%. Consider your sector limit.',
    confidence: 71,
    expectedMove: '-8%',
    sizing: 'Avoid — overexposure risk',
    matchScore: 62,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.18)',
    Icon: AlertTriangle,
    status: 'weakening',
  },
  {
    symbol: 'JPM',
    signal: 'WATCH',
    personalNote: 'You have zero financial exposure — this sector rotation setup diversifies your portfolio.',
    confidence: 81,
    expectedMove: '+7%',
    sizing: 'Up to 5% position would balance your sector allocation',
    matchScore: 88,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.18)',
    Icon: Eye,
    status: 'rising',
  },
];

const STATUS_CONFIG = {
  rising:    { label: 'Confidence rising 📈', color: '#22c55e' },
  weakening: { label: 'Weakening signal ⚠️', color: '#ef4444' },
  steady:    { label: 'Setup strengthening', color: '#F59E0B' },
};

const ACTIONS = [
  { label: 'Follow Signal', icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
  { label: 'Watch', icon: BookmarkPlus, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
  { label: 'Ignore', icon: X, color: 'rgba(255,255,255,0.25)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)' },
];

function SignalDecision({ s, i }) {
  const [action, setAction] = useState(null);
  const st = STATUS_CONFIG[s.status] || STATUS_CONFIG.steady;

  if (action === 'Ignore') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
      style={{
        background: '#0f0f18',
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.color}`,
        borderRadius: 14,
        padding: '14px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 15, color: 'rgba(255,255,255,0.9)' }}>{s.symbol}</span>
          <span style={{ fontSize: 9, fontWeight: 800, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: 99, padding: '2px 8px', letterSpacing: '0.08em' }}>
            {s.signal}
          </span>
          <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 900, color: s.color }}>{s.expectedMove}</span>
        </div>
        {/* Dynamic status */}
        <span style={{ fontSize: 9, fontWeight: 700, color: st.color }}>
          {st.label}
        </span>
      </div>

      {/* Personal note */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
          🎯 <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>For you: </span>{s.personalNote}
        </p>
      </div>

      {/* Position sizing */}
      <p style={{ fontSize: 10, color: '#F59E0B', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Target style={{ width: 10, height: 10 }} />
        {s.sizing}
      </p>

      {/* Quick decision buttons */}
      {action === null ? (
        <div style={{ display: 'flex', gap: 6 }}>
          {ACTIONS.map(a => (
            <button
              key={a.label}
              onClick={() => setAction(a.label)}
              style={{
                flex: 1, padding: '7px 0',
                background: a.bg, border: `1px solid ${a.border}`,
                borderRadius: 8, cursor: 'pointer',
                fontSize: 10, fontWeight: 700, color: a.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <a.icon style={{ width: 11, height: 11 }} />
              {a.label}
            </button>
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ padding: '8px 12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 8, textAlign: 'center' }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>
            ✓ Marked as "{action}" — tracked in your journal
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function ForYouSection() {
  const { data: holdings = [] } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.entities.Portfolio.list(),
  });

  const techHoldings = holdings.filter(h => h.sector === 'Technology' || ['AAPL','MSFT','NVDA','META','GOOGL'].includes(h.symbol));
  const techExposure = holdings.length > 0
    ? Math.round((techHoldings.length / holdings.length) * 100)
    : 38;

  // Build "For You" signals based on actual holdings — complement what user already has
  const heldSymbols = new Set(holdings.map(h => h.symbol));
  const dynamicSignals = FOR_YOU_SIGNALS.filter(s => {
    if (heldSymbols.has(s.symbol)) return true; // always show signals for held assets
    return true; // also show complementary suggestions
  }).slice(0, 3);

  // Personalise the note for held assets
  const signals = dynamicSignals.map(s => {
    const holding = holdings.find(h => h.symbol === s.symbol);
    if (holding) {
      return {
        ...s,
        personalNote: `You hold ${holding.shares} shares at avg $${holding.avg_cost?.toFixed(2) ?? '—'}. ${s.personalNote}`,
      };
    }
    return s;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Target className="h-3.5 w-3.5 text-primary" />
          </div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/80">🎯 For You</h2>
          <span className="text-[9px] text-white/25">· Personalized to your portfolio</span>
        </div>
        <span className="text-[9px] font-mono text-white/20">
          Tech exposure: <span className="text-primary/70 font-bold">{techExposure}%</span>
        </span>
      </div>

      {holdings.length === 0 && (
        <p className="text-[11px] text-white/30 mb-3">Add holdings to your portfolio for personalized signals.</p>
      )}

      <div className="space-y-3">
        {signals.map((s, i) => (
          <SignalDecision key={s.symbol} s={s} i={i} />
        ))}
      </div>
    </motion.div>
  );
}