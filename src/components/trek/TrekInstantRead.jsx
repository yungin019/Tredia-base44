import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Parse signal from AI text (BUY/SELL/HOLD/WATCH) to override static
function parseSignalFromText(text) {
  if (!text) return null;
  const m = text.match(/TREK SAYS:\s*(BUY|SELL|HOLD|WATCH|STRONG BUY|STRONG SELL)/i);
  if (m) return m[1].toUpperCase();
  const verdict = text.match(/VERDICT[:\s]+(STRONG BUY|STRONG SELL|BUY|SELL|HOLD|WATCH)/i);
  if (verdict) return verdict[1].toUpperCase();
  return null;
}

// Extract just the first meaningful sentence for the header summary
function extractSummaryLine(text) {
  if (!text) return null;
  const trekSays = text.match(/TREK SAYS[:\s]+(.+)/i);
  if (trekSays) return trekSays[1].trim();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('⚡') && !l.startsWith('━') && !l.startsWith('—'));
  return lines[0] || text.slice(0, 120);
}

export default function TrekInstantRead({ symbol, signal, trekText, trekLoading, aiConfidence, conviction }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();

  const aiSignal = parseSignalFromText(trekText);
  const activeSignal = aiSignal || signal;

  const sentiment = (activeSignal === 'BUY' || activeSignal === 'STRONG BUY') ? 'BULLISH'
    : (activeSignal === 'SELL' || activeSignal === 'STRONG SELL' || activeSignal === 'AVOID') ? 'BEARISH'
    : 'NEUTRAL';

  const summaryLine = extractSummaryLine(trekText);
  const loading = trekLoading ?? false;

  const getColors = () => {
    if (sentiment === 'BULLISH') return { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.25)', text: '#22c55e', left: '#22c55e' };
    if (sentiment === 'BEARISH') return { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', text: '#ef4444', left: '#ef4444' };
    return { bg: 'rgba(251,191,36,0.07)', border: 'rgba(251,191,36,0.2)', text: '#F59E0B', left: '#F59E0B' };
  };
  const colors = getColors();
  const icon = sentiment === 'BULLISH' ? '🟢' : sentiment === 'BEARISH' ? '🔴' : '🟡';
  const cvColor = conviction === 'HIGH' ? '#22c55e' : conviction === 'MEDIUM' ? '#F59E0B' : '#6b7280';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl mb-4 overflow-hidden"
      style={{ background: colors.bg, border: `1px solid ${colors.border}`, borderLeft: `4px solid ${colors.left}` }}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-3">
        <Zap className="h-3.5 w-3.5 flex-shrink-0" style={{ color: colors.text }} />
        <span className="text-[10px] font-black uppercase tracking-[0.12em]" style={{ color: colors.text }}>
          ⚡ {t('trek.analysis', 'TREK Analysis')}
        </span>
        {(aiConfidence || conviction) && !loading && (
          <span className="ml-auto text-[10px] font-black" style={{ color: cvColor }}>
            {aiConfidence ? `${aiConfidence}% ${t('trek.confidence', 'confidence')}` : ''}{conviction ? ` · ${conviction}` : ''}
          </span>
        )}
        {loading && <Loader2 className="h-3 w-3 animate-spin ml-auto" style={{ color: colors.text }} />}
      </div>

      {/* Summary line — always visible */}
      <div className="px-4 pb-3">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-white/40">
            <div className="flex gap-1">
              {[0, 0.2, 0.4].map((delay, i) => (
                <motion.span key={i} animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay }}>●</motion.span>
              ))}
            </div>
            <span className="text-[12px]">{t('asset.analyzing', 'Analyzing')} {symbol}…</span>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <span className="text-base flex-shrink-0">{icon}</span>
            <p className="text-[12px] text-white/85 leading-relaxed flex-1">
              <span className="font-bold" style={{ color: colors.text }}>{sentiment}</span>
              {summaryLine ? ` — ${summaryLine}` : ''}
            </p>
          </div>
        )}
      </div>

      {/* Expand toggle — only when full text is available */}
      {trekText && !loading && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            className="w-full flex items-center gap-1.5 px-4 py-2 text-[10px] font-bold border-t transition-colors"
            style={{ color: colors.text, borderColor: `${colors.border}`, background: 'rgba(0,0,0,0.15)' }}
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? t('asset.showLess', 'Show less') : t('asset.seeFullAnalysis', 'See full analysis')}
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                <div className="px-4 py-3 text-[12px] text-white/70 leading-relaxed whitespace-pre-line border-t"
                  style={{ borderColor: colors.border }}>
                  {trekText}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </motion.div>
  );
}