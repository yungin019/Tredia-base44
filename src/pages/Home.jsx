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

          {/* Market Sentiment */}
          <TrekIntelligenceCardV2
            sentiment={fearGreed?.value || 50}
            regime={fearGreed?.value < 40 ? 'FEAR' : fearGreed?.value > 60 ? 'GREED' : 'NEUTRAL'}
          />

          {/* Market Cause & Effect */}
          <MarketCauseEffectExplainer />

          {/* Sector Heat Map */}
          <SectorHeatExplainer />

          {/* Next Jump Detector */}
          <NextJumpDetector
            signal={{
              asset: 'NVDA',
              direction: 'LONG',
              confidence: 87,
              quote: 'AI infrastructure demand accelerating. Jensen Huang confirmed record Blackwell orders from hyperscalers.'
            }}
            onSeeWhy={() => navigate('/AIInsights')}
          />

          <div>
            <SectionTitle icon="🎯" label="Actionable Setups" sub="High-conviction trades" />
            <div className="space-y-3">
              <ActionableTradeCard
                symbol="NVDA"
                action="BUY"
                confidence={87}
                reason="AI infrastructure demand surge"
                entryRange="$870–$885"
                riskLevel="Medium"
                keyRisk="Earnings miss could trigger 8–12% pullback"
                whatToWatchFor="Watch NVIDIA earnings guidance and AI demand signals"
                bestTimeframe="Swing trade: 2–4 weeks"
              />
              <ActionableTradeCard
                symbol="JPM"
                action="WATCH"
                confidence={65}
                reason="Financial sector rotation on rate steepening"
                entryRange="$195–$205"
                riskLevel="Low"
                keyRisk="Yield curve inversion could reverse the trade"
                whatToWatchFor="Watch 10Y/2Y spread and credit spreads"
                bestTimeframe="Position trade: 4–8 weeks"
              />
              <ActionableTradeCard
                symbol="BTC"
                action="BUY"
                confidence={81}
                reason="Spot ETF inflows at record levels"
                entryRange="$66,000–$67,500"
                riskLevel="High"
                keyRisk="Regulatory uncertainty could spike volatility"
                whatToWatchFor="Watch Fed policy and macroeconomic data"
                bestTimeframe="Medium-term: 2–3 months"
              />
            </div>
          </div>

          <div>
            <SectionTitle
              icon="🚨"
              label={t('home.alerts')}
              sub={t('home.timeSensitive')}
              action={t('home.allSignals')}
              onAction={() => navigate('/AIInsights')}
            />
            <div className="space-y-3">
              {ALERTS.map((a, i) => (
                <AlertRow
                  key={a.id}
                  type={a.type === 'BUY' ? 'green' : a.type === 'SELL' ? 'red' : 'yellow'}
                  title={`${a.symbol}: ${a.note}`}
                  timestamp={a.age}
                  onClick={() => navigate('/AIInsights')}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionTitle icon="🚀" label={t('home.latestJumps')} sub={t('home.strongSignals')} />
            <div className="grid grid-cols-2 gap-3">
              {JUMPS.map((j, i) => (
                <motion.button
                  key={j.symbol}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => navigate(`/Asset/${j.symbol}`)}
                  className="text-left rounded-2xl p-4 transition-all hover:scale-[1.02] active:scale-[0.98] glass-card border border-success/20 bg-success/5 hover:border-success/30 card-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-black text-sm text-foreground">{j.symbol}</span>
                    <span className="font-mono font-black text-sm text-success">+{j.change}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{j.reason}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Elite Premium CTA */}
          <ElitePremiumShowcase />

          {/* Market News */}
          <MarketNewsSection />

          <div>
            <SectionTitle icon="⚠️" label={t('home.riskWarnings')} sub={t('home.assetsToAvoid')} />
            <div className="space-y-2">
              {WARNINGS.map((w, i) => (
                <motion.button
                  key={w.symbol}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => navigate(`/Asset/${w.symbol}`)}
                  className="w-full text-left rounded-2xl px-5 py-4 flex items-center gap-3 transition-all hover:scale-[1.01] active:scale-[0.99] glass-card border-2 card-shadow group"
                  style={{
                    background: 'rgba(239,68,68,0.05)',
                    borderColor: 'rgba(239,68,68,0.2)',
                    borderLeft: '4px solid hsl(0, 84%, 60%)'
                  }}
                >
                  <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" strokeWidth={2.5} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono font-bold text-sm text-foreground">{w.symbol}</span>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${w.severity === 'HIGH' ? 'bg-destructive/15 text-destructive border border-destructive/25' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                        {w.severity}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{w.reason}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-foreground/20 group-hover:text-destructive/60 flex-shrink-0 transition-colors" />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <LogTradeButton />
      </div>
    </PullToRefresh>
  );
}