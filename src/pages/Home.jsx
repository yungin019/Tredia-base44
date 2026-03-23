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
  const [liveStocks, setLiveStocks] = useState([]);

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
    
    // Fetch live stock data
    async function fetchStocks() {
      try {
        const symbols = ['NVDA', 'AAPL', 'TSLA', 'META', 'MSFT', 'AMZN', 'GOOGL', 'SPY', 'QQQ'];
        const res = await base44.functions.invoke('stockPrices', { symbols });
        if (res?.data?.prices) {
          const stocks = symbols
            .filter(s => res.data.prices[s] && res.data.prices[s].price > 0)
            .map(s => {
              const data = res.data.prices[s];
              const change = data.prevClose ? ((data.price - data.prevClose) / data.prevClose) * 100 : 0;
              return {
                symbol: s,
                name: s,
                price: data.price,
                change: parseFloat(change.toFixed(2)),
                signal: change > 2 ? 'BUY' : change < -2 ? 'SELL' : 'WATCH'
              };
            });
          setLiveStocks(stocks);
        }
      } catch (error) {
        console.error('Error fetching stocks:', error);
      }
    }
    
    fetchStocks();
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

          {/* Next Best Opportunity - Show only if we have live data */}
          {liveStocks.length > 0 && (
            <NextJumpDetector
              signal={{
                asset: liveStocks[0]?.symbol || 'NVDA',
                direction: liveStocks[0]?.change > 0 ? 'LONG' : 'SHORT',
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
          
          {/* Live data indicator */}
          <div className="text-center text-xs text-white/30 pt-4 border-t border-white/5">
            {liveStocks.length > 0 ? (
              <span>✓ All data is live from Polygon.io + CoinGecko • Last update: {new Date().toLocaleTimeString()}</span>
            ) : (
              <span>Loading real-time market data...</span>
            )}
          </div>
        </div>

        <LogTradeButton />
      </div>
    </PullToRefresh>
  );
}