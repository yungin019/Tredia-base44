import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const INDICES = [
  {
    symbol: 'SPX',
    name: 'S&P 500',
    price: 5180.45,
    change: 1.23,
    chartData: [5100, 5120, 5110, 5140, 5135, 5150, 5155, 5170, 5165, 5180],
  },
  {
    symbol: 'COMP',
    name: 'NASDAQ',
    price: 16340.87,
    change: 2.15,
    chartData: [16000, 16050, 16020, 16100, 16150, 16200, 16250, 16300, 16320, 16340],
  },
  {
    symbol: 'DJI',
    name: 'DOW JONES',
    price: 38789.23,
    change: 0.87,
    chartData: [38500, 38550, 38520, 38600, 38650, 38700, 38720, 38750, 38770, 38789],
  },
];

export default function IndexCardsSection() {
  const [indices, setIndices] = useState(INDICES);

  useEffect(() => {
    // Simulate real-time updates (optional)
    const interval = setInterval(() => {
      setIndices((prev) =>
        prev.map((index) => ({
          ...index,
          price: index.price + (Math.random() - 0.5) * 2,
          change: index.change + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="overflow-x-auto -mx-4 px-4 scrollbar-hide mb-5">
      <div className="flex gap-3 pb-2">
        {indices.map((index, i) => {
          const isUp = index.change >= 0;
          const chartData = index.chartData.map((v, idx) => ({ v, idx }));

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
                  <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
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
