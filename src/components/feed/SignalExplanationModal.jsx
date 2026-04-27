import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, AlertCircle, TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const CATEGORY_LABELS = {
  macro: 'Macro Event',
  earnings: 'Earnings',
  geopolitical: 'Geopolitical',
  economic_data: 'Economic Data',
  central_bank: 'Central Bank',
  corporate: 'Corporate',
};

export default function SignalExplanationModal({ signal, isOpen, onClose }) {
  const { t } = useTranslation();
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
              <h2 className="text-lg font-bold text-white">{t('feed.signalExplanation', 'TREK Signal Explanation')}</h2>
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
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">{t('feed.newsHeadline', 'News Headline')}</h3>
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
                      {t('feed.viewOriginal', 'View Original')}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Market State */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">{t('feed.marketContext', 'Market Context')}</h3>
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
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">{t('feed.whatsDriverThis', "What's Driving This")}</h3>
              <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <p className="text-sm text-white/75">{signal.driver}</p>
              </div>
            </div>

            {/* Impact */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">{t('feed.expectedImpact', 'Expected Impact')}</h3>
              <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.08]">
                <p className="text-sm text-white/75">{signal.impact}</p>
              </div>
            </div>

            {/* What Matters Now */}
            {signal.watch_next && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">{t('feed.whatMattersNow', 'What Matters Now')}</h3>
                <div className="px-4 py-3 rounded-lg bg-yellow-500/[0.05] border border-yellow-500/[0.15]">
                  <p className="text-sm text-white/75">{signal.watch_next}</p>
                </div>
              </div>
            )}

            {/* Affected Assets & Sectors */}
            {signal.related_assets && signal.related_assets.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">{t('feed.affectedAssets', 'Affected Assets')}</h3>
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
                <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">{t('feed.regionsAffected', 'Regions Affected')}</h3>
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
                {t('feed.keyRisk', 'Key Risk / Invalidation')}
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
                  {t('feed.tradeSetup', 'Trade Setup')}
                </h3>
                <div className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(245,158,11,0.25)', background: 'rgba(245,158,11,0.05)' }}>
                  <div className="px-4 py-3 space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="text-[9px] font-black text-yellow-500/60 uppercase tracking-widest w-20 flex-shrink-0 pt-0.5">{t('asset.entry', 'Entry')}</span>
                      <span className="text-sm text-white/80 font-medium">{signal.trade_setup.entry}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest w-20 flex-shrink-0 pt-0.5">{t('feed.invalid', 'Invalidation')}</span>
                      <span className="text-sm text-white/80 font-medium">{signal.trade_setup.invalidation}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-[9px] font-black text-white/25 uppercase tracking-widest w-20 flex-shrink-0 pt-0.5">{t('feed.time', 'Timeframe')}</span>
                      <span className="text-sm text-white/60">{signal.trade_setup.timeframe}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Bias */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">{t('trek.signal', 'TREK Signal')}</h3>
              <div
                className="px-4 py-3 rounded-lg border flex items-center justify-between"
                style={{ background: biasColor.bg, border: `1px solid ${biasColor.border}` }}
              >
                <span style={{ color: biasColor.text, fontWeight: 'bold', fontSize: '14px' }}>
                  {signal.action_bias === 'bullish' ? '↗ Bullish' : '↘ Bearish'} Bias
                </span>
                <span style={{ fontSize: '12px', color: biasColor.text, opacity: 0.7 }}>
                  {t('trek.confidence', 'Confidence')}: {signal.confidence}%
                </span>
              </div>
            </div>

            {/* Share to Discord */}
            <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between gap-3">
              <p className="text-xs text-white/30 flex-1">
                {isStructure
                  ? t('feed.structureSignalNote', '⚡ Structure signal generated from live market price action.')
                  : t('feed.newsSignalNote', 'News signal interpreted by TREK intelligence engine.')}
              </p>
              <a
                href="https://discord.gg/tredio"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all hover:opacity-90 flex-shrink-0"
                style={{ background: 'rgba(88,101,242,0.15)', border: '1px solid rgba(88,101,242,0.3)', color: '#7289da' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.031.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                {t('discord.shareToDiscord', 'Share to Discord')}
              </a>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}