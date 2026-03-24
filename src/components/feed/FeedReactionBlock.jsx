import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Clock, ChevronDown, ChevronUp, Zap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── SIGNAL BADGE CONFIG ─────────────────────────────────────────────────────
const SIGNAL_CFG = {
  bullish: { label: 'BULLISH', color: '#0ec8dc', bg: 'rgba(14,200,220,0.12)', border: 'rgba(14,200,220,0.3)',  Icon: TrendingUp },
  bearish: { label: 'BEARISH', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)',   Icon: TrendingDown },
  neutral: { label: 'NEUTRAL', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)',  Icon: Minus },
  wait:    { label: 'WAIT',    color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.25)', Icon: Clock },
};

// Direction cue for related asset pills
function AssetPill({ symbol, direction, onClick }) {
  const isUp = direction === 'up';
  const isDown = direction === 'down';
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(symbol); }}
      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all min-h-0 min-w-0"
      style={isUp
        ? { background: 'rgba(14,200,220,0.08)', border: '1px solid rgba(14,200,220,0.25)', color: '#7ee8f0' }
        : isDown
        ? { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }
        : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
      }
    >
      {isUp ? <TrendingUp className="h-2.5 w-2.5" /> : isDown ? <TrendingDown className="h-2.5 w-2.5" /> : null}
      {symbol}
    </button>
  );
}

export default function FeedReactionBlock({ reaction, index = 0 }) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  if (!reaction) return null;

  const isPrimary = index === 0;
  const dir = (reaction.direction || 'neutral').toLowerCase();
  const sig = SIGNAL_CFG[dir] || SIGNAL_CFG.neutral;
  const sigColor = sig.color;
  const SigIcon = sig.Icon;

  const relatedAssets = reaction.relatedAssets || [];

  const cardStyle = isPrimary ? {
    background: 'rgba(12, 26, 62, 0.78)',
    backdropFilter: 'blur(32px) saturate(200%)',
    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
    border: `1px solid ${sigColor}30`,
    boxShadow: `0 0 40px ${sigColor}10, 0 12px 40px rgba(0,0,0,0.5)`,
  } : {
    background: 'rgba(8, 18, 42, 0.60)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: '1px solid rgba(100,220,255,0.09)',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl overflow-hidden"
      style={cardStyle}
    >
      {/* ── ACCENT LINE ───────────────────────────────────────────── */}
      <div
        style={{
          height: isPrimary ? 3 : 2,
          background: `linear-gradient(90deg, ${sigColor}${isPrimary ? 'cc' : '66'} 0%, ${sigColor}22 60%, transparent 100%)`,
        }}
      />

      {/* ── SIGNAL + STATE (FUSED HEADLINE) ─────────────────────── */}
      <div className={`px-4 ${isPrimary ? 'pt-4 pb-2' : 'pt-3 pb-2'}`}>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          {/* SIGNAL — STATE merged */}
          <h2
            style={{
              fontSize: isPrimary ? 16 : 14,
              fontWeight: 900,
              color: 'rgba(255,255,255,0.97)',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            <span style={{ color: sigColor, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              {sig.label}
            </span>
            {' — '}
            {reaction.marketState}
          </h2>
          {/* Timing badge (secondary, right) */}
          <span
            className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border flex-shrink-0 mt-0.5 uppercase tracking-wide"
            style={{
              color: reaction.timing === 'Live' ? '#7ee8f0' : 'rgba(245,158,11,0.7)',
              background: reaction.timing === 'Live' ? 'rgba(14,200,220,0.06)' : 'rgba(245,158,11,0.05)',
              border: reaction.timing === 'Live' ? '1px solid rgba(14,200,220,0.15)' : '1px solid rgba(245,158,11,0.15)',
            }}
          >
            {reaction.timing || 'Now'}
          </span>
        </div>
      </div>

      {/* ── ACTION (2nd line, dominant) ─────────────────────────── */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: `${sigColor}06` }}>
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 flex-shrink-0" style={{ color: sigColor }} />
          <p className="text-sm font-black leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
            {reaction.actionBias}
          </p>
        </div>
      </div>

      {/* ── DRIVER + IMPACT (secondary, muted) ────────────────── */}
      <div className="px-4 py-2.5 space-y-1.5" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
        <div className="flex items-start gap-2">
          <span className="text-[9px] text-white/20 font-mono mt-0.5 flex-shrink-0">→</span>
          <p className="text-[10px] text-white/40 leading-tight">{reaction.driver}</p>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-[9px] text-white/20 font-mono mt-0.5 flex-shrink-0">→</span>
          <p className="text-[10px] text-white/40 leading-tight">{reaction.impactText}</p>
        </div>
        {/* Asset pills */}
        {relatedAssets.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {relatedAssets.map((a, i) => (
              <AssetPill key={i} symbol={a.symbol} direction={a.direction} onClick={(sym) => navigate(`/Asset/${sym}`)} />
            ))}
          </div>
        )}
      </div>

      {/* ── RISK ────────────────────────────────────────────────── */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: 'rgba(239,68,68,0.04)' }}>
        <div className="flex items-start gap-2">
          <span className="text-[9px] flex-shrink-0 mt-0.5 font-mono">⚠</span>
          <p className="text-[10px] leading-tight" style={{ color: 'rgba(252,165,165,0.7)' }}>
            {reaction.riskInvalidation}
          </p>
        </div>
      </div>

      {/* ── EXPANDABLE: macro + watch ────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {reaction.macroContext && (
              <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(100,220,255,0.06)' }}>
                <p className="text-[9px] font-black text-white/25 uppercase tracking-[0.12em] mb-1">Macro Context</p>
                <p className="text-xs text-white/50 leading-relaxed">{reaction.macroContext}</p>
              </div>
            )}
            {reaction.watchNext && (
              <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: 'rgba(14,200,220,0.03)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye className="h-3 w-3" style={{ color: 'rgba(14,200,220,0.5)' }} />
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(14,200,220,0.5)' }}>Watch</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{reaction.watchNext}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <div
        className="px-4 py-2 flex items-center justify-between cursor-pointer"
        style={{ borderTop: '1px solid rgba(100,220,255,0.06)' }}
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex gap-1">
          {reaction.sectors?.slice(0, 2).map((s, i) => (
            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(100,220,255,0.05)', border: '1px solid rgba(100,220,255,0.08)', color: 'rgba(150,230,255,0.3)' }}>{s}</span>
          ))}
        </div>
        <div className="flex items-center gap-1" style={{ color: 'rgba(100,220,255,0.3)' }}>
          <span className="text-[9px]">{expanded ? 'Less' : 'More'}</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </div>
      </div>
    </motion.div>
  );
}