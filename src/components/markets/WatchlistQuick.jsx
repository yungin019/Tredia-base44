import React from 'react';
import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WatchlistQuick({ stocks = [] }) {
  const navigate = useNavigate();

  // Only show stocks with live data
  const liveStocks = stocks.filter(s => s.price && s.price > 0).slice(0, 4);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Star className="h-4 w-4 text-gold" />
        <h3 className="text-sm font-bold text-white/80">Your Watchlist</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {liveStocks.length > 0 ? liveStocks.map((asset, i) => (
          <motion.button
            key={asset.symbol}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/Asset/${asset.symbol}`)}
            className="rounded-lg p-2.5 bg-white/[0.03] border border-white/5 hover:border-gold/30 hover:bg-gold/5 transition-all group"
          >
              <span className="font-mono font-bold text-white text-xs block">{asset.symbol}</span>
            <div className="flex items-baseline justify-between gap-1 mt-1">
              <span className="font-mono font-bold text-white/80 text-xs">${asset.price >= 100 ? asset.price.toFixed(0) : asset.price.toFixed(2)}</span>
              <div className={`flex items-center gap-0.5 text-xs font-bold ${asset.change >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                {asset.change >= 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
                {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
              </div>
            </div>
          </motion.button>
        )) : (
          <div className="col-span-full text-center py-4 text-xs text-white/40">
            Loading live data...
          </div>
        )}
      </div>
    </div>
  );
}