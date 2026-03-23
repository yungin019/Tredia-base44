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

const POPULAR_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'META', name: 'Meta Platforms' },
  { symbol: 'AMZN', name: 'Amazon.com' },
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SPY', name: 'S&P 500 ETF' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF' },
  { symbol: 'MSFT', name: 'Microsoft Corp' },
];

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const debounceRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    // First: instant local filter on popular symbols
    const q = query.toLowerCase();
    const local = POPULAR_SYMBOLS.filter(
      s => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
    setResults(local.slice(0, 6));

    // Then: debounced backend search for full universe
    clearTimeout(debounceRef.current);
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke('stockPrices', { mode: 'search', query: query.trim() });
        const backendResults = res?.data?.results || [];
        if (backendResults.length > 0) {
          // Merge: backend results first, deduplicate
          const seen = new Set();
          const merged = [...backendResults, ...local].filter(r => {
            if (seen.has(r.symbol)) return false;
            seen.add(r.symbol);
            return true;
          });
          setResults(merged.slice(0, 12));
        }
      } catch { /* keep local results */ } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

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
              placeholder="Search any stock, ETF, crypto, index..."
              className="flex-1 bg-transparent text-white/90 placeholder:text-white/25 text-base outline-none"
            />
            {searching && <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin flex-shrink-0" />}
            {query && !searching && (
              <button onClick={() => setQuery('')} className="p-1 hover:bg-white/[0.05] rounded tap-feedback">
                <X className="h-4 w-4 text-white/30" />
              </button>
            )}
            <kbd className="hidden sm:block text-[10px] bg-white/[0.06] px-2 py-1 rounded font-mono text-white/30">
              ESC
            </kbd>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {/* Search Results */}
            {query && results.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="h-3 w-3" />
                  Results
                </div>
                {results.map((item) => (
                  <button
                    key={item.symbol}
                    onClick={() => handleAssetSelect(item.symbol)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/[0.04] active:bg-white/[0.06] transition-colors text-left card-press"
                    style={{ minHeight: '52px' }}
                  >
                    <div className="h-9 w-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[10px] font-black font-mono text-white/50 flex-shrink-0">
                      {item.symbol.slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white/90 font-mono">{item.symbol}</div>
                      <div className="text-xs text-white/40 truncate">{item.name}</div>
                    </div>
                    {item.type && <span className="text-[9px] text-white/20 bg-white/[0.04] px-1.5 py-0.5 rounded flex-shrink-0">{item.type}</span>}
                    <Zap className="h-3.5 w-3.5 text-white/15 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            {/* No Results */}
            {query && !searching && results.length === 0 && (
              <div className="p-8 text-center">
                <div className="text-white/20 mb-2">No results for "{query}"</div>
                <div className="text-xs text-white/30">Try a ticker symbol like AAPL, BTC, or SPY</div>
              </div>
            )}

            {/* Quick Actions */}
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

            {/* Popular Symbols */}
            {!query && (
              <div className="p-2 border-t border-white/[0.05]">
                <div className="px-3 py-2 text-[10px] font-bold text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  Popular Assets
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {POPULAR_SYMBOLS.slice(0, 9).map((item) => (
                    <button
                      key={item.symbol}
                      onClick={() => handleAssetSelect(item.symbol)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] active:bg-white/[0.06] border border-white/[0.05] transition-colors text-left card-press"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-white/85 font-mono">{item.symbol}</div>
                        <div className="text-[9px] text-white/30 truncate">{item.name.split(' ')[0]}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-white/[0.05] flex items-center justify-between">
            <div className="text-[10px] text-white/20">
              Powered by Finnhub · 30,000+ assets
            </div>
            <kbd className="text-[9px] bg-white/[0.06] px-1.5 py-0.5 rounded font-mono text-white/30">ESC</kbd>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}