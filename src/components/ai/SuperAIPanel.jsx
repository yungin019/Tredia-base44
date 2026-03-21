import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Share2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { buildMarketContext } from '@/api/marketContext';

const VERDICT_COLORS = {
  'STRONG BUY': '#22c55e',
  'BUY': '#86efac',
  'HOLD': '#F59E0B',
  'SELL': '#f87171',
  'STRONG SELL': '#ef4444',
};

const LOADING_STEPS = [
  '⚡ Activating Super AI...',
  '🧠 Claude analyzing technicals...',
  '🤖 GPT-4 analyzing fundamentals...',
  '💎 Gemini analyzing sentiment...',
  'Combining 3 AI perspectives...',
];

function ModelCard({ emoji, name, role, analysis, verdict, delay }) {
  const verdictColor = verdict === 'BULLISH' ? '#22c55e' : verdict === 'BEARISH' ? '#ef4444' : '#F59E0B';
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{emoji}</span>
          <div>
            <p className="text-[11px] font-black text-white/90">{name}</p>
            <p className="text-[9px] text-white/35 uppercase tracking-wider">{role}</p>
          </div>
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded-full" style={{ background: `${verdictColor}20`, color: verdictColor, border: `1px solid ${verdictColor}40` }}>
          {verdict}
        </span>
      </div>
      <p className="text-[11px] text-white/60 leading-relaxed">{analysis}</p>
    </motion.div>
  );
}

export default function SuperAIPanel({ question, onClose, isElite }) {
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [ran, setRan] = useState(false);

  const run = async () => {
    if (!question?.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setRan(true);

    // Animate loading steps
    for (let i = 0; i < LOADING_STEPS.length; i++) {
      setLoadingStep(i);
      await new Promise(r => setTimeout(r, 700));
    }

    try {
      const marketContext = await buildMarketContext().catch(() => null);
      const res = await base44.functions.invoke('superAI', { question, marketContext });
      if (res.data?.error) throw new Error(res.data.error);
      setResult(res.data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run when component mounts if we have a question
  React.useEffect(() => {
    if (question && !ran) run();
  }, [question]);

  const verdictColor = result ? (VERDICT_COLORS[result.master?.action] || '#F59E0B') : '#F59E0B';

  const share = () => {
    if (!result) return;
    const text = `⚡ SUPER AI ANALYSIS\n${question}\n\nVerdict: ${result.master?.action}\nConfidence: ${result.master?.confidence}%\nConsensus: ${result.master?.consensus}\n\nPowered by TREDIO`;
    navigator.share?.({ text }) || navigator.clipboard?.writeText(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: '#0c0c18',
        border: loading ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(245,158,11,0.25)',
        boxShadow: loading ? '0 0 30px rgba(245,158,11,0.15), 0 0 60px rgba(245,158,11,0.06)' : '0 8px 40px rgba(0,0,0,0.5)',
        animation: loading ? 'pulseBorderGold 1.5s ease-in-out infinite' : 'none',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]"
        style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), transparent)' }}>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-[12px] font-black text-primary uppercase tracking-wider">Super AI</span>
          <span className="text-[9px] text-white/30 font-mono">3 MODELS · PARALLEL</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {/* Question */}
        {question && (
          <div className="text-[11px] text-white/40 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            "{question}"
          </div>
        )}

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 py-2">
              {LOADING_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: i <= loadingStep ? 1 : 0.2, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-[11px]"
                  style={{ color: i === loadingStep ? '#F59E0B' : 'rgba(255,255,255,0.3)' }}
                >
                  {i === loadingStep && (
                    <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  )}
                  {i !== loadingStep && <span className="w-1.5 h-1.5 rounded-full bg-white/10 flex-shrink-0" />}
                  {step}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        {result && !loading && (
          <div className="space-y-3">
            <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.15em] text-center py-1">— Individual Analysis —</div>

            <ModelCard emoji="🧠" name="CLAUDE" role="Technical View" analysis={result.claude?.analysis} verdict={result.claude?.verdict} delay={0} />
            <ModelCard emoji="🤖" name="GPT-4" role="Fundamental View" analysis={result.gpt?.analysis} verdict={result.gpt?.verdict} delay={0.1} />
            <ModelCard emoji="💎" name="GEMINI" role="Sentiment View" analysis={result.gemini?.analysis} verdict={result.gemini?.verdict} delay={0.2} />

            {/* Master Verdict */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl p-4 text-center"
              style={{
                background: `linear-gradient(135deg, ${verdictColor}10, rgba(0,0,0,0.3))`,
                border: `2px solid ${verdictColor}40`,
                boxShadow: `0 0 30px ${verdictColor}15`,
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="h-3.5 w-3.5" style={{ color: verdictColor }} />
                <span className="text-[9px] font-black uppercase tracking-[0.15em]" style={{ color: verdictColor }}>TREK MASTER VERDICT</span>
                <Zap className="h-3.5 w-3.5" style={{ color: verdictColor }} />
              </div>
              <p className="text-[22px] font-black mb-2" style={{ color: verdictColor }}>{result.master?.action}</p>
              <p className="text-[11px] text-white/50 mb-1">{result.master?.consensus}</p>
              <p className="text-[13px] font-bold" style={{ color: verdictColor }}>Confidence: {result.master?.confidence}%</p>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center justify-between">
              <p className="text-[9px] text-white/20">TREK Intelligence · Not financial advice</p>
              <button onClick={share} className="flex items-center gap-1.5 text-[10px] text-white/40 hover:text-white/70 transition-colors">
                <Share2 className="h-3 w-3" /> Share
              </button>
            </motion.div>
          </div>
        )}

        {error && (
          <div className="text-[11px] text-red-400/70 text-center py-3">{error}</div>
        )}
      </div>
    </motion.div>
  );
}