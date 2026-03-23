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
    marketState: 'Tech rally after Fed signals pause on hikes',
    region: 'US',
    timing: 'Live',
    driver: 'Fed members hint at end of rate hike cycle; bond yields falling',
    impactText: 'Growth sectors rotating in. Bonds benefiting from lower yields. Tech entering early recovery phase.',
    affectedAssets: ['NVDA', 'AAPL', 'MSFT', 'QQQ', 'TLT'],
    affectedRegions: ['US'],
    direction: 'bullish',
    importance: 9,
    actionBias: 'Early recovery phase. Watch for continuation above resistance. Buy dips in large-cap tech.',
    riskInvalidation: 'Fed reverts to hawkish tone or PCE inflation reignites',
  },
  {
    id: 'ecb-inflation',
    marketState: 'EUR strength as inflation stays above ECB target',
    region: 'Europe',
    timing: '45 min ago',
    driver: 'Eurozone inflation expectations surge; ECB likely to hike rates further',
    impactText: 'Euro currency rallying. Financials and energy outperforming. Defensive sectors leading.',
    affectedAssets: ['EURUSD', 'STOXX50E', 'RWE', 'SAP', 'ASML'],
    affectedRegions: ['EU', 'UK'],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Rate hike cycle not finished. Favor financial stocks and energy. Avoid consumer discretionary.',
    riskInvalidation: 'ECB signals pause or unexpected easing',
  },
  {
    id: 'apac-gdp',
    marketState: 'China weakness as GDP disappoints, setting up stimulus window',
    region: 'Asia-Pacific',
    timing: '2 hours ago',
    driver: 'Q4 GDP growth misses estimates; PBOC expected to respond with easing',
    impactText: 'Hang Seng under pressure. Chinese tech (Alibaba, Tencent) vulnerable. Commodity currencies weakening.',
    affectedAssets: ['0700.HK', '9988.HK', 'CNY', 'AUD', 'NZD'],
    affectedRegions: ['APAC'],
    direction: 'bearish',
    importance: 7,
    actionBias: 'Watch for PBOC rate cut signal. Short-term: avoid longs. Medium-term: position for rebound if stimulus announced.',
    riskInvalidation: 'Stimulus delayed or growth deteriorates further',
  },
  {
    id: 'nvidia-earnings',
    marketState: 'AI boom accelerating—semis breaking out higher',
    region: 'US / Global',
    timing: 'After hours',
    driver: 'NVIDIA beats earnings and raises guidance; AI demand stronger than expected',
    impactText: 'Semiconductor sector rallying. AI-related names breaking resistance. QQQ outperforming.',
    affectedAssets: ['NVDA', 'SMCI', 'LRCX', 'ASML', 'QQQ'],
    affectedRegions: ['US', 'EU'],
    direction: 'bullish',
    importance: 8,
    actionBias: 'Structural breakout forming. Buy dips in peer stocks. Watch for follow-through at open.',
    riskInvalidation: 'Profit-taking or broader tech correction',
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