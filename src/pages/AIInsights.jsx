import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, Shield, AlertTriangle, BarChart3, Send, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const PREDEFINED_SIGNALS = [
  { type: 'bullish', symbol: 'NVDA', title: 'Momentum Breakout', message: 'NVDA confirmed breakout above $870 key resistance. RSI divergence with increasing institutional volume. Neural network model: 85% probability of continued upside. Target: $920–$950.', confidence: 92, icon: TrendingUp, time: '2m ago', sector: 'Technology' },
  { type: 'alert', symbol: 'TSLA', title: 'Unusual Options Flow', message: 'Detected unusual call options volume. 340% above 20-day average. $180 strike, 2-week expiry. Institutional dark pool activity elevated. Potential catalyst: delivery numbers.', confidence: 87, icon: Zap, time: '8m ago', sector: 'Automotive' },
  { type: 'hedge', symbol: 'SPX', title: 'Volatility Warning', message: 'VIX term structure inversion detected. Historical pattern analysis: 73% probability of elevated volatility next 5 sessions. Recommend reducing net delta exposure.', confidence: 78, icon: Shield, time: '15m ago', sector: 'Index' },
  { type: 'bearish', symbol: 'META', title: 'Earnings Risk Alert', message: 'Sentiment analysis across 50K+ signals shows growing ad revenue concern. Put/call ratio elevated at 1.4. AI model flags downside risk pre-earnings. Reduce position size.', confidence: 71, icon: AlertTriangle, time: '22m ago', sector: 'Technology' },
  { type: 'bullish', symbol: 'AAPL', title: 'Cup & Handle Pattern', message: 'Daily chart forming textbook cup and handle. Volume confirmation on breakout attempt. Fundamental score 8.4/10. Price target: $195–$202 range over 3–4 weeks.', confidence: 84, icon: BarChart3, time: '31m ago', sector: 'Technology' },
  { type: 'alert', symbol: 'JPM', title: 'Sector Rotation Signal', message: 'Financial sector exhibiting strong relative strength. JPM leading rotation with above-average institutional inflows. Yield curve dynamics favorable for NIM expansion.', confidence: 81, icon: TrendingUp, time: '45m ago', sector: 'Financial' },
];

const typeConfig = {
  bullish: { label: 'BULLISH', color: 'text-chart-3', bg: 'bg-chart-3/8', border: 'border-chart-3/15', dot: 'bg-chart-3' },
  alert:   { label: 'ALERT',   color: 'text-primary', bg: 'bg-primary/8', border: 'border-primary/15', dot: 'bg-primary' },
  hedge:   { label: 'HEDGE',   color: 'text-chart-2', bg: 'bg-chart-2/8', border: 'border-chart-2/15', dot: 'bg-chart-2' },
  bearish: { label: 'BEARISH', color: 'text-destructive', bg: 'bg-destructive/8', border: 'border-destructive/15', dot: 'bg-destructive' },
};

const SUGGESTED = [
  'Is NVDA overbought?',
  'Fed rate outlook 2025',
  'Best sectors for Q2',
  'Bitcoin next resistance',
];

export default function AIInsights() {
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAI = async (q) => {
    const question = q || query;
    if (!question.trim()) return;
    setQuery(question);
    setLoading(true);
    setAiResponse('');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are TREDIA AI — a premium institutional-grade trading intelligence assistant. Provide concise, data-driven analysis. Use precise financial language. Include specific levels, probabilities, and actionable insight. Keep under 180 words.\n\nQuestion: ${question}`,
      add_context_from_internet: true,
    });
    setAiResponse(result);
    setLoading(false);
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-8 w-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white/95 tracking-tight leading-none">AI Intelligence</h1>
            <p className="text-[11px] text-white/30 font-medium mt-0.5">Institutional-grade signals · Real-time analysis</p>
          </div>
        </div>
      </motion.div>

      {/* AI Ask Box */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-primary/20 bg-[#111118] overflow-hidden glow-gold"
      >
        {/* Top gold line */}
        <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-bold text-white/90">Ask TREDIA AI</span>
            <span className="text-[9px] font-mono font-bold text-primary/50 bg-primary/8 px-1.5 py-0.5 rounded border border-primary/15 ml-auto tracking-wider">GPT-4 · WEB</span>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Ask about any stock, strategy, or market condition..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
              className="bg-white/[0.04] border-white/[0.07] h-10 text-[12px] text-white/80 placeholder:text-white/20 focus:border-primary/40"
            />
            <Button
              onClick={() => handleAskAI()}
              disabled={loading}
              size="sm"
              className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {/* Suggested queries */}
          {!aiResponse && !loading && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {SUGGESTED.map((s) => (
                <button
                  key={s}
                  onClick={() => handleAskAI(s)}
                  className="text-[10px] text-white/35 hover:text-white/70 bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] px-2.5 py-1 rounded-lg transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <AnimatePresence>
            {(aiResponse || loading) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 p-4 rounded-lg bg-white/[0.03] border border-white/[0.07]"
              >
                {loading ? (
                  <div className="flex items-center gap-2.5 text-[11px] text-white/35">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                    <span>Analyzing market data...</span>
                    <div className="flex gap-1 ml-auto">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-1 w-1 rounded-full bg-primary/50 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[12px] text-white/75 leading-relaxed font-medium whitespace-pre-wrap">{aiResponse}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Signals Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-[0.1em]">Live Signal Feed</h2>
          <span className="text-[9px] font-mono text-white/25">{PREDEFINED_SIGNALS.length} signals · updated now</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {PREDEFINED_SIGNALS.map((signal, i) => {
            const cfg = typeConfig[signal.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card-hover rounded-xl border border-white/[0.07] bg-[#111118] p-4 cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                    <signal.icon className={`h-5 w-5 ${cfg.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black font-mono text-[13px] text-white/90">{signal.symbol}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                          {cfg.label}
                        </span>
                        <span className="text-[9px] text-white/25 font-medium">{signal.sector}</span>
                      </div>
                      <span className="text-[9px] font-mono text-white/25">{signal.time}</span>
                    </div>
                    <h4 className="text-[12px] font-bold text-white/80 mb-1.5">{signal.title}</h4>
                    <p className="text-[11px] text-white/40 leading-relaxed mb-3">{signal.message}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${signal.confidence}%` }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold text-primary">{signal.confidence}%</span>
                      </div>
                      <span className="text-[9px] text-white/20">confidence</span>
                      <button className="ml-auto flex items-center gap-0.5 text-[10px] text-white/25 hover:text-white/60 transition-colors">
                        Details <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}