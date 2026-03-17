import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function ExpandableSignalCard({ signal, index }) {
  const [expanded, setExpanded] = useState(false);

  const typeColors = {
    bullish: 'text-chart-3',
    bearish: 'text-destructive',
    alert: 'text-orange-500',
    hedge: 'text-blue-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.02 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold uppercase tracking-wider ${typeColors[signal.type]}`}>
                {signal.type}
              </span>
              <span className="text-[10px] text-white/30">{signal.time}</span>
            </div>
            <h3 className="text-sm font-bold text-white/85 mb-1.5">{signal.symbol} — {signal.title}</h3>
            <p className="text-xs text-white/50 line-clamp-2">{signal.message}</p>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 flex-shrink-0"
          >
            <ChevronDown className="h-4 w-4 text-white/30" />
          </motion.div>
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-white/[0.05] overflow-hidden"
          >
            <div className="p-4 space-y-3">
              {/* Confidence Breakdown */}
              <div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Confidence Breakdown</div>
                <div className="space-y-1.5">
                  {signal.evidence.slice(0, 3).map((e, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-0.5">
                        <span className="text-[10px] text-white/60">{e.label}</span>
                        <span className="text-[10px] font-bold text-white/80">{e.score}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${e.score}%` }}
                          transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-2">Key Risks</div>
                <ul className="space-y-1">
                  {signal.risks.slice(0, 2).map((risk, i) => (
                    <li key={i} className="text-[10px] text-white/50 leading-relaxed">
                      • {risk}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Summary */}
              <div className="pt-2 border-t border-white/[0.05]">
                <p className="text-[10px] text-white/60 italic">
                  Expected move: <span className="text-white/80 font-semibold">{signal.expectedPct > 0 ? '+' : ''}{signal.expectedPct}% over {signal.expectedDays}</span>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}