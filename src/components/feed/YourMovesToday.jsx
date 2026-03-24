import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock, Eye, ChevronRight } from 'lucide-react';
import { safeRender, validateSignal, validateConfidence } from '@/lib/dataValidation';
import { useNavigate } from 'react-router-dom';

// ── SIGNAL badge config aligned with global theme ──────────────────────────
const ACTION_CFG = {
  BUY:   { label: 'BULLISH', color: '#0ec8dc', bg: 'rgba(14,200,220,0.12)',   border: 'rgba(14,200,220,0.3)',   accentBg: 'rgba(14,200,220,0.06)',   Icon: TrendingUp },
  SELL:  { label: 'BEARISH', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)',    accentBg: 'rgba(239,68,68,0.05)',    Icon: TrendingDown },
  AVOID: { label: 'BEARISH', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    border: 'rgba(239,68,68,0.3)',    accentBg: 'rgba(239,68,68,0.05)',    Icon: TrendingDown },
  WATCH: { label: 'WAIT',    color: '#6b7280', bg: 'rgba(107,114,128,0.1)',   border: 'rgba(107,114,128,0.25)', accentBg: 'rgba(107,114,128,0.04)',  Icon: Clock },
  WAIT:  { label: 'WAIT',    color: '#6b7280', bg: 'rgba(107,114,128,0.1)',   border: 'rgba(107,114,128,0.25)', accentBg: 'rgba(107,114,128,0.04)',  Icon: Clock },
};

function MoveCard({ move, index, onExplore }) {
  const action = (move.action || 'WATCH').toUpperCase();
  const cfg = ACTION_CFG[action] || ACTION_CFG.WATCH;
  const color = cfg.color;
  const bg = cfg.bg;
  const border = cfg.border;
  const accentBg = cfg.accentBg;
  const Icon = cfg.Icon;

  // Parse entry into uppercase action command
  const actionCmd = move.entry ? 
    (move.entry.includes('Buy') ? 'BUY DIPS' : 
     move.entry.includes('Do not') ? 'AVOID' :
     move.entry.includes('Watch') ? 'WAIT BREAKOUT' : 'MONITOR')
    : 'WATCH';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(8, 18, 42, 0.65)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid rgba(100,220,255,0.09)`,
      }}
    >
      {/* accent line */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${color}66 0%, ${color}18 60%, transparent 100%)` }} />

      {/* ── HEADER: symbol + signal badge ─────────────────────── */}
      <div className="px-4 pt-3 pb-3 flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1.5">
          {/* Signal badge */}
          <span
            className="inline-flex items-center gap-1.5 font-black tracking-widest rounded-full self-start"
            style={{ fontSize: 10, color, background: bg, border: `1px solid ${border}`, padding: '3px 10px', letterSpacing: '0.12em' }}
          >
            <Icon style={{ width: 10, height: 10 }} />
            {cfg.label}
          </span>
          {/* Symbol */}
          <span className="font-mono font-black text-white" style={{ fontSize: 22, letterSpacing: '-0.02em', lineHeight: 1 }}>
            {safeRender(move.symbol)}
          </span>
          {move.name && (
            <span className="text-[10px]" style={{ color: 'rgba(180,210,240,0.4)' }}>{move.name}</span>
          )}
        </div>

        {/* Confidence + arrow */}
        <button
          onClick={onExplore}
          className="flex flex-col items-end gap-1 flex-shrink-0 mt-1"
          style={{ color: 'rgba(100,220,255,0.3)' }}
        >
          {move.confidence !== undefined && (
            <span className="font-mono font-black" style={{ fontSize: 20, color, lineHeight: 1 }}>
              {validateConfidence(move.confidence)}%
            </span>
          )}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* ── WHY (1 line) ──────────────────────────────────────── */}
      {move.why && (
        <div className="px-4 pb-3" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', paddingTop: 10 }}>
          <div className="flex items-start gap-2">
            <span className="text-[10px] text-white/30 font-mono mt-0.5 flex-shrink-0">→</span>
            <p className="text-xs leading-snug" style={{ color: 'rgba(200,225,255,0.6)' }}>{safeRender(move.why)}</p>
          </div>
        </div>
      )}

      {/* ── TRADE PLAN (compact grid) ─────────────────────────── */}
      {(move.entry || move.positionSize || move.timeframe) && (
        <div
          className="px-4 py-3"
          style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: accentBg }}
        >
          <div className="grid grid-cols-3 gap-3">
            {move.entry && move.entry !== 'N/A' && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Entry</span>
                <span className="text-xs font-mono font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>{safeRender(move.entry)}</span>
              </div>
            )}
            {move.positionSize && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Size</span>
                <span className="text-xs font-mono font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>{safeRender(move.positionSize)}</span>
              </div>
            )}
            {move.timeframe && (
              <div className="flex flex-col gap-0.5">
                <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Hold</span>
                <span className="text-xs font-mono font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>{safeRender(move.timeframe)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ACTION + RISK ────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(100,220,255,0.06)' }}>
        {/* Action instruction */}
        <div className="px-4 py-2.5 flex items-start gap-2" style={{ background: `${color}08` }}>
          <span className="text-[10px] font-mono flex-shrink-0 mt-0.5" style={{ color }}>⚡</span>
          <p className="text-xs font-bold leading-snug" style={{ color: 'rgba(255,255,255,0.9)' }}>
            <span style={{ color }}>Action: </span>
            {move.entry === 'N/A'
              ? 'DO NOT ENTER — conditions not met'
              : move.entry
              ? `Wait for ${move.entry}`
              : safeRender(move.exitTarget) || 'Monitor for setup'}
          </p>
        </div>
        {/* Risk */}
        <div className="px-4 py-2.5 flex items-start gap-2" style={{ borderTop: '1px solid rgba(239,68,68,0.08)', background: 'rgba(239,68,68,0.04)' }}>
          <span className="text-[10px] flex-shrink-0 mt-0.5">⚠</span>
          <p className="text-xs leading-snug" style={{ color: 'rgba(252,165,165,0.7)' }}>
            <span className="font-bold" style={{ color: 'rgba(248,113,113,0.85)' }}>Risk: </span>
            {safeRender(move.risk)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export default function YourMovesToday({ moves = [], onExplore }) {
  if (!moves || moves.length === 0) {
    return (
      <div>
        <div className="mb-4">
          <h2 className="text-base font-black text-white tracking-tight">Your Moves Today</h2>
          <p className="text-[11px] mt-0.5" style={{ color: 'rgba(180,210,240,0.4)' }}>Live desk instructions — not advice</p>
        </div>
        <div className="text-center py-8 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Loading live signals...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-black text-white tracking-tight">Your Moves Today</h2>
        <p className="text-[11px] mt-0.5" style={{ color: 'rgba(180,210,240,0.4)' }}>Live desk instructions — not advice</p>
      </div>
      <div className="space-y-3">
        {moves.map((move, i) => (
          <MoveCard key={move.symbol || i} move={move} index={i} onExplore={() => onExplore?.(move)} />
        ))}
      </div>
    </div>
  );
}