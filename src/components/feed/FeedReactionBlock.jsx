import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Clock, ChevronDown, ChevronUp, Zap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { calculateSignalStrength, getSignalColor } from '@/lib/signalStrength';

// ── VALIDATION ────────────────────────────────────────────────────────────────
const BANNED_PHRASES = ['sentiment', 'narrative', 'momentum', 'uncertain'];
function isValidSignal(reaction) {
  const text = [reaction.market_state || reaction.marketState, reaction.driver, reaction.impact || reaction.impactText, reaction.risk || reaction.riskInvalidation].join(' ').toLowerCase();
  for (const p of BANNED_PHRASES) { if (text.includes(p)) return false; }
  return /\d/.test(text);
}

// ── TIME AGO ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr) {
  if (!dateStr) return null;
  const secs = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (secs < 60) return 'Just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

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
  if (!isValidSignal(reaction)) return null;

  const isPrimary = index === 0;
  const dir = (reaction.direction || reaction.action_bias || 'neutral').toLowerCase();
  const sig = SIGNAL_CFG[dir] || SIGNAL_CFG.neutral;
  const sigColor = getSignalColor(reaction.direction || reaction.action_bias);
  const SigIcon = sig.Icon;
  const strength = calculateSignalStrength(reaction);

  const relatedAssets = reaction.relatedAssets || [];
  // Normalize field names (support both old and new)
  const marketState = reaction.marketState || reaction.market_state || '';
  const action = reaction.actionBias || reaction.action_bias || '';
  const impactText = reaction.impactText || reaction.impact || '';
  const riskText = reaction.riskInvalidation || reaction.risk || '';
  const sourceLabel = reaction.source_name || (reaction.timing ? 'Market Structure' : null);
  const timestamp = reaction.published_at || reaction.interpretation_updated_at || null;
  const age = timeAgo(timestamp);
  const isOld = timestamp && (Date.now() - new Date(timestamp)) > 2 * 60 * 60 * 1000;
  const tradeSetup = reaction.trade_setup || null;

  const cardStyle = isPrimary ? {
    background: 'rgba(12, 26, 62, 0.78)',
    backdropFilter: 'blur(32px) saturate(200%)',
    WebkitBackdropFilter: 'blur(32px) saturate(200%)',
    border: `${strength.borderWidth} solid ${sigColor}${strength.level === 'STRONG' ? 'cc' : strength.level === 'MODERATE' ? '66' : '33'}`,
    boxShadow: `0 0 ${strength.glowSize} ${strength.glow}, 0 0 ${strength.glowSize} ${sigColor}30, 0 12px 40px rgba(0,0,0,0.5)`,
    opacity: strength.opacity,
  } : {
    background: 'rgba(8, 18, 42, 0.60)',
    backdropFilter: 'blur(24px) saturate(180%)',
    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
    border: `1px solid rgba(100,220,255,${strength.level === 'STRONG' ? '0.15' : strength.level === 'MODERATE' ? '0.09' : '0.05'})`,
    opacity: strength.opacity,
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
              color: isOld ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.97)',
              letterSpacing: '-0.02em',
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            <span style={{ color: sigColor, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              {sig.label}
            </span>
            {' — '}
            {marketState}
          </h2>
          {/* Timing + source */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide"
              style={{
                color: reaction.timing === 'Live' ? '#7ee8f0' : age ? (isOld ? 'rgba(255,255,255,0.3)' : 'rgba(245,158,11,0.7)') : 'rgba(245,158,11,0.7)',
                background: reaction.timing === 'Live' ? 'rgba(14,200,220,0.06)' : 'rgba(245,158,11,0.05)',
                border: reaction.timing === 'Live' ? '1px solid rgba(14,200,220,0.15)' : '1px solid rgba(245,158,11,0.15)',
              }}
            >
              {age || reaction.timing || 'Now'}
            </span>
            {sourceLabel && (
              <span className="text-[8px] text-white/25 font-medium">{sourceLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* ── ACTION (2nd line, dominant) ─────────────────────────── */}
      <div className="px-4 py-2" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: `${sigColor}06` }}>
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 flex-shrink-0" style={{ color: sigColor }} />
          <p className="text-sm font-black leading-tight" style={{ color: 'rgba(255,255,255,0.95)' }}>
            {action}
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
          <p className="text-[10px] text-white/40 leading-tight">{impactText}</p>
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
            {riskText}
          </p>
        </div>
      </div>

      {/* ── TRADE SETUP ─────────────────────────────────────────── */}
      {tradeSetup && (
        <div className="px-4 py-3 space-y-1.5" style={{ borderTop: '1px solid rgba(245,158,11,0.12)', background: 'rgba(245,158,11,0.04)' }}>
          <p className="text-[8px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(245,158,11,0.5)' }}>⚡ Trade Setup</p>
          <div className="flex items-start gap-2">
            <span className="text-[8px] font-black text-yellow-500/50 uppercase w-16 flex-shrink-0 pt-0.5">Entry</span>
            <span className="text-[10px] text-white/70">{tradeSetup.entry}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[8px] font-black text-orange-500/50 uppercase w-16 flex-shrink-0 pt-0.5">Invalid.</span>
            <span className="text-[10px] text-white/70">{tradeSetup.invalidation}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-[8px] font-black text-white/20 uppercase w-16 flex-shrink-0 pt-0.5">Time</span>
            <span className="text-[10px] text-white/40">{tradeSetup.timeframe}</span>
          </div>
        </div>
      )}

      {/* ── EXPANDABLE: watch ────────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {(reaction.watchNext || reaction.watch_next) && (
              <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(100,220,255,0.06)', background: 'rgba(14,200,220,0.03)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye className="h-3 w-3" style={{ color: 'rgba(14,200,220,0.5)' }} />
                  <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(14,200,220,0.5)' }}>Watch</span>
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{reaction.watchNext || reaction.watch_next}</p>
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