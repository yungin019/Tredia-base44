import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Info } from 'lucide-react';
import ExplanationModal from '@/components/ui/ExplanationModal';

export default function MarketCauseEffectExplainer() {
  const [selectedChain, setSelectedChain] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const chains = [
    {
      id: 'fed_rates',
      title: 'Fed Policy → Rate Environment',
      cause: '📍 Fed Hawkish',
      steps: [
        { icon: '📈', text: 'Interest rates rise', impact: 'bonds less attractive' },
        { icon: '📉', text: 'Bond prices fall', impact: 'yield-sensitive stocks hurt' },
        { icon: '💼', text: 'Growth stocks pressure', impact: 'less money for expansion' },
      ],
      affected: ['Tech', 'Biotech', 'Small Caps', 'High-growth names'],
      explanation: {
        whatItMeans: 'The Federal Reserve is taking a "hawkish" stance, meaning they want to keep interest rates high or raise them further to fight inflation.',
        whyHappening: 'Central banks fight inflation by making borrowing expensive. When companies and consumers borrow less, inflation should cool down.',
        whatItAffects: [
          'Companies with high debt become less profitable',
          'Future earnings are worth less (higher discount rates)',
          'Investors shift money from growth stocks to bonds',
          'Cryptocurrency tanks (high-risk, rate-sensitive)',
        ],
        trekInterpretation: 'TREK sees this as a structural headwind. Growth stocks will underperform. Defensive stocks and dividend payers shine.',
        whatToDoAboutIt: 'Reduce exposure to high-beta tech. Buy bonds or dividend stocks. Wait for Fed to pivot before adding growth exposure.',
        whatToWatchNext: 'Watch for CPI data and Fed statements. When inflation starts falling, the Fed will pivot dovish (lower rates), and growth stocks will rally again.',
      },
    },
    {
      id: 'earnings',
      title: 'Earnings Misses → Sector Selloff',
      cause: '📍 Bad Earnings',
      steps: [
        { icon: '📊', text: 'Company misses guidance', impact: 'trust is broken' },
        { icon: '🔴', text: 'Entire sector suspects problems', impact: 'contagion spreads' },
        { icon: '💰', text: 'Investors rotate to winners', impact: 'peers get sold too' },
      ],
      affected: ['Tech', 'Retail', 'Consumer Discretionary'],
      explanation: {
        whatItMeans: 'A major company in a sector reports earnings that miss expectations, and investors immediately worry other companies will do the same.',
        whyHappening: 'Earnings misses signal something is structurally wrong — demand weakening, competition rising, or costs soaring. If one company has this, others might too.',
        whatItAffects: [
          'The offending company drops 15–30%',
          'Competitors drop 5–15% on contagion',
          'Entire sector can underperform for weeks',
          'Money rotates to more profitable sectors',
        ],
        trekInterpretation: 'TREK sees a sector-wide problem forming. Avoid the sector for 3–4 weeks until survivors prove resilience.',
        whatToDoAboutIt: 'Don\'t panic sell good companies. But pause new entries into that sector. Wait for stabilization and proof of earnings recovery.',
        whatToWatchNext: 'Watch for the next round of sector earnings. Winners will outperform. TREK will flag the safest re-entry points.',
      },
    },
    {
      id: 'macro',
      title: 'Recession Signal → Risk-Off Rally',
      cause: '📍 Economic Weakness',
      steps: [
        { icon: '📉', text: 'GDP slows, unemployment rises', impact: 'recession risk emerges' },
        { icon: '🛑', text: 'Growth stocks get crushed', impact: 'cashflow becomes king' },
        { icon: '🏛️', text: 'Fed hints at rate cuts', impact: 'bond yields fall, safe havens surge' },
      ],
      affected: ['Tech', 'Discretionary', 'Industrials', 'Energy'],
      explanation: {
        whatItMeans: 'Economic data suggests the economy is slowing down. Companies will have less revenue, and unemployment will rise.',
        whyHappening: 'Recessions are part of economic cycles. High interest rates, weak consumer spending, or supply shocks can trigger them.',
        whatItAffects: [
          'Stock valuations compress (earnings down, rates up)',
          'Defaults increase (companies struggle to pay debt)',
          'Unemployment rises (less consumer spending)',
          'Recession-resistant stocks outperform (utilities, food, healthcare)',
        ],
        trekInterpretation: 'Recessions create the best buying opportunities. Quality companies at 30–50% discounts. But catch the falling knife with caution.',
        whatToDoAboutIt: 'Rotate to defensive sectors. Build cash. Wait for VIX to spike (peak fear). Buy high-quality names at 30%+ discounts.',
        whatToWatchNext: 'Watch for Fed rate cuts. When the Fed cuts rates, the recession is priced in, and recovery rallies typically follow. That\'s your entry signal.',
      },
    },
  ];

  const selected = chains.find(c => c.id === selectedChain);

  return (
    <>
      <ExplanationModal
        isOpen={showExplanation && selected}
        onClose={() => setShowExplanation(false)}
        title={selected?.title}
        explanation={selected?.explanation}
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Market Cause & Effect</h2>
          <button
            onClick={() => setShowExplanation(true)}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
            disabled={!selected}
          >
            <Info className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
        </div>

        {chains.map((chain, idx) => (
          <motion.button
            key={chain.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => {
              setSelectedChain(selectedChain === chain.id ? null : chain.id);
              if (selectedChain === chain.id) setShowExplanation(false);
            }}
            className={`w-full text-left rounded-2xl p-4 border transition-all ${
              selectedChain === chain.id
                ? 'border-primary/50 bg-primary/5'
                : 'border-white/5 bg-white/[0.02] hover:border-white/10'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-xs font-bold text-muted-foreground mb-1">{chain.title}</p>
                <p className="text-sm font-bold text-foreground">{chain.cause}</p>
              </div>
              <ChevronRight className={`w-4 h-4 text-foreground/40 transition-transform ${selectedChain === chain.id ? 'rotate-90' : ''}`} />
            </div>

            {/* Expanded Content */}
            {selectedChain === chain.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                {/* Chain Visualization */}
                <div className="mb-4 p-3 bg-white/[0.02] rounded-lg border border-white/5 space-y-2">
                  {chain.steps.map((step, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{step.icon}</span>
                        <div>
                          <p className="text-sm font-bold text-foreground">{step.text}</p>
                          <p className="text-xs text-muted-foreground">{step.impact}</p>
                        </div>
                      </div>
                      {i < chain.steps.length - 1 && <div className="ml-4 text-xs text-muted-foreground">↓</div>}
                    </div>
                  ))}
                </div>

                {/* Affected Assets */}
                <div className="mb-4">
                  <p className="text-xs font-bold text-muted-foreground mb-2">Most Affected:</p>
                  <div className="flex flex-wrap gap-2">
                    {chain.affected.map(asset => (
                      <div key={asset} className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/5 text-xs font-semibold text-foreground">
                        {asset}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Learn More Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExplanation(true);
                  }}
                  className="w-full text-center text-xs font-bold text-primary hover:text-primary/80 py-2 rounded-lg hover:bg-primary/5 transition-colors"
                >
                  Learn Full Context
                </button>
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </>
  );
}