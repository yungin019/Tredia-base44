import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import SignalDetailModal from './SignalDetailModal';
import ConfidenceBreakdownModal from './ConfidenceBreakdownModal';

const TYPE_CONFIG = {
  bullish: {
    header: 'BULLISH SIGNAL',
    bg: 'bg-[#22C55E]/10',
    border: 'border-[#22C55E]/20',
    color: 'text-[#22C55E]',
    dot: 'bg-[#22C55E]',
    leftBorder: true,
    leftBorderColor: '#22C55E',
  },
  bearish: {
    header: 'BEARISH SIGNAL',
    bg: 'bg-[#EF4444]/10',
    border: 'border-[#EF4444]/20',
    color: 'text-[#EF4444]',
    dot: 'bg-[#EF4444]',
  },
  alert: {
    header: 'CATALYST ALERT',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    color: 'text-primary',
    dot: 'bg-primary',
  },
  hedge: {
    header: 'HEDGE SIGNAL',
    bg: 'bg-[#60A5FA]/10',
    border: 'border-[#60A5FA]/20',
    color: 'text-[#60A5FA]',
    dot: 'bg-[#60A5FA]',
  },
};

export default function SignalCard({ signal, index }) {
  const [showDetail, setShowDetail] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);

  const cfg = TYPE_CONFIG[signal.type] || TYPE_CONFIG.alert;
  const Icon = signal.icon;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06 }}
        onClick={() => setShowDetail(true)}
        className={`card-hover cursor-pointer rounded-xl border ${cfg.border} bg-[#111118] p-4 flex flex-col gap-3 relative`}
        style={cfg.leftBorder ? {
          borderLeft: `3px solid ${cfg.leftBorderColor}`,
          boxShadow: `inset 0 0 12px ${cfg.leftBorderColor}22, inset -4px 0 12px ${cfg.leftBorderColor}15`
        } : {}}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color} border ${cfg.border} whitespace-nowrap`}>
              {cfg.header}
            </span>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} animate-pulse flex-shrink-0`} />
          </div>
          <span className="text-[9px] text-white/25 font-mono whitespace-nowrap">{signal.time}</span>
        </div>

        {/* Symbol + Title */}
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`h-8 w-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-4 w-4 ${cfg.color}`} />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[15px] font-black font-mono text-white">{signal.symbol}</span>
              <span className="text-[9px] text-white/30">{signal.sector}</span>
            </div>
            <p className="text-[11px] font-bold text-white/70 leading-tight truncate">{signal.title}</p>
          </div>
        </div>

        {/* Message */}
        <p className="text-[10px] text-white/40 leading-relaxed line-clamp-2">{signal.message}</p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
          <div className="flex items-center gap-3">
            {/* Confidence */}
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${signal.confidence}%` }} />
              </div>
              <button
                onClick={e => { e.stopPropagation(); setShowConfidence(true); }}
                className={`text-[10px] font-black font-mono ${cfg.color} hover:opacity-70 transition-opacity`}
              >
                {signal.confidence}%
              </button>
            </div>
            {/* Expected move */}
            <span className={`text-[10px] font-bold font-mono ${signal.expectedPct > 0 ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {signal.expectedPct > 0 ? '+' : ''}{signal.expectedPct}% · {signal.expectedDays}
            </span>
          </div>
          <div className={`flex items-center gap-0.5 text-[9px] font-bold ${cfg.color}`}>
            <span>View</span>
            <ChevronRight className="h-3 w-3" />
          </div>
        </div>
      </motion.div>

      {/* Detail Modal */}
      {showDetail && (
        <SignalDetailModal
          signal={signal}
          cfg={cfg}
          onClose={() => setShowDetail(false)}
        />
      )}

      {/* Confidence Modal */}
      {showConfidence && (
        <ConfidenceBreakdownModal
          confidence={signal.confidence}
          symbol={signal.symbol}
          onClose={() => setShowConfidence(false)}
        />
      )}
    </>
  );
}