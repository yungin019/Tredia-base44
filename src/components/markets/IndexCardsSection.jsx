import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { base44 } from '@/api/base44Client';

const INDEX_SYMBOLS = [
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'NASDAQ 100 ETF' },
  { symbol: 'DIA', name: 'Dow Jones ETF' },
];

export default function IndexCardsSection() {
  const [indices, setIndices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchIndices() {
      try {
        const symbols = INDEX_SYMBOLS.map(s => s.symbol);
        const res = await base44.functions.invoke('stockPrices', { symbols });
        
        if (res?.data?.prices) {
          const liveIndices = INDEX_SYMBOLS
            .filter(s => res.data.prices[s.symbol] && res.data.prices[s.symbol].price > 0)
            .map(s => {
              const data = res.data.prices[s.symbol];
              const change = data.prevClose ? ((data.price - data.prevClose) / data.prevClose) * 100 : 0;
              // Generate simple sparkline data (last 10 days would need historical API)
              const basePrice = data.price;
              const sparkline = Array.from({ length: 10 }, (_, i) => ({
                v: basePrice * (0.998 + (i * 0.002) + (Math.random() - 0.5) * 0.004)
              }));
              
              return {
                symbol: s.symbol,
                name: s.name,
                price: data.price,
                change: parseFloat(change.toFixed(2)),
                chartData: sparkline
              };
            });
          
          if (liveIndices.length > 0) {
            setIndices(liveIndices);
          }
        }
      } catch (error) {
        console.error('Error fetching indices:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchIndices();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchIndices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || indices.length === 0) {
    return (
      <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide mb-5">
        <div className="flex gap-3 pb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 rounded-2xl p-4 glass-card border border-white/[0.07]" style={{ width: '280px' }}>
              <div className="h-4 w-24 bg-white/5 rounded mb-2 animate-pulse" />
              <div className="h-6 w-32 bg-white/5 rounded mb-3 animate-pulse" />
              <div className="h-12 w-full bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide mb-5">
      <div className="flex gap-3 pb-2">
        {indices.map((index, i) => {
          const isUp = index.change >= 0;

          return (
            <motion.div
              key={index.symbol}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex-shrink-0 rounded-2xl p-4 glass-card border border-white/[0.07] hover:border-white/[0.12] transition-all"
              style={{ width: '280px', minWidth: '280px' }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
                    {index.name}
                  </div>
                  <div className="font-mono font-black text-xl text-white/95">
                    {index.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg ${
                    isUp ? 'text-chart-3 bg-chart-3/10' : 'text-destructive bg-destructive/10'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {isUp ? '+' : ''}
                  {index.change.toFixed(2)}%
                </div>
              </div>

              {/* Sparkline */}
              <div className="h-12 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={index.chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={isUp ? '#22c55e' : '#ef4444'}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}