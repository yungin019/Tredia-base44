import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Eye, Zap, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

const SIGNAL_CONFIG = {
  BUY:   { color: 'text-chart-3', bg: 'bg-chart-3/10', border: 'border-chart-3/20', icon: TrendingUp },
  SELL:  { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20', icon: TrendingDown },
  HOLD:  { color: 'text-white/50', bg: 'bg-white/5', border: 'border-white/10', icon: Minus },
  WATCH: { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20', icon: Eye },
};

function ConfidenceBar({ label, value }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/30 w-20 shrink-0">{label}</span>
      <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: value >= 75 ? '#22c55e' : value >= 50 ? '#F59E0B' : '#ef4444' }}
        />
      </div>
      <span className="text-[10px] font-mono text-white/40 w-7 text-right">{value}</span>
    </div>
  );
}

export default function SignalCard({ signal }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SIGNAL_CONFIG[signal.signal] || SIGNAL_CONFIG.HOLD;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border bg-[#111118] overflow-hidden ${cfg.border}`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-[15px] text-white/90">{signal.symbol}</span>
            {signal.jumpDetected && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-primary bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
                <Zap className="h-2.5 w-2.5" /> JUMP
              </span>
            )}
            {signal.lossDetected && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2 py-0.5">
                <AlertTriangle className="h-2.5 w-2.5" /> RISK
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.color} ${cfg.bg}`}>
              <Icon className="h-3 w-3" />
              {signal.signal}
            </span>
            <div className="flex flex-col items-end">
              <span className="text-[18px] font-black font-mono text-white/90 leading-none">{signal.confidence}</span>
              <span className="text-[8px] text-white/25 uppercase tracking-wider">conf.</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] font-semibold text-white/60 mb-1 leading-snug">{signal.title}</p>
        <p className="text-[10px] text-white/35 leading-relaxed">{signal.oneLiner}</p>

        {/* Expected move + timeframe */}
        {(signal.expectedMove || signal.timeframe) && (
          <div className="flex items-center gap-3 mt-2.5">
            {signal.expectedMove && (
              <span className={`text-[11px] font-mono font-bold ${signal.signal === 'BUY' ? 'text-chart-3' : 'text-destructive'}`}>
                {signal.expectedMove}
              </span>
            )}
            {signal.timeframe && (
              <span className="text-[10px] text-white/25 font-mono">{signal.timeframe}</span>
            )}
            {signal.time && (
              <span className="text-[10px] text-white/20 ml-auto">{signal.time}</span>
            )}
          </div>
        )}
      </div>

      {/* Jump/Loss reasons */}
      {(signal.jumpReason || signal.lossReason) && (
        <div className="px-4 pb-3 flex flex-col gap-1.5">
          {signal.jumpReason && (
            <div className="text-[10px] text-primary/70 bg-primary/5 border border-primary/10 rounded-lg px-3 py-1.5">
              ⚡ {signal.jumpReason}
            </div>
          )}
          {signal.lossReason && (
            <div className="text-[10px] text-destructive/70 bg-destructive/5 border border-destructive/10 rounded-lg px-3 py-1.5">
              ⚠ {signal.lossReason}
            </div>
          )}
        </div>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-center gap-1 py-2 border-t border-white/[0.05] text-[10px] text-white/25 hover:text-white/40 transition-colors"
      >
        {expanded ? <><ChevronUp className="h-3 w-3" /> Less</> : <><ChevronDown className="h-3 w-3" /> Details</>}
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-white/[0.05]"
          >
            <div className="p-4 space-y-4">
              {/* Technical summary */}
              {signal.technicalSummary && (
                <div>
                  <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-1.5">Technical</p>
                  <p className="text-[11px] text-white/50 leading-relaxed">{signal.technicalSummary}</p>
                </div>
              )}

              {/* Why Buy / Why Sell */}
              {signal.whyBuy?.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-chart-3/60 uppercase tracking-widest mb-1.5">Why Buy</p>
                  <ul className="space-y-1">
                    {signal.whyBuy.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/45">
                        <span className="text-chart-3 mt-0.5">+</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {signal.whySell?.length > 0 && (
                <div>
                  <p className="text-[9px] font-bold text-destructive/60 uppercase tracking-widest mb-1.5">Why Sell</p>
                  <ul className="space-y-1">
                    {signal.whySell.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/45">
                        <span className="text-destructive mt-0.5">−</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Confidence breakdown */}
              {signal.confidence_breakdown && (
                <div>
                  <p className="text-[9px] font-bold text-white/25 uppercase tracking-widest mb-2">Confidence Breakdown</p>
                  <div className="space-y-1.5">
                    <ConfidenceBar label="Technical" value={signal.confidence_breakdown.technical} />
                    <ConfidenceBar label="Sentiment" value={signal.confidence_breakdown.sentiment} />
                    <ConfidenceBar label="Volume" value={signal.confidence_breakdown.volume} />
                    <ConfidenceBar label="Macro" value={signal.confidence_breakdown.macro} />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}