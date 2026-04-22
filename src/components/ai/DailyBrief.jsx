import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, TrendingUp, AlertTriangle, Zap, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MORNING_BRIEF = {
  time: 'This Morning',
  icon: Sun,
  headline: 'Fed Decision at 2pm EST — Market On Edge',
  subheadline: 'Rate hike expected. Watch JPMorgan, Tech earnings, Energy.',
  events: [
    { time: '2:00 PM EST', event: 'Federal Reserve Rate Decision', impact: 'HIGH' },
    { time: '3:00 PM EST', event: 'NVIDIA Earnings Guidance', impact: 'CRITICAL' },
    { time: '4:30 PM EST', event: 'Energy Inventory Report', impact: 'MEDIUM' },
  ],
  trades: [
    { asset: 'NVDA', action: 'WATCH', confidence: 87, reason: 'Earnings tonight. Breakout above $880 = bullish.' },
    { asset: 'JPM', action: 'BUY', confidence: 72, reason: 'Steeper yield curve = wider NIM. Rate hike = +2-3%.' },
    { asset: 'XLE', action: 'HOLD', confidence: 65, reason: 'Energy inventory critical. Could spike oil +$2.' },
  ],
  watch: ['VIX levels', '10Y yield action', 'Fed tone', 'Earnings guidance'],
};

const EVENING_RECAP = {
  time: 'Tonight',
  icon: Moon,
  headline: 'Here\'s What Mattered Today',
  subheadline: 'And what to prepare for tomorrow.',
  whatHappened: [
    { title: 'Fed Raised Rates 25bp', impact: 'Dollar surged to 3-month high. Tech sold off 2.1%. Bonds rallied.', color: 'success' },
    { title: 'NVDA Beat Earnings', impact: 'AI demand stronger than expected. Guided up for next quarter. Sector rallied.', color: 'success' },
    { title: 'Energy Fell on Inventory', impact: 'Supply higher than expected. Oil dropped $2. XLE down 1.8%. Watch for rebound.', color: 'destructive' },
  ],
  tomorrowsSetup: [
    { asset: 'JPM', signal: 'BUY', reason: 'Rate hike is bullish. NIM expands. Added to position.' },
    { asset: 'Tech ETF (QQQ)', signal: 'WATCH', reason: 'Fed was hawkish. Tech may see more selling tomorrow morning. Set buy below 380.' },
    { asset: 'Oil', signal: 'BUY', reason: 'Oversold. OPEC cut coming. Next support = $75. Good risk/reward entry.' },
  ],
};

export default function DailyBrief({ mode = 'morning' }) {
  // Disabled: hardcoded event data removed — connect to live earnings calendar before re-enabling
  return null;

  const navigate = useNavigate();
  const brief = mode === 'morning' ? MORNING_BRIEF : EVENING_RECAP;
  const Icon = brief.icon;

  if (mode === 'morning') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 to-primary/5 p-6 space-y-6"
      >
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{brief.time}</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">{brief.headline}</h2>
          <p className="text-sm text-muted-foreground">{brief.subheadline}</p>
        </div>

        {/* Today's Events */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase">Key Events Today</p>
          <div className="space-y-2">
            {brief.events.map((e, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-primary/15"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-primary">{e.time}</p>
                  <p className="text-sm font-semibold text-foreground">{e.event}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                  e.impact === 'CRITICAL' ? 'bg-destructive/15 text-destructive' :
                  e.impact === 'HIGH' ? 'bg-warning/15 text-warning' :
                  'bg-success/15 text-success'
                }`}>
                  {e.impact}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Trade Ideas */}
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-3 uppercase">Watch These Trades</p>
          <div className="space-y-2">
            {brief.trades.map((t, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate(`/Asset/${t.asset}`)}
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 hover:border-primary/25 text-left transition-all hover:scale-[1.01]"
              >
                <div className="flex items-start justify-between mb-1">
                  <span className="font-mono font-bold text-foreground">{t.asset}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    t.action === 'BUY' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                  }`}>
                    {t.action}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t.reason}</p>
                <p className="text-[10px] text-primary font-semibold mt-1">Confidence: {t.confidence}%</p>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quick Watch */}
        <div className="bg-warning/8 border border-warning/20 rounded-lg p-3">
          <p className="text-xs font-bold text-warning mb-2">⏰ Watch These Minutes</p>
          <div className="flex flex-wrap gap-2">
            {brief.watch.map((w) => (
              <span key={w} className="text-[10px] font-semibold text-foreground bg-warning/10 px-2 py-1 rounded">
                {w}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/AIInsights')}
          className="w-full py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 transition-all"
        >
          View Full Analysis
          <ChevronRight className="h-4 w-4" />
        </motion.button>
      </motion.div>
    );
  }

  // Evening Recap
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-accent/25 bg-gradient-to-br from-accent/10 to-accent/5 p-6 space-y-6"
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-accent" />
          <span className="text-xs font-bold text-accent uppercase tracking-wider">{brief.time}</span>
        </div>
        <h2 className="text-2xl font-black text-foreground">{brief.headline}</h2>
        <p className="text-sm text-muted-foreground">{brief.subheadline}</p>
      </div>

      {/* What Happened */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-3 uppercase">The Big Moves</p>
        <div className="space-y-2">
          {brief.whatHappened.map((event, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-start gap-2">
                <TrendingUp className={`h-4 w-4 flex-shrink-0 mt-0.5 ${event.color === 'success' ? 'text-success' : 'text-destructive'}`} />
                <div>
                  <p className="font-bold text-foreground text-sm">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{event.impact}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tomorrow's Setup */}
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-3 uppercase">Prepare for Tomorrow</p>
        <div className="space-y-2">
          {brief.tomorrowsSetup.map((setup, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate(`/Asset/${setup.asset}`)}
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 hover:border-accent/25 text-left transition-all"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="font-mono font-bold text-foreground">{setup.asset}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  setup.signal === 'BUY' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'
                }`}>
                  {setup.signal}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{setup.reason}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}