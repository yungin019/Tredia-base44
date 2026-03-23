import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp } from 'lucide-react';

const MOVES = [
  {
    symbol: 'NVDA',
    action: 'BUY',
    entry: 'Buy between $870–$885 on dips. Do NOT chase above $900.',
    positionSize: 'Normal size (no event risk)',
    timeframe: '1–2 weeks',
    why: 'Growth rally on. Yields down = multiple expansion. AI demand remains structural.',
    exitTarget: 'Sell 50% at $920, trail stop on remainder.',
    risk: 'If 10Y yields bounce above 4.3% + Fed signals hawkish, expect 8–12% drop quickly.',
    confidence: 'High (macro tailwind)',
  },
  {
    symbol: 'XLE',
    action: 'AVOID',
    entry: 'N/A',
    positionSize: 'Do not enter',
    timeframe: 'N/A',
    why: 'Energy sector divergence: Oil up 2.8% but XLE lagging. Structural weakness, not a bounce. Sell on strength if you hold.',
    exitTarget: 'Sell any longs into strength.',
    risk: 'If oil breaks above $95 AND energy catches up with heavy volume, could reverse. But odds favor 5–8% more downside first.',
    confidence: 'Medium (mean reversion play)',
  },
  {
    symbol: 'GLD',
    action: 'WATCH',
    entry: 'Wait for pullback to $195–$200. Do NOT chase current strength.',
    positionSize: 'Small size (tactical only)',
    timeframe: 'Intraday to 3 days',
    why: 'Gold up today on weak dollar + flight to safety. But risk-on days usually see gold reverse by close or next day. Better setup = lower entry.',
    exitTarget: 'Scalp 1–2% on quick bounce, do not hold overnight.',
    risk: 'If Fed cuts more aggressively or equity fear spikes, gold could squeeze higher 2–4%. But consolidation is more likely.',
    confidence: 'Medium (technical setup forming)',
  },
];

function MoveCard({ move, onExplore }) {
  const actionColors = {
    BUY: { bg: 'bg-success/10', border: 'border-success/20', label: 'text-success', labelBg: 'bg-success/15' },
    AVOID: { bg: 'bg-destructive/10', border: 'border-destructive/20', label: 'text-destructive', labelBg: 'bg-destructive/15' },
    WATCH: { bg: 'bg-warning/10', border: 'border-warning/20', label: 'text-warning', labelBg: 'bg-warning/15' },
  };

  const colors = actionColors[move.action];

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onExplore}
      className={`w-full text-left rounded-xl p-4 ${colors.bg} border ${colors.border} transition-all hover:bg-opacity-20 group space-y-3`}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-lg text-foreground">{move.symbol}</span>
          <span className={`text-xs font-bold px-2 py-1 rounded-lg ${colors.labelBg} ${colors.label}`}>
            {move.action}
          </span>
          {move.confidence && (
            <span className="text-xs text-muted-foreground ml-auto">{move.confidence}</span>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
      </div>

      {/* Why + Action + Timing + Risk */}
      <div className="space-y-3">
        <p className="text-sm text-foreground leading-relaxed">{move.why}</p>
        
        {move.entry !== 'N/A' && (
          <div className="bg-success/10 rounded-lg p-2.5 border border-success/20 space-y-1.5">
            <p className="text-xs text-foreground">
              <span className="font-semibold text-success">→ Entry:</span> {move.entry}
            </p>
            {move.positionSize && (
              <p className="text-xs text-foreground">
                <span className="font-semibold text-foreground">→ Size:</span> {move.positionSize}
              </p>
            )}
            {move.timeframe && (
              <p className="text-xs text-foreground">
                <span className="font-semibold text-foreground">→ Hold:</span> {move.timeframe}
              </p>
            )}
            {move.exitTarget && (
              <p className="text-xs text-foreground">
                <span className="font-semibold text-primary">→ Exit:</span> {move.exitTarget}
              </p>
            )}
          </div>
        )}

        {move.entry === 'N/A' && (
          <div className="bg-destructive/10 rounded-lg p-2.5 border border-destructive/20">
            <p className="text-xs text-destructive font-semibold">→ Do NOT enter. {move.exitTarget}</p>
          </div>
        )}

        <div className="bg-destructive/5 rounded-lg p-2 border border-destructive/20">
          <p className="text-xs text-destructive">
            <span className="font-semibold">⚠ Risk Trigger:</span> {move.risk}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

export default function YourMovesToday({ onExplore }) {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-1">Your Moves Today</h2>
      <p className="text-xs text-muted-foreground mb-4">Based on today's market context. TREK's mentor guidance for each trade.</p>
      <div className="space-y-3">
        {MOVES.map((move) => (
          <MoveCard key={move.symbol} move={move} onExplore={() => onExplore?.(move)} />
        ))}
      </div>
    </div>
  );
}