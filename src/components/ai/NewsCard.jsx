import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import NewsArticleModal from './NewsArticleModal';

const SENTIMENT_STYLES = {
  bullish: { bg: 'bg-[#22C55E]/10', border: 'border-[#22C55E]/20', text: 'text-[#22C55E]', label: 'BULLISH', Icon: TrendingUp },
  bearish: { bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/20', text: 'text-[#EF4444]', label: 'BEARISH', Icon: TrendingDown },
  neutral: { bg: 'bg-white/5', border: 'border-white/10', text: 'text-white/40', label: 'NEUTRAL', Icon: Minus },
};

export default function NewsCard({ article, index }) {
  const [open, setOpen] = useState(false);
  const style = SENTIMENT_STYLES[article.sentiment] || SENTIMENT_STYLES.neutral;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => setOpen(true)}
        className="bg-[#111118] border border-white/[0.07] rounded-xl overflow-hidden cursor-pointer hover:border-white/[0.14] transition-all duration-200 card-press"
        style={{ minHeight: '100px' }}
      >
        <div className="flex gap-3 p-3">
          {/* Thumbnail */}
          <div className="relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-[#1a1a24] animate-pulse" style={{ background: 'linear-gradient(90deg, #111118 0%, #1c1c10 50%, #111118 100%)' }} />
            <img src={article.image} alt="" className="w-full h-full object-cover relative z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-20" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-white/85 leading-snug mb-1.5 line-clamp-2">{article.headline}</p>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[8px] font-bold text-primary">{article.source}</span>
              <span className="text-white/15">·</span>
              <span className="text-[8px] text-white/25">{article.time}</span>
            </div>
            {/* TREK Impact line */}
            <div className={`flex items-center gap-1.5 ${style.bg} border ${style.border} rounded-lg px-2 py-1`}>
              <style.Icon className={`h-2.5 w-2.5 ${style.text} flex-shrink-0`} />
              <p className={`text-[8px] ${style.text} font-medium leading-none`}>{article.impact}</p>
            </div>
          </div>
        </div>

        {/* Ticker badges */}
        {article.tickers && article.tickers.length > 0 && (
          <div className="px-3 pb-2.5 flex items-center gap-1.5 flex-wrap">
            {article.tickers.map((t, i) => (
              <span
                key={i}
                className={`text-[7px] font-mono font-black px-1.5 py-0.5 rounded border ${
                  t.direction === 'up' ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20' :
                  t.direction === 'down' ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20' :
                  'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20'
                }`}
              >
                {t.symbol} {t.direction === 'up' ? '↑' : t.direction === 'down' ? '↓' : '~'}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {open && <NewsArticleModal article={article} onClose={() => setOpen(false)} />}
    </>
  );
}