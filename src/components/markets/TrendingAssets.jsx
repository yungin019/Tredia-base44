import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TRENDING = [
  { symbol: 'SOL', change: 5.6, volume: 'Very High' },
  { symbol: 'PEPE', change: 8.2, volume: 'Explosive' },
  { symbol: 'AVAX', change: 4.2, volume: 'High' },
  { symbol: 'LINK', change: 2.3, volume: 'High' },
  { symbol: 'AAVE', change: 3.1, volume: 'Medium' },
  { symbol: 'UNI', change: 1.8, volume: 'Medium' },
];

export default function TrendingAssets() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-4 w-4 text-warning" />
        <h3 className="text-sm font-bold text-white/80">Trending Now</h3>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-2 min-w-min">
          {TRENDING.map((asset, i) => (
            <motion.button
              key={asset.symbol}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/Asset/${asset.symbol}`)}
              className="flex-shrink-0 rounded-lg p-3 bg-white/[0.03] border border-white/5 hover:border-chart-3/30 hover:bg-chart-3/5 transition-all group min-w-[140px]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-white text-sm">{asset.symbol}</span>
                <TrendingUp className="h-3 w-3 text-chart-3" />
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-mono font-bold text-chart-3 text-sm">+{asset.change}%</span>
              </div>
              <span className="text-xs text-white/40">{asset.volume}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}