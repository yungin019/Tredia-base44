import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap, TrendingUp, TrendingDown, AlertTriangle, ChevronRight } from 'lucide-react';
import { fetchFearGreed } from '@/api/marketData';
import TickerTape from '@/components/dashboard/TickerTape';
import IndexCardsSection from '@/components/markets/IndexCardsSection';
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
import TrendingAssets from '@/components/markets/TrendingAssets';
import WatchlistQuick from '@/components/markets/WatchlistQuick';
import { fetchTier1Assets, fetchCryptoPrices } from '@/api/marketDataClient';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [fearGreed, setFearGreed] = useState(null);
  const [ogStats, setOgStats] = useState(null);
  const [isOgMember, setIsOgMember] = useState(false);
  const [liveStocks, setLiveStocks] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState([]);
  const [dataStatus, setDataStatus] = useState('loading');

  // TIER 1: Core assets for Home feed (REAL-TIME PRIORITY)
  useEffect(() => {
    async function fetchTier1() {
      try {
        setDataStatus('loading');
        const [stocks, crypto] = await Promise.all([
          fetchTier1Assets(),
          fetchCryptoPrices()
        ]);
        
        if (stocks.length > 0) {
          setLiveStocks(stocks);
          setCryptoPrices(crypto);
          setDataStatus('live');
          console.log(`[Home] Loaded ${stocks.length} stocks + ${crypto.length} crypto (TIER 1)`);
        }
      } catch (error) {
        console.error('[Home] Tier 1 fetch failed:', error.message);
        setDataStatus('stale');
      }
    }
    
    fetchTier1();
    
    // Auto-refresh Tier 1 every 15 seconds (real-time feel)
    const interval = setInterval(fetchTier1, 15000);
    return () => clearInterval(interval);
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

          {/* Your Watchlist (Top 4 stocks) */}
          <WatchlistQuick stocks={liveStocks} />

          {/* Trending Assets (Horizontal scroll) */}
          <TrendingAssets stocks={liveStocks} />

          {/* Next Best Opportunity - Show only if we have live data */}
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

          {/* 1. Market Alert (TOP PRIORITY) */}
          <MarketAlert />

          {/* 3. Your Moves Today - Pass live stock data */}
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

          {/* 4. Watch Out */}
          <WatchOut />

          {/* 5. Market Pulse (merged sentiment + drivers + sectors) */}
          <MarketPulse sentiment={fearGreed?.value || 50} />

          {/* 6. Smart News */}
          <SmartNews />

          {/* 7. Upgrade Section (at bottom) */}
          <UpgradeCall onUpgrade={() => navigate('/Upgrade')} />
          
          {/* Live data status indicator */}
          <div className="text-center text-xs pt-4 border-t border-white/5">
            {dataStatus === 'loading' && (
              <span className="text-white/30">⏳ Loading real-time data...</span>
            )}
            {dataStatus === 'live' && (
              <span className="text-primary/60">✓ Real-time data active • Last update: {new Date().toLocaleTimeString()}</span>
            )}
            {dataStatus === 'stale' && (
              <span className="text-warning/60">⚠ Using cached data (API unavailable)</span>
            )}
          </div>
        </div>

        <LogTradeButton />
      </div>
    </PullToRefresh>
  );
}