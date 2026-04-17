import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, Shield, AlertTriangle, BarChart3, Zap, RefreshCw } from 'lucide-react';
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
import ContextBanner from '@/components/ai/ContextBanner';
import PullToRefresh from '@/components/ui/PullToRefresh';

const PREDEFINED_SIGNALS = [
  // DISABLED — fallback signals removed per final product rules
  // If engine fails, show empty state instead
];


function toSignalCardProps(s) {
  const signalMap = { bullish: 'BUY', bearish: 'SELL', hedge: 'SELL', alert: 'WATCH' };
  const ev = s.evidence || [];
  // Extract entry/target/stop from targets array
  const getTarget = (label) => {
    const t = s.targets?.find(t => t.label.toLowerCase().includes(label.toLowerCase()));
    return t?.value?.replace(/[$,]/g, '') || null;
  };
  const riskMap = { bullish: 'Medium', bearish: 'High', hedge: 'High', alert: 'Medium' };
  return {
    symbol: s.symbol,
    title: s.title,
    signal: signalMap[s.type] || 'HOLD',
    confidence: s.confidence,
    time: s.time,
    expectedMove: s.expectedPct ? `${s.expectedPct > 0 ? '+' : ''}${s.expectedPct}%` : undefined,
    timeframe: s.expectedDays,
    oneLiner: s.message?.split('.')[0] + '.',
    technicalSummary: s.message,
    entry: getTarget('entry') || getTarget('breakout') || null,
    target: getTarget('target') || getTarget('downside') || null,
    stopLoss: getTarget('stop') || null,
    riskLevel: riskMap[s.type] || 'Medium',
    confidence_breakdown: {
      technical: ev[0]?.score ?? 0,
      sentiment: ev[1]?.score ?? 0,
      volume:    ev[2]?.score ?? 0,
      macro:     ev[3]?.score ?? 0,
    },
    whyBuy: s.type === 'bullish' ? s.risks?.map(r => r) : undefined,
    whySell: s.type !== 'bullish' ? s.risks : undefined,
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
  const navigate = useNavigate();
  const [engineSignals, setEngineSignals] = useState([]);
  const [engineLoading, setEngineLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [trekInsight, setTrekInsight] = useState(null);
  const [fngValue, setFngValue] = useState(null);
  const intervalRef = useRef(null);

  const generateTrekInsight = (fng, signals) => {
    if (!fng && (!signals || signals.length === 0)) return null;
    const fngLabel = fng > 75 ? t('trek.extremeGreed') :
                     fng > 55 ? t('trek.greed') :
                     fng > 45 ? t('common.neutral') :
                     fng > 25 ? t('trek.fear') : t('trek.extremeFear');
    const topBuy = signals?.find(s => s.signal === 'BUY');
    const topSell = signals?.find(s => s.signal === 'SELL');
    return `${t('trek.marketsAt')} ${fngLabel} (${fng}/100). ` +
      (topBuy ? `${t('trek.bestSetup')}: ${topBuy.symbol} — ${topBuy.oneLiner} ` : '') +
      (topSell ? `${t('trek.watch')}: ${topSell.symbol} ${t('trek.showingRiskSignals')}.` : '');
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
    <PullToRefresh onRefresh={fetchSignals}>
      <div className="min-h-screen p-5 space-y-6 max-w-[1800px] mx-auto pb-24" style={{ background: '#080B12' }}>

      {/* AI Context Banner */}
      <ContextBanner
        storageKey="ai_insights_v1"
        title={t('ai.contextTitle')}
        body={t('ai.contextBody')}
        steps={[
          t('ai.contextStep1'),
          t('ai.contextStep2'),
          t('ai.contextStep3'),
        ]}
        actions={[{ label: t('ai.contextAction'), onClick: () => {} }]}
        aiQuestion={t('ai.contextQuestion')}
      />

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
          <span className="text-[9px] font-mono font-bold text-white/40 uppercase tracking-wider">{t('common.live')}</span>
          <span className="text-[9px] text-white/20 hidden sm:block">· {t('ai.updatesEvery')}</span>
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
              <SentimentGauge value={fngValue ?? 50} label="Fear & Greed" />
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-[#111118] flex flex-col items-center justify-center p-4 col-span-1">
              <SentimentGauge value={engineSignals.filter(s => s.signal === 'BUY').length > engineSignals.filter(s => s.signal === 'SELL').length ? Math.min(75, (fngValue ?? 50) + 10) : Math.max(25, (fngValue ?? 50) - 10)} label="Equity Bias" />
            </div>
            <div className="rounded-xl border border-white/[0.07] bg-[#111118] flex flex-col items-center justify-center p-4 col-span-1">
              <SentimentGauge value={fngValue != null ? Math.max(10, Math.min(90, 100 - fngValue)) : 50} label="Risk-Off Pressure" />
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
            ⚡ {t('trek.wow')} · {fngValue !== null ? `FNG ${fngValue}` : t('common.loading')} · {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              {engineLoading ? t('ai.fetchingLiveData') : `${engineSignals.length} ${t('ai.liveSignals')} · ${lastUpdatedLabel || t('common.now')}`}
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
              <div className="lg:col-span-2">
                <div className="p-8 rounded-lg bg-white/[0.02] border border-white/[0.08] text-center">
                  <p className="text-sm font-semibold text-white/70 mb-2">No active signals right now</p>
                  <p className="text-xs text-white/40">TREK is monitoring markets. Signals appear when conditions align. Check back soon or pull to refresh.</p>
                </div>
              </div>
            )}
            {!isElite && (
              <div
                onClick={() => navigate('/Upgrade')}
                className="lg:col-span-2 p-4 rounded-lg bg-white/[0.03] border border-primary/20 text-center cursor-pointer hover:bg-primary/5 hover:border-primary/40 transition-all tap-feedback"
              >
                <p className="text-xs text-white/40 mb-2">{t('ai.unlockSignals')}</p>
                <p className="text-[10px] font-bold text-primary">Tap to Upgrade →</p>
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
    </PullToRefresh>
  );
}