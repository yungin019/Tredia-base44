import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Globe, TrendingUp, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const QUICK_ASSETS = {
  US: ['AAPL', 'NVDA', 'MSFT', 'TSLA', 'GOOGL', 'META', 'AMZN'],
  EU: ['MC.PA', 'SAP.DE', 'ASML.AS', 'BABA', 'ABNB', 'ADYEN.AS'],
  CRYPTO: ['BTC', 'ETH', 'SOL', 'XRP', 'ADA', 'AVAX'],
  FOREX: ['EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'XAGUSD'],
};

export default function GlobalAssetSearch({ isOpen: isOpenProp, onClose }) {
  const navigate = useNavigate();
  const [isOpenInternal, setIsOpenInternal] = useState(false);
  const isOpen = isOpenProp !== undefined ? isOpenProp : isOpenInternal;
  const closeModal = () => { setIsOpenInternal(false); if (onClose) onClose(); };
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);

  // Search across providers
  const handleSearch = async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await base44.functions.invoke('stockPrices', {
        mode: 'search',
        query: q,
        assetType: activeTab === 'all' ? 'all' : activeTab,
      });

      if (res.data?.results) {
        setResults(res.data.results);
      }
    } catch (e) {
      console.error('Search failed:', e);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) handleSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, activeTab]);

  // ESC to close
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) closeModal(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const tabs = [
    { id: 'all', label: 'All', icon: '🔍' },
    { id: 'stock', label: 'Stocks', icon: '📈' },
    { id: 'etf', label: 'ETFs', icon: '📊' },
    { id: 'crypto', label: 'Crypto', icon: '₿' },
    { id: 'forex', label: 'Forex', icon: '💱' },
  ];

  const getQuickAssets = () => {
    if (activeTab === 'all') {
      return [
        { section: 'US Tech', items: QUICK_ASSETS.US },
        { section: 'European', items: QUICK_ASSETS.EU },
        { section: 'Crypto', items: QUICK_ASSETS.CRYPTO },
        { section: 'Forex Pairs', items: QUICK_ASSETS.FOREX },
      ];
    }
    if (activeTab === 'stock') return [{ section: 'Popular US Stocks', items: QUICK_ASSETS.US }];
    if (activeTab === 'crypto') return [{ section: 'Top Cryptocurrencies', items: QUICK_ASSETS.CRYPTO }];
    if (activeTab === 'forex') return [{ section: 'Major Pairs', items: QUICK_ASSETS.FOREX }];
    return [];
  };

  return (
    <>
      {/* Search Button — only shown when used standalone (no isOpenProp) */}
      {isOpenProp === undefined && (
        <button
          onClick={() => setIsOpenInternal(true)}
          className="w-full h-12 rounded-xl bg-white/[0.02] border border-white/10 px-4 flex items-center gap-3 text-muted-foreground hover:border-primary/25 transition-all group"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm">Search stocks, crypto, forex...</span>
          <kbd className="ml-auto text-xs font-mono text-white/25">⌘K</kbd>
        </button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/60 z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[80vh] rounded-3xl bg-card border border-white/10 overflow-hidden flex flex-col"
            >
              {/* Search Input */}
              <div className="border-b border-white/5 p-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search stocks, ETFs, crypto, forex..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent pl-10 pr-4 py-3 text-foreground placeholder-muted-foreground outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-white/5 px-4 pt-3 pb-0 flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setQuery('');
                    }}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto">
                {query ? (
                  <div className="p-4 space-y-2">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    ) : results.length > 0 ? (
                      results.map((r) => (
                        <motion.button
                          key={`${r.symbol}-${r.type}`}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={() => {
                            navigate(`/Asset/${r.symbol}`);
                            closeModal();
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold text-foreground">{r.symbol}</p>
                              <p className="text-xs text-muted-foreground">{r.name}</p>
                            </div>
                            <span className="text-xs font-semibold text-primary px-2 py-1 rounded-lg bg-primary/10">
                              {r.type}
                            </span>
                          </div>
                        </motion.button>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <p className="text-sm">No results found</p>
                        <p className="text-xs mt-2">Try entering a ticker symbol or company name</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {getQuickAssets().map((group) => (
                      <div key={group.section}>
                        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wider">{group.section}</p>
                        <div className="grid grid-cols-3 gap-2">
                          {group.items.map((symbol) => (
                            <motion.button
                              key={symbol}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              onClick={() => { navigate(`/Asset/${symbol}`); closeModal(); }}
                              onContextMenu={(e) => {
                                e.preventDefault();
                                setQuery(symbol);
                              }}
                              className="p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-primary/25 transition-all text-center"
                            >
                              <p className="font-bold text-foreground text-sm">{symbol}</p>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-white/5 p-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex gap-3">
                  <span>↵ to select</span>
                  <span>ESC to close</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  Powered by Finnhub, Polygon, Twelve Data, AlphaVantage
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </>
  );
}