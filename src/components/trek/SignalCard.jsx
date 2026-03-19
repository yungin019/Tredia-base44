import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Eye, Zap, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const SIGNAL_CONFIG = {
  BUY:   { label: 'BUY',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',  icon: TrendingUp },
  SELL:  { label: 'SELL',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',  icon: TrendingDown },
  HOLD:  { label: 'HOLD',  color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.2)', icon: Minus },
  WATCH: { label: 'WATCH', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)', icon: Eye },
};

function BreakdownBar({ label, value }) {
  const color = value >= 75 ? '#22c55e' : value >= 50 ? '#F59E0B' : '#ef4444';
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}>{value}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
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
  const cfg = SIGNAL_CONFIG[signal.signal] || SIGNAL_CONFIG.HOLD;
  const Icon = cfg.icon;

  const glowMap = {
    BUY:   '0 0 20px rgba(34,197,94,0.15)',
    SELL:  '0 0 20px rgba(239,68,68,0.15)',
    WATCH: '0 0 20px rgba(245,158,11,0.15)',
    HOLD:  'none',
  };
  const leftBorderMap = {
    BUY:   '#22c55e',
    SELL:  '#ef4444',
    WATCH: '#F59E0B',
    HOLD:  'rgba(255,255,255,0.1)',
  };
  const microCopyMap = {
    BUY:   'Momentum building',
    SELL:  'Risk increasing',
    WATCH: 'Breakout forming',
    HOLD:  'Consolidating',
  };

  return (
    <div
      style={{
        background: '#111118',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: `3px solid ${leftBorderMap[signal.signal] || leftBorderMap.HOLD}`,
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        boxShadow: glowMap[signal.signal] || 'none',
      }}
    >
      {/* Top row: symbol + badges + signal badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 18, color: 'rgba(255,255,255,0.95)' }}>
            {signal.symbol}
          </span>
          {signal.jumpDetected && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, color: '#F59E0B', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 99, padding: '2px 8px', letterSpacing: '0.08em' }}>
              <Zap style={{ width: 9, height: 9 }} /> JUMP
            </span>
          )}
          {signal.lossDetected && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 99, padding: '2px 8px', letterSpacing: '0.08em' }}>
              <AlertTriangle style={{ width: 9, height: 9 }} /> RISK
            </span>
          )}
        </div>
        {/* Signal badge (large) + confidence big number */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 99, padding: '5px 12px', whiteSpace: 'nowrap', letterSpacing: '0.07em' }}>
            <Icon style={{ width: 12, height: 12 }} />
            {cfg.label}
          </span>
          <span style={{ fontSize: 22, fontFamily: 'monospace', fontWeight: 900, color: cfg.color, lineHeight: 1 }}>
            {signal.confidence}%
          </span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>confidence</span>
        </div>
      </div>

      {/* Title */}
      {signal.title && (
        <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: 4, lineHeight: 1.4 }}>
          {signal.title}
        </p>
      )}

      {/* One-liner */}
      {signal.oneLiner && (
        <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.35)', marginBottom: 8, lineHeight: 1.5 }}>
          {signal.oneLiner}
        </p>
      )}

      {/* Expected move + timeframe + LIVE badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
        {signal.expectedMove && (
          <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: signal.signal === 'SELL' ? '#ef4444' : '#22c55e' }}>
            {signal.expectedMove}
          </span>
        )}
        {signal.timeframe && (
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: '2px 6px' }}>{signal.timeframe}</span>
        )}
        {/* LIVE badge */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 99, padding: '2px 8px', marginLeft: 'auto' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
          LIVE · {signal.time || 'just now'}
        </span>
      </div>

      {/* Micro copy */}
      <p style={{ fontSize: 10, color: cfg.color, fontWeight: 600, opacity: 0.7, marginBottom: 10, letterSpacing: '0.05em' }}>
        {microCopyMap[signal.signal] || ''}
      </p>

      {/* Confidence bar (signal color) */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${signal.confidence}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{ height: '100%', background: cfg.color, borderRadius: 99, opacity: 0.6 }}
          />
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          padding: '8px 0', marginTop: 2, borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'none', border: 'none', borderRadius: 0, cursor: 'pointer',
          fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(245,158,11,0.7)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
      >
        {expanded ? <><ChevronUp style={{ width: 12, height: 12 }} /> Hide Details</> : <><ChevronDown style={{ width: 12, height: 12 }} /> Show Details</>}
      </button>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* Confidence breakdown bars */}
              {signal.confidence_breakdown && (
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Confidence Breakdown</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <BreakdownBar label="Technical" value={signal.confidence_breakdown.technical ?? 0} />
                    <BreakdownBar label="Sentiment" value={signal.confidence_breakdown.sentiment ?? 0} />
                    <BreakdownBar label="Volume"    value={signal.confidence_breakdown.volume ?? 0} />
                    <BreakdownBar label="Macro"     value={signal.confidence_breakdown.macro ?? 0} />
                  </div>
                </div>
              )}

              {/* Technical summary */}
              {signal.technicalSummary && (
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Technical Summary</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', lineHeight: 1.55 }}>{signal.technicalSummary}</p>
                </div>
              )}

              {/* Why Buy */}
              {signal.whyBuy?.length > 0 && (
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(34,197,94,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Why Buy</p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {signal.whyBuy.map((r, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                        <span style={{ color: '#22c55e', fontWeight: 800, marginTop: 1 }}>+</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Why Sell */}
              {signal.whySell?.length > 0 && (
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(239,68,68,0.6)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Why Sell / Risks</p>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {signal.whySell.map((r, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.4 }}>
                        <span style={{ color: '#ef4444', fontWeight: 800, marginTop: 1 }}>−</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Trade Plan */}
              {(signal.entry || signal.target || signal.stopLoss) && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Trade Plan</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                    {signal.entry && (
                      <div>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Entry</span>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 800, color: 'rgba(255,255,255,0.75)' }}>${signal.entry}</span>
                      </div>
                    )}
                    {signal.target && (
                      <div>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Target</span>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 800, color: '#22c55e' }}>${signal.target}</span>
                      </div>
                    )}
                    {signal.stopLoss && (
                      <div>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Stop Loss</span>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 800, color: '#ef4444' }}>${signal.stopLoss}</span>
                      </div>
                    )}
                    {signal.riskLevel && (
                      <div>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>Risk</span>
                        <span style={{ fontSize: 11, fontWeight: 800, color: signal.riskLevel === 'Low' ? '#22c55e' : signal.riskLevel === 'High' ? '#ef4444' : '#F59E0B' }}>{signal.riskLevel}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Jump reason */}
              {signal.jumpReason && (
                <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>⚡ Jump Signal</p>
                  <p style={{ fontSize: 11, color: 'rgba(245,158,11,0.75)', lineHeight: 1.5 }}>{signal.jumpReason}</p>
                </div>
              )}

              {/* Loss reason */}
              {signal.lossReason && (
                <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>⚠ Risk Alert</p>
                  <p style={{ fontSize: 11, color: 'rgba(239,68,68,0.7)', lineHeight: 1.5 }}>{signal.lossReason}</p>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}