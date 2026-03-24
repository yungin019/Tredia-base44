import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { fetchCoreAssets } from '@/api/marketDataClient';

/**
 * CoreAssetDisplay
 *
 * States per card:
 *   skeleton   → 0–1s loading
 *   live       → real price data from backend
 *   unavailable → provider down / stale / failed
 *
 * NEVER shows: infinite loading, blank, fake prices, NaN.
 *
 * Refreshes every 10s automatically.
 */

const CORE_SYMBOLS = ['AAPL', 'NVDA', 'TSLA', 'AMZN', 'SPY', 'QQQ', 'BTC', 'ETH'];

const CORE_META = {
  AAPL: { name: 'Apple',     sector: 'Technology' },
  NVDA: { name: 'NVIDIA',    sector: 'Technology' },
  TSLA: { name: 'Tesla',     sector: 'Automotive' },
  AMZN: { name: 'Amazon',    sector: 'Technology' },
  SPY:  { name: 'S&P 500',   sector: 'Index' },
  QQQ:  { name: 'Nasdaq 100',sector: 'Index' },
  BTC:  { name: 'Bitcoin',   sector: 'Crypto' },
  ETH:  { name: 'Ethereum',  sector: 'Crypto' },
};

function AssetCardSkeleton({ symbol }) {
  const meta = CORE_META[symbol] || { name: symbol, sector: '' };
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-mono font-bold text-white text-sm">{symbol}</div>
          <div className="text-xs text-white/40">{meta.name}</div>
        </div>
        <div className="text-[10px] text-white/20 px-2 py-1 rounded-full bg-white/[0.04]">
          {meta.sector}
        </div>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="h-5 w-20 rounded bg-white/5 animate-pulse" />
        <div className="h-4 w-12 rounded bg-white/5 animate-pulse" />
      </div>
      <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-white/10 animate-pulse" />
        <div className="h-3 w-16 rounded bg-white/5 animate-pulse" />
      </div>
    </div>
  );
}

function AssetCardUnavailable({ symbol }) {
  const meta = CORE_META[symbol] || { name: symbol, sector: '' };
  return (
    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 opacity-60">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-mono font-bold text-white/50 text-sm">{symbol}</div>
          <div className="text-xs text-white/25">{meta.name}</div>
        </div>
        <div className="text-[10px] text-white/20 px-2 py-1 rounded-full bg-white/[0.03]">
          {meta.sector}
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-white/30 text-xs">
        <AlertCircle className="h-3 w-3" />
        <span>Unavailable</span>
      </div>
      <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-white/20 flex items-center gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-white/15" />
        Offline
      </div>
    </div>
  );
}

function AssetCardLive({ symbol, data, onClick }) {
  const meta = CORE_META[symbol] || { name: data.name || symbol, sector: data.sector || '' };
  const isPositive = data.changePct >= 0;
  const price = typeof data.price === 'number' ? data.price : null;
  const changePct = typeof data.changePct === 'number' ? data.changePct : null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="text-left rounded-lg border border-white/5 bg-white/[0.03] p-4 hover:bg-white/[0.06] hover:border-white/10 transition-all group w-full"
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="font-mono font-bold text-white text-sm">{symbol}</div>
          <div className="text-xs text-white/40">{meta.name}</div>
        </div>
        <div className="text-[10px] text-white/30 px-2 py-1 rounded-full bg-white/[0.05] group-hover:bg-white/10 transition-colors">
          {meta.sector}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono font-bold text-white text-base">
          {price !== null ? `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
        </span>
        {changePct !== null && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {isPositive ? '+' : ''}{changePct.toFixed(2)}%
          </div>
        )}
      </div>

      <div className="mt-2 pt-2 border-t border-white/5 text-[9px] text-white/30 flex items-center gap-1">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live · {data.provider === 'polygon' ? 'Polygon' : 'CoinGecko'}
      </div>
    </motion.button>
  );
}

export default function CoreAssetDisplay() {
  const navigate = useNavigate();
  const [assetMap, setAssetMap] = useState({}); // symbol → data or null (skeleton)
  const [phase, setPhase] = useState('skeleton'); // skeleton | loaded
  const timeoutRef = useRef(null);
  const refreshRef = useRef(null);

  async function load() {
    // After 2.5s with no data → force all to unavailable
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setAssetMap(prev => {
        const next = { ...prev };
        CORE_SYMBOLS.forEach(s => {
          if (!next[s] || next[s]._skeleton) {
            next[s] = { status: 'unavailable' };
          }
        });
        return next;
      });
      setPhase('loaded');
    }, 2500);

    const assets = await fetchCoreAssets();
    console.log('FRONT DATA:', JSON.stringify(assets));
    clearTimeout(timeoutRef.current);

    const map = {};
    assets.forEach(a => { map[a.symbol] = a; });

    // For any missing symbol, mark unavailable
    CORE_SYMBOLS.forEach(s => {
      if (!map[s]) map[s] = { status: 'unavailable' };
    });

    setAssetMap(map);
    setPhase('loaded');
  }

  useEffect(() => {
    load();

    // Refresh every 10s
    refreshRef.current = setInterval(load, 10000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (refreshRef.current) clearInterval(refreshRef.current);
    };
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {CORE_SYMBOLS.map((symbol, i) => {
        if (phase === 'skeleton') {
          return <AssetCardSkeleton key={symbol} symbol={symbol} />;
        }

        const data = assetMap[symbol];

        if (!data || data.status === 'unavailable') {
          return <AssetCardUnavailable key={symbol} symbol={symbol} />;
        }

        return (
          <AssetCardLive
            key={symbol}
            symbol={symbol}
            data={data}
            onClick={() => navigate(`/Asset/${symbol}`)}
          />
        );
      })}
    </div>
  );
}