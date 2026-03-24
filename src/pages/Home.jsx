import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fetchFearGreed } from '@/api/marketData';
import TickerTape from '@/components/dashboard/TickerTape';
import IndexCardsSection from '@/components/markets/IndexCardsSection';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { NextJumpDetector } from '@/components/ai/NextJumpDetector';
import { IntelligenceTicker } from '@/components/ai/IntelligenceTicker';
import { OG100Card } from '@/components/ai/OG100Card';
import { LogTradeButton } from '@/components/ai/LogTradeButton';
import DailyBrief from '@/components/ai/DailyBrief';
import YourMovesToday from '@/components/feed/YourMovesToday';
import WatchOut from '@/components/feed/WatchOut';
import MarketPulse from '@/components/feed/MarketPulse';
import UpgradeCall from '@/components/feed/UpgradeCall';
import TrendingAssets from '@/components/markets/TrendingAssets';
import WatchlistQuick from '@/components/markets/WatchlistQuick';
import { fetchCoreAssets } from '@/api/marketDataClient';
import RegionSwitcher from '@/components/feed/RegionSwitcher';
import IntelligenceFeed from '@/components/feed/IntelligenceFeed';
import { base44 } from '@/api/base44Client';

// Detect region from timezone
function detectDefaultRegion() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if (tz.includes('Europe') || tz.includes('London')) return 'EU';
  if (tz.includes('Asia') || tz.includes('Tokyo') || tz.includes('Hong_Kong') || tz.includes('Singapore')) return 'APAC';
  if (tz.includes('Africa')) return 'Africa';
  if (tz.includes('America/Sao_Paulo') || tz.includes('America/Mexico') || tz.includes('America/Bogota') || tz.includes('America/Santiago')) return 'LatAm';
  return 'US';
}

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fearGreed, setFearGreed] = useState(null);
  const [liveStocks, setLiveStocks] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [dataStatus, setDataStatus] = useState('loading');
  const [activeRegion, setActiveRegion] = useState(() => {
    return localStorage.getItem('tredio_region') || detectDefaultRegion();
  });
  const stickyRef = useRef(null);

  // Core assets for Home feed
  useEffect(() => {
    async function loadCore() {
      try {
        setDataStatus('loading');
        const assets = await fetchCoreAssets();
        const live = assets.filter(a => a.status === 'live');
        const stocks = live.filter(a => a.type !== 'crypto').map(a => ({
          ...a,
          change: a.changePct || 0,
          signal: a.changePct > 1 ? 'BUY' : a.changePct < -1 ? 'SELL' : 'HOLD'
        }));
        const crypto = live.filter(a => a.type === 'crypto');
        setLiveStocks(stocks);
        setCryptoPrices(crypto);
        setDataStatus(live.length > 0 ? 'live' : 'stale');
      } catch (error) {
        console.error('[Home] Core fetch failed:', error.message);
        setDataStatus('stale');
      }
    }

    loadCore();
    const interval = setInterval(loadCore, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleRegionChange = (r) => {
    setActiveRegion(r);
    localStorage.setItem('tredio_region', r);
  };

  const sentimentLabel = fearGreed
    ? fearGreed.value >= 70 ? t('trek.greed') : fearGreed.value >= 50 ? t('common.neutral') : fearGreed.value >= 30 ? t('trek.fear') : t('trek.extremeFear')
    : t('common.neutral');

  return (
    <PullToRefresh onRefresh={async () => {
      const assets = await fetchCoreAssets().catch(() => []);
      const live = assets.filter(a => a.status === 'live');
      if (live.length > 0) {
        setLiveStocks(live.filter(a => a.type !== 'crypto').map(a => ({ ...a, change: a.changePct || 0, signal: a.changePct > 1 ? 'BUY' : a.changePct < -1 ? 'SELL' : 'HOLD' })));
      }
    }}>
      <div className="w-full min-h-screen" style={{ background: '#080B12' }}>
        <IntelligenceTicker />
        <IndexCardsSection />

        {/* ── STICKY REGION BAR ──────────────────────────────────────── */}
        <div
          ref={stickyRef}
          className="sticky top-0 z-30 px-5 py-3 border-b border-white/[0.05]"
          style={{ background: 'rgba(8,11,18,0.92)', backdropFilter: 'blur(16px)' }}
        >
          <RegionSwitcher activeRegion={activeRegion} onChange={handleRegionChange} />
        </div>

        <div className="p-5 space-y-6 max-w-[900px] mx-auto pb-24">
          {/* OG100 Badge */}
          <OG100Card />

          {/* Daily Morning Brief */}
          <DailyBrief mode="morning" />

          {/* Watchlist Quick */}
          <WatchlistQuick stocks={liveStocks} />

          {/* Trending Assets */}
          <TrendingAssets stocks={liveStocks} />

          {/* ── INTELLIGENCE FEED (replaces scattered components) ─── */}
          <div className="space-y-2">
            {/* Section header */}
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <h2 className="text-sm font-bold text-white/80">Market Intelligence</h2>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 ml-1 uppercase tracking-wide">
                {activeRegion === 'EU' ? 'Europe' : activeRegion === 'APAC' ? 'Asia' : activeRegion}
              </span>
              <span className="text-[9px] text-white/25 ml-auto">Interpretation-first</span>
            </div>
            <IntelligenceFeed activeRegion={activeRegion} onRegionChange={handleRegionChange} />
          </div>

          {/* ── NEXT JUMP ───────────────────────────────────────────── */}
          {liveStocks.length > 0 && (
            <NextJumpDetector
              signal={{
                asset: liveStocks[0]?.symbol || 'NVDA',
                direction: liveStocks[0]?.change > 0 ? 'BUY' : 'SELL',
                confidence: Math.min(87, Math.max(50, Math.abs(liveStocks[0]?.change || 0) * 10)),
                quote: `Live market data: ${liveStocks[0]?.symbol} ${liveStocks[0]?.change > 0 ? 'up' : 'down'} ${Math.abs(liveStocks[0]?.change || 0).toFixed(2)}% today.`,
                entry: liveStocks[0]?.change > 0 ? 'Buy dips, do not chase.' : 'Wait for reversal signals.',
                positionSize: liveStocks[0]?.change > 2 ? 'Normal size' : 'Small size',
                timing: 'Hold 1–2 weeks',
                risk: 'Monitor volume and market sentiment.'
              }}
              onSeeWhy={() => navigate('/AIInsights')}
            />
          )}

          {/* ── YOUR MOVES TODAY ─────────────────────────────────────── */}
          <YourMovesToday
            moves={liveStocks.slice(0, 3).map(stock => ({
              symbol: stock.symbol,
              action: stock.signal,
              entry: stock.signal === 'BUY' ? `Buy on dips to $${(stock.price * 0.98).toFixed(0)}` : stock.signal === 'SELL' ? 'Do not enter, wait for reversal' : `Watch for breakout above $${(stock.price * 1.02).toFixed(0)}`,
              positionSize: stock.signal === 'BUY' ? 'Normal size' : stock.signal === 'SELL' ? 'Avoid' : 'Small size',
              timeframe: '1-2 weeks',
              why: `${stock.symbol} ${stock.change > 0 ? 'up' : 'down'} ${Math.abs(stock.change).toFixed(2)}% today. Market ${stock.change > 2 ? 'showing strength' : stock.change < -2 ? 'showing weakness' : 'consolidating'}.`,
              exitTarget: stock.signal === 'BUY' ? `Sell at $${(stock.price * 1.05).toFixed(0)}` : 'N/A',
              risk: stock.change < -2 ? 'Further downside risk' : stock.change > 2 ? 'Pullback risk' : 'Sideways movement',
              confidence: `${stock.signal === 'BUY' || stock.signal === 'SELL' ? 'High' : 'Medium'}`
            }))}
            onExplore={(move) => navigate(`/Asset/${move.symbol}`)}
          />

          {/* ── WATCH OUT ────────────────────────────────────────────── */}
          <WatchOut />

          {/* ── MARKET PULSE ─────────────────────────────────────────── */}
          <MarketPulse sentiment={fearGreed?.value || 50} />

          {/* ── UPGRADE ──────────────────────────────────────────────── */}
          <UpgradeCall onUpgrade={() => navigate('/Upgrade')} />

          {/* Live data indicator */}
          <div className="text-center text-xs pt-4 border-t border-white/5">
            {dataStatus === 'live' && <span className="text-primary/50">✓ Real-time data active</span>}
            {dataStatus === 'stale' && <span className="text-warning/50">⚠ Using cached data</span>}
          </div>
        </div>

        <LogTradeButton />
      </div>
    </PullToRefresh>
  );
}