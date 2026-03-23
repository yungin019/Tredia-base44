import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, TrendingUp } from 'lucide-react';

const MOVES = [
  {
    symbol: 'NVDA',
    action: 'BUY',
    entry: '$870–$885',
    why: 'Growth rally on. Yields down = multiple expansion. AI demand remains structural.',
    timing: 'Add on dips today. 2-week hold.',
    risk: 'If yields bounce back >4.3% and Fed pivots hawkish, this corrects 8-12%.',
    confidence: 'High (macro tailwind)',
  },
  {
    symbol: 'XLE',
    action: 'AVOID',
    entry: 'N/A',
    why: 'Energy sector headwind. Oil rallying today is counterintuitive—energy stocks lag in risk-on. Sell if you hold.',
    timing: 'Wait for capitulation. Better entries coming.',
    risk: 'FOMO if oil keeps rallying, but technicals warn.',
    confidence: 'Medium (mean reversion play)',
  },
  {
    symbol: 'GLD',
    action: 'WATCH',
    entry: '$195–$200',
    why: 'Gold up today (flight to safety + weak dollar). But in a risk-ON day, it usually reverses. Better to see weakness first.',
    timing: 'Buy on pullback, not here.',
    risk: 'Can squeeze higher if Fed cuts more. But odds favor consolidation.',
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
        <p className="text-sm text-foreground leading-relaxed font-semibold">{move.why}</p>
        
        {move.entry !== 'N/A' && (
          <div className="bg-black/30 rounded-lg p-2.5 border border-success/20">
            <p className="text-xs text-foreground">
              <span className="font-semibold text-success">Entry:</span> {move.entry}
            </p>
          </div>
        )}

        <div className="border-t border-white/5 pt-2 space-y-2 text-xs">
          <p className="text-muted-foreground">
            <span className="font-semibold text-foreground">When:</span> {move.timing}
          </p>
          <p className="text-destructive/80">
            <span className="font-semibold">Fails if:</span> {move.risk}
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