import React from 'react';
import { motion } from 'framer-motion';
import { Zap, TrendingUp, TrendingDown, Eye, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SIGNALS = [
  {
    action: 'BUY',
    symbol: 'NVDA',
    message: 'Momentum breakout above $870. RSI 67 + volume 2.4× avg. AI infrastructure demand accelerating.',
    confidence: 92,
    expectedMove: '+8.2%',
    timeframe: '2W',
    entry: '871',
    target: '942',
    stop: '848',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.2)',
    Icon: TrendingUp,
  },
  {
    action: 'WATCH',
    symbol: 'TSLA',
    message: 'Approaching $175 key support. Unusual options activity — 340% above 20-day avg. Caution.',
    confidence: 75,
    expectedMove: '±6.1%',
    timeframe: '1W',
    entry: null,
    target: null,
    stop: null,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.2)',
    Icon: Eye,
  },
  {
    action: 'SELL',
    symbol: 'SPX',
    message: 'VIX term structure inversion. 73% probability of elevated volatility next 5 sessions.',
    confidence: 78,
    expectedMove: '-2.4%',
    timeframe: '5D',
    entry: '5220',
    target: '5080',
    stop: '5280',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.1)',
    border: 'rgba(239,68,68,0.2)',
    Icon: TrendingDown,
  },
];

export default function AISignalCard() {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Zap className="h-3.5 w-3.5 text-primary" />
          </div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-white/80">Live Signals</h3>
        </div>
        <Link to="/AIInsights" className="flex items-center gap-1 text-[10px] font-bold text-primary/70 hover:text-primary transition-colors">
          All signals <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="flex-1">
        {SIGNALS.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="px-5 py-4 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: s.bg, border: `1px solid ${s.border}` }}
              >
                <s.Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>

              <div className="flex-1 min-w-0">
                {/* Symbol + action + expected move */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-black font-mono text-white/90">{s.symbol}</span>
                  <span
                    className="text-[9px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider"
                    style={{ color: s.color, background: s.bg, borderColor: s.border }}
                  >
                    {s.action}
                  </span>
                  <span
                    className="text-[10px] font-black font-mono ml-auto"
                    style={{ color: s.color }}
                  >
                    {s.expectedMove}
                  </span>
                </div>

                <p className="text-[10px] text-white/40 leading-relaxed mb-2">{s.message}</p>

                {/* Trade plan mini */}
                {s.entry && (
                  <div className="flex items-center gap-3 mb-2 text-[9px] font-mono">
                    <span className="text-white/25">E: <span className="text-white/55 font-bold">${s.entry}</span></span>
                    <span className="text-white/25">T: <span className="text-green-400 font-bold">${s.target}</span></span>
                    <span className="text-white/25">SL: <span className="text-red-400 font-bold">${s.stop}</span></span>
                    <span className="text-white/20 ml-auto">{s.timeframe}</span>
                  </div>
                )}

                {/* Confidence bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden max-w-[80px]">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${s.confidence}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold" style={{ color: s.color }}>{s.confidence}%</span>
                  <span className="text-[9px] text-white/20">conf</span>
                  <span className="text-[8px] ml-auto flex items-center gap-1 text-white/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 live-pulse inline-block" />
                    LIVE
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}