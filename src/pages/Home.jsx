import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PullToRefresh from '@/components/ui/PullToRefresh';
import { OG100Card } from '@/components/ai/OG100Card';
import YourMovesToday from '@/components/feed/YourMovesToday';
import CatalystFeed from '@/components/feed/CatalystFeed';
import UpgradeCall from '@/components/feed/UpgradeCall';
import TrendingAssets from '@/components/markets/TrendingAssets';
import WatchlistQuick from '@/components/markets/WatchlistQuick';
import { fetchCoreAssets } from '@/api/marketDataClient';
import { invokeFunction } from '@/api/functionsClient';
import RegionSwitcher from '@/components/feed/RegionSwitcher';
import { useFirebaseAuth } from '@/lib/FirebaseAuthContext';
import IntelligenceFeed from '@/components/feed/IntelligenceFeed.jsx';
import GlobalMarketStateBanner from '@/components/ai/GlobalMarketStateBanner';
import { useVisibilityAwareInterval } from '@/hooks/useVisibilityAwareInterval';
import { PRICE_DATA_LABEL, PRICE_DATA_CADENCE } from '@/lib/dataFreshness';

// Detect region from timezone
function detectDefaultRegion() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  if (tz.includes('Europe') || tz.includes('London')) return 'EU';
  if (tz.includes('Asia') || tz.includes('Tokyo') || tz.includes('Hong_Kong') || tz.includes('Singapore')) return 'APAC';
  if (tz.includes('Africa')) return 'Africa';
  if (tz.includes('America/Sao_Paulo') || tz.includes('America/Mexico') || tz.includes('America/Bogota') || tz.includes('America/Santiago')) return 'LatAm';
  return 'US';
}

const REGION_LABELS = { Global: 'Global', US: 'US', EU: 'Europe', APAC: 'Asia', Africa: 'Africa', LatAm: 'LatAm' };

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { firebaseUser } = useFirebaseAuth();
  const [liveStocks, setLiveStocks] = useState([]);
  const [dataStatus, setDataStatus] = useState('loading');
  const [structureSignals, setStructureSignals] = useState(null);
  const [activeRegion, setActiveRegion] = useState(() => {
    return localStorage.getItem('tredio_region') || detectDefaultRegion();
  });

  // ── Core assets fetch (visibility-aware, 60s) ──────────────────────────────
  const loadCore = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      setDataStatus('loading');
      const assets = await fetchCoreAssets();
      const live = assets.filter(a => a.status === 'live');
      const stocks = live.filter(a => a.type !== 'crypto').map(a => ({
        ...a,
        change: a.changePct || 0,
        signal: a.changePct > 1 ? 'BUY' : a.changePct < -1 ? 'SELL' : 'HOLD'
      }));
      setLiveStocks(stocks);
      setDataStatus(live.length > 0 ? 'live' : 'stale');
    } catch (error) {
      console.error('[Home] Core fetch failed:', error.message);
      setDataStatus('stale');
    }
  }, [firebaseUser]);

  // ── Structure signals fetch (visibility-aware, 5min) — single source ────────
  const loadStructureSignals = useCallback(async () => {
    try {
      const res = await invokeFunction('generateStructureSignals', {});
      setStructureSignals(res?.signals || []);
    } catch (_) {
      // On first failure, resolve loading state; on subsequent failures, keep existing
      setStructureSignals(prev => prev ?? []);
    }
  }, []);

  useEffect(() => {
    loadCore();
  }, [loadCore]);

  useEffect(() => {
    loadStructureSignals();
  }, [loadStructureSignals]);

  useVisibilityAwareInterval(loadCore, 60000);
  useVisibilityAwareInterval(loadStructureSignals, 5 * 60 * 1000);

  const handleRegionChange = (r) => {
    setActiveRegion(r);
    localStorage.setItem('tredio_region', r);
  };

  const regionLabel = useMemo(() => REGION_LABELS[activeRegion] || activeRegion, [activeRegion]);

  // ── Memoized moves for YourMovesToday ───────────────────────────────────────
  const moves = useMemo(() => {
    // Informational only: every field below is read from the live quote.
    // No invented entry/target levels, position sizes or confidence grades.
    return liveStocks.slice(0, 3).map(stock => ({
      symbol: stock.symbol,
      action: stock.signal,
      why: `${stock.symbol} ${stock.change > 0 ? `up ${stock.change.toFixed(2)}%` : stock.change < 0 ? `down ${Math.abs(stock.change).toFixed(2)}%` : 'flat at 0.00%'}. ${stock.change > 2 ? 'Buyers winning today' : stock.change < -2 ? 'Sellers in control' : 'No momentum either way'}.`,
      risk: stock.change < -2 ? 'Could drop further' : stock.change > 2 ? 'Could pull back' : 'May stay stuck',
    }));
  }, [liveStocks]);

  return (
    <>
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
                {regionLabel}
              </span>
            </div>
            <IntelligenceFeed activeRegion={activeRegion} onRegionChange={handleRegionChange} signals={structureSignals} />
          </div>

          {/* ╔════════════════════════════════════════════════════════════════ */}
          {/* ║ EXECUTION LAYER — Your Moves Today */}
          {/* ╚════════════════════════════════════════════════════════════════ */}
          <YourMovesToday
            moves={moves}
            onExplore={(move) => navigate(`/Asset/${move.symbol}`)}
          />

          {/* ╔════════════════════════════════════════════════════════════════ */}
          {/* ║ CONTEXT LAYER — Global Market State (Dynamic) */}
          {/* ╚════════════════════════════════════════════════════════════════ */}

          <GlobalMarketStateBanner />

          {/* ╔════════════════════════════════════════════════════════════════ */}
          {/* ║ CATALYST FEED — Real market catalysts interpreted by TREK */}
          {/* ╚════════════════════════════════════════════════════════════════ */}

          <CatalystFeed activeRegion={activeRegion} signals={structureSignals} />

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
            {dataStatus === 'live' && <span className="text-primary/50">✓ {PRICE_DATA_LABEL} · {PRICE_DATA_CADENCE}</span>}
            {dataStatus === 'stale' && <span className="text-warning/50">⚠ {t('home.usingCached', 'Using cached data')}</span>}
          </div>
        </div>

      </div>
    </PullToRefresh>
    </>
  );
}