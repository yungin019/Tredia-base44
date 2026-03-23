import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { formatPrice, formatPercent, validatePrice, validatePercent } from '@/lib/dataValidation';
import { useLoadingState } from '@/hooks/useLoadingState';
import { SkeletonCard, LoadingMessage, DataUnavailable } from '@/components/ui/SkeletonLoader';
import { fetchTier1Assets, getCacheStatus } from '@/api/marketDataClient';

/**
 * Core Asset Display - 12-14 high-priority assets only
 * Shows real data or honest loading states, never fake prices
 */

const CORE_ASSETS = [
  { symbol: 'NVDA', name: 'NVIDIA', sector: 'Technology' },
  { symbol: 'AAPL', name: 'Apple', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla', sector: 'Automotive' },
  { symbol: 'AMZN', name: 'Amazon', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet', sector: 'Technology' },
  { symbol: 'META', name: 'Meta', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan', sector: 'Finance' },
  { symbol: 'SPY', name: 'S&P 500', sector: 'Index' },
  { symbol: 'QQQ', name: 'Nasdaq-100', sector: 'Index' },
  { symbol: 'BTC', name: 'Bitcoin', sector: 'Crypto' },
  { symbol: 'ETH', name: 'Ethereum', sector: 'Crypto' },
];

export default function CoreAssetDisplay() {
  const navigate = useNavigate();
  const [liveData, setLiveData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const loadingState = useLoadingState(loading);

  // Load core assets on mount
  useEffect(() => {
    async function loadCore() {
      setLoading(true);
      setError(false);
      try {
        // Try to fetch live data
        const assets = await fetchTier1Assets();
        
        if (assets && assets.length > 0) {
          const priceMap = {};
          assets.forEach(asset => {
            if (CORE_ASSETS.find(ca => ca.symbol === asset.symbol)) {
              priceMap[asset.symbol] = {
                price: asset.price,
                prevClose: asset.prevClose || asset.price,
                change: asset.change || 0
              };
            }
          });
          
          if (Object.keys(priceMap).length > 0) {
            setLiveData(priceMap);
            setLoading(false);
            return;
          }
        }
        
        // If live fetch failed, try cache as fallback
        const cacheStatus = getCacheStatus();
        const cachedPrices = {};
        CORE_ASSETS.forEach(asset => {
          if (cacheStatus[asset.symbol]) {
            cachedPrices[asset.symbol] = {
              price: asset.price || 0,
              prevClose: asset.prevClose || 0,
              change: asset.change || 0
            };
          }
        });
        
        if (Object.keys(cachedPrices).length > 0) {
          setLiveData(cachedPrices);
          setLoading(false);
        } else {
          setError(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('[CoreAssets] Load failed:', err.message);
        setError(true);
        setLoading(false);
      }
    }
    
    loadCore();
  }, []);

  const handleRetry = () => {
    setError(false);
    setLoading(true);
    // Trigger reload
    window.location.reload();
  };

  // Skeleton state
  if (loadingState === 'skeleton') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CORE_ASSETS.slice(0, 12).map((asset) => (
            <SkeletonCard key={asset.symbol} />
          ))}
        </div>
      </div>
    );
  }

  // Fetching state
  if (loadingState === 'fetching') {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CORE_ASSETS.slice(0, 12).map((asset) => (
            <motion.div
              key={asset.symbol}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="rounded-lg border border-white/5 bg-white/[0.03] p-4"
            >
              <div className="h-8 w-16 bg-white/5 rounded animate-pulse mb-2" />
              <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
            </motion.div>
          ))}
        </div>
        <LoadingMessage message="Fetching live data…" />
      </div>
    );
  }

  // Unavailable state
  if (loadingState === 'unavailable' || error) {
    return (
      <DataUnavailable onRetry={handleRetry} />
    );
  }

  // Real data render
  const displayAssets = CORE_ASSETS.filter(a => liveData[a.symbol]);
  const missingCount = CORE_ASSETS.length - displayAssets.length;

  return (
    <div className="space-y-4">
      {/* Core Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {displayAssets.map((asset, i) => {
            const priceInfo = liveData[asset.symbol];
            if (!priceInfo || !priceInfo.price) return null;

            const change = validatePercent(
              ((priceInfo.price - (priceInfo.prevClose || priceInfo.price)) / (priceInfo.prevClose || priceInfo.price)) * 100
            );
            const priceStr = formatPrice(validatePrice(priceInfo.price), 2);
            const changeStr = formatPercent(change, 1);

            return (
              <motion.button
                key={asset.symbol}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/Asset/${asset.symbol}`)}
                className="text-left rounded-lg border border-white/5 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-mono font-bold text-white text-sm">{asset.symbol}</div>
                    <div className="text-xs text-white/40">{asset.name}</div>
                  </div>
                  <div className="text-[10px] text-white/30 px-2 py-1 rounded-full bg-white/[0.05] group-hover:bg-white/10 transition-colors">
                    {asset.sector}
                  </div>
                </div>

                {/* Price & Change */}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-mono font-bold text-white text-base">${priceStr}</span>
                  <div className={`flex items-center gap-0.5 text-xs font-bold ${
                    change >= 0 ? 'text-chart-3' : 'text-destructive'
                  }`}>
                    {change >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {changeStr}
                  </div>
                </div>

                {/* Live indicator */}
                <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-white/30 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-chart-3 animate-pulse" />
                  Real-time
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Missing assets note */}
      {missingCount > 0 && (
        <p className="text-xs text-white/30 text-center">
          {missingCount} assets unavailable • Search to explore 200+ options
        </p>
      )}
    </div>
  );
}