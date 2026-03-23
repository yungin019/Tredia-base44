import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertCircle, ChevronRight } from 'lucide-react';

/**
 * Market Reaction Card (REACTION ENGINE - NOT NEWS)
 * 
 * Structure:
 * 1. MARKET STATE (what is happening)
 * 2. DRIVER (what caused it)
 * 3. IMPACT (which assets/sectors)
 * 4. ACTION BIAS (what direction matters)
 * 5. RISK (what invalidates it)
 * 
 * No headlines. Pure market interpretation.
 */
export default function MarketReactionCard({ reaction, onExplore }) {
  if (!reaction) return null;

  const stateColor = reaction.direction === 'bullish' ? '#22c55e' : reaction.direction === 'bearish' ? '#ef4444' : '#F59E0B';
  const StateIcon = reaction.direction === 'bullish' ? TrendingUp : reaction.direction === 'bearish' ? TrendingDown : AlertCircle;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onExplore}
      className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group"
    >
      {/* 1. MARKET STATE - MAIN FOCUS (TOP, LARGE) */}
      <div className="p-4 pb-0 space-y-2">
        <div className="flex items-start gap-2">
          <StateIcon className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: stateColor }} />
          <h2 className="text-base font-bold text-white/95 leading-tight flex-1">
            {reaction.marketState}
          </h2>
        </div>
        <div className="text-xs text-white/50 ml-7">
          {reaction.region || 'Global'} · {reaction.timing || 'Now'}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-white/5 mt-3 mb-0" />

      {/* 2. DRIVER (What caused it) */}
      <div className="px-4 py-3 space-y-1 border-b border-white/5">
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.08em]">Caused by</span>
        <p className="text-xs text-white/75 leading-relaxed">{reaction.driver}</p>
      </div>

      {/* 3. IMPACT (Assets/Sectors affected) */}
      <div className="px-4 py-3 space-y-2 border-b border-white/5">
        <span className="text-[10px] font-semibold text-white/40 uppercase tracking-[0.08em]">Impact</span>
        <p className="text-xs text-white/75 leading-relaxed mb-2">{reaction.impactText}</p>
        {reaction.affectedAssets && reaction.affectedAssets.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {reaction.affectedAssets.slice(0, 5).map((asset, i) => (
              <span key={i} className="text-[9px] px-2 py-1 rounded-md bg-white/5 text-white/60 font-mono border border-white/5">
                {asset}
              </span>
            ))}
            {reaction.affectedAssets.length > 5 && (
              <span className="text-[9px] px-2 py-1 text-white/40">
                +{reaction.affectedAssets.length - 5}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4. ACTION BIAS (What direction matters) */}
      <div className="px-4 py-3 space-y-1 border-b border-white/5 bg-primary/5">
        <span className="text-[10px] font-semibold text-primary/70 uppercase tracking-[0.08em]">Action Bias</span>
        <p className="text-xs text-white/80 leading-relaxed font-medium">{reaction.actionBias}</p>
      </div>

      {/* 5. RISK (What invalidates it) */}
      <div className="px-4 py-3 space-y-1 bg-destructive/5">
        <span className="text-[10px] font-semibold text-destructive/60 uppercase tracking-[0.08em]">⚠ Invalidated if</span>
        <p className="text-xs text-destructive/80 leading-relaxed">{reaction.riskInvalidation}</p>
      </div>

      {/* Footer - Importance + Explore hint */}
      <div className="px-4 py-2 border-t border-white/5 flex items-center justify-between text-[9px] text-white/30 group-hover:text-white/40 transition-colors">
        <span>Confidence: {reaction.importance}/10</span>
        <ChevronRight className="h-3 w-3 opacity-30 group-hover:opacity-50 transition-opacity" />
      </div>
    </motion.button>
  );
}