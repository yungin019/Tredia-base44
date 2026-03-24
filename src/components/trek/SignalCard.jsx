import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Clock, Zap, ShieldAlert, Target, ChevronDown, ChevronUp } from 'lucide-react';

// ── SIGNAL CONFIG ─────────────────────────────────────────────────────────
const SIGNAL_CFG = {
  BUY:   { label: 'BULLISH', color: '#0ec8dc', bg: 'rgba(14,200,220,0.12)',   border: 'rgba(14,200,220,0.3)',  Icon: TrendingUp },
  SELL:  { label: 'BEARISH', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)',   Icon: TrendingDown },
  HOLD:  { label: 'NEUTRAL', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',   border: 'rgba(245,158,11,0.3)',  Icon: Minus },
  WATCH: { label: 'WAIT',    color: '#6b7280', bg: 'rgba(107,114,128,0.1)',   border: 'rgba(107,114,128,0.25)', Icon: Clock },
};

function getConviction(confidence) {
  if (confidence >= 82) return 'HIGH';
  if (confidence >= 65) return 'MEDIUM';
  return 'LOW';
}

function getRiskPct(signal) {
  if (signal.entry && signal.stopLoss) {
    const entry = parseFloat(signal.entry);
    const stop = parseFloat(signal.stopLoss);
    if (!isNaN(entry) && !isNaN(stop) && entry > 0) {
      return Math.abs(((stop - entry) / entry) * 100).toFixed(1);
    }
  }
  return signal.signal === 'BUY' ? '3.2' : signal.signal === 'SELL' ? '4.1' : '2.5';
}

function BreakdownBar({ label, value }) {
  const color = value >= 75 ? '#0ec8dc' : value >= 50 ? '#F59E0B' : '#ef4444';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color, fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ height: '100%', background: color, borderRadius: 99 }}
        />
      </div>
    </div>
  );
}

export default function SignalCard({ signal }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SIGNAL_CFG[signal.signal] || SIGNAL_CFG.HOLD;
  const color = cfg.color;
  const bg = cfg.bg;
  const border = cfg.border;
  const Icon = cfg.Icon;
  const conviction = getConviction(signal.confidence);
  const riskPct = getRiskPct(signal);
  const isFresh = signal.detectedMinsAgo <= 15 || signal.time?.includes('m') || signal.time === 'live';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(8, 18, 42, 0.70)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: `1px solid ${isFresh && conviction === 'HIGH' ? color + '40' : 'rgba(100,220,255,0.09)'}`,
        boxShadow: isFresh && conviction === 'HIGH' ? `0 0 24px ${color}14` : 'none',
      }}
    >
      {/* accent line */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${color}88 0%, ${color}20 60%, transparent 100%)` }} />

      {/* ── SYMBOL — SIGNAL + CONFIDENCE ──────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* SYMBOL — SIGNAL */}
          <h3 style={{ fontSize: 16, fontWeight: 900, color: 'rgba(255,255,255,0.97)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            <span className="font-mono">{signal.symbol}</span>
            {' — '}
            <span style={{ color }}>
              {cfg.label}
            </span>
          </h3>
          {/* Confidence */}
          <span style={{ fontSize: 18, fontFamily: 'monospace', fontWeight: 900, color, lineHeight: 1, flexShrink: 0 }}>
            {signal.confidence}%
          </span>
        </div>
        
        {/* Confidence bar */}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${signal.confidence}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: color, borderRadius: 99, opacity: 0.75 }}
          />
        </div>
      </div>

      {/* ── ACTION (2nd visible line) ─────────────────────── */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: `${color}06` }}>
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 flex-shrink-0" style={{ color }} />
          <p className="text-sm font-black uppercase tracking-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
            {signal.signal === 'BUY' ? 'BUY ABOVE BREAKOUT' :
             signal.signal === 'SELL' ? 'SELL / SHORT BELOW' :
             signal.signal === 'WATCH' ? 'MONITOR — WAIT' :
             'HOLD POSITION'}
          </p>
        </div>
      </div>

      {/* ── DRIVER (why now, secondary) ────────────────── */}
      {(signal.oneLiner || signal.technicalSummary) && (
        <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
          <div className="flex items-start gap-2">
            <span className="text-[9px] text-white/20 font-mono mt-0.5 flex-shrink-0">→</span>
            <p className="text-[10px] leading-tight" style={{ color: 'rgba(200,225,255,0.4)' }}>
              {signal.oneLiner || (signal.technicalSummary?.split('.')[0] + '.')}
            </p>
          </div>
        </div>
      )}

      {/* ── RISK ──────────────────────────────────────────── */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: 'rgba(239,68,68,0.04)' }}>
        <div className="flex items-start gap-2">
          <span className="text-[9px] flex-shrink-0">⚠</span>
          <p className="text-[10px] leading-tight" style={{ color: 'rgba(252,165,165,0.7)' }}>
            -{riskPct}% if breaks
            {signal.lossReason ? `: ${signal.lossReason}` : ''}
          </p>
        </div>
      </div>

      {/* ── EXPAND: full trade plan ───────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            {(signal.entry || signal.target || signal.stopLoss) && (
              <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(100,220,255,0.06)' }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Trade Plan</p>
                <div className="grid grid-cols-2 gap-3">
                  {signal.entry && <div><span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Entry</span><span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: 'rgba(255,255,255,0.8)' }}>${signal.entry}</span></div>}
                  {signal.target && <div><span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Target</span><span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: '#0ec8dc' }}>${signal.target}</span></div>}
                  {signal.stopLoss && <div><span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Stop</span><span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: '#ef4444' }}>${signal.stopLoss}</span></div>}
                  {signal.timeframe && <div><span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Hold</span><span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: '#F59E0B' }}>{signal.timeframe}</span></div>}
                </div>
              </div>
            )}

            {signal.confidence_breakdown && (
              <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(100,220,255,0.06)' }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-2.5" style={{ color: 'rgba(255,255,255,0.25)' }}>Signal Breakdown</p>
                <div className="flex flex-col gap-2">
                  <BreakdownBar label="Technical" value={signal.confidence_breakdown.technical ?? 0} />
                  <BreakdownBar label="Sentiment" value={signal.confidence_breakdown.sentiment ?? 0} />
                  <BreakdownBar label="Volume"    value={signal.confidence_breakdown.volume ?? 0} />
                  <BreakdownBar label="Macro"     value={signal.confidence_breakdown.macro ?? 0} />
                </div>
              </div>
            )}

            {signal.jumpReason && (
              <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: 'rgba(245,158,11,0.04)' }}>
                <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: '#F59E0B' }}>⚡ Jump Signal</p>
                <p className="text-xs leading-relaxed" style={{ color: 'rgba(245,158,11,0.65)' }}>{signal.jumpReason}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER toggle ────────────────────────────────── */}
      <div
        className="px-4 py-2 flex items-center justify-between cursor-pointer"
        style={{ borderTop: '1px solid rgba(100,220,255,0.06)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <span style={{ fontSize: 9, color: 'rgba(100,220,255,0.3)', fontWeight: 700, letterSpacing: '0.06em' }}>
          {conviction} CONVICTION
        </span>
        <div className="flex items-center gap-1" style={{ color: 'rgba(100,220,255,0.3)' }}>
          <span className="text-[9px]">{expanded ? 'Hide plan' : 'View plan'}</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </div>
      </div>
    </div>
  );
}