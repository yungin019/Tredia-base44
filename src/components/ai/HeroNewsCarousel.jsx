import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HERO_ARTICLES = [
  {
    id: 1,
    headline: 'NVIDIA Blackwell GPU Shipments Accelerate — Data Center Revenue Set to Double',
    source: 'Bloomberg',
    time: '4 minutes ago',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=900&q=80',
    verdict: 'BULLISH FOR MARKETS',
    verdictType: 'bullish',
    tickers: ['NVDA', 'AMD', 'SOXX'],
  },
  {
    id: 2,
    headline: 'Fed Officials Signal Higher-For-Longer Stance — Rate Cuts Pushed to Q4 2024',
    source: 'Reuters',
    time: '22 minutes ago',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80',
    verdict: 'BEARISH SHORT TERM',
    verdictType: 'bearish',
    tickers: ['TLT', 'SPX', 'GLD'],
  },
  {
    id: 3,
    headline: 'China PMI Beats Estimates at 51.2 — Manufacturing Expansion Accelerates',
    source: 'Financial Times',
    time: '45 minutes ago',
    image: 'https://images.unsplash.com/photo-1569025690938-a00729c9e1f9?w=900&q=80',
    verdict: 'WATCH THIS SPACE',
    verdictType: 'watch',
    tickers: ['EEM', 'FXI', 'BABA'],
  },
  {
    id: 4,
    headline: 'Apple Services Revenue Surges 18% QoQ — AI Feature Monetization Begins',
    source: 'CNBC',
    time: '1 hour ago',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80',
    verdict: 'BULLISH FOR MARKETS',
    verdictType: 'bullish',
    tickers: ['AAPL', 'MSFT', 'GOOG'],
  },
];

const verdictStyles = {
  bullish: { bg: 'bg-[#22C55E]/20', border: 'border-[#22C55E]/40', text: 'text-[#22C55E]' },
  bearish: { bg: 'bg-[#EF4444]/20', border: 'border-[#EF4444]/40', text: 'text-[#EF4444]' },
  watch: { bg: 'bg-[#F59E0B]/20', border: 'border-[#F59E0B]/40', text: 'text-[#F59E0B]' },
};

const tickerColors = {
  bull: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
  bear: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
  watch: 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20',
};

export default function HeroNewsCarousel() {
  const [current, setCurrent] = useState(0);
  const [imgLoaded, setImgLoaded] = useState({});

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % HERO_ARTICLES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const article = HERO_ARTICLES[current];
  const vstyle = verdictStyles[article.verdictType];

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ height: 220 }}>
      {/* Gold shimmer skeleton */}
      <div className="absolute inset-0 bg-[#111118] animate-pulse" style={{ background: 'linear-gradient(90deg, #111118 0%, #1a1a0a 50%, #111118 100%)' }} />

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <img
            src={article.image}
            alt=""
            className="w-full h-full object-cover"
            onLoad={() => setImgLoaded(p => ({ ...p, [current]: true }))}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Verdict badge */}
      <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg border text-[8px] font-black tracking-widest backdrop-blur-sm ${vstyle.bg} ${vstyle.border} ${vstyle.text}`}>
        {article.verdict}
      </div>

      {/* Nav buttons */}
      <button
        onClick={() => setCurrent(c => (c - 1 + HERO_ARTICLES.length) % HERO_ARTICLES.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-white/10 hover:bg-black/70 transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5 text-white" />
      </button>
      <button
        onClick={() => setCurrent(c => (c + 1) % HERO_ARTICLES.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-white/10 hover:bg-black/70 transition-colors"
      >
        <ChevronRight className="h-3.5 w-3.5 text-white" />
      </button>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[14px] font-black text-white leading-snug mb-2">{article.headline}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-bold text-primary">{article.source}</span>
              <span className="text-white/20">·</span>
              <span className="text-[9px] text-white/35">{article.time}</span>
              {article.tickers.map(t => (
                <span key={t} className={`text-[8px] font-mono font-black px-1.5 py-0.5 rounded border ${tickerColors[article.verdictType]}`}>{t}</span>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-3 right-4 flex gap-1">
        {HERO_ARTICLES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${i === current ? 'w-4 h-1.5 bg-primary' : 'w-1.5 h-1.5 bg-white/20'}`}
          />
        ))}
      </div>
    </div>
  );
}