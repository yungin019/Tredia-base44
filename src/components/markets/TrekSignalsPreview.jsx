import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TREK_SIGNALS = [
  {
    symbol: 'NVDA',
    action: 'BUY',
    reason: 'AI demand + falling yields accelerating',
    confidence: 87,
  },
  {
    symbol: 'AMZN',
    action: 'BUY',
    reason: 'Cloud infrastructure rally + earnings beat',
    confidence: 80,
  },
  {
    symbol: 'TSLA',
    action: 'SELL',
    reason: 'Delivery misses + margin compression',
    confidence: 72,
  },
  {
    symbol: 'META',
    action: 'SELL',
    reason: 'Ad revenue fears + multiple compression',
    confidence: 68,
  },
];

export default function TrekSignalsPreview() {
  const navigate = useNavigate();

  return (
    <div>
      <h3 className="text-sm font-bold text-white/80 mb-3">TREK Signals Today</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TREK_SIGNALS.map((signal, i) => (
          <motion.button
            key={signal.symbol}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/Asset/${signal.symbol}`)}
            className={`text-left rounded-lg p-3 border-l-4 transition-all hover:translate-x-1 group ${
              signal.action === 'BUY'
                ? 'border-l-chart-3 bg-chart-3/5 hover:bg-chart-3/10'
                : 'border-l-destructive bg-destructive/5 hover:bg-destructive/10'
            } border border-white/5`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <span className="font-mono font-black text-white text-sm">{signal.symbol}</span>
              <div className="flex items-center gap-1">
                {signal.action === 'BUY' ? (
                  <TrendingUp className="h-4 w-4 text-chart-3" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  signal.action === 'BUY'
                    ? 'bg-chart-3/20 text-chart-3'
                    : 'bg-destructive/20 text-destructive'
                }`}>
                  {signal.action}
                </span>
              </div>
            </div>
            <p className="text-xs text-white/60 mb-1.5">{signal.reason}</p>
            <span className="text-xs text-white/40">Confidence: {signal.confidence}%</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}