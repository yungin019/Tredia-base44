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
    leftBorder: true,
    leftBorderColor: '#EF4444',
  },
  alert: {
    header: 'CATALYST ALERT',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    color: 'text-primary',
    dot: 'bg-primary',
    leftBorder: true,
    leftBorderColor: '#F59E0B',
  },
  hedge: {
    header: 'HEDGE SIGNAL',
    bg: 'bg-[#60A5FA]/10',
    border: 'border-[#60A5FA]/20',
    color: 'text-[#60A5FA]',
    dot: 'bg-[#60A5FA]',
    leftBorder: true,
    leftBorderColor: '#60A5FA',
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
        className={`card-press cursor-pointer rounded-xl border ${cfg.border} bg-[#111118] p-4 flex flex-col gap-3 relative`}
        style={cfg.leftBorder ? {
          borderLeft: `3px solid ${cfg.leftBorderColor}`,
          boxShadow: `inset 0 0 12px ${cfg.leftBorderColor}22, inset -4px 0 12px ${cfg.leftBorderColor}15`,
          minHeight: '120px'
        } : { minHeight: '120px' }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color} border ${cfg.border} whitespace-nowrap`}>
              {cfg.header}
            </span>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot} animate-pulse flex-shrink-0`} />
          </div>
          <div className="flex items-center gap-2">
            {signal.time === 'live' && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-chart-3/15 border border-chart-3/30">
                <motion.span animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="h-1.5 w-1.5 bg-chart-3 rounded-full" />
                <span className="text-[8px] font-black text-chart-3 uppercase tracking-widest">Live</span>
              </div>
            )}
            <span className="text-[9px] text-white/25 font-mono whitespace-nowrap">{signal.time !== 'live' && signal.time}</span>
          </div>
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

        {/* Action + Confidence */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
          <div className="flex items-center gap-3">
            {/* Action */}
            <div className={`px-3 py-1.5 rounded-lg font-black text-sm ${
              signal.type === 'bullish' ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30' :
              signal.type === 'bearish' ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30' :
              'bg-primary/20 text-primary border border-primary/30'
            }`}>
              {signal.type === 'bullish' ? 'BUY' : signal.type === 'bearish' ? 'SELL' : 'WATCH'}
            </div>

            {/* Confidence */}
            <div className="flex flex-col">
              <span className="text-[9px] text-white/30 uppercase tracking-wider font-mono">Confidence</span>
              <button
                onClick={e => { e.stopPropagation(); setShowConfidence(true); }}
                className={`text-[16px] font-black font-mono ${cfg.color} hover:opacity-70 transition-opacity leading-none text-left tap-feedback`}
              >
                {signal.confidence}%
              </button>
            </div>
          </div>

          <div className={`flex items-center gap-1 text-[10px] font-bold ${cfg.color}`}>
            <span>Tap for details</span>
            <ChevronRight className="h-3.5 w-3.5" />
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