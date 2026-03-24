import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EXPANDED_ASSETS } from '@/lib/assetDatabase';
import { deriveSignal } from '@/api/signalEngine';
import { fetchCoreAssets } from '@/api/marketDataClient';

// Single source of truth: all data from marketCore
const SIGNAL_SYMBOLS = ['NVDA', 'AMZN', 'TSLA', 'AAPL', 'BTC', 'ETH'];

export default function TrekSignalsPreview() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    async function fetchSignals() {
      try {
        // ── Single source: same cache as CoreAssetDisplay ──
        const assets = await fetchCoreAssets();
        console.log('[Trek] Raw assets from marketCore:', assets.map(a => `${a.symbol}:${a.status}:${a.price}`));

        const derivedSignals = [];
        for (const symbol of SIGNAL_SYMBOLS) {
          const asset = EXPANDED_ASSETS.find(a => a.symbol === symbol);
          if (!asset) continue;

          const data = assets.find(a => a.symbol === symbol);
          if (!data || data.status !== 'live' || !data.price) {
            console.log(`[Trek] ${symbol} unavailable — skipping signal`);
            continue;
          }

          const signal = deriveSignal(asset, {
            price: data.price,
            prevClose: data.price / (1 + (data.changePct || 0) / 100),
            change24h: data.changePct || 0,
            high24h: data.price * 1.02,
            low24h: data.price * 0.98
          }, {
            marketSentiment: (data.changePct || 0) > 2 ? 'BULLISH' : (data.changePct || 0) < -2 ? 'BEARISH' : 'NEUTRAL'
          });

          derivedSignals.push({ symbol, ...signal });
        }

        derivedSignals.sort((a, b) => b.confidence - a.confidence);
        setSignals(derivedSignals.slice(0, 4));
        setLastUpdate(new Date());
      } catch (error) {
        console.error('[Trek] Error fetching signals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSignals();
    const interval = setInterval(fetchSignals, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-2 text-white/40">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span className="text-xs">Deriving live signals...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white/80">TREK Signals (Live-Derived)</h3>
        {lastUpdate && (
          <span className="text-[10px] text-white/40 flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" />
            Updated {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {signals.map((signal, i) => (
          <motion.button
            key={signal.symbol}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => navigate(`/Asset/${signal.symbol}`)}
            className={`text-left rounded-lg p-3 border-l-4 transition-all hover:translate-x-1 group ${
              signal.signal === 'BUY'
                ? 'border-l-chart-3 bg-chart-3/5 hover:bg-chart-3/10'
                : signal.signal === 'SELL'
                ? 'border-l-destructive bg-destructive/5 hover:bg-destructive/10'
                : 'border-l-warning bg-warning/5 hover:bg-warning/10'
            } border border-white/5`}
          >
            <div className="flex items-start justify-between mb-1.5">
              <span className="font-mono font-black text-white text-sm">{signal.symbol}</span>
              <div className="flex items-center gap-1">
                {signal.signal === 'BUY' ? (
                  <TrendingUp className="h-4 w-4 text-chart-3" />
                ) : signal.signal === 'SELL' ? (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                ) : (
                  <Zap className="h-4 w-4 text-warning" />
                )}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  signal.signal === 'BUY'
                    ? 'bg-chart-3/20 text-chart-3'
                    : signal.signal === 'SELL'
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-warning/20 text-warning'
                }`}>
                  {signal.signal}
                </span>
              </div>
            </div>
            <p className="text-xs text-white/60 mb-1.5">{signal.reason}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-white/40">Conf: {signal.confidence}%</span>
              {signal.isLiveDerived && (
                <span className="text-primary/60" title="Derived from live data">● Live</span>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}