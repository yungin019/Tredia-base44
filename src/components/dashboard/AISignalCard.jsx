import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const signals = [
  { type: 'bullish', symbol: 'NVDA', message: 'Strong momentum breakout above $870 resistance. RSI divergence + volume confirmation.', confidence: 92, icon: TrendingUp },
  { type: 'alert', symbol: 'TSLA', message: 'Unusual options activity. Call volume 340% above 20-day average. Institutional positioning shift.', confidence: 87, icon: Zap },
  { type: 'hedge', symbol: 'SPX', message: 'VIX term structure inversion. 73% probability of elevated volatility next 5 sessions.', confidence: 78, icon: Shield },
];

const typeConfig = {
  bullish: { label: 'BULL', color: 'text-chart-3', bg: 'bg-chart-3/8', border: 'border-chart-3/15' },
  alert: { label: 'ALERT', color: 'text-primary', bg: 'bg-primary/8', border: 'border-primary/15' },
  hedge: { label: 'HEDGE', color: 'text-chart-2', bg: 'bg-chart-2/8', border: 'border-chart-2/15' },
};

export default function AISignalCard() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Brain className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-semibold text-white/90">AI Signals</h3>
        </div>
        <Link to="/AIInsights" className="flex items-center gap-1 text-[10px] font-medium text-primary/70 hover:text-primary transition-colors">
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div>
        {signals.map((signal, i) => {
          const cfg = typeConfig[signal.type];
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              className="px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className={`h-8 w-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <signal.icon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[12px] font-black font-mono text-white/90">{signal.symbol}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed mb-2">{signal.message}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-0.5 bg-white/[0.06] rounded-full overflow-hidden max-w-[100px]">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${signal.confidence}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-primary">{signal.confidence}%</span>
                    <span className="text-[9px] text-white/25">confidence</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}