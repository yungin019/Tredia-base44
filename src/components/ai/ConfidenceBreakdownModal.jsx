import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart2, Newspaper, Activity, MessageSquare, UserCheck, TrendingUp } from 'lucide-react';

const BREAKDOWN_ITEMS = [
  { label: 'Technical Analysis', icon: BarChart2, key: 'technical' },
  { label: 'News Sentiment', icon: Newspaper, key: 'news' },
  { label: 'Options Flow', icon: Activity, key: 'options' },
  { label: 'Social Sentiment', icon: MessageSquare, key: 'social' },
  { label: 'Insider Activity', icon: UserCheck, key: 'insider' },
  { label: 'Historical Pattern', icon: TrendingUp, key: 'historical' },
];

const DEFAULT_SCORES = {
  technical: 92, news: 85, options: 88, social: 78, insider: 71, historical: 94,
};

export default function ConfidenceBreakdownModal({ confidence, scores = DEFAULT_SCORES, symbol, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="bg-[#111118] border border-white/[0.1] rounded-2xl w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
            <div>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold mb-0.5">Confidence Breakdown</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-primary">{confidence}%</span>
                <span className="text-[11px] text-white/40">{symbol} AI Signal</span>
              </div>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-full bg-white/[0.05] flex items-center justify-center hover:bg-white/10 transition-colors">
              <X className="h-4 w-4 text-white/50" />
            </button>
          </div>

          {/* Breakdown bars */}
          <div className="px-5 py-4 space-y-4">
            {BREAKDOWN_ITEMS.map((item, i) => {
              const score = scores[item.key] ?? 75;
              const color = score >= 85 ? '#22C55E' : score >= 70 ? '#F59E0B' : '#EF4444';
              return (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <item.icon className="h-3 w-3 text-white/30" />
                      <span className="text-[11px] text-white/60 font-medium">{item.label}</span>
                    </div>
                    <span className="text-[12px] font-mono font-black" style={{ color }}>{score}%</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ delay: i * 0.06 + 0.2, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 pb-5">
            <div className="bg-primary/5 border border-primary/10 rounded-xl p-3 text-center">
              <p className="text-[10px] text-white/40">Based on <span className="text-primary font-bold">847 similar setups</span> analyzed over the last 5 years</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}