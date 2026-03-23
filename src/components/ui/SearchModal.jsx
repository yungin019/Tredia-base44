import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const QUICK_ACTIONS = [
  { label: 'View Portfolio', path: '/Portfolio', icon: '💼' },
  { label: 'AI Insights', path: '/AIInsights', icon: '🤖' },
  { label: 'Markets', path: '/Markets', icon: '📈' },
  { label: 'Trade', path: '/Trade', icon: '⚡' },
  { label: 'Paper Trading', path: '/PaperTrading', icon: '📝' },
];

// Popular assets — US, International, Forex, Crypto, ETFs
const POPULAR_SYMBOLS = [
  // US Stocks
  { symbol: 'AAPL',    name: 'Apple Inc.',        type: 'Stock' },
  { symbol: 'NVDA',    name: 'NVIDIA Corp',       type: 'Stock' },
  { symbol: 'TSLA',    name: 'Tesla Inc.',        type: 'Stock' },
  { symbol: 'MSFT',    name: 'Microsoft Corp',    type: 'Stock' },
  { symbol: 'GOOGL',   name: 'Alphabet Inc.',     type: 'Stock' },
  { symbol: 'META',    name: 'Meta Platforms',    type: 'Stock' },
  { symbol: 'AMZN',    name: 'Amazon.com',        type: 'Stock' },
  { symbol: 'BABA',    name: 'Alibaba Group',     type: 'Stock' },
  // European
  { symbol: 'MC.PA',   name: 'LVMH',              type: 'Stock' },
  { symbol: 'SAP.DE',  name: 'SAP SE',            type: 'Stock' },
  { symbol: 'ASML.AS', name: 'ASML Holding',      type: 'Stock' },
  // Asia
  { symbol: '7203.T',  name: 'Toyota Motor',      type: 'Stock' },
  // ETFs
  { symbol: 'SPY',     name: 'S&P 500 ETF',       type: 'ETF' },
  { symbol: 'QQQ',     name: 'Nasdaq-100 ETF',    type: 'ETF' },
  { symbol: 'GLD',     name: 'Gold ETF',          type: 'ETF' },
  // Crypto
  { symbol: 'BTC',     name: 'Bitcoin',           type: 'Crypto' },
  { symbol: 'ETH',     name: 'Ethereum',          type: 'Crypto' },
  // Forex / Commodities
  { symbol: 'EURUSD',  name: 'Euro / US Dollar',  type: 'Forex' },
  { symbol: 'GBPUSD',  name: 'British Pound / USD', type: 'Forex' },
  { symbol: 'XAUUSD',  name: 'Gold / US Dollar',  type: 'Commodity' },
  { symbol: 'XAGUSD',  name: 'Silver / US Dollar', type: 'Commodity' },
];

// Asset-type tabs for filtering
const ASSET_TABS = [
  { id: 'all',       label: 'All' },
  { id: 'stock',     label: 'Stocks' },
  { id: 'etf',       label: 'ETFs' },
  { id: 'crypto',    label: 'Crypto' },
  { id: 'forex',     label: 'Forex' },
  { id: 'commodity', label: 'Commodities' },
];

const TYPE_COLORS = {
  Stock:     { bg: 'rgba(59,130,246,0.12)',  text: '#60a5fa' },
  ETF:       { bg: 'rgba(16,185,129,0.12)',  text: '#34d399' },
  Crypto:    { bg: 'rgba(245,158,11,0.12)', text: '#fbbf24' },
  Forex:     { bg: 'rgba(168,85,247,0.12)', text: '#c084fc' },
  Commodity: { bg: 'rgba(251,146,60,0.12)', text: '#fb923c' },
  Index:     { bg: 'rgba(236,72,153,0.12)', text: '#f472b6' },
  ADR:       { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)' },
  ETP:       { bg: 'rgba(16,185,129,0.08)', text: '#34d399' },
  Fund:      { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)' },
  Asset:     { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)' },
};

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
      setActiveTab('all');
    }
  }, [isOpen]);

  // Keyboard: close on ESC
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      clearTimeout(debounceRef.current);
      return;
    }

    const q = query.toLowerCase();

    // Filter popular symbols by activeTab (type match is case-insensitive)
    const local = POPULAR_SYMBOLS.filter(s => {
      const typeL = s.type.toLowerCase();
      const matchesTab = activeTab === 'all'
        || typeL === activeTab
        || (activeTab === 'forex' && (typeL === 'forex' || typeL === 'commodity'))
        || (activeTab === 'commodity' && typeL === 'commodity');
      const matchesQuery = s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
    setResults(local.slice(0, 6));

    // Debounced backend search (Finnhub: 30,000+ assets)
    clearTimeout(debounceRef.current);
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke('stockPrices', {
          mode: 'search',
          query: query.trim(),
          assetType: activeTab, // pass tab filter to backend
        });
        const backendResults = res?.data?.results || [];
        if (backendResults.length > 0) {
          const seen = new Set();
          const merged = [...backendResults, ...local].filter(r => {
            if (seen.has(r.symbol)) return false;
            seen.add(r.symbol);
            return true;
          });
          setResults(merged.slice(0, 15));
        }
      } catch { /* keep local results */ } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query, activeTab]);

  const handleSelect = (path) => {
    navigate(path);
    onClose();
    setQuery('');
  };

  const handleAssetSelect = (symbol) => {
    navigate(`/Asset/${symbol}`);
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  const popularToShow = activeTab === 'all'
    ? POPULAR_SYMBOLS
    : POPULAR_SYMBOLS.filter(s => s.type.toLowerCase() === activeTab);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-start justify-center pt-20 px-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#111118] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
            <Search className="h-5 w-5 text-white/30 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search stocks, ETFs, crypto, forex..."
              className="flex-1 bg-transparent text-white/90 placeholder:text-white/25 text-base outline-none"
            />
            {searching && <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />}
            {query && !searching && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-white/[0.05] rounded tap-feedback">
                <X className="h-4 w-4 text-white/30" />
              </button>
            )}
          </div>

          {/* Asset Type Tabs */}
          <div className="flex gap-1 px-4 py-2 border-b border-white/[0.04] overflow-x-auto scrollbar-hide">
            {ASSET_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition-all"
                style={{
                  background: activeTab === tab.id ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                  color: activeTab === tab.id ? '#F59E0B' : 'rgba(255,255,255,0.35)',
                  border: `1px solid ${activeTab === tab.id ? 'rgba(245,158,11,0.3)' : 'transparent'}`,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Search Results */}
            {query && results.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" />
                  Results ({results.length})
                </div>
                {results.map((item) => {
                  const typeColor = TYPE_COLORS[item.type] || TYPE_COLORS.Asset;
                  return (
                    <button
                      key={item.symbol}
                      onClick={() => handleAssetSelect(item.symbol)}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors text-left card-press"
                      style={{ minHeight: '52px' }}
                    >
                      <div className="h-9 w-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] font-black font-mono text-white/50 flex-shrink-0">
                        {item.symbol.slice(0, 3)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white/90 font-mono">{item.symbol}</div>
                        <div className="text-xs text-white/40 truncate">{item.name}</div>
                      </div>
                      {item.type && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: typeColor.bg, color: typeColor.text }}>
                          {item.type}
                        </span>
                      )}
                      <Zap className="h-3.5 w-3.5 text-white/15 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}

            {/* No Results */}
            {query && !searching && results.length === 0 && (
              <div className="p-8 text-center">
                {activeTab === 'forex' ? (
                  <>
                    <div className="text-2xl mb-2">📊</div>
                    <div className="text-white/40 text-sm font-bold mb-1">Forex search not available</div>
                    <div className="text-xs text-white/25 leading-relaxed">
                      Forex pairs require direct symbol lookup.<br />
                      Navigate to a specific asset page (e.g. EUR/USD).
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-white/20 mb-2">No results for "{query}"</div>
                    <div className="text-xs text-white/30">
                      Try a ticker like AAPL, BTC, SPY, or a company name
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Quick Actions (no query) */}
            {!query && (
              <div className="p-2">
                <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider">
                  Quick Actions
                </div>
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.path}
                    onClick={() => handleSelect(action.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors text-left card-press"
                    style={{ minHeight: '52px' }}
                  >
                    <div className="h-9 w-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-xl">
                      {action.icon}
                    </div>
                    <div className="text-sm font-medium text-white/80">{action.label}</div>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Symbols (filtered by tab) */}
            {!query && popularToShow.length > 0 && (
              <div className="p-2 border-t border-white/[0.05]">
                <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Popular Assets
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {popularToShow.slice(0, 9).map((item) => {
                    const typeColor = TYPE_COLORS[item.type] || TYPE_COLORS.Asset;
                    return (
                      <button
                        key={item.symbol}
                        onClick={() => handleAssetSelect(item.symbol)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] active:bg-white/[0.06] border border-white/[0.05] transition-colors text-left card-press"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-white/85 font-mono">{item.symbol}</div>
                          <div className="text-[9px] truncate" style={{ color: typeColor.text }}>
                            {item.type}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/[0.05] flex items-center justify-between">
            <div className="text-[10px] text-white/20">
              Powered by Finnhub · Stocks, ETFs, Crypto, Forex
            </div>
            <kbd className="text-[9px] bg-white/[0.06] px-1.5 py-0.5 rounded font-mono text-white/30">ESC</kbd>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}