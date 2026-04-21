import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// TrekInstantRead now accepts a shared `trekSignal` object from the parent (AssetDetail)
// so it always shows the same data as the TREK Analysis card below.
export default function TrekInstantRead({ symbol, trekSignal, loading }) {
  const navigate = useNavigate();

  const sentiment = trekSignal?.sentiment || 'NEUTRAL';
  const getColors = () => {
    if (sentiment === 'BULLISH') return { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' };
    if (sentiment === 'BEARISH') return { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' };
    return { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', text: '#F59E0B' };
  };

  const colors = getColors();
  const icon = sentiment === 'BULLISH' ? '🟢' : sentiment === 'BEARISH' ? '🔴' : '🟡';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 mb-4"
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderLeft: `4px solid ${colors.text}`
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-4 w-4" style={{ color: colors.text }} />
        <span className="text-xs font-black uppercase tracking-wider" style={{ color: colors.text }}>
          ⚡ TREK INSTANT READ
        </span>
        {loading && <Loader2 className="h-3 w-3 animate-spin ml-auto" style={{ color: colors.text }} />}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-white/40">
          <div className="flex gap-1">
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>●</motion.span>
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>●</motion.span>
            <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>●</motion.span>
          </div>
          <span>Analyzing {symbol}...</span>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-2 mb-4">
            <span className="text-lg flex-shrink-0">{icon}</span>
            <p className="text-sm text-white/85 leading-relaxed flex-1">
              <span className="font-bold" style={{ color: colors.text }}>{sentiment}</span>
              {trekSignal?.confidence ? <span className="text-white/40 text-xs ml-1">· {trekSignal.confidence}% confidence</span> : null}
              {' — '}{trekSignal?.text || `${symbol} is showing ${sentiment.toLowerCase()} signals based on current market conditions.`}
            </p>
          </div>

          <button
            onClick={() => navigate('/AIInsights')}
            className="flex items-center gap-2 text-xs font-bold transition-colors hover:opacity-80"
            style={{ color: colors.text }}
          >
            Full Analysis <ArrowRight className="h-3 w-3" />
          </button>
        </>
      )}
    </motion.div>
  );
}