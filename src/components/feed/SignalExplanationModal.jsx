import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, AlertCircle, TrendingUp, TrendingDown, Zap } from 'lucide-react';

const CATEGORY_LABELS = {
  macro: 'Macro Event',
  earnings: 'Earnings',
  geopolitical: 'Geopolitical',
  economic_data: 'Economic Data',
  central_bank: 'Central Bank',
  corporate: 'Corporate',
};

export default function SignalExplanationModal({ signal, isOpen, onClose }) {
  if (!isOpen || !signal) return null;

  const isStructure = signal.type === 'structure';
  const biasColor = signal.action_bias === 'bullish' 
    ? { bg: 'rgba(14,200,220,0.1)', border: 'rgba(14,200,220,0.3)', text: '#0ec8dc' }
    : { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-2xl rounded-2xl overflow-hidden max-h-[85vh] overflow-y-auto"
          style={{
            background: 'rgba(8, 18, 42, 0.95)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(100,220,255,0.15)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 px-6 py-4 border-b border-white/[0.05] flex items-center justify-between" style={{ background: 'rgba(4,8,20,0.8)', backdropFilter: 'blur(24px)' }}>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">TREK Signal Explanation</h2>
              {isStructure && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <Zap className="h-3 w-3 text-yellow-500" />
                  <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Live Structure</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              <X className="h-5 w-5 text-white/60" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Headline (News only) */}
            {!isStructure && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">News Headline</h3>
                <p className="text-sm font-semibold text-white leading-snug">{signal.headline}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-white/40">{signal.source_name}</span>
                  {signal.source_url && (
                    <a
                      href={signal.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View Original
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Market State */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Market Context</h3>
              <div
                className="px-4 py-3 rounded-lg border"
                style={{
                  background: 'rgba(14,200,220,0.08)',
                  border: '1px solid rgba(14,200,220,0.2)',
                }}
              >
                <p className="text-sm text-white/80">{signal.market_state}</p>
              </div>
            </div>

            {/* Driver */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">What's Driving This</h3>
              <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <p className="text-sm text-white/75">{signal.driver}</p>
              </div>
            </div>

            {/* Impact */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Expected Impact</h3>
              <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <p className="text-sm text-white/75">{signal.impact}</p>
              </div>
            </div>

            {/* What Matters Now */}
            {signal.watch_next && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">What Matters Now</h3>
                <div className="px-4 py-3 rounded-lg bg-yellow-500/[0.05] border border-yellow-500/[0.15]">
                  <p className="text-sm text-white/75">{signal.watch_next}</p>
                </div>
              </div>
            )}

            {/* Affected Assets & Sectors */}
            {signal.related_assets && signal.related_assets.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Affected Assets</h3>
                <div className="flex flex-wrap gap-2">
                  {signal.related_assets.map((symbol, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-lg font-mono font-semibold"
                      style={{
                        background: 'rgba(14,200,220,0.1)',
                        border: '1px solid rgba(14,200,220,0.2)',
                        color: '#0ec8dc'
                      }}
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Regions */}
            {signal.regions && signal.regions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Regions Affected</h3>
                <div className="flex flex-wrap gap-2">
                  {signal.regions.map((region, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold"
                      style={{
                        background: 'rgba(100,220,255,0.1)',
                        border: '1px solid rgba(100,220,255,0.2)',
                        color: 'rgba(150,230,255,0.7)'
                      }}
                    >
                      {region}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Risk / Invalidation */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Key Risk / Invalidation
              </h3>
              <div className="px-4 py-3 rounded-lg bg-orange-500/[0.08] border border-orange-500/[0.2]">
                <p className="text-sm text-white/75">{signal.risk}</p>
              </div>
            </div>

            {/* Trade Setup */}
            {signal.trade_setup && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider flex items-center gap-2">
                  <Zap className="h-4 w-4" style={{ color: '#f59e0b' }} />
                  Trade Setup
                </h3>
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.05)' }}>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-[9px] font-black text-yellow-500/60 uppercase tracking-widest w-20 flex-shrink-0 pt-0.5">Entry</span>
                      <span className="text-sm text-white/80 font-medium">{signal.trade_setup.entry}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest w-20 flex-shrink-0 pt-0.5">Invalidation</span>
                      <span className="text-sm text-white/80 font-medium">{signal.trade_setup.invalidation}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[9px] font-black text-white/25 uppercase tracking-widest w-20 flex-shrink-0 pt-0.5">Timeframe</span>
                      <span className="text-sm text-white/60">{signal.trade_setup.timeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bias */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">TREK Signal</h3>
              <div
                className="px-4 py-3 rounded-lg border flex items-center justify-between"
                style={{ background: biasColor.bg, border: `1px solid ${biasColor.border}` }}
              >
                <span style={{ color: biasColor.text, fontWeight: 'bold', fontSize: '14px' }}>
                  {signal.action_bias === 'bullish' ? '↗ Bullish' : '↘ Bearish'} Bias
                </span>
                <span style={{ fontSize: '12px', color: biasColor.text, opacity: 0.7 }}>
                  Confidence: {signal.confidence}%
                </span>
              </div>
            </div>

            {/* Footer info */}
            <div className="pt-4 border-t border-white/[0.05]">
              {isStructure ? (
                <p className="text-xs text-white/30">
                  ⚡ Structure signal generated from live market price action, volatility, and sentiment analysis.
                </p>
              ) : (
                <p className="text-xs text-white/30">
                  News signal interpreted by TREK anticipatory intelligence engine.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}