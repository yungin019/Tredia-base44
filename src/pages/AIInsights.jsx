import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Shield, AlertTriangle, BarChart3, Zap, Activity, RefreshCw } from 'lucide-react';
import { runTREKEngine } from '@/api/trekEngine';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

import AIChat from '@/components/ai/AIChat';
import SignalCard from '@/components/trek/SignalCard';
import SuperAICard from '@/components/trek/SuperAICard';
import { useSubscriptionStatus } from '@/hooks/useSubscriptionStatus';
import MarketScanner from '@/components/ai/MarketScanner';
import SentimentGauge from '@/components/ai/SentimentGauge';
import MacroBar from '@/components/ai/MacroBar';
import SectorHeatmap from '@/components/ai/SectorHeatmap';
import LiveIntelligenceRibbon from '@/components/ai/LiveIntelligenceRibbon';
import TrekMoodIndicator from '@/components/ai/TrekMoodIndicator';
import NewsFeed from '@/components/ai/NewsFeed';
import MarketCauseEffect from '@/components/ai/MarketCauseEffect';

const PREDEFINED_SIGNALS = [
  {
    type: 'bullish', symbol: 'NVDA', title: 'Momentum Breakout - $870 Cleared', expectedPct: 8, expectedDays: '7-14d',
    message: 'NVDA confirmed breakout above $870 key resistance on 3.2x average volume. Institutional accumulation pattern detected over 14 sessions. Neural network model assigns 85% probability of continued upside toward $920-$950 range.',
    confidence: 92, icon: TrendingUp, time: '2m ago', sector: 'Technology',
    targets: [{ label: 'Entry Zone', value: '$871-$878' }, { label: 'Target 1', value: '$920' }, { label: 'Stop Loss', value: '$852' }],
    evidence: [
      { label: 'Volume vs 20D Avg', value: '+318%', score: 92 },
      { label: 'RSI Momentum', value: '67.4 Rising', score: 74 },
      { label: 'Institutional Flow', value: 'Heavy Buy', score: 88 },
      { label: 'Options Sentiment', value: 'Call Skew +2.1σ', score: 85 },
      { label: 'Relative Strength', value: '94th Percentile', score: 94 },
      { label: 'AI Pattern Match', value: 'Cup Breakout', score: 91 },
    ],
    risks: [
      'Broad market selloff (SPX -2%+) would invalidate this setup immediately.',
      'NVDA has earnings in 6 weeks - IV crush risk if held through the event.',
      'Semiconductor index SOX has not confirmed with a breakout of its own.',
    ],
    news: [
      { headline: 'NVIDIA ships Blackwell GPUs to major cloud providers ahead of schedule', source: 'Reuters 4m ago', sentiment: 'positive' },
      { headline: 'Jensen Huang hints at new AI accelerator roadmap at GTC conference', source: 'Bloomberg 1h ago', sentiment: 'positive' },
      { headline: 'AMD struggles to close gap with NVDA in data center AI market share', source: 'FT 3h ago', sentiment: 'positive' },
    ],
    technicals: [
      { label: 'RSI(14)', value: '67.4', signal: 'bull' },
      { label: 'MACD', value: 'Cross Up', signal: 'bull' },
      { label: 'EMA 50', value: 'Above', signal: 'bull' },
      { label: 'BB Width', value: 'Expanding', signal: 'bull' },
      { label: 'ADX', value: '28.3', signal: 'bull' },
      { label: 'OBV', value: 'ATH', signal: 'bull' },
    ],
  },
  {
    type: 'alert', symbol: 'TSLA', title: 'Unusual Options Flow - Delivery Catalyst', expectedPct: 10, expectedDays: '14d',
    message: 'Dark pool and options flow scanning detected $180 call volume at 340% above the 20-day average. Two-week expiry suggests positioning for an imminent catalyst - most likely Q1 delivery data. Historically TSLA moves 8-12% on delivery beats.',
    confidence: 87, icon: Zap, time: '8m ago', sector: 'Automotive',
    targets: [{ label: 'Call Strike', value: '$180' }, { label: 'Expiry', value: '14 days' }, { label: 'Options Vol', value: '+340%' }],
    evidence: [
      { label: 'Call Volume Spike', value: '+340% vs 20D', score: 90 },
      { label: 'Dark Pool Prints', value: '$48M notional', score: 83 },
      { label: 'Implied Volatility', value: 'IV Rank 71', score: 71 },
      { label: 'Delivery Beat Prob.', value: '62% (AI est.)', score: 62 },
      { label: 'Short Interest', value: '3.1% Declining', score: 55 },
      { label: 'Gamma Exposure', value: 'Positive $180', score: 80 },
    ],
    risks: [
      'Delivery miss would cause rapid reversal - options premium would collapse.',
      'Macro headwinds: rising rates reducing EV purchase financing demand.',
      'Chinese competition (BYD) intensifying in TSLA core growth market.',
    ],
    news: [
      { headline: 'Tesla Shanghai factory output at record levels in March - supplier sources', source: 'Bloomberg 22m ago', sentiment: 'positive' },
      { headline: 'Analysts lower Q1 delivery estimates amid Cybertruck ramp concerns', source: 'Wall St. Journal 2h ago', sentiment: 'negative' },
      { headline: 'Elon Musk signals focus returning to Tesla after xAI announcement', source: 'X Verified 5h ago', sentiment: 'positive' },
    ],
    technicals: [
      { label: 'RSI(14)', value: '52.1', signal: 'neutral' },
      { label: 'MACD', value: 'Flat', signal: 'neutral' },
      { label: 'EMA 50', value: 'Below', signal: 'bear' },
      { label: 'IV Rank', value: '71', signal: 'bull' },
      { label: 'Put/Call', value: '0.72', signal: 'bull' },
      { label: 'OBV', value: 'Rising', signal: 'bull' },
    ],
  },
  {
    type: 'hedge', symbol: 'SPX', title: 'Volatility Regime Shift Warning', expectedPct: -2, expectedDays: '5d',
    message: 'VIX term structure inversion detected. Front-month VIX trading above 3-month VIX for the first time since October. Historical backtesting shows this precedes a 73% probability of a 1.5%+ SPX drawdown within 5 sessions.',
    confidence: 78, icon: Shield, time: '15m ago', sector: 'Index',
    targets: [{ label: 'VIX Level', value: '14.2' }, { label: 'SPX Support', value: '5,120' }, { label: 'Hedge Window', value: '5 Sessions' }],
    evidence: [
      { label: 'VIX Term Inversion', value: 'Active', score: 80 },
      { label: 'Put Buying Surge', value: '+112% vs avg', score: 78 },
      { label: 'Breadth Deterioration', value: 'A/D Line Down', score: 72 },
      { label: 'Macro Uncertainty', value: 'CPI + FOMC Week', score: 85 },
      { label: 'Historical Hit Rate', value: '73% (40 cases)', score: 73 },
      { label: 'Credit Spread', value: 'Widening +8bps', score: 65 },
    ],
    risks: [
      'False positive rate is 27% - market can continue higher through this signal.',
      'Hedging costs are elevated; time decay works against protection.',
      'Strong corporate buybacks provide a technical floor near 5,100.',
    ],
    news: [
      { headline: 'Fed officials signal higher for longer stance at Brookings event', source: 'Bloomberg 45m ago', sentiment: 'negative' },
      { headline: 'CPI data due Thursday - consensus at +3.1% YoY', source: 'Reuters 1h ago', sentiment: 'negative' },
      { headline: 'JPMorgan quant desk increases tail-risk hedge allocation by 15%', source: 'FT 2h ago', sentiment: 'negative' },
    ],
    technicals: [
      { label: 'RSI(14)', value: '58.2', signal: 'neutral' },
      { label: 'VIX', value: '14.2 Up', signal: 'bear' },
      { label: 'A/D Line', value: 'Diverge', signal: 'bear' },
      { label: 'Credit', value: 'Widening', signal: 'bear' },
      { label: 'Breadth', value: '44%', signal: 'bear' },
      { label: 'Trend', value: 'Intact', signal: 'bull' },
    ],
  },
  {
    type: 'bearish', symbol: 'META', title: 'Pre-Earnings Sentiment Deterioration', expectedPct: -8, expectedDays: '4d',
    message: 'NLP sentiment analysis across 50,000+ social, news, and analyst signals shows ad revenue concern rising sharply over the past 72 hours. Put/call ratio elevated at 1.4. AI model flags 68% probability of a negative earnings reaction.',
    confidence: 71, icon: AlertTriangle, time: '22m ago', sector: 'Technology',
    targets: [{ label: 'Downside Target', value: '$445' }, { label: 'P/C Ratio', value: '1.4' }, { label: 'Event', value: 'Earnings -4d' }],
    evidence: [
      { label: 'Sentiment Score', value: '-2.1σ vs norm', score: 71 },
      { label: 'Put/Call Ratio', value: '1.4 (elevated)', score: 75 },
      { label: 'Analyst Downgrades', value: '3 in 72hrs', score: 68 },
      { label: 'Ad Spend Tracker', value: 'Q/Q decel signal', score: 65 },
      { label: 'Insider Activity', value: 'No buys 30d', score: 55 },
      { label: 'Short Interest', value: '+0.8% WoW', score: 62 },
    ],
    risks: [
      'AI segment (Meta AI, Ray-Bans) could surprise positively and overshadow ad weakness.',
      'Cost discipline has been exceptional - operating leverage could beat consensus.',
      'Short squeeze risk if print is even slightly above lowered expectations.',
    ],
    news: [
      { headline: 'Digital ad market softening in Q1 per channel checks - GroupM data', source: 'Ad Age 1h ago', sentiment: 'negative' },
      { headline: 'Meta AI reaches 400M daily active users, monetization path unclear', source: 'TechCrunch 3h ago', sentiment: 'neutral' },
      { headline: 'Three sell-side analysts cut META price targets ahead of earnings', source: 'Bloomberg 5h ago', sentiment: 'negative' },
    ],
    technicals: [
      { label: 'RSI(14)', value: '44.8', signal: 'bear' },
      { label: 'MACD', value: 'Cross Down', signal: 'bear' },
      { label: 'EMA 50', value: 'Testing', signal: 'neutral' },
      { label: 'Put/Call', value: '1.40', signal: 'bear' },
      { label: 'IV Rank', value: '83', signal: 'neutral' },
      { label: 'OBV', value: 'Diverging', signal: 'bear' },
    ],
  },
  {
    type: 'bullish', symbol: 'AAPL', title: 'Cup and Handle - Breakout Attempt', expectedPct: 6, expectedDays: '21-28d',
    message: 'Classic cup and handle formation completing on the daily timeframe. Rim resistance at $191.50 being tested with above-average volume. Fundamental score 8.4/10 driven by services revenue growth (+14% YoY). India manufacturing ramp de-risks supply chain.',
    confidence: 84, icon: BarChart3, time: '31m ago', sector: 'Technology',
    targets: [{ label: 'Breakout Level', value: '$191.50' }, { label: 'Target', value: '$195-$202' }, { label: 'Stop', value: '$184' }],
    evidence: [
      { label: 'Pattern Completion', value: 'Cup & Handle', score: 87 },
      { label: 'Volume on Handle', value: '+22% vs avg', score: 72 },
      { label: 'Services Revenue', value: '+14% YoY', score: 84 },
      { label: 'Buyback Yield', value: '3.6% TTM', score: 80 },
      { label: 'Fundamental Score', value: '8.4 / 10', score: 84 },
      { label: 'Analyst Consensus', value: '78% Buy', score: 78 },
    ],
    risks: [
      'China sales remain under pressure (-6% YoY last quarter).',
      'Breakout failure below $188 would suggest distribution; stop must be respected.',
      'Broader tech sector rotation could drag AAPL even on positive fundamentals.',
    ],
    news: [
      { headline: 'Apple India manufacturing hits record output, diversifying from China', source: 'Reuters 2h ago', sentiment: 'positive' },
      { headline: 'App Store subscription revenue accelerates on AI-powered apps', source: 'Bloomberg 4h ago', sentiment: 'positive' },
      { headline: 'Apple faces EU antitrust probe into App Store fee structure', source: 'FT 6h ago', sentiment: 'negative' },
    ],
    technicals: [
      { label: 'RSI(14)', value: '59.3', signal: 'bull' },
      { label: 'MACD', value: 'Cross Up', signal: 'bull' },
      { label: 'EMA 50', value: 'Above', signal: 'bull' },
      { label: 'Pattern', value: 'C&H', signal: 'bull' },
      { label: 'Vol Trend', value: 'Rising', signal: 'bull' },
      { label: 'BB', value: 'Upper test', signal: 'neutral' },
    ],
  },
  {
    type: 'alert', symbol: 'JPM', title: 'Financial Sector Rotation - Lead Horse', expectedPct: 7, expectedDays: '28-42d',
    message: 'Quantitative sector rotation model flags Financials as the highest-probability outperformer for the next 4-6 weeks. JPMorgan specifically showing above-average institutional inflows for 8 consecutive sessions. Yield curve steepening +18bps provides direct NIM tailwind.',
    confidence: 81, icon: TrendingUp, time: '45m ago', sector: 'Financial',
    targets: [{ label: 'Target', value: '$215' }, { label: 'NIM Upside', value: '+12bps' }, { label: 'Sector Rank', value: '#1 / 11' }],
    evidence: [
      { label: 'Sector Momentum Score', value: '88 / 100', score: 88 },
      { label: 'Institutional Inflows', value: '8 sessions', score: 85 },
      { label: 'Yield Curve Slope', value: '+18bps (2s10s)', score: 80 },
      { label: 'NIM Expansion Model', value: '+12bps est.', score: 75 },
      { label: 'Relative Strength (3M)', value: 'Top decile', score: 90 },
      { label: 'P/E vs Historical', value: '11.2x (cheap)', score: 72 },
    ],
    risks: [
      'Credit loss acceleration in commercial real estate could surprise negatively.',
      'If Fed cuts rates faster than expected, NIM tailwind reverses quickly.',
      'Geopolitical risk events could trigger broad risk-off, dragging all sectors.',
    ],
    news: [
      { headline: 'JPMorgan Q1 trading revenue tracking above consensus - sources', source: 'Bloomberg 30m ago', sentiment: 'positive' },
      { headline: 'Yield curve steepens to flattest inversion since 2022, NIM uplift expected', source: 'Reuters 1h ago', sentiment: 'positive' },
      { headline: 'Regional bank stress recedes as deposit outflows stabilize - Fed data', source: 'WSJ 3h ago', sentiment: 'positive' },
    ],
    technicals: [
      { label: 'RSI(14)', value: '61.8', signal: 'bull' },
      { label: 'MACD', value: 'Bullish', signal: 'bull' },
      { label: 'Rel. Strength', value: 'Top 10%', signal: 'bull' },
      { label: 'EMA 50', value: 'Above', signal: 'bull' },
      { label: 'Yield 10Y', value: '4.34% Up', signal: 'bull' },
      { label: 'P/E', value: '11.2x', signal: 'bull' },
    ],
  },
];

function toSignalCardProps(s) {
  const signalMap = { bullish: 'BUY', bearish: 'SELL', hedge: 'SELL', alert: 'WATCH' };
  const ev = s.evidence || [];
  return {
    symbol: s.symbol,
    title: s.title,
    signal: signalMap[s.type] || 'HOLD',
    confidence: s.confidence,
    time: s.time,
    expectedMove: s.expectedPct ? `${s.expectedPct > 0 ? '+' : ''}${s.expectedPct}%` : undefined,
    timeframe: s.expectedDays,
    technicalSummary: s.message,
    confidence_breakdown: {
      technical: ev[0]?.score ?? 0,
      sentiment: ev[1]?.score ?? 0,
      volume:    ev[2]?.score ?? 0,
      macro:     ev[3]?.score ?? 0,
    },
  };
}

function toEngineSignalCardProps(s) {
  return {
    symbol: s.symbol,
    title: s.oneLiner,
    signal: s.signal,
    confidence: s.confidence,
    time: 'live',
    expectedMove: s.change24h != null ? `${s.change24h > 0 ? '+' : ''}${s.change24h.toFixed(2)}%` : undefined,
    timeframe: '24h',
    technicalSummary: s.oneLiner,
    confidence_breakdown: {
      technical: s.rsi ? Math.round(Math.abs(50 - s.rsi) + 50) : 50,
      sentiment: s.confidence,
      volume: s.jumpDetected ? 85 : 50,
      macro: 55,
    },
  };
}

export default function AIInsights() {
  const { t } = useTranslation();
  const { isElite } = useSubscriptionStatus();
  const [engineSignals, setEngineSignals] = useState([]);
  const [engineLoading, setEngineLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [trekInsight, setTrekInsight] = useState(null);
  const [fngValue, setFngValue] = useState(null);
  const intervalRef = useRef(null);

  const generateTrekInsight = (fng, signals) => {
    if (!fng && (!signals || signals.length === 0)) return null;
    const fngLabel = fng > 75 ? 'EXTREME GREED' :
                     fng > 55 ? 'GREED' :
                     fng > 45 ? 'NEUTRAL' :
                     fng > 25 ? 'FEAR' : 'EXTREME FEAR';
    const topBuy = signals?.find(s => s.signal === 'BUY');
    const topSell = signals?.find(s => s.signal === 'SELL');
    return `Markets at ${fngLabel} (${fng}/100). ` +
      (topBuy ? `Best setup: ${topBuy.symbol} — ${topBuy.oneLiner} ` : '') +
      (topSell ? `Watch: ${topSell.symbol} showing risk signals.` : '');
  };

  const fetchSignals = async () => {
    try {
      const result = await runTREKEngine();
      const signals = result.signals || [];
      setEngineSignals(signals);
      setLastUpdated(new Date());
      // build trek insight from live data
      const fngRes = await fetch('https://api.alternative.me/fng/').then(r => r.json()).catch(() => null);
      const fngVal = fngRes?.data?.[0] ? parseInt(fngRes.data[0].value) : null;
      if (fngVal !== null) {
        setTrekInsight(generateTrekInsight(fngVal, signals));
        setFngValue(fngVal);
      }
    } catch {
      // degrade gracefully — keep existing signals
    } finally {
      setEngineLoading(false);
    }
  };

  useEffect(() => {
    fetchSignals();
    intervalRef.current = setInterval(fetchSignals, REFRESH_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, []);

  const lastUpdatedLabel = lastUpdated
    ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1800px] mx-auto pb-24">

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
        <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-chart-3 animate-pulse flex-shrink-0" />
          <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-wider">LIVE</span>
          <span className="text-[9px] text-white/20 hidden sm:block">· Updates every 5 min</span>
          {lastUpdatedLabel && (
            <span className="text-[9px] text-white/20 hidden md:block">· {lastUpdatedLabel}</span>
          )}
          <button onClick={fetchSignals} className="ml-1 text-white/20 hover:text-white/50 transition-colors">
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="relative">
        <LiveIntelligenceRibbon />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <MacroBar />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="xl:col-span-1 flex flex-col gap-4">
          <TrekMoodIndicator />
          <AIChat />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="xl:col-span-2 flex flex-col gap-5">
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
          <MarketScanner />
        </motion.div>
      </div>

      {/* ⚡ TREK WOW MOMENT BANNER */}
      {trekInsight && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: fngValue !== null && fngValue > 75 ? 'linear-gradient(135deg, #13120a, #0e0e14)' : 'linear-gradient(135deg, #111118, #1a1a2e)',
            border: fngValue !== null && fngValue > 75 ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(245,158,11,0.3)',
            borderLeft: fngValue !== null && fngValue > 75 ? '3px solid #EF4444' : '3px solid #F59E0B',
            borderRadius: 16,
            padding: '14px 18px',
          }}
        >
          <div style={{ color: fngValue !== null && fngValue > 75 ? '#EF4444' : '#F59E0B', fontWeight: 800, fontSize: 11, marginBottom: 6, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: fngValue !== null && fngValue > 75 ? '#EF4444' : '#F59E0B', display: 'inline-block', animation: 'livePulse 2s ease-in-out infinite' }} />
            ⚡ TREK INSIGHT · {fngValue !== null ? `FNG ${fngValue}` : 'Loading...'} · {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.6, fontWeight: 500 }}>
            {trekInsight}
          </div>
        </motion.div>
      )}

      {/* Cause & Effect */}
      <MarketCauseEffect />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.12em]">{t('ai.signal_feed')}</h2>
            <span className="text-[9px] font-mono text-white/20">
              {engineLoading ? 'Fetching live data...' : `${engineSignals.length} live signals · ${lastUpdatedLabel || 'now'}`}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="lg:col-span-2">
              <SuperAICard isElite={isElite} result={null} />
            </div>
            {engineLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-white/[0.03] animate-pulse border border-white/[0.05]" />
              ))
            ) : engineSignals.length > 0 ? (
              engineSignals.slice(0, isElite ? 10 : 3).map((signal, i) => (
                <SignalCard key={i} signal={toEngineSignalCardProps(signal)} />
              ))
            ) : (
              PREDEFINED_SIGNALS.slice(0, isElite ? 6 : 2).map((signal, i) => (
                <SignalCard key={i} signal={toSignalCardProps(signal)} />
              ))
            )}
            {!isElite && (
              <div className="lg:col-span-2 p-4 rounded-lg bg-white/[0.03] border border-primary/20 text-center">
                <p className="text-xs text-white/40 mb-2">Unlock unlimited signals · Tap for more</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="xl:col-span-1">
          <SectorHeatmap />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <NewsFeed />
      </motion.div>

    </div>
  );
}