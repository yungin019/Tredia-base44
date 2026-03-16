import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const signals = [
  { type: 'bullish', symbol: 'NVDA', message: 'Strong momentum breakout detected. RSI divergence confirmed.', confidence: 92, icon: TrendingUp },
  { type: 'alert', symbol: 'TSLA', message: 'Unusual options activity. Volume spike 340% above average.', confidence: 87, icon: Zap },
  { type: 'hedge', symbol: 'SPX', message: 'Consider hedging. VIX pattern suggests increased volatility ahead.', confidence: 78, icon: Shield },
];

export default function AISignalCard() {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-accent" />
          <h3 className="text-sm font-semibold">AI Signals</h3>
        </div>
        <Link to="/AIInsights" className="text-xs text-accent flex items-center gap-0.5 hover:underline">
          View All <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-border/30">
        {signals.map((signal, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className="px-4 py-3 hover:bg-secondary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                signal.type === 'bullish' ? 'bg-primary/10' : signal.type === 'alert' ? 'bg-chart-4/10' : 'bg-accent/10'
              }`}>
                <signal.icon className={`h-4 w-4 ${
                  signal.type === 'bullish' ? 'text-primary' : signal.type === 'alert' ? 'text-chart-4' : 'text-accent'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold font-mono">{signal.symbol}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    signal.type === 'bullish' ? 'bg-primary/10 text-primary' : signal.type === 'alert' ? 'bg-chart-4/10 text-chart-4' : 'bg-accent/10 text-accent'
                  }`}>
                    {signal.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{signal.message}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full"
                      style={{ width: `${signal.confidence}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-accent">{signal.confidence}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}