import React from 'react';
import { Newspaper } from 'lucide-react';
import HeroNewsCarousel from './HeroNewsCarousel';
import MarketImpactBanner from './MarketImpactBanner';
import NewsCard from './NewsCard';

const NEWS_ARTICLES = [
  {
    id: 1,
    headline: 'NVIDIA Ships Blackwell GPUs to Major Cloud Providers Ahead of Schedule',
    source: 'Reuters',
    source_url: 'https://www.reuters.com/technology/nvidia/',
    time: '4m ago',
    sentiment: 'bullish',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
    impact: 'Bullish for NVDA — Ahead-of-schedule delivery signals strong execution, data center demand remains insatiable.',
    tickers: [{ symbol: 'NVDA', direction: 'up' }, { symbol: 'AMD', direction: 'up' }, { symbol: 'INTC', direction: 'down' }],
  },
  {
    id: 2,
    headline: 'Fed Officials Signal "Higher for Longer" — Rate Cuts Pushed to Q4',
    source: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/federal-reserve',
    time: '22m ago',
    sentiment: 'bearish',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
    impact: 'Bearish for growth stocks — Higher rates compress multiples on tech and speculative assets.',
    tickers: [{ symbol: 'QQQ', direction: 'down' }, { symbol: 'TLT', direction: 'up' }, { symbol: 'GLD', direction: 'up' }],
  },
  {
    id: 3,
    headline: 'Tesla Shanghai Factory Output at Record Levels in March — Supplier Sources',
    source: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/tesla',
    time: '38m ago',
    sentiment: 'bullish',
    image: 'https://images.unsplash.com/photo-1617704548623-340376564e68?w=400&q=80',
    impact: 'Bullish for TSLA — Record output ahead of Q1 delivery report, delivery beat probability rising.',
    tickers: [{ symbol: 'TSLA', direction: 'up' }, { symbol: 'LIT', direction: 'up' }],
  },
  {
    id: 4,
    headline: 'Three Sell-Side Analysts Cut META Price Targets Ahead of Earnings',
    source: 'Financial Times',
    source_url: 'https://www.ft.com/companies/meta',
    time: '1h ago',
    sentiment: 'bearish',
    image: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=400&q=80',
    impact: 'Bearish for META — Pre-earnings downgrade cycle signals potential earnings disappointment ahead.',
    tickers: [{ symbol: 'META', direction: 'down' }, { symbol: 'SNAP', direction: 'down' }],
  },
  {
    id: 5,
    headline: 'Apple India Manufacturing Hits Record Output — China Diversification Succeeds',
    source: 'Reuters',
    source_url: 'https://www.reuters.com/technology/apple/',
    time: '2h ago',
    sentiment: 'bullish',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
    impact: 'Bullish for AAPL — Supply chain de-risking reduces geopolitical exposure, improving margin outlook.',
    tickers: [{ symbol: 'AAPL', direction: 'up' }],
  },
  {
    id: 6,
    headline: 'JPMorgan Q1 Trading Revenue Tracking Above Consensus — Sources',
    source: 'Bloomberg',
    source_url: 'https://www.bloomberg.com/news/articles/jpmorgan',
    time: '2h ago',
    sentiment: 'bullish',
    image: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?w=400&q=80',
    impact: 'Bullish for JPM and financials — Strong trading beat sets positive tone for bank earnings season.',
    tickers: [{ symbol: 'JPM', direction: 'up' }, { symbol: 'GS', direction: 'up' }, { symbol: 'XLF', direction: 'up' }],
  },
];

export default function NewsFeed() {
  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <Newspaper className="h-4 w-4 text-primary" />
        <h2 className="text-[11px] font-bold text-white/50 uppercase tracking-[0.12em]">Market News</h2>
        <span className="text-[9px] font-mono text-white/20">{NEWS_ARTICLES.length} articles</span>
      </div>

      {/* Hero Carousel */}
      <HeroNewsCarousel />

      {/* Market Impact Banner */}
      <MarketImpactBanner />

      {/* News Cards */}
      <div className="space-y-2">
        {NEWS_ARTICLES.map((article, i) => (
          <NewsCard key={article.id} article={article} index={i} />
        ))}
      </div>
    </div>
  );
}