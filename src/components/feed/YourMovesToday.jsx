import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp } from 'lucide-react';

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

export default function YourMovesToday({ moves = [], onExplore }) {
  if (!moves || moves.length === 0) {
    return (
      <div>
        <h2 className="text-base font-bold text-foreground mb-1">Your Moves Today</h2>
        <p className="text-xs text-muted-foreground mb-4">Based on today's market context. TREK's mentor guidance for each trade.</p>
        <div className="text-center py-8 text-xs text-white/40">
          Loading live signals...
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-1">Your Moves Today</h2>
      <p className="text-xs text-muted-foreground mb-4">Based on today's market context. TREK's mentor guidance for each trade.</p>
      <div className="space-y-3">
        {moves.map((move) => (
          <MoveCard key={move.symbol} move={move} onExplore={() => onExplore?.(move)} />
        ))}
      </div>
    </div>
  );
}