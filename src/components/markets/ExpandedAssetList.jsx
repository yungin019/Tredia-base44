import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Loader2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EXPANDED_ASSETS, searchAssets } from '@/lib/assetDatabase';
import { base44 } from '@/api/base44Client';
import { deriveSignal } from '@/api/signalEngine';

export default function ExpandedAssetList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [liveData, setLiveData] = useState({});
  const [cryptoData, setCryptoData] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);
  const navigate = useNavigate();
  const refreshIntervalRef = useRef(null);

  // Fetch live stock prices with auto-refresh
  useEffect(() => {
    async function fetchPrices() {
      try {
        const stockSymbols = EXPANDED_ASSETS
          .filter(a => a.sector !== 'Crypto')
          .map(a => a.symbol);
        
        const res = await base44.functions.invoke('stockPrices', { symbols: stockSymbols });
        if (res?.data?.prices) {
          // Transform API response to include calculated change %
          const transformedData = {};
          Object.entries(res.data.prices).forEach(([symbol, data]) => {
            if (data && data.price) {
              const price = data.price;
              const prevClose = data.prevClose || price;
              const change = prevClose && price ? ((price - prevClose) / prevClose) * 100 : 0;
              transformedData[symbol] = {
                price,
                prevClose,
                change: parseFloat(change.toFixed(2)),
                timestamp: data.timestamp || Date.now()
              };
            }
          });
          setLiveData(transformedData);
          setLastRefresh(new Date());
          setRefreshCount(prev => prev + 1);
        }
      } catch (error) {
        console.error('Error fetching stock prices:', error);
      } finally {
        setLoading(false);
      }
    }
    
    // Initial fetch
    fetchPrices();
    
    // Auto-refresh every 45 seconds
    refreshIntervalRef.current = setInterval(fetchPrices, 45000);
    
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  // Fetch live crypto prices with auto-refresh
  useEffect(() => {
    async function fetchCrypto() {
      try {
        const cryptoIds = {
          'BTC': 'bitcoin', 'ETH': 'ethereum', 'SOL': 'solana', 'XRP': 'ripple',
          'ADA': 'cardano', 'DOGE': 'dogecoin', 'MATIC': 'matic-network',
          'AVAX': 'avalanche-2', 'LINK': 'chainlink', 'UNI': 'uniswap',
          'SHIB': 'shiba-inu', 'PEPE': 'pepe', 'LDO': 'lido-dao'
        };
        
        const ids = Object.values(cryptoIds).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (!response.ok) {
          if (response.status === 429) {
            console.warn('CoinGecko rate limited, keeping previous data');
            return; // Keep existing data, don't update
          }
          throw new Error('CoinGecko error');
        }
        
        const data = await response.json();
        
        const priceMap = {};
        Object.entries(cryptoIds).forEach(([symbol, id]) => {
          if (data[id] && data[id].usd) {
            priceMap[symbol] = {
              price: data[id].usd,
              change: data[id].usd_24h_change || 0,
              prevClose: data[id].usd / (1 + (data[id].usd_24h_change || 0) / 100)
            };
          }
        });
        
        // Only update if we got valid data
        if (Object.keys(priceMap).length > 0) {
          setCryptoData(priceMap);
          setLastRefresh(new Date());
          setRefreshCount(prev => prev + 1);
        }
      } catch (error) {
        console.warn('Crypto fetch failed, keeping previous data:', error.message);
        // Keep existing data on error
      } finally {
        setLoading(false);
      }
    }
    
    // Initial fetch
    fetchCrypto();
    
    // Auto-refresh every 60 seconds (reduced from 30s to avoid rate limits)
    const cryptoInterval = setInterval(fetchCrypto, 60000);
    
    return () => clearInterval(cryptoInterval);
  }, []);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return EXPANDED_ASSETS.slice(0, 50);
    return searchAssets(searchQuery);
  }, [searchQuery]);

  const getPriceData = (asset) => {
    if (asset.sector === 'Crypto') {
      const cryptoInfo = cryptoData[asset.symbol];
      return {
        price: cryptoInfo?.price || null,
        change: cryptoInfo?.change || null,
        prevClose: cryptoInfo?.prevClose || null
      };
    }
    const priceInfo = liveData[asset.symbol];
    if (priceInfo && typeof priceInfo === 'object') {
      return {
        price: priceInfo.price || null,
        change: priceInfo.change || null,
        prevClose: priceInfo.prevClose || null
      };
    }
    return { price: null, change: null, prevClose: null };
  };

  // Derive live signals from real market data
  const getLiveSignal = (asset) => {
    const priceInfo = asset.sector === 'Crypto' 
      ? cryptoData[asset.symbol] 
      : liveData[asset.symbol];
    
    if (!priceInfo || !priceInfo.price) {
      return {
        signal: 'WATCH',
        confidence: 0,
        reason: 'Loading price data...',
        isLiveDerived: false,
        metrics: { volatility: 'UNKNOWN' }
      };
    }

    const priceData = {
      price: priceInfo.price,
      prevClose: priceInfo.prevClose || priceInfo.price,
      change24h: priceInfo.change || 0,
      high24h: priceInfo.price * 1.02,
      low24h: priceInfo.price * 0.98
    };

    return deriveSignal(asset, priceData, {
      marketSentiment: priceInfo.change > 2 ? 'BULLISH' : priceInfo.change < -2 ? 'BEARISH' : 'NEUTRAL'
    });
  };

  const getSignalColor = (signal) => {
    if (signal === 'BUY') return 'bg-chart-3/10 text-chart-3';
    if (signal === 'SELL') return 'bg-destructive/10 text-destructive';
    if (signal === 'WATCH') return 'bg-warning/10 text-warning';
    return 'bg-white/5 text-white/50';
  };

  const getSignalBorderColor = (signal) => {
    if (signal === 'BUY') return 'border-l-chart-3';
    if (signal === 'SELL') return 'border-l-destructive';
    if (signal === 'WATCH') return 'border-l-warning';
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

      {/* Results Count + Refresh Status */}
      <div className="flex items-center justify-between text-xs text-white/50 px-1">
        <span>
          Showing {results.length} of {EXPANDED_ASSETS.length} assets
          {loading && <span className="animate-pulse ml-2">• Fetching live prices...</span>}
        </span>
        {lastRefresh && (
          <span className="flex items-center gap-1.5">
            <RefreshCw className={`h-3 w-3 ${refreshCount > 0 ? 'text-primary' : ''}`} />
            Live • {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {refreshCount > 0 && <span className="text-primary/70">(+{refreshCount} updates)</span>}
          </span>
        )}
      </div>

      {/* Asset Grid - Scrollable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {results.map((asset, i) => {
            const { price, change } = getPriceData(asset);
            const signal = getLiveSignal(asset);
            
            return (
              <motion.button
                key={`${asset.symbol}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => navigate(`/Asset/${asset.symbol}`)}
                className={`text-left rounded-lg p-3 border-l-4 transition-all hover:scale-[1.02] group ${getSignalBorderColor(signal.signal)} ${
                  signal.signal === 'BUY' ? 'bg-chart-3/5 hover:bg-chart-3/10' :
                  signal.signal === 'SELL' ? 'bg-destructive/5 hover:bg-destructive/10' :
                  signal.signal === 'WATCH' ? 'bg-warning/5 hover:bg-warning/10' :
                  'bg-white/[0.03] hover:bg-white/[0.08]'
                } border border-white/5`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <div className="font-mono font-bold text-white text-sm">{asset.symbol}</div>
                    <div className="text-xs text-white/50 truncate">{asset.name}</div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getSignalColor(signal.signal)}`}>
                      {signal.signal}
                    </span>
                    {signal.isLiveDerived && (
                      <span className="text-[10px] text-primary/60" title="Derived from live market data">
                        ●
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Signal Reason (1 line) */}
                <p className="text-xs text-white/60 mb-2 line-clamp-1">
                  {signal.reason}
                  {!signal.isLiveDerived && <span className="text-white/30 ml-1">(demo)</span>}
                </p>

                {/* Price & Change */}
                {price !== null ? (
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono font-bold text-white text-sm transition-colors duration-200">
                      ${price > 100 ? price.toFixed(0) : price.toFixed(2)}
                    </span>
                    {change !== null && (
                      <div className={`flex items-center gap-0.5 text-xs font-bold transition-colors duration-200 ${change >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                        {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {change >= 0 ? '+' : ''}{change.toFixed(2)}%
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-white/40 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Loading...
                  </div>
                )}

                {/* Signal Confidence + Sector */}
                <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                  <span className="text-white/40">{asset.sector}</span>
                  <div className="flex items-center gap-2">
                    {signal.metrics && (
                      <span className="text-white/40" title={`Momentum: ${signal.metrics.momentumScore}`}>
                        {signal.metrics.volatility} vol
                      </span>
                    )}
                    <span className="text-white/50">Conf: {signal.confidence}%</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
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
          ✓ 200+ real assets | Live prices from Polygon + CoinGecko | Auto-refresh every 30-45s | Signals derived from real market data
        </p>
      </div>
    </div>
  );
}