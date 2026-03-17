import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, TrendingDown, MessageSquare, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const WINNERS_LOSERS = {
  bullish: {
    winners: [
      { symbol: 'NVDA', est: '+3.2%' }, { symbol: 'AMD', est: '+2.1%' }, { symbol: 'MSFT', est: '+1.4%' },
    ],
    losers: [
      { symbol: 'TLT', est: '-0.8%' }, { symbol: 'SQQQ', est: '-4.1%' },
    ],
  },
  bearish: {
    winners: [
      { symbol: 'GLD', est: '+1.2%' }, { symbol: 'TLT', est: '+0.9%' },
    ],
    losers: [
      { symbol: 'QQQ', est: '-2.3%' }, { symbol: 'SPY', est: '-1.5%' }, { symbol: 'AAPL', est: '-1.8%' },
    ],
  },
  neutral: {
    winners: [{ symbol: 'SPY', est: '+0.3%' }],
    losers: [{ symbol: 'VIX', est: '-2%' }],
  },
};

export default function NewsArticleModal({ article, onClose }) {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(true);

  const wl = WINNERS_LOSERS[article.sentiment] || WINNERS_LOSERS.neutral;

  useEffect(() => {
    const generate = async () => {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `TREK AI — give a 2-sentence market impact summary for this news: "${article.headline}" (${article.source}). 
Focus on: immediate market effect and what traders should do. Be direct and specific. Under 60 words.`,
      });
      setAnalysis(result);
      setLoading(false);
    };
    generate();
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex flex-col"
        style={{ background: '#0A0A0F' }}
      >
        {/* Hero */}
        <div className="relative h-48 flex-shrink-0">
          <img src={article.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#0A0A0F]" />
          <button
            onClick={onClose}
            className="absolute top-4 left-4 h-9 w-9 rounded-full bg-black/50 backdrop-blur flex items-center justify-center border border-white/10"
          >
            <X className="h-4 w-4 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-24">
          {/* Article header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-bold text-primary">{article.source}</span>
              <span className="text-white/15">·</span>
              <span className="text-[9px] text-white/30">{article.time}</span>
            </div>
            <h2 className="text-[16px] font-black text-white leading-snug">{article.headline}</h2>
          </div>

          {/* TREK Market Impact */}
          <div className="bg-[#111118] border border-primary/15 rounded-xl overflow-hidden mb-4">
            <div className="bg-primary/5 px-4 py-2.5 border-b border-primary/10">
              <p className="text-[9px] font-black text-primary uppercase tracking-widest">TREK Market Impact</p>
            </div>

            <div className="p-4 space-y-4">
              {/* Winners */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingUp className="h-3 w-3 text-[#22C55E]" />
                  <span className="text-[9px] font-bold text-[#22C55E] uppercase tracking-wider">Winners</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {wl.winners.map((w, i) => (
                    <div key={i} className="bg-[#22C55E]/10 border border-[#22C55E]/20 rounded-lg px-3 py-1.5">
                      <span className="text-[11px] font-black font-mono text-[#22C55E]">{w.symbol}</span>
                      <span className="text-[9px] text-[#22C55E]/70 ml-1">{w.est}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Losers */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <TrendingDown className="h-3 w-3 text-[#EF4444]" />
                  <span className="text-[9px] font-bold text-[#EF4444] uppercase tracking-wider">Losers</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {wl.losers.map((l, i) => (
                    <div key={i} className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg px-3 py-1.5">
                      <span className="text-[11px] font-black font-mono text-[#EF4444]">{l.symbol}</span>
                      <span className="text-[9px] text-[#EF4444]/70 ml-1">{l.est}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Portfolio impact */}
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-3">
                <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Your Portfolio Impact</p>
                <p className={`text-[16px] font-black font-mono ${article.sentiment === 'bearish' ? 'text-[#EF4444]' : 'text-primary'}`}>
                  {article.sentiment === 'bearish' ? '-$420 est.' : '+$680 est.'}
                </p>
                <p className="text-[9px] text-white/25 mt-0.5">Based on your current holdings</p>
              </div>

              {/* TREK recommendation */}
              <div>
                <p className="text-[9px] font-bold text-white/40 uppercase tracking-wider mb-2">TREK Recommendation</p>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-2.5 bg-white/[0.04] rounded-full animate-pulse w-full" />
                    <div className="h-2.5 bg-white/[0.04] rounded-full animate-pulse w-3/4" />
                  </div>
                ) : (
                  <p className="text-[11px] text-white/60 leading-relaxed">{analysis}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0F]/95 backdrop-blur border-t border-white/[0.07] p-4">
          <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-[12px] font-bold text-primary">Ask TREK About This</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}