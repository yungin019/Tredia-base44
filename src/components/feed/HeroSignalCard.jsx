import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Clock, Zap } from 'lucide-react';
import { calculateSignalStrength, getSignalColor } from '@/lib/signalStrength';

const SIGNAL_CFG = {
  bullish: { label: 'BULLISH', Icon: TrendingUp },
  bearish: { label: 'BEARISH', Icon: TrendingDown },
  neutral: { label: 'NEUTRAL', Icon: Minus },
  wait:    { label: 'WAIT',    Icon: Clock },
};

export default function HeroSignalCard({ signal, index = 0 }) {
  if (!signal) return null;

  const dir = (signal.direction || 'neutral').toLowerCase();
  const cfg = SIGNAL_CFG[dir] || SIGNAL_CFG.neutral;
  const strength = calculateSignalStrength(signal);
  const color = getSignalColor(signal.direction);
  const Icon = cfg.Icon;

  // Hero card: strongest visual presence
  const glowStyle = {
    boxShadow: `
      0 0 ${strength.glowSize} ${strength.glow},
      0 0 ${strength.glowSize} ${color}30,
      ${strength.level === 'STRONG' ? `0 12px 40px ${color}25` : `0 8px 20px ${color}15`}
    `,
    border: `${strength.borderWidth} solid ${color}${strength.level === 'STRONG' ? 'cc' : '66'}`,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-3xl overflow-hidden cursor-pointer group"
      style={{
        opacity: strength.opacity,
        transform: `scale(${strength.scale})`,
        transformOrigin: 'center',
      }}
    >
      {/* Accent stripe */}
      <div style={{
        height: 4,
        background: `linear-gradient(90deg, ${color}ff 0%, ${color}44 60%, transparent 100%)`,
      }} />

      {/* CARD BODY */}
      <div
        className="p-6 space-y-4"
        style={{
          background: 'rgba(12, 26, 62, 0.85)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          ...glowStyle,
        }}
      >
        {/* ═══════════════════════════════════════ */}
        {/* LINE 1: SIGNAL — MARKET STATE (HERO) */}
        {/* ═══════════════════════════════════════ */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <span
            className="font-black tracking-widest text-lg md:text-xl"
            style={{
              color,
              letterSpacing: '0.04em',
              fontFamily: 'monospace',
              fontSize: strength.level === 'STRONG' ? '1.5rem' : '1.25rem',
            }}
          >
            {cfg.label}
          </span>
          <span className="text-sm md:text-base font-bold text-white/90" style={{ letterSpacing: '-0.01em' }}>
            — {signal.marketState}
          </span>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* LINE 2: ⚡ ACTION (UPPERCASE, DOMINANT) */}
        {/* ═══════════════════════════════════════ */}
        <div
          className="flex items-center gap-2 p-3 rounded-lg"
          style={{
            background: `${color}12`,
            borderLeft: `3px solid ${color}`,
          }}
        >
          <Zap className="h-5 w-5 flex-shrink-0" style={{ color }} />
          <p className="font-black text-sm md:text-base leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
            {signal.actionBias || 'NO ACTION YET'}
          </p>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* LINES 3–4: DRIVER + IMPACT (muted) */}
        {/* ═══════════════════════════════════════ */}
        <div className="space-y-2 pt-1 text-xs md:text-sm" style={{ color: 'rgba(200,225,255,0.5)' }}>
          <div className="flex gap-2">
            <span className="flex-shrink-0 font-mono">→</span>
            <span>{signal.driver || 'Multiple factors aligning'}</span>
          </div>
          <div className="flex gap-2">
            <span className="flex-shrink-0 font-mono">→</span>
            <span>{signal.impactText || 'Cross-market spillovers'}</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* LINE 5: ⚠ RISK */}
        {/* ═══════════════════════════════════════ */}
        <div className="flex gap-2 p-3 rounded-lg bg-red-500/5" style={{ borderLeft: '3px solid rgba(239,68,68,0.5)' }}>
          <span className="text-lg flex-shrink-0">⚠</span>
          <p className="text-xs md:text-sm leading-tight" style={{ color: 'rgba(252,165,165,0.7)' }}>
            {signal.riskInvalidation || 'Sentiment reversal'}
          </p>
        </div>

        {/* Confidence badge */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
            Strength
          </span>
          <span
            className="font-mono font-black px-2.5 py-1 rounded text-xs"
            style={{
              background: strength.level === 'STRONG' ? 'rgba(14,200,220,0.15)' : 'rgba(14,200,220,0.06)',
              color: strength.level === 'STRONG' ? '#7ee8f0' : 'rgba(14,200,220,0.5)',
              border: `1px solid ${strength.level === 'STRONG' ? 'rgba(14,200,220,0.3)' : 'rgba(14,200,220,0.1)'}`,
            }}
          >
            {strength.level}
          </span>
          {strength.pulse && (
            <div
              className="ml-auto h-2 w-2 rounded-full animate-pulse"
              style={{ background: color, boxShadow: `0 0 8px ${color}` }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}