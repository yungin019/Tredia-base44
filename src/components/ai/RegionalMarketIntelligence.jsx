import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRegionalContext, rankByRegionalRelevance } from '@/hooks/useRegionalContext';
import MarketReactionCard from './MarketReactionCard';
import { SkeletonCard, LoadingMessage } from '@/components/ui/SkeletonLoader';

/**
 * Regional Market Intelligence Feed
 * Event-first, region-aware reactions
 */

const MARKET_REACTIONS = [
  {
    id: 'fed-rate-hike',
    headline: 'Federal Reserve Signals Pause on Rate Hikes',
    summary: 'FOMC members indicate potential shift in monetary policy stance',
    marketImpact: 'Bonds rally, USD weakens. Tech stocks benefit from lower borrowing costs. Expect rotation from defensive to growth.',
    affectedAssets: ['NVDA', 'AAPL', 'MSFT', 'QQQ', 'TLT', 'DXY'],
    affectedRegions: ['US'],
    direction: 'bullish',
    importance: 9,
    timing: 'Live',
    trekTake: 'Growth sectors (Tech, Small Cap) likely to outperform. Watch for intraday volatility in the next 2 hours. Ideal entry for underweighted NASDAQ exposure.',
    riskTrigger: 'Reversal if Fed sounds hawkish; watch PCE inflation data',
  },
  {
    id: 'ecb-inflation',
    headline: 'ECB Inflation Expectations Surge Above Target',
    summary: 'Eurozone price pressures accelerate despite rate hikes',
    marketImpact: 'EUR strengthens on rate hike expectations. Defensives outperform. Energy stocks rally.',
    affectedAssets: ['EURUSD', 'STOXX50E', 'RWE', 'SAP', 'ASML'],
    affectedRegions: ['EU', 'UK'],
    direction: 'bearish',
    importance: 8,
    timing: '45 min ago',
    trekTake: 'ECB likely to hike again. Banks benefit (XU000), but discretionary spending slows. Avoid overweighting consumer stocks; favor financials and energy.',
    riskTrigger: 'If ECB hints at pause, rotation back to growth',
  },
  {
    id: 'apac-gdp',
    headline: 'China GDP Misses Estimates, Growth Slows',
    summary: 'Q4 growth disappoints, raising stimulus expectations',
    marketImpact: 'Hang Seng falls. Chinese tech (JD, BABA, TENCENT) pressured. Commodity currencies weaken.',
    affectedAssets: ['0700.HK', '9988.HK', 'CNY', 'AUD', 'NZD'],
    affectedRegions: ['APAC'],
    direction: 'bearish',
    importance: 7,
    timing: '2 hours ago',
    trekTake: 'PBOC likely to ease soon (watch for rate cut signals). Hong Kong tech has downside risk near-term. Position for rebound IF stimulus announced.',
    riskTrigger: 'Further weakness if stimulus delayed',
  },
  {
    id: 'nvidia-earnings',
    headline: 'NVIDIA Beat Guidance, AI Demand Accelerating',
    summary: 'Record quarterly revenue, guidance raised for Q2',
    marketImpact: 'Semiconductor sector rallies. Nvidia peers gain (+3-5%). AI-related names surge. QQQ outperforms.',
    affectedAssets: ['NVDA', 'SMCI', 'LRCX', 'ASML', 'QQQ'],
    affectedRegions: ['US', 'EU'],
    direction: 'bullish',
    importance: 8,
    timing: 'After hours',
    trekTake: 'This is a structural breakout. Expect follow-through at open. NVDA could test $900+. Play: buy the dip in peer stocks (SMCI, LRCX). Risk: short-term overextension.',
    riskTrigger: 'Pullback if tech sector overall weakens',
  },
];

export default function RegionalMarketIntelligence() {
  const { region, config } = useRegionalContext();
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReaction, setSelectedReaction] = useState(null);

  useEffect(() => {
    // Simulate loading from API
    const timer = setTimeout(() => {
      const ranked = rankByRegionalRelevance(MARKET_REACTIONS, region);
      setReactions(ranked.slice(0, 3)); // Show top 3 relevant reactions
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [region]);

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="h-6 w-32 bg-white/5 rounded animate-pulse" />
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-sm font-bold text-white/90">{config.label} · Live Market Reactions</h2>
        </div>
        <p className="text-xs text-white/40">
          Events ranked by relevance to your region. Events → Impact → Action.
        </p>
      </div>

      {/* Reaction Cards */}
      <div className="space-y-3">
        {reactions.map((reaction) => (
          <MarketReactionCard
            key={reaction.id}
            reaction={reaction}
            onExplore={() => setSelectedReaction(reaction)}
          />
        ))}
      </div>

      {/* See More Link */}
      {reactions.length > 0 && (
        <button className="w-full text-center py-3 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
          View all market reactions
        </button>
      )}
    </motion.div>
  );
}