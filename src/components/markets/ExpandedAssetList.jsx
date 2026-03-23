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
          setLiveData(res.data.prices);
          setLastRefresh(new Date());
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
          'AVAX': 'avalanche-2', 'FTM': 'fantom', 'LINK': 'chainlink',
          'ARB': 'arbitrum', 'OP': 'optimism', 'LDO': 'lido-dao',
          'PEPE': 'pepe', 'SHIB': 'shiba-inu', 'UNI': 'uniswap',
          'AAVE': 'aave', 'CRV': 'curve-dao-token', 'MKR': 'maker',
          'SNX': 'synthetix', 'GRT': 'the-graph', 'ATOM': 'cosmos',
          'NEAR': 'near', 'ALGO': 'algorand', 'FLOW': 'flow'
        };
        
        const ids = Object.values(cryptoIds).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        const data = await response.json();
        
        const priceMap = {};
        Object.entries(cryptoIds).forEach(([symbol, id]) => {
          if (data[id]) {
            priceMap[symbol] = {
              price: data[id].usd,
              change: data[id].usd_24h_change || 0,
              prevClose: data[id].usd / (1 + (data[id].usd_24h_change || 0) / 100)
            };
          }
        });
        setCryptoData(priceMap);
        setLastRefresh(new Date());
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
      } finally {
        setLoading(false);
      }
    }
    
    // Initial fetch
    fetchCrypto();
    
    // Auto-refresh every 30 seconds (crypto is more volatile)
    const cryptoInterval = setInterval(fetchCrypto, 30000);
    
    return () => clearInterval(cryptoInterval);
  }, []);

  const results = useMemo(() => {
    if (!searchQuery.trim()) return EXPANDED_ASSETS.slice(0, 50);
    return searchAssets(searchQuery);
  }, [searchQuery]);

  const getPriceData = (asset) => {
    if (asset.sector === 'Crypto') {
      return cryptoData[asset.symbol] || { price: null, change: null };
    }
    const priceInfo = liveData[asset.symbol];
    if (priceInfo && typeof priceInfo === 'object') {
      return { price: priceInfo.price, change: priceInfo.change };
    }
    if (typeof priceInfo === 'number') {
      return { price: priceInfo, change: null };
    }
    return { price: null, change: null };
  };

  const TREK_REASONS = {
    'AAPL': 'Strong cash flow + innovation cycle',
    'NVDA': 'AI infrastructure demand accelerating',
    'MSFT': 'Cloud growth + enterprise AI adoption',
    'GOOGL': 'Search moat + AI integration',
    'AMZN': 'AWS expansion + cloud infrastructure',
    'META': 'Ad revenue uncertainty + multiple compression',
    'TSLA': 'Delivery misses + margin compression',
    'JPM': 'Interest rate sensitivity + credit quality',
    'JNJ': 'Defensive play + dividend safety',
    'LLY': 'GLP-1 franchise + obesity market',
    'NFLX': 'Content strength + subscriber growth',
    'COST': 'Member growth + pricing power',
    'SPY': 'Broad market proxy + stable',
    'QQQ': 'Tech exposure + growth leverage',
    'BTC': 'Macro uncertainty hedge + adoption',
    'ETH': 'DeFi growth + staking yield',
    'SOL': 'Developer adoption + speed',
    'AAVE': 'DeFi lending protocol leader',
  };

  const getTrekSignal = (symbol) => {
    const buySymbols = ['AAPL', 'NVDA', 'MSFT', 'AMZN', 'NFLX', 'COST', 'JNJ', 'LLY', 'BTC', 'ETH', 'SOL', 'AAVE'];
    const sellSymbols = ['META', 'TSLA'];
    
    if (buySymbols.includes(symbol)) return 'Buy';
    if (sellSymbols.includes(symbol)) return 'Sell';
    return 'Hold';
  };

  const getTrekColor = (signal) => {
    if (signal === 'Buy') return 'bg-chart-3/10 text-chart-3';
    if (signal === 'Sell') return 'bg-destructive/10 text-destructive';
    return 'bg-white/5 text-white/50';
  };

  const getTrekBorderColor = (signal) => {
    if (signal === 'Buy') return 'border-l-chart-3';
    if (signal === 'Sell') return 'border-l-destructive';
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
        Showing {results.length} of {EXPANDED_ASSETS.length} assets {loading && <span className="animate-pulse">• Fetching live prices...</span>}
      </div>

      {/* Asset Grid - Scrollable */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {results.map((asset, i) => {
            const { price, change } = getPriceData(asset);
            const trekSignal = getTrekSignal(asset.symbol);
            const reason = TREK_REASONS[asset.symbol] || 'Market dynamics analysis';
            
            return (
              <motion.button
                key={`${asset.symbol}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: i * 0.02 }}
                onClick={() => navigate(`/Asset/${asset.symbol}`)}
                className={`text-left rounded-lg p-3 border-l-4 transition-all hover:scale-[1.02] group ${getTrekBorderColor(trekSignal)} ${
                  trekSignal === 'Buy' ? 'bg-chart-3/5 hover:bg-chart-3/10' :
                  trekSignal === 'Sell' ? 'bg-destructive/5 hover:bg-destructive/10' :
                  'bg-white/[0.03] hover:bg-white/[0.08]'
                } border border-white/5`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <div className="font-mono font-bold text-white text-sm">{asset.symbol}</div>
                    <div className="text-xs text-white/50 truncate">{asset.name}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getTrekColor(trekSignal)}`}>
                    {trekSignal}
                  </span>
                </div>

                {/* TREK Reason (1 line) */}
                <p className="text-xs text-white/60 mb-2 line-clamp-1">{reason}</p>

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

                {/* Confidence + Sector */}
                <div className="mt-2 pt-2 border-t border-white/5 flex justify-between items-center text-xs">
                  <span className="text-white/40">{asset.sector}</span>
                  <span className="text-white/50">Conf: {asset.confidence}%</span>
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
          ✓ 200+ real assets | Live prices from Polygon API + CoinGecko | 24h change data
        </p>
      </div>
    </div>
  );
}