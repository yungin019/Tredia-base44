import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ExplanationModal from '@/components/ui/ExplanationModal';

export default function TrekIntelligenceCardV2({ sentiment = 50, regime = 'NEUTRAL' }) {
  const navigate = useNavigate();
  const [showExplanation, setShowExplanation] = useState(false);

  // Sentiment analysis
  const getSentimentData = () => {
    if (sentiment < 25) return {
      label: 'Extreme Fear',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      icon: '😱',
      opportunities: ['Potential oversold bounce', 'Institutional buyers accumulating', 'Strong contrarian entry points'],
      risks: ['May continue falling', 'Bad news still coming', 'Recovery may be slow'],
      trekAdvice: 'TREK detects maximum fear. This historically precedes recovery rallies. Quality stocks trading below intrinsic value. Consider averaging in over 2-3 weeks.',
    };
    if (sentiment < 45) return {
      label: 'Fear',
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      icon: '😟',
      opportunities: ['Defensive setups', 'Quality at discount', 'Long-term entries'],
      risks: ['Volatility may spike', 'Sentiment can turn worse', 'Timing is hard'],
      trekAdvice: 'Market is risk-off. Growth names struggling. Rotation to defensive plays happening. Time to research, not necessarily buy.',
    };
    if (sentiment < 60) return {
      label: 'Neutral',
      color: 'text-muted-foreground',
      bg: 'bg-muted/10',
      icon: '😐',
      opportunities: ['Balanced risk/reward', 'Two-sided market', 'Sector selection matters'],
      risks: ['Direction unclear', 'Whipsaw risk', 'Requires timing'],
      trekAdvice: 'Market is sideways. Winners and losers based on fundamentals, not broad rallies. Focus on individual stock research.',
    };
    if (sentiment < 75) return {
      label: 'Greed',
      color: 'text-success',
      bg: 'bg-success/10',
      icon: '🤑',
      opportunities: ['Momentum plays', 'Tech leading', 'Risk-on sentiment'],
      risks: ['Complacency risk', 'Pullback coming', 'Valuation stretched'],
      trekAdvice: 'Market is hot. Momentum > fundamentals right now. Great for traders, risky for new positions. Take profits on strength.',
    };
    return {
      label: 'Extreme Greed',
      color: 'text-success',
      bg: 'bg-success/10',
      icon: '🚀',
      opportunities: ['Momentum accelerating', 'Retail FOMO', 'Technical breakouts'],
      risks: ['Major correction risk', 'Valuation at extremes', 'Unsustainable move'],
      trekAdvice: 'TREK sees maximum euphoria. This is typically a top warning. De-risk positions. Lock in gains. Build cash for the next dip.',
    };
  };

  const sentimentData = getSentimentData();

  const explanationData = {
    whatItMeans: `The Fear & Greed Index measures market psychology. ${sentiment < 45 ? 'Fear dominates — investors are risk-averse and selling.' : sentiment < 60 ? 'Market is balanced — no strong emotional bias.' : 'Greed dominates — investors are optimistic and buying aggressively.'}`,
    whyHappening: 'Market sentiment shifts based on news, earnings, macro data, and investor positioning. It drives short-term price movements.',
    whatItAffects: [
      'Stock valuations — fear = lower prices, greed = higher prices',
      'Trading volume — extremes show conviction',
      'Sector rotation — fear = defensive, greed = growth',
      'Cryptocurrency volatility — most sensitive to sentiment',
    ],
    trekInterpretation: sentimentData.trekAdvice,
    whatToDoAboutIt: sentiment < 35
      ? 'Extreme fear creates asymmetric opportunities. High-quality stocks at discounts. Avoid panic-selling. Consider DCA (dollar-cost averaging).'
      : sentiment > 75
      ? 'Extreme greed means valuations matter less right now. Protect gains. Raise some cash. Set stop-losses.'
      : 'Balanced sentiment means fundamentals and technicals matter equally. Follow earnings and support/resistance levels.',
    whatToWatchNext: sentiment < 45
      ? 'Watch for capitulation signals: VIX spike, panic selling volume, or breadth extremes. Recovery often starts silently.'
      : sentiment > 75
      ? 'Watch for profit-taking, insider selling, or deteriorating breadth. These precede pullbacks.'
      : 'Watch for rotation signals. Shifting between sectors or cap sizes shows sentiment is evolving.',
    risks: sentiment < 35
      ? 'Market can stay irrational longer than you expect. Fear can deepen. Always respect the trend.'
      : sentiment > 75
      ? 'Corrections from extremes are fast and violent. Even small positions can gap down.'
      : 'Whipsaws in both directions. Requires active management.',
  };

  return (
    <>
      <ExplanationModal
        isOpen={showExplanation}
        onClose={() => setShowExplanation(false)}
        title="Market Sentiment & Opportunity"
        explanation={explanationData}
      />

      <motion.button
        onClick={() => navigate('/AIInsights')}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full text-left rounded-2xl p-5 border border-white/10 bg-gradient-to-br from-card to-card/50 hover:border-primary/25 transition-all active:scale-95 group card-shadow"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{sentimentData.icon}</span>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Market Sentiment</p>
              <h3 className={`text-lg font-bold ${sentimentData.color}`}>{sentimentData.label}</h3>
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

        {/* Sentiment Bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                sentiment < 45
                  ? 'bg-destructive'
                  : sentiment < 60
                  ? 'bg-muted-foreground'
                  : 'bg-success'
              }`}
              style={{ width: `${sentiment}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-muted-foreground">Fear</span>
            <span className="text-xs font-bold text-foreground">{Math.round(sentiment)}/100</span>
            <span className="text-xs text-muted-foreground">Greed</span>
          </div>
        </div>

        {/* Opportunities */}
        <div className="mb-3">
          <p className="text-xs font-bold text-muted-foreground mb-2">Right Now:</p>
          <div className="space-y-1">
            {sentimentData.opportunities.map((opp, i) => (
              <div key={i} className="text-xs text-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {opp}
              </div>
            ))}
          </div>
        </div>

        {/* Risks */}
        <div className="mb-4 pb-4 border-b border-white/5">
          <p className="text-xs font-bold text-destructive/70 mb-2">Watch Out For:</p>
          <div className="space-y-1">
            {sentimentData.risks.map((risk, i) => (
              <div key={i} className="text-xs text-foreground flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive/50" />
                {risk}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">See TREK Signals</span>
          <ChevronRight className="w-4 h-4 text-foreground/40 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </motion.button>
    </>
  );
}