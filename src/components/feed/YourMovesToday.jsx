import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const MOVES = [
  {
    symbol: 'NVDA',
    action: 'BUY',
    entryZone: '$870–$885',
    reasoning: 'AI infrastructure demand surge — institutional accumulation detected',
    riskNote: 'Earnings miss could trigger 8–12% pullback',
  },
  {
    symbol: 'JPM',
    action: 'WATCH',
    entryZone: '$195–$205',
    reasoning: 'Financial sector rotation on yield curve steepening',
    riskNote: 'Inversion could reverse the setup',
  },
  {
    symbol: 'BTC',
    action: 'BUY',
    entryZone: '$66k–$67.5k',
    reasoning: 'Spot ETF inflows at record levels + halving cycle momentum',
    riskNote: 'Regulatory uncertainty = high volatility',
  },
];

function MoveCard({ move, onExplore }) {
  const actionColors = {
    BUY: { bg: 'bg-success/10', border: 'border-success/20', text: 'text-success' },
    WATCH: { bg: 'bg-warning/10', border: 'border-warning/20', text: 'text-warning' },
    HOLD: { bg: 'bg-muted/10', border: 'border-muted/20', text: 'text-muted-foreground' },
  };

  const colors = actionColors[move.action];

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onExplore}
      className={`w-full text-left rounded-xl p-4 ${colors.bg} border ${colors.border} transition-all hover:border-opacity-100 hover:bg-opacity-20 group`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="font-mono font-bold text-foreground">{move.symbol}</span>
          <span className={`ml-2 text-xs font-bold ${colors.text}`}>{move.action}</span>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
      <p className="text-sm text-foreground mb-1">Entry: {move.entryZone}</p>
      <p className="text-xs text-muted-foreground leading-relaxed mb-2">{move.reasoning}</p>
      <p className="text-xs text-destructive/70">Risk: {move.riskNote}</p>
    </motion.button>
  );
}

export default function YourMovesToday({ onExplore }) {
  return (
    <div>
      <h2 className="text-base font-bold text-foreground mb-4">Your Moves Today</h2>
      <div className="space-y-3">
        {MOVES.map((move) => (
          <MoveCard key={move.symbol} move={move} onExplore={() => onExplore?.(move)} />
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3">TREK suggests these setups. Click to see full mentor guidance.</p>
    </div>
  );
}