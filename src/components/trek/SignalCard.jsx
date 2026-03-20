import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Eye, Zap, Clock, ShieldAlert, Target } from 'lucide-react';

const SIGNAL_CONFIG = {
  BUY:   { label: 'BUY',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)',  icon: TrendingUp },
  SELL:  { label: 'SELL',  color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',  icon: TrendingDown },
  HOLD:  { label: 'HOLD',  color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.2)', icon: Minus },
  WATCH: { label: 'WATCH', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)', icon: Eye },
};

const CONVICTION_CONFIG = {
  HIGH:   { label: 'HIGH',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.25)' },
  MEDIUM: { label: 'MEDIUM', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  LOW:    { label: 'LOW',    color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' },
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
  if (signal.signal === 'BUY') return '3.2';
  if (signal.signal === 'SELL') return '4.1';
  return '2.5';
}

function BreakdownBar({ label, value }) {
  const color = value >= 75 ? '#22c55e' : value >= 50 ? '#F59E0B' : '#ef4444';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
  const cfg = SIGNAL_CONFIG[signal.signal] || SIGNAL_CONFIG.HOLD;
  const Icon = cfg.icon;
  const conviction = getConviction(signal.confidence);
  const cvCfg = CONVICTION_CONFIG[conviction];
  const riskPct = getRiskPct(signal);
  const isFresh = signal.detectedMinsAgo <= 15 || signal.time?.includes('m') || signal.time === 'live';

  const glowMap = {
    BUY:   '0 0 20px rgba(34,197,94,0.12)',
    SELL:  '0 0 20px rgba(239,68,68,0.12)',
    WATCH: '0 0 20px rgba(245,158,11,0.12)',
    HOLD:  'none',
  };

  // Pulsing border for fresh signals
  const borderStyle = isFresh && conviction === 'HIGH'
    ? `2px solid ${cfg.color}`
    : `1px solid rgba(255,255,255,0.08)`;

  return (
    <div
      style={{
        background: '#111118',
        border: borderStyle,
        borderLeft: `3px solid ${cfg.color}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: glowMap[signal.signal] || 'none',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s, border-color 0.2s',
      }}
    >
      {/* Fresh pulse overlay */}
      {isFresh && (
        <motion.div
          animate={{ opacity: [0, 0.04, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{ position: 'absolute', inset: 0, background: cfg.color, borderRadius: 16, pointerEvents: 'none' }}
        />
      )}

      {/* TOP ROW: Symbol + badges + conviction */}
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
          {isFresh && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 8, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 99, padding: '1px 6px' }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} className="live-pulse" />
              NEW
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 800, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 99, padding: '5px 12px', whiteSpace: 'nowrap', letterSpacing: '0.07em' }}>
            <Icon style={{ width: 12, height: 12 }} />
            {cfg.label}
          </span>
          {/* Conviction badge */}
          <span style={{ fontSize: 8, fontWeight: 800, color: cvCfg.color, background: cvCfg.bg, border: `1px solid ${cvCfg.border}`, borderRadius: 99, padding: '2px 8px', letterSpacing: '0.1em' }}>
            {conviction} CONVICTION
          </span>
        </div>
      </div>

      {/* Confidence big number */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6 }}>
        <span style={{ fontSize: 26, fontFamily: 'monospace', fontWeight: 900, color: cfg.color, lineHeight: 1 }}>
          {signal.confidence}%
        </span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>confidence</span>
        {signal.expectedMove && (
          <span style={{ marginLeft: 'auto', fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: signal.signal === 'SELL' ? '#ef4444' : '#22c55e' }}>
            {signal.expectedMove}
          </span>
        )}
      </div>

      {/* Confidence bar */}
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${signal.confidence}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ height: '100%', background: cfg.color, borderRadius: 99, opacity: 0.7 }}
        />
      </div>

      {/* Title */}
      {signal.title && (
        <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 6, lineHeight: 1.4 }}>
          {signal.title}
        </p>
      )}

      {/* LIVE + time detected */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 9, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 99, padding: '2px 8px' }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} className="live-pulse" />
          LIVE
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
          <Clock style={{ width: 9, height: 9 }} />
          Detected {signal.time || 'just now'}
        </span>
        {signal.timeframe && (
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '2px 6px' }}>{signal.timeframe}</span>
        )}
        {/* Momentum micro-copy */}
        <span style={{ fontSize: 9, color: cfg.color, fontWeight: 700, opacity: 0.8, marginLeft: 'auto', letterSpacing: '0.04em' }}>
          {signal.signal === 'BUY' ? '↑ Momentum building' : signal.signal === 'SELL' ? '↓ Risk increasing' : '→ Breakout forming'}
        </span>
      </div>

      {/* Risk visualization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: 8, marginBottom: 10 }}>
        <ShieldAlert style={{ width: 11, height: 11, color: '#ef4444', flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Risk if support breaks:</span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 800, color: '#ef4444' }}>-{riskPct}%</span>
        <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', maxWidth: 60 }}>
          <div style={{ height: '100%', width: `${Math.min(parseFloat(riskPct) * 10, 100)}%`, background: '#ef4444', borderRadius: 99 }} />
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            flex: 1, padding: '9px 0',
            background: expanded ? cfg.bg : `linear-gradient(135deg, ${cfg.color}22, ${cfg.color}11)`,
            border: `1px solid ${cfg.border}`,
            borderRadius: 9, cursor: 'pointer',
            fontSize: 11, fontWeight: 800, color: cfg.color,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all 0.15s',
          }}
        >
          <Target style={{ width: 12, height: 12 }} />
          {expanded ? 'Hide Plan' : 'View Plan'}
        </button>
      </div>

      {/* Expanded section */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

              {/* Trade Plan — instant view */}
              {(signal.entry || signal.target || signal.stopLoss) && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Trade Plan</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 16px' }}>
                    {signal.entry && (
                      <div>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Entry</span>
                        <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: 'rgba(255,255,255,0.8)' }}>${signal.entry}</span>
                      </div>
                    )}
                    {signal.target && (
                      <div>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Target</span>
                        <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: '#22c55e' }}>${signal.target}</span>
                      </div>
                    )}
                    {signal.stopLoss && (
                      <div>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Stop Loss</span>
                        <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: '#ef4444' }}>${signal.stopLoss}</span>
                      </div>
                    )}
                    {signal.timeframe && (
                      <div>
                        <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>Timeframe</span>
                        <span style={{ fontSize: 14, fontFamily: 'monospace', fontWeight: 900, color: '#F59E0B' }}>{signal.timeframe}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Why Now */}
              {(signal.oneLiner || signal.technicalSummary) && (
                <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>⚡ Why Now?</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
                    {signal.oneLiner || signal.technicalSummary?.split('.')[0] + '.'}
                  </p>
                </div>
              )}

              {/* Confidence breakdown */}
              {signal.confidence_breakdown && (
                <div>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Signal Breakdown</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <BreakdownBar label="Technical" value={signal.confidence_breakdown.technical ?? 0} />
                    <BreakdownBar label="Sentiment" value={signal.confidence_breakdown.sentiment ?? 0} />
                    <BreakdownBar label="Volume"    value={signal.confidence_breakdown.volume ?? 0} />
                    <BreakdownBar label="Macro"     value={signal.confidence_breakdown.macro ?? 0} />
                  </div>
                </div>
              )}

              {/* Jump signal */}
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