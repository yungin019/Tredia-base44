import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

const typeConfig = {
  bullish: { label: 'BULLISH',  color: 'text-chart-3',      bg: 'bg-chart-3/8',      border: 'border-chart-3/15',      bar: 'bg-chart-3' },
  alert:   { label: 'ALERT',    color: 'text-primary',      bg: 'bg-primary/8',      border: 'border-primary/15',      bar: 'bg-primary' },
  hedge:   { label: 'HEDGE',    color: 'text-chart-2',      bg: 'bg-chart-2/8',      border: 'border-chart-2/15',      bar: 'bg-chart-2' },
  bearish: { label: 'BEARISH',  color: 'text-destructive',  bg: 'bg-destructive/8',  border: 'border-destructive/15',  bar: 'bg-destructive' },
};

export default function SignalCard({ signal, index }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = typeConfig[signal.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`rounded-xl border bg-[#111118] overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/[0.12] ${expanded ? 'border-white/[0.1]' : 'border-white/[0.07]'}`}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Colored top strip */}
      <div className={`h-[2px] ${cfg.bar} opacity-50`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
            <signal.icon className={`h-5 w-5 ${cfg.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-black font-mono text-[13px] text-white/90">{signal.symbol}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold tracking-wider ${cfg.bg} ${cfg.color} border ${cfg.border}`}>{cfg.label}</span>
                <span className="text-[9px] text-white/25 font-medium hidden sm:inline">{signal.sector}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[9px] font-mono text-white/25">{signal.time}</span>
                {expanded ? <ChevronUp className="h-3.5 w-3.5 text-white/30" /> : <ChevronDown className="h-3.5 w-3.5 text-white/20" />}
              </div>
            </div>
            <h4 className="text-[12px] font-bold text-white/80 mb-2">{signal.title}</h4>

            {/* Confidence bar always visible */}
            <div className="flex items-center gap-2.5">
              <div className="w-24 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${signal.confidence}%` }}
                  transition={{ delay: index * 0.06 + 0.3, duration: 0.6, ease: 'easeOut' }}
                  className={`h-full ${cfg.bar} rounded-full`}
                />
              </div>
              <span className={`text-[10px] font-mono font-bold ${cfg.color}`}>{signal.confidence}%</span>
              <span className="text-[9px] text-white/20">confidence</span>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-white/[0.05]">
                <p className="text-[11px] text-white/50 leading-relaxed">{signal.message}</p>
                {signal.targets && (
                  <div className="flex gap-3 mt-3">
                    {signal.targets.map((tgt, i) => (
                      <div key={i} className="flex flex-col">
                        <span className="text-[9px] text-white/25 uppercase tracking-wider">{tgt.label}</span>
                        <span className={`text-[11px] font-mono font-bold ${cfg.color}`}>{tgt.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}