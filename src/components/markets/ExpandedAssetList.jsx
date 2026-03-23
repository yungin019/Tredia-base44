import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EXPANDED_ASSETS, searchAssets } from '@/lib/assetDatabase';

export default function ExpandedAssetList() {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!searchQuery.trim()) return EXPANDED_ASSETS.slice(0, 50);
    return searchAssets(searchQuery);
  }, [searchQuery]);

  const getTrekColor = (signal) => {
    if (signal === 'Buy') return 'bg-chart-3/10 text-chart-3';
    if (signal === 'Sell') return 'bg-destructive/10 text-destructive';
    if (signal === 'Watch') return 'bg-warning/10 text-warning';
    return 'bg-white/5 text-white/50';
  };

  const getTrekBorderColor = (signal) => {
    if (signal === 'Buy') return 'border-l-chart-3';
    if (signal === 'Sell') return 'border-l-destructive';
    if (signal === 'Watch') return 'border-l-warning';
    return 'border-l-white/20';
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3.5 h-5 w-5 text-white/30 pointer-events-none" />
        <input
          type="text"
          placeholder="Search 200+ assets... (ticker or name)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Results Count */}
      <div className="text-xs text-white/50 px-1">
        Showing {results.length} of {EXPANDED_ASSETS.length} assets
      </div>

      {/* Asset Grid - Scrollable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {results.map((asset, i) => (
            <motion.button
              key={`${asset.symbol}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => navigate(`/Asset/${asset.symbol}`)}
              className={`text-left rounded-lg p-3 border-l-4 transition-all hover:bg-white/[0.08] group ${getTrekBorderColor(asset.trek)} bg-white/[0.03] border border-white/5`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-mono font-bold text-white text-sm">{asset.symbol}</div>
                  <div className="text-xs text-white/50 truncate">{asset.name}</div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${getTrekColor(asset.trek)}`}>
                  {asset.trek}
                </span>
              </div>

              {/* Price & Change */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono font-bold text-white text-sm">
                  ${asset.price > 100 ? asset.price.toFixed(0) : asset.price.toFixed(2)}
                </span>
                <div className={`flex items-center gap-0.5 text-xs font-bold ${asset.change >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                  {asset.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {asset.change >= 0 ? '+' : ''}{asset.change}%
                </div>
              </div>

              {/* Confidence + Sector */}
              <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                <span className="text-white/40">{asset.sector}</span>
                <span className="text-white/50">Conf: {asset.confidence}%</span>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {results.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-white/50 text-sm">No assets found matching "{searchQuery}"</p>
          <p className="text-white/30 text-xs mt-1">Try searching by ticker (AAPL) or company name (Apple)</p>
        </motion.div>
      )}

      {/* Coverage Info */}
      <div className="text-center py-4 border-t border-white/5 mt-4">
        <p className="text-xs text-white/40">
          Tracking 200+ assets across stocks, ETFs, and crypto. TREK confidence scores on every asset.
        </p>
      </div>
    </div>
  );
}