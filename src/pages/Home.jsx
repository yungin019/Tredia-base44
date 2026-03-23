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
          {/* OG100 Badge (TOP) */}
          <OG100Card />

          {/* Daily Morning Brief */}
          <DailyBrief mode="morning" />

          {/* Next Best Opportunity */}
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