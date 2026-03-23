import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, TrendingUp, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react';
import { fetchFearGreed } from '@/api/marketData';
import TickerTape from '@/components/dashboard/TickerTape';
import IndexCardsSection from '@/components/markets/IndexCardsSection';
import { base44 } from '@/api/base44Client';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { getFoundingStats, getFoundingMemberInfo } from '@/api/foundingMembers';
import { NextJumpDetector } from '@/components/ai/NextJumpDetector';
import { IntelligenceTicker } from '@/components/ai/IntelligenceTicker';
import { OG100Card } from '@/components/ai/OG100Card';
import { LogTradeButton } from '@/components/ai/LogTradeButton';
import DailyBrief from '@/components/ai/DailyBrief';
import MarketAlert from '@/components/feed/MarketAlert';
import YourMovesToday from '@/components/feed/YourMovesToday';
import WatchOut from '@/components/feed/WatchOut';
import MarketPulse from '@/components/feed/MarketPulse';
import SmartNews from '@/components/feed/SmartNews';
import UpgradeCall from '@/components/feed/UpgradeCall';

const ALERTS = [
  { id: 1, type: 'BUY',  symbol: 'NVDA', note: 'Momentum breakout above $870 — volume 3.2× average', age: '7m', color: 'hsl(142, 86%, 28%)', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
  { id: 2, type: 'RISK', symbol: 'VIX',  note: 'VIX term structure inversion — elevated market risk', age: '14m', color: 'hsl(0, 84%, 60%)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  { id: 3, type: 'SELL', symbol: 'META', note: 'Pre-earnings sentiment deteriorating — put/call 1.4', age: '31m', color: 'hsl(45, 93%, 47%)', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)' },
];

const FOR_YOU = [
  { symbol: 'NVDA', signal: 'BUY',   note: 'Institutional accumulation detected. Strong breakout setup.', move: '+8.2%', color: 'hsl(142, 86%, 28%)' },
  { symbol: 'JPM',  signal: 'WATCH', note: 'Financial sector rotation. Rate curve steepening.', move: '+7%', color: 'hsl(45, 93%, 47%)' },
  { symbol: 'BTC',  signal: 'BUY',   note: 'Spot ETF inflows at record. Halving cycle momentum.', move: '+12%', color: 'hsl(142, 86%, 28%)' },
];

const RECOMMENDED = [
  { symbol: 'NVDA', name: 'NVIDIA', price: 871.20, change: 5.1, signal: 'BUY', sector: 'Tech' },
  { symbol: 'AMZN', name: 'Amazon', price: 182.90, change: 3.2, signal: 'BUY', sector: 'E-Comm' },
  { symbol: 'JPM',  name: 'JPMorgan', price: 201.50, change: 1.5, signal: 'WATCH', sector: 'Finance' },
  { symbol: 'BTC',  name: 'Bitcoin', price: 67420, change: 4.8, signal: 'BUY', sector: 'Crypto' },
  { symbol: 'MSFT', name: 'Microsoft', price: 415.80, change: 1.8, signal: 'HOLD', sector: 'Tech' },
];

const JUMPS = [
  { symbol: 'SMCI', name: 'Supermicro',    change: +18.4, reason: 'AI server demand surge — NVIDIA GPU allocation confirmed' },
  { symbol: 'ARM',  name: 'ARM Holdings', change: +12.1, reason: 'New chip licensing deal with major hyperscaler' },
  { symbol: 'PLTR', name: 'Palantir',      change: +9.7,  reason: 'DoD contract expansion — AI platform adoption' },
  { symbol: 'SOFI', name: 'SoFi',          change: +7.3,  reason: 'Student loan refinancing demand up 40% QoQ' },
];

const WARNINGS = [
  { symbol: 'TSLA', reason: 'Delivery miss risk + margin compression. Bearish divergence on daily.', severity: 'HIGH' },
  { symbol: 'META', reason: 'Ad revenue uncertainty. 3 analyst downgrades in 72h. Put/call elevated.', severity: 'MEDIUM' },
  { symbol: 'RIVN', reason: 'Cash burn accelerating. Production ramp below target. EV demand softening.', severity: 'HIGH' },
];



function SectionTitle({ icon, label, sub, action, onAction }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{icon}</span>
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">{label}</h2>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group"
        >
          {action}
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}



export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fearGreed, setFearGreed] = useState(null);
  const [ogStats, setOgStats] = useState(null);
  const [isOgMember, setIsOgMember] = useState(false);

  useEffect(() => {
    fetchFearGreed().then(fg => { if (fg) setFearGreed(fg); });
    getFoundingStats().then(stats => setOgStats(stats)).catch(() => {});
    base44.auth.me().then(user => {
      if (user?.email || user?.id) {
        getFoundingMemberInfo(user.email || user.id).then(member => {
          if (member) setIsOgMember(true);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);



  const sentimentLabel = fearGreed
    ? fearGreed.value >= 70 ? t('trek.greed') : fearGreed.value >= 50 ? t('common.neutral') : fearGreed.value >= 30 ? t('trek.fear') : t('trek.extremeFear')
    : t('common.neutral');

  return (
    <PullToRefresh onRefresh={async () => {
      await fetchFearGreed().then(fg => { if (fg) setFearGreed(fg); });
    }}>
      <div className="w-full min-h-screen" style={{ background: '#080B12' }}>
        <IntelligenceTicker />
        <IndexCardsSection />

        <div className="p-5 space-y-6 max-w-[900px] mx-auto pb-24">
          {/* Daily Morning Brief */}
          <DailyBrief mode="morning" />

          {/* OG100 Badge */}
          <OG100Card />

          {/* 1. Market Alert (TOP PRIORITY) */}
          <MarketAlert />

          {/* 2. Next Best Opportunity */}
          <NextJumpDetector
            signal={{
              asset: 'NVDA',
              direction: 'LONG',
              confidence: 87,
              quote: 'AI infrastructure demand accelerating. Jensen Huang confirmed record Blackwell orders from hyperscalers.'
            }}
            onSeeWhy={() => navigate('/AIInsights')}
          />

          {/* 3. Your Moves Today */}
          <YourMovesToday onExplore={(move) => navigate(`/Asset/${move.symbol}`)} />

          {/* 4. Watch Out */}
          <WatchOut />

          {/* 5. Market Pulse (merged sentiment + drivers + sectors) */}
          <MarketPulse sentiment={fearGreed?.value || 50} />

          {/* 6. Smart News */}
          <SmartNews />

          {/* 7. Upgrade Section (at bottom) */}
          <UpgradeCall onUpgrade={() => navigate('/Upgrade')} />
        </div>

        <LogTradeButton />
      </div>
    </PullToRefresh>
  );
}