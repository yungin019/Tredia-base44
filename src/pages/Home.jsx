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
import DailyBrief from '@/components/ai/DailyBrief';
import YourMovesToday from '@/components/feed/YourMovesToday';
import WatchOut from '@/components/feed/WatchOut';
import MarketPulse from '@/components/feed/MarketPulse';
import CatalystFeed from '@/components/feed/CatalystFeed';
import UpgradeCall from '@/components/feed/UpgradeCall';
import TrendingAssets from '@/components/markets/TrendingAssets';
import WatchlistQuick from '@/components/markets/WatchlistQuick';
import { fetchCoreAssets } from '@/api/marketDataClient';
import RegionSwitcher from '@/components/feed/RegionSwitcher';
import IntelligenceFeed from '@/components/feed/IntelligenceFeed.jsx';
import HeroSignalCard from '@/components/feed/HeroSignalCard';
import { base44 } from '@/api/base44Client';
import GlobalMarketStateBanner from '@/components/ai/GlobalMarketStateBanner';
import AlpacaConnectBanner from '@/components/broker/AlpacaConnectBanner';

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
    ? fearGreed.value >= 70 ? t('trek.greed', 'Greed') : fearGreed.value >= 50 ? t('common.neutral', 'Neutral') : fearGreed.value >= 30 ? t('trek.fear', 'Fear') : t('trek.extremeFear', 'Extreme Fear')
    : t('common.neutral', 'Neutral');

  return (
    <>
    <AlpacaConnectBanner />
    <PullToRefresh onRefresh={async () => {
      const assets = await fetchCoreAssets().catch(() => []);
      const live = assets.filter(a => a.status === 'live');
      if (live.length > 0) {
        setLiveStocks(live.filter(a => a.type !== 'crypto').map(a => ({ ...a, change: a.changePct || 0, signal: a.changePct > 1 ? 'BUY' : a.changePct < -1 ? 'SELL' : 'HOLD' })));
      }
    }}>
      <div className="w-full min-h-screen app-bg">

        {/* ── STICKY REGION BAR ──────────────────────────────────────── */}
        <div
          ref={stickyRef}
          className="sticky top-0 z-40 px-5 py-3 border-b border-white/[0.04]"
          style={{ background: 'rgba(4,8,20,0.95)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
          <RegionSwitcher activeRegion={activeRegion} onChange={handleRegionChange} />
        </div>

        <div className="p-5 space-y-6 max-w-[900px] mx-auto pb-24">
          {/* ╔════════════════════════════════════════════════════════════════ */}
          {/* ║ DECISION LAYER (NO SCROLL) — Hero + Secondaries */}
          {/* ╚════════════════════════════════════════════════════════════════ */}

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'rgb(14,200,220)' }} />
              <h2 className="text-sm font-bold text-white/80">{t('home.liveSignals', 'Live Signals')}</h2>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full ml-1 uppercase tracking-wide" style={{ background: 'rgba(14,200,220,0.1)', color: 'rgb(100,220,240)', border: '1px solid rgba(14,200,220,0.2)' }}>
                {({ Global: 'Global', US: 'US', EU: 'Europe', APAC: 'Asia', Africa: 'Africa', LatAm: 'LatAm' })[activeRegion] || activeRegion}
              </span>
            </div>
            <IntelligenceFeed activeRegion={activeRegion} onRegionChange={handleRegionChange} />
          </div>

          {/* ╔════════════════════════════════════════════════════════════════ */}
          {/* ║ EXECUTION LAYER — Your Moves Today */}
          {/* ╚════════════════════════════════════════════════════════════════ */}
          <YourMovesToday
            moves={liveStocks.slice(0, 3).map(stock => ({
              symbol: stock.symbol,
              action: stock.signal,
              entry: stock.signal === 'BUY' ? `Wait for pullback to $${(stock.price * 0.98).toFixed(0)}` : stock.signal === 'SELL' ? 'Stay away until reversal forms' : `Buy if it breaks above $${(stock.price * 1.02).toFixed(0)}`,
              positionSize: stock.signal === 'BUY' ? 'Full size' : stock.signal === 'SELL' ? 'No position' : 'Quarter size',
              timeframe: '1-2 weeks',
              why: `${stock.symbol} up ${stock.change > 0 ? stock.change.toFixed(2) : 'and flat'}%. ${stock.change > 2 ? 'Buyers winning today' : stock.change < -2 ? 'Sellers in control' : 'No momentum either way'}.`,
              exitTarget: stock.signal === 'BUY' ? `Take profit at $${(stock.price * 1.05).toFixed(0)}` : 'N/A',
              risk: stock.change < -2 ? 'Could drop further' : stock.change > 2 ? 'Could pull back' : 'May stay stuck',
              confidence: `${stock.signal === 'BUY' || stock.signal === 'SELL' ? 'High' : 'Medium'}`
            }))}
            onExplore={(move) => navigate(`/Asset/${move.symbol}`)}
          />

          {/* ╔════════════════════════════════════════════════════════════════ */}
          {/* ║ CONTEXT LAYER — Global Market State (Dynamic) */}
          {/* ╚════════════════════════════════════════════════════════════════ */}

          <GlobalMarketStateBanner />

          {/* ╔════════════════════════════════════════════════════════════════ */}
          {/* ║ CATALYST FEED — Real market catalysts interpreted by TREK */}
          {/* ╚════════════════════════════════════════════════════════════════ */}

          <CatalystFeed activeRegion={activeRegion} />

          {/* ╔════════════════════════════════════════════════════════════════ */}
          {/* ║ EXPLORATION LAYER — Watchlist + Assets + Offers */}
          {/* ╚════════════════════════════════════════════════════════════════ */}

          {/* Watchlist Quick */}
          <WatchlistQuick stocks={liveStocks} />

          {/* Trending Assets (Live Assets) */}
          <TrendingAssets stocks={liveStocks} />

          {/* OG100 Founding Offer */}
          <OG100Card />

          {/* ── UPGRADE (at end, not intrusive) ──────────────────────────── */}
          <UpgradeCall onUpgrade={() => navigate('/Upgrade')} />

          {/* Live data indicator */}
          <div className="text-center text-xs pt-4 border-t border-white/5">
            {dataStatus === 'live' && <span className="text-primary/50">✓ {t('home.realtimeActive', 'Real-time data active')}</span>}
            {dataStatus === 'stale' && <span className="text-warning/50">⚠ {t('home.usingCached', 'Using cached data')}</span>}
          </div>
        </div>

      </div>
    </PullToRefresh>
    </>
  );
}