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
  const { color, bg, border, Icon } = cfg;
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

      {/* ── TOP: symbol + signal + confidence ───────────────── */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Left: signal badge + symbol */}
          <div className="flex flex-col gap-1.5">
            <span
              className="inline-flex items-center gap-1.5 font-black tracking-widest rounded-full self-start"
              style={{ fontSize: 10, color, background: bg, border: `1px solid ${border}`, padding: '3px 10px', letterSpacing: '0.12em' }}
            >
              <Icon style={{ width: 10, height: 10 }} />
              {cfg.label}
            </span>
            <span style={{ fontSize: 22, fontFamily: 'monospace', fontWeight: 900, color: 'rgba(255,255,255,0.95)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {signal.symbol}
            </span>
            {signal.title && (
              <p style={{ fontSize: 11, color: 'rgba(200,225,255,0.55)', lineHeight: 1.35, marginTop: 2 }}>{signal.title}</p>
            )}
          </div>

          {/* Right: confidence */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span style={{ fontSize: 26, fontFamily: 'monospace', fontWeight: 900, color, lineHeight: 1 }}>
              {signal.confidence}%
            </span>
            <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>confidence</span>
            {isFresh && (
              <span style={{ fontSize: 8, fontWeight: 700, color: '#0ec8dc', background: 'rgba(14,200,220,0.1)', border: '1px solid rgba(14,200,220,0.2)', borderRadius: 99, padding: '1px 7px' }}>
                LIVE
              </span>
            )}
          </div>
        </div>

        {/* Confidence bar */}
        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginTop: 12 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${signal.confidence}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: color, borderRadius: 99, opacity: 0.75 }}
          />
        </div>
      </div>

      {/* ── DRIVER line (why now) ─────────────────────────── */}
      {(signal.oneLiner || signal.technicalSummary) && (
        <div className="px-4 pb-3" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', paddingTop: 10 }}>
          <div className="flex items-start gap-2">
            <span className="text-[10px] text-white/30 font-mono mt-0.5 flex-shrink-0">→</span>
            <p className="text-xs leading-snug" style={{ color: 'rgba(200,225,255,0.6)' }}>
              {signal.oneLiner || (signal.technicalSummary?.split('.')[0] + '.')}
            </p>
          </div>
        </div>
      )}

      {/* ── ACTION + RISK ─────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(100,220,255,0.06)' }}>
        {/* Action */}
        <div className="px-4 py-2.5 flex items-start gap-2" style={{ background: `${color}08` }}>
          <Zap className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" style={{ color }} />
          <p className="text-xs font-bold leading-snug" style={{ color: 'rgba(255,255,255,0.9)' }}>
            <span style={{ color }}>Action: </span>
            {signal.signal === 'BUY' ? `Buy above $${signal.entry || 'breakout'}` :
             signal.signal === 'SELL' ? `Exit / short below $${signal.stopLoss || 'breakdown'}` :
             signal.signal === 'WATCH' ? 'Monitor — no entry yet' :
             'Hold current position'}
          </p>
        </div>
        {/* Risk */}
        <div className="px-4 py-2.5 flex items-start gap-2" style={{ borderTop: '1px solid rgba(239,68,68,0.08)', background: 'rgba(239,68,68,0.04)' }}>
          <ShieldAlert className="h-3 w-3 flex-shrink-0 mt-0.5" style={{ color: '#f87171' }} />
          <p className="text-xs leading-snug" style={{ color: 'rgba(252,165,165,0.7)' }}>
            <span className="font-bold" style={{ color: 'rgba(248,113,113,0.85)' }}>Risk: </span>
            -{riskPct}% if support breaks
            {signal.lossReason ? ` — ${signal.lossReason}` : ''}
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