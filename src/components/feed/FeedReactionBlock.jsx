import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, ChevronDown, ChevronUp, Zap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * FeedReactionBlock
 * 
 * Premium reaction card with:
 * - Layer 1: Market State (big, interpretation-first)
 * - Layer 2: Driver + Impact
 * - Layer 3: Related Asset Pills (direction-aware)
 * - Layer 4: Action Bias + Risk
 * - Layer 5: Expandable context / macro note
 */

const IMPORTANCE_LABEL = {
  9: { label: 'Critical', color: 'text-red-400',  bg: 'bg-red-400/10 border-red-400/20' },
  8: { label: 'High',     color: 'text-gold',     bg: 'bg-gold/10 border-gold/20' },
  7: { label: 'Medium',   color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/20' },
};

const TIMING_STYLE = {
  'Live':       'text-cyan-300 bg-cyan-400/10 border-cyan-400/25',
  'Developing': 'text-gold bg-gold/10 border-gold/20',
  'Follow-up':  'text-blue-400 bg-blue-400/10 border-blue-400/20',
};

// Direction cue for related asset pills — glass chip style
function AssetPill({ symbol, direction, onClick }) {
  const isUp = direction === 'up';
  const isDown = direction === 'down';
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(symbol); }}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all min-h-0 min-w-0 backdrop-blur-sm ${
        isUp
          ? 'bg-cyan-400/[0.08] border-cyan-400/25 text-cyan-300 hover:bg-cyan-400/15 hover:border-cyan-400/40'
          : isDown
          ? 'bg-red-400/[0.08] border-red-400/20 text-red-400 hover:bg-red-400/15'
          : 'bg-white/[0.04] border-white/10 text-white/50 hover:bg-white/[0.08]'
      }`}
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

  const dir = reaction.direction;
  const stateColor = dir === 'bullish' ? '#22c55e' : dir === 'bearish' ? '#ef4444' : '#F59E0B';
  const StateIcon = dir === 'bullish' ? TrendingUp : dir === 'bearish' ? TrendingDown : AlertCircle;
  const importanceMeta = IMPORTANCE_LABEL[reaction.importance] || IMPORTANCE_LABEL[7];
  const timingStyle = TIMING_STYLE[reaction.timing] || 'text-white/40 bg-white/5 border-white/10';

  // Assets split by direction
  const relatedAssets = reaction.relatedAssets || reaction.affectedAssets?.map(s => ({ symbol: s, direction: dir === 'bullish' ? 'up' : 'down' })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      className="rounded-2xl border border-white/[0.07] overflow-hidden"
      style={{ background: 'rgba(14,19,30,0.7)' }}
    >
      {/* ── TOP STRIPE: Region + Importance + Timing ─────────────── */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-0">
        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{reaction.region || 'Global'}</span>
        <span className="text-white/15">·</span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${importanceMeta.bg} ${importanceMeta.color}`}>
          {importanceMeta.label}
        </span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ml-auto ${timingStyle}`}>
          {reaction.timing || 'Now'}
        </span>
      </div>

      {/* ── MARKET STATE ─────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 p-1.5 rounded-lg" style={{ background: `${stateColor}18` }}>
            <StateIcon className="h-4 w-4" style={{ color: stateColor }} />
          </div>
          <h2 className="text-[15px] font-bold text-white/95 leading-snug flex-1 tracking-tight">
            {reaction.marketState}
          </h2>
        </div>
      </div>

      {/* ── DRIVER ───────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.05] px-4 py-3 space-y-1">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.1em]">Why</span>
        <p className="text-xs text-white/70 leading-relaxed">{reaction.driver}</p>
      </div>

      {/* ── IMPACT ───────────────────────────────────────────────── */}
      <div className="border-t border-white/[0.05] px-4 py-3 space-y-2.5">
        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.1em]">Impact</span>
        <p className="text-xs text-white/70 leading-relaxed">{reaction.impactText}</p>

        {/* Related Asset Pills */}
        {relatedAssets.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {relatedAssets.map((a, i) => (
              <AssetPill
                key={i}
                symbol={a.symbol}
                direction={a.direction}
                onClick={(sym) => navigate(`/Asset/${sym}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── ACTION BIAS ──────────────────────────────────────────── */}
      <div className="border-t border-white/[0.05] px-4 py-3" style={{ background: `${stateColor}08` }}>
        <div className="flex items-start gap-2">
          <Zap className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" style={{ color: stateColor }} />
          <p className="text-xs text-white/85 leading-relaxed font-semibold">{reaction.actionBias}</p>
        </div>
      </div>

      {/* ── EXPANDABLE CONTEXT ───────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {/* Risk invalidation */}
            <div className="border-t border-white/[0.05] px-4 py-3 bg-red-400/5">
              <span className="text-[9px] font-black text-red-400/60 uppercase tracking-[0.1em]">⚠ Invalidated if</span>
              <p className="text-xs text-red-300/70 leading-relaxed mt-1">{reaction.riskInvalidation}</p>
            </div>

            {/* Macro context (if present) */}
            {reaction.macroContext && (
              <div className="border-t border-white/[0.05] px-4 py-3">
                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.1em]">Macro Context</span>
                <p className="text-xs text-white/55 leading-relaxed mt-1">{reaction.macroContext}</p>
              </div>
            )}

            {/* What TREK is watching */}
            {reaction.watchNext && (
              <div className="border-t border-white/[0.05] px-4 py-3 bg-primary/5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Eye className="h-3 w-3 text-primary/60" />
                  <span className="text-[9px] font-black text-primary/60 uppercase tracking-[0.1em]">Trek Watching</span>
                </div>
                <p className="text-xs text-white/60 leading-relaxed">{reaction.watchNext}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FOOTER: Confidence + Expand ──────────────────────────── */}
      <div
        className="border-t border-white/[0.05] px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-3">
          <span className="text-[9px] text-white/25">Confidence {reaction.importance}/10</span>
          {reaction.sectors && (
            <div className="flex gap-1">
              {reaction.sectors.slice(0, 2).map((s, i) => (
                <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30 border border-white/[0.05]">{s}</span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-white/25">
          <span className="text-[9px]">{expanded ? 'Less' : 'More'}</span>
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </div>
      </div>
    </motion.div>
  );
}