import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, AlertCircle, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

/**
 * Market Reaction Card
 * Event-first format showing impact → affected assets → TREK take
 */
export default function MarketReactionCard({ reaction, onExplore }) {
  if (!reaction) return null;

  const impactColor = reaction.direction === 'bullish' ? '#22c55e' : reaction.direction === 'bearish' ? '#ef4444' : '#F59E0B';
  const ImpactIcon = reaction.direction === 'bullish' ? TrendingUp : reaction.direction === 'bearish' ? TrendingDown : AlertCircle;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onExplore}
      className="w-full text-left rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all group p-4 space-y-3"
    >
      {/* Header: Event + Region Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary flex-shrink-0" />
            <h3 className="text-sm font-bold text-white/90 leading-snug">{reaction.headline}</h3>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{reaction.summary}</p>
        </div>
        <div className="flex-shrink-0">
          <Badge className="bg-primary/15 text-primary text-[10px]">
            {reaction.affectedRegions?.[0] || 'Global'}
          </Badge>
        </div>
      </div>

      {/* Market Impact Section */}
      <div className="rounded-lg bg-white/[0.03] border border-white/5 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <ImpactIcon className="h-4 w-4" style={{ color: impactColor }} />
          <span className="text-xs font-semibold text-white/70">Immediate Impact</span>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">{reaction.marketImpact}</p>
      </div>

      {/* Affected Assets */}
      {reaction.affectedAssets && reaction.affectedAssets.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-white/60">Affected Assets</span>
          <div className="flex flex-wrap gap-2">
            {reaction.affectedAssets.slice(0, 4).map((asset, i) => (
              <span key={i} className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-white/70 font-mono">
                {asset}
              </span>
            ))}
            {reaction.affectedAssets.length > 4 && (
              <span className="text-[10px] px-2 py-1 text-white/40">
                +{reaction.affectedAssets.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* TREK Take */}
      <div className="rounded-lg bg-primary/5 border border-primary/15 p-3 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <Target className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">TREK Take</span>
        </div>
        <p className="text-xs text-white/80 leading-relaxed">{reaction.trekTake}</p>
      </div>

      {/* Risk Trigger (if applicable) */}
      {reaction.riskTrigger && (
        <div className="rounded-lg bg-destructive/5 border border-destructive/15 p-2">
          <p className="text-xs text-destructive/80">
            <span className="font-semibold">⚠ Risk:</span> {reaction.riskTrigger}
          </p>
        </div>
      )}

      {/* Timing + Confidence */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-white/40">
        <span>{reaction.timing || 'Now'}</span>
        <span>Importance: {reaction.importance}/10</span>
      </div>
    </motion.button>
  );
}