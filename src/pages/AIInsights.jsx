import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Shield, AlertTriangle, BarChart3, Zap, Activity } from 'lucide-react';

import AIChat from '@/components/ai/AIChat';
import MarketScanner from '@/components/ai/MarketScanner';
import SignalCard from '@/components/ai/SignalCard';
import SentimentGauge from '@/components/ai/SentimentGauge';
import MacroBar from '@/components/ai/MacroBar';
import SectorHeatmap from '@/components/ai/SectorHeatmap';

const PREDEFINED_SIGNALS = [
  {
    type: 'bullish', symbol: 'NVDA', title: 'Momentum Breakout',
    message: 'NVDA confirmed breakout above $870 key resistance. RSI divergence with increasing institutional volume. Neural network model: 85% probability of continued upside.',
    confidence: 92, icon: TrendingUp, time: '2m ago', sector: 'Technology',
    targets: [{ label: 'Entry', value: '$874' }, { label: 'Target', value: '$920–$950' }, { label: 'Stop', value: '$852' }],
  },
  {
    type: 'alert', symbol: 'TSLA', title: 'Unusual Options Flow',
    message: 'Detected unusual call options volume — 340% above 20-day average. $180 strike, 2-week expiry. Institutional dark pool activity elevated. Potential catalyst: delivery numbers.',
    confidence: 87, icon: Zap, time: '8m ago', sector: 'Automotive',
    targets: [{ label: 'Call Strike', value: '$180' }, { label: 'Expiry', value: '2W' }, { label: 'Flow', value: '+340%' }],
  },
  {
    type: 'hedge', symbol: 'SPX', title: 'Volatility Warning',
    message: 'VIX term structure inversion detected. Historical pattern analysis: 73% probability of elevated volatility next 5 sessions. Recommend reducing net delta exposure.',
    confidence: 78, icon: Shield, time: '15m ago', sector: 'Index',
    targets: [{ label: 'VIX', value: '14.2' }, { label: 'Prob', value: '73%' }, { label: 'Window', value: '5 days' }],
  },
  {
    type: 'bearish', symbol: 'META', title: 'Earnings Risk Alert',
    message: 'Sentiment analysis across 50K+ signals shows growing ad revenue concern. Put/call ratio elevated at 1.4. AI model flags downside risk pre-earnings.',
    confidence: 71, icon: AlertTriangle, time: '22m ago', sector: 'Technology',
    targets: [{ label: 'P/C Ratio', value: '1.4' }, { label: 'Risk', value: 'Downside' }, { label: 'Event', value: 'Earnings' }],
  },
  {
    type: 'bullish', symbol: 'AAPL', title: 'Cup & Handle Pattern',
    message: 'Daily chart forming textbook cup and handle. Volume confirmation on breakout attempt. Fundamental score 8.4/10. Price target: $195–$202 range over 3–4 weeks.',
    confidence: 84, icon: BarChart3, time: '31m ago', sector: 'Technology',
    targets: [{ label: 'Entry', value: '$188' }, { label: 'Target', value: '$202' }, { label: 'Score', value: '8.4/10' }],
  },
  {
    type: 'alert', symbol: 'JPM', title: 'Sector Rotation Signal',
    message: 'Financial sector exhibiting strong relative strength. JPM leading rotation with above-average institutional inflows. Yield curve dynamics favorable for NIM expansion.',
    confidence: 81, icon: TrendingUp, time: '45m ago', sector: 'Financial',
    targets: [{ label: 'Inflows', value: '↑ High' }, { label: 'NIM', value: 'Expanding' }, { label: 'Rank', value: '#1 Fin' }],
  },
];

export default function AIInsights() {
  const { t } = useTranslation();

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1800px] mx-auto">

      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Brain className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white/95 tracking-tight leading-none">{t('ai.title')}</h1>
            <p className="text-[11px] text-white/30 font-medium mt-0.5">{t('ai.subtitle')}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">
          <Activity className="h-3 w-3 text-chart-3 animate-pulse" />
          <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-wider">Live Intelligence Active</span>
        </div>
      </motion.div>

      {/* Macro Bar */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <MacroBar />
      </motion.div>

      {/* Main 3-col grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* LEFT: AI Chat (takes 1 col on xl) */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="xl:col-span-1">
          <AIChat />
        </motion.div>

        {/* CENTER + RIGHT: Sentiment + Scanner */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="xl:col-span-2 flex flex-col gap-5">
          {/* Sentiment row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-white/[0.07] bg-[#111118] flex flex-col items-center justify-center p-4 col-span-1">
              <SentimentGauge value={62} label="Overall Market" />
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-[#111118] flex flex-col items-center justify-center p-4 col-span-1">
              <SentimentGauge value={78} label="Equity Sentiment" />
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-[#111118] flex flex-col items-center justify-center p-4 col-span-1">
              <SentimentGauge value={45} label="Risk Appetite" />
            </div>
          </div>

          {/* Market Scanner */}
          <MarketScanner />
        </motion.div>
      </div>

      {/* Bottom: Signals + Heatmap */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Signals feed — 2 cols */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.12em]">{t('ai.signal_feed')}</h2>
            <span className="text-[9px] font-mono text-white/20">{PREDEFINED_SIGNALS.length} active signals · refreshed now</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {PREDEFINED_SIGNALS.map((signal, i) => (
              <SignalCard key={i} signal={signal} index={i} />
            ))}
          </div>
        </motion.div>

        {/* Sector Heatmap — 1 col */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="xl:col-span-1">
          <SectorHeatmap />
        </motion.div>
      </div>

    </div>
  );
}