import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Info, AlertCircle, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExplanationModal from '@/components/ui/ExplanationModal';

export default function ActionableTradeCard({
  symbol = 'NVDA',
  action = 'BUY',
  confidence = 87,
  reason = 'AI infrastructure momentum',
  entryRange = '$870–$885',
  riskLevel = 'Medium',
  keyRisk = 'Earnings miss could trigger 8–12% pullback',
  whatToWatchFor = 'Watch NVIDIA earnings guidance and AI demand signals',
  bestTimeframe = 'Swing trade: 2–4 weeks',
}) {
  const navigate = useNavigate();
  const [showExplanation, setShowExplanation] = useState(false);

  const isGreen = action === 'BUY';
  const color = isGreen ? 'text-success' : 'text-destructive';
  const bg = isGreen ? 'bg-success/10' : 'bg-destructive/10';
  const borderColor = isGreen ? 'border-success/25' : 'border-destructive/25';

  const explanationData = {
    whatItMeans: `TREK recommends ${action}ing ${symbol} because ${reason.toLowerCase()}. This is a high-conviction signal based on AI analysis of market data, sentiment, and technicals.`,
    whyHappening: `${reason}. Institutional money is flowing in, volume is above average, and technical setup is favorable. This creates a confluence of bullish signals.`,
    whatItAffects: [
      `${symbol} price action — expect 3–8% move if thesis plays out`,
      'Related stocks in the AI/tech sector — they move together',
      'Your portfolio risk — ${riskLevel.toLowerCase()} volatility',
      'Exit timing — know your stop-loss and take-profit levels',
    ],
    trekInterpretation: `TREK's AI engines detect ${reason.toLowerCase()}. The confidence level of ${confidence}% means this setup appears in TREK's winning trade history. Not guaranteed, but statistically sound.`,
    whatToDoAboutIt: `Entry around ${entryRange}. Position size based on your risk tolerance — this is ${riskLevel.toLowerCase()} risk. Don't FOMO in; wait for a pullback to your entry zone. Use alerts, not market orders.`,
    risks: keyRisk,
    whatToWatchNext: whatToWatchFor,
  };

  return (
    <>
      <ExplanationModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        title={`${action} ${symbol} — Trade Plan`}
        explanation={explanationData}
      />

      <motion.button
        onClick={() => navigate(`/Asset/${symbol}`)}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full text-left rounded-2xl p-5 border transition-all active:scale-95 group card-shadow ${bg} ${borderColor} border-2 hover:border-white/20`}
      >
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-1">Signal</p>
              <p className={`text-xl font-black ${color} uppercase tracking-tight`}>{action}</p>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div>
              <p className="text-2xl font-black text-foreground">{symbol}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{reason}</p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowExplanation(true);
            }}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Info className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {/* Confidence Meter */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-bold text-muted-foreground">Confidence</p>
            <p className={`text-sm font-bold ${color}`}>{confidence}%</p>
          </div>
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full ${isGreen ? 'bg-success' : 'bg-destructive'}`}
            />
          </div>
        </div>

        {/* Trade Details Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-white/5">
          <div className="bg-white/[0.02] rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Entry Zone</p>
            <p className="text-sm font-bold text-foreground">{entryRange}</p>
          </div>
          <div className="bg-white/[0.02] rounded-lg p-3">
            <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
            <p className={`text-sm font-bold ${
              riskLevel === 'Low' ? 'text-success' :
              riskLevel === 'Medium' ? 'text-warning' : 'text-destructive'
            }`}>
              {riskLevel}
            </p>
          </div>
        </div>

        {/* Key Risk */}
        <div className="flex items-start gap-2.5 mb-4 p-3 rounded-lg bg-destructive/5 border border-destructive/15">
          <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-destructive mb-1">Key Risk</p>
            <p className="text-xs text-foreground leading-relaxed">{keyRisk}</p>
          </div>
        </div>

        {/* Timeframe */}
        <div className="text-xs text-muted-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          {bestTimeframe}
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-foreground">View Full Plan</span>
          <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </motion.button>
    </>
  );
}