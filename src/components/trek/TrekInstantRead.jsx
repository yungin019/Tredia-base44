import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { askTrek } from '@/api/trek';
import { buildMarketContext } from '@/api/marketContext';
import { base44 } from '@/api/base44Client';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';

export default function TrekInstantRead({ symbol }) {
  const navigate = useNavigate();
  const { tier } = useSubscriptionStatus();
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    async function fetchInstantRead() {
      setLoading(true);
      try {
        const [marketContext, user] = await Promise.all([
          buildMarketContext(),
          base44.auth.me(),
        ]);

        const prompt = tier === 'free'
          ? `Give me a one-sentence general market direction for ${symbol}. No specific prices.`
          : `Give me a one-sentence TREK instant read for ${symbol} with exact price level.`;

        const messages = [{ role: 'user', content: prompt }];
        const reply = await askTrek(messages, marketContext, user, tier);

        const sentiment = reply.toLowerCase().includes('buy') || reply.toLowerCase().includes('bullish')
          ? 'BULLISH'
          : reply.toLowerCase().includes('sell') || reply.toLowerCase().includes('bearish')
          ? 'BEARISH'
          : 'NEUTRAL';

        setAnalysis({ text: reply, sentiment });
      } catch (e) {
        console.error('TrekInstantRead error:', e);
        setAnalysis({
          text: `${symbol} analysis unavailable. Check AIInsights for full details.`,
          sentiment: 'NEUTRAL'
        });
      } finally {
        setLoading(false);
      }
    }

    fetchInstantRead();
  }, [symbol, tier]);

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
