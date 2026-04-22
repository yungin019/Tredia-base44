import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


// Extract the key TREK signal line from the full AI response
function extractSummaryLine(text) {
  if (!text) return null;
  // Try to get the "TREK SAYS:" line first
  const trekSays = text.match(/TREK SAYS[:\s]+(.+)/i);
  if (trekSays) return trekSays[1].trim();
  // Try to extract the first sentence of real content (skip header lines)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('⚡') && !l.startsWith('━') && !l.startsWith('—'));
  return lines[0] || text.slice(0, 120);
}

// Parse signal from AI text (BUY/SELL/HOLD/WATCH) to override static
function parseSignalFromText(text) {
  if (!text) return null;
  const m = text.match(/TREK SAYS:\s*(BUY|SELL|HOLD|WATCH|STRONG BUY|STRONG SELL)/i);
  if (m) return m[1].toUpperCase();
  const verdict = text.match(/VERDICT[:\s]+(STRONG BUY|STRONG SELL|BUY|SELL|HOLD|WATCH)/i);
  if (verdict) return verdict[1].toUpperCase();
  return null;
}

export default function TrekInstantRead({ symbol, signal, trekText, trekLoading }) {
  const navigate = useNavigate();

  // Use AI-parsed signal if available, otherwise fall back to static
  const aiSignal = parseSignalFromText(trekText);
  const activeSignal = aiSignal || signal;

  // Derive sentiment from the active signal (consistent with main analysis)
  const sentiment = (activeSignal === 'BUY' || activeSignal === 'STRONG BUY') ? 'BULLISH'
    : (activeSignal === 'SELL' || activeSignal === 'STRONG SELL' || activeSignal === 'AVOID') ? 'BEARISH'
    : 'NEUTRAL';

  const summaryLine = extractSummaryLine(trekText);
  const analysis = summaryLine ? { text: summaryLine, sentiment } : null;
  const loading = trekLoading ?? false;

  const getColors = () => {
    if (analysis?.sentiment === 'BULLISH') return { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', text: '#22c55e' };
    if (analysis?.sentiment === 'BEARISH') return { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', text: '#ef4444' };
    return { bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.25)', text: '#F59E0B' };
  };

  const colors = getColors();
  const icon = analysis?.sentiment === 'BULLISH' ? '🟢' : analysis?.sentiment === 'BEARISH' ? '🔴' : '🟡';

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
              <span className="font-bold" style={{ color: colors.text }}>{analysis?.sentiment}</span> — {analysis?.text}
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