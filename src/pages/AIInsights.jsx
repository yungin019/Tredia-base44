import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, Shield, AlertTriangle, BarChart3, Send, Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const PREDEFINED_SIGNALS = [
  { type: 'bullish', symbol: 'NVDA', title: 'Momentum Breakout', message: 'NVDA showing strong momentum breakout above key resistance at $870. RSI divergence confirmed with increasing volume. Neural network model predicts 85% probability of continued upward movement.', confidence: 92, icon: TrendingUp, time: '2 min ago' },
  { type: 'alert', symbol: 'TSLA', title: 'Unusual Options Activity', message: 'Detected unusual call options volume for TSLA expiring next Friday. Volume spike 340% above 20-day average. Institutional positioning suggests bullish sentiment shift.', confidence: 87, icon: Zap, time: '8 min ago' },
  { type: 'hedge', symbol: 'SPX', title: 'Volatility Warning', message: 'VIX term structure inversion detected. Historical pattern analysis suggests 73% probability of increased market volatility in the next 5 trading sessions. Consider portfolio hedging strategies.', confidence: 78, icon: Shield, time: '15 min ago' },
  { type: 'bearish', symbol: 'META', title: 'Earnings Risk Alert', message: 'Sentiment analysis across 50K+ social signals indicates growing concern about ad revenue growth. Put/call ratio rising. AI model flags elevated downside risk pre-earnings.', confidence: 71, icon: AlertTriangle, time: '22 min ago' },
  { type: 'bullish', symbol: 'AAPL', title: 'Technical Breakout', message: 'AAPL forming a bullish cup and handle pattern on the daily chart. Volume confirmation expected. Price target analysis suggests $195-$202 range. Fundamental score: 8.4/10.', confidence: 84, icon: BarChart3, time: '31 min ago' },
  { type: 'alert', symbol: 'JPM', title: 'Sector Rotation Signal', message: 'Financial sector showing strong relative strength vs. S&P 500. JPM leading the rotation with above-average institutional inflows. Yield curve dynamics favorable for bank margins.', confidence: 81, icon: TrendingUp, time: '45 min ago' },
];

const typeColors = {
  bullish: { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  alert: { bg: 'bg-chart-4/10', text: 'text-chart-4', border: 'border-chart-4/20' },
  hedge: { bg: 'bg-accent/10', text: 'text-accent', border: 'border-accent/20' },
  bearish: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20' },
};

export default function AIInsights() {
  const [query, setQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setAiResponse('');
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are TREDIA AI, a premium trading intelligence assistant. Provide a concise, data-driven analysis for the following question. Use financial terminology and include specific metrics when possible. Keep response under 200 words.\n\nQuestion: ${query}`,
      add_context_from_internet: true,
    });
    setAiResponse(result);
    setLoading(false);
  };

  return (
    <div className="sm:ml-16 p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2 mb-1">
          <Brain className="h-5 w-5 text-accent" />
          <h1 className="text-xl font-bold">AI Intelligence</h1>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Advanced AI-powered market analysis and trading signals</p>
      </motion.div>

      {/* AI Query */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-accent/20 bg-accent/5 p-4 glow-blue"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="text-sm font-semibold">Ask TREDIA AI</span>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Ask about any stock, market trend, or strategy..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            className="bg-background/50 border-border/50 text-sm h-10"
          />
          <Button onClick={handleAskAI} disabled={loading} size="sm" className="px-4 h-10">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        <AnimatePresence>
          {(aiResponse || loading) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 p-3 rounded-lg bg-background/50 border border-border/30"
            >
              {loading ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Analyzing markets...
                </div>
              ) : (
                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Signals Feed */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Live Signals Feed</h2>
        <div className="space-y-3">
          {PREDEFINED_SIGNALS.map((signal, i) => {
            const colors = typeColors[signal.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`rounded-xl border ${colors.border} bg-card p-4 hover:bg-secondary/20 transition-colors cursor-pointer`}
              >
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl ${colors.bg} flex items-center justify-center flex-shrink-0`}>
                    <signal.icon className={`h-5 w-5 ${colors.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-sm">{signal.symbol}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${colors.bg} ${colors.text}`}>
                          {signal.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{signal.time}</span>
                    </div>
                    <h4 className="text-sm font-medium mb-1">{signal.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{signal.message}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-[10px] text-muted-foreground">Confidence</span>
                        <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden max-w-[120px]">
                          <div className={`h-full rounded-full ${colors.bg.replace('/10', '')}`} style={{ width: `${signal.confidence}%` }} />
                        </div>
                        <span className="text-[10px] font-mono font-semibold">{signal.confidence}%</span>
                      </div>
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