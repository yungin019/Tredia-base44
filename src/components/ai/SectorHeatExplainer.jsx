import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import ExplanationModal from '@/components/ui/ExplanationModal';

const SECTORS = [
  {
    name: 'Technology',
    heat: 85,
    movers: [
      { symbol: 'NVDA', price: 871.20, change: 5.1, reason: 'AI chip demand surge', confidence: 87 },
      { symbol: 'META', price: 542.80, change: -2.3, reason: 'Earnings guidance caution', confidence: 65 },
      { symbol: 'MSFT', price: 415.80, change: 1.8, reason: 'Cloud growth steady', confidence: 72 },
    ],
    driver: 'AI infrastructure capex race accelerating. NVIDIA orders from hyperscalers at record pace.',
    riskWatch: 'Valuation stretched. Earnings cuts could cascade.',
    whatToWatch: 'NVIDIA earnings guidance, AMD competitive position, cloud spending trends',
  },
  {
    name: 'Financial Services',
    heat: 62,
    movers: [
      { symbol: 'JPM', price: 201.50, change: 1.5, reason: 'Net interest margin benefits', confidence: 68 },
      { symbol: 'BAC', price: 35.20, change: 0.8, reason: 'Yield curve steepening', confidence: 55 },
    ],
    driver: 'Yield curve steepening = wider NIM. But recession fears starting to creep in.',
    riskWatch: 'Credit quality deterioration. Commercial real estate exposure.',
    whatToWatch: 'Credit spreads, loan growth, deposit flows, commercial real estate stress',
  },
  {
    name: 'Energy',
    heat: 72,
    movers: [
      { symbol: 'XLE', price: 89.50, change: 3.2, reason: 'Oil breakout, supply concerns', confidence: 78 },
      { symbol: 'CVX', price: 125.80, change: 2.8, reason: 'Dividend appeal + production', confidence: 71 },
    ],
    driver: 'Geopolitical supply shock tightens market. OPEC+ production cuts supporting price.',
    riskWatch: 'Oil demand destruction if recession hits. Alternative energy policy shifts.',
    whatToWatch: 'WTI crude levels, OPEC announcements, demand data, alternative energy policy',
  },
  {
    name: 'Healthcare',
    heat: 48,
    movers: [
      { symbol: 'JNJ', price: 159.30, change: 0.5, reason: 'Defensive appeal', confidence: 52 },
    ],
    driver: 'Defensive positioning. GLP-1 sector benefiting from obesity drug trend.',
    riskWatch: 'Drug pricing pressure. Patent cliffs coming.',
    whatToWatch: 'FDA approvals, drug pricing legislation, biotech M&A activity',
  },
];

export default function SectorHeatExplainer() {
  const [expandedSector, setExpandedSector] = useState(null);
  const [explanationModal, setExplanationModal] = useState({ isOpen: false, data: null });

  const handleSectorClick = (sector) => {
    setExpandedSector(expandedSector === sector.name ? null : sector.name);
  };

  const handleLearnMore = (sector) => {
    setExplanationModal({
      isOpen: true,
      data: {
        title: `${sector.name} Sector Deep Dive`,
        explanation: {
          whatItMeans: `This sector is showing ${sector.heat > 70 ? 'strong bullish' : sector.heat > 50 ? 'mixed' : 'weak'} momentum. The heat score reflects price action, volume, and institutional positioning across major names.`,
          whyHappening: sector.driver,
          whatItAffects: sector.movers.map(m => `${m.symbol}: ${m.reason}`),
          trekInterpretation: `I'm seeing ${sector.heat > 70 ? 'conviction buying' : 'cautious positioning'} in ${sector.name}. The moves are real but watch the second-order effects.`,
          whatToWatchNext: sector.whatToWatch,
          risks: sector.riskWatch,
          whatToDoAboutIt: `Consider overweighting the strongest movers (${sector.movers[0]?.symbol}) but use stops. If sector heat cools, be ready to rotate.`,
        },
      },
    });
  };

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🌡️</span>
            <div>
              <h2 className="text-base font-bold text-foreground tracking-tight">Sector Heat Map</h2>
              <p className="text-xs text-muted-foreground">Which sectors are moving + why</p>
            </div>
          </div>
          <button
            onClick={() => handleLearnMore(SECTORS[0])}
            className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors group flex items-center gap-1"
          >
            Learn More
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="space-y-2">
          {SECTORS.map((sector, idx) => {
            const isExpanded = expandedSector === sector.name;
            const heatColor = sector.heat > 70 ? 'from-success/20 to-success/5' : sector.heat > 50 ? 'from-warning/20 to-warning/5' : 'from-muted/20 to-muted/5';
            const heatBorder = sector.heat > 70 ? 'border-success/25' : sector.heat > 50 ? 'border-warning/25' : 'border-muted/25';

            return (
              <motion.div
                key={sector.name}
                layout
                className={`rounded-2xl border overflow-hidden transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] glass-card ${heatBorder}`}
                style={{ background: `linear-gradient(135deg, ${heatColor.split(' ')[1]} 0%, ${heatColor.split(' ')[2]} 100%)` }}
                onClick={() => handleSectorClick(sector)}
              >
                {/* Summary */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-foreground">{sector.name}</h3>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-primary">{sector.heat}/100</div>
                      <div className="text-xs text-muted-foreground">Heat Score</div>
                    </div>
                  </div>

                  {/* Heat Bar */}
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sector.heat}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full ${sector.heat > 70 ? 'bg-success' : sector.heat > 50 ? 'bg-warning' : 'bg-muted'}`}
                    />
                  </div>

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Top movers: {sector.movers.slice(0, 2).map(m => m.symbol).join(', ')}</span>
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-white/5 px-4 py-4 space-y-4"
                    >
                      {/* Driver */}
                      <div>
                        <div className="flex items-start gap-2 mb-2">
                          <Zap className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-bold text-primary mb-1">What's Driving It</p>
                            <p className="text-sm text-foreground leading-relaxed">{sector.driver}</p>
                          </div>
                        </div>
                      </div>

                      {/* Movers */}
                      <div>
                        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase">Top Movers</p>
                        <div className="space-y-2">
                          {sector.movers.map((m, i) => (
                            <motion.div
                              key={m.symbol}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 hover:border-primary/25 transition-colors cursor-pointer"
                            >
                              <div className="flex-1">
                                <p className="font-bold text-foreground text-sm">{m.symbol}</p>
                                <p className="text-xs text-muted-foreground">{m.reason}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-mono font-bold text-sm text-foreground">${m.price}</p>
                                <p className={`text-xs font-semibold ${m.change > 0 ? 'text-success' : 'text-destructive'}`}>
                                  {m.change > 0 ? '+' : ''}{m.change}%
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Risk Alert */}
                      <div className="bg-warning/10 border border-warning/25 rounded-xl p-3 flex gap-3">
                        <AlertTriangle className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-warning mb-1">Watch For</p>
                          <p className="text-xs text-foreground leading-snug">{sector.riskWatch}</p>
                        </div>
                      </div>

                      {/* Learn More Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLearnMore(sector);
                        }}
                        className="w-full py-2.5 rounded-lg bg-primary/10 hover:bg-primary/15 border border-primary/25 text-primary font-semibold text-sm transition-all"
                      >
                        Deep Dive →
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      <ExplanationModal
        isOpen={explanationModal.isOpen}
        onClose={() => setExplanationModal({ isOpen: false, data: null })}
        title={explanationModal.data?.title}
        explanation={explanationModal.data?.explanation}
      />
    </>
  );
}