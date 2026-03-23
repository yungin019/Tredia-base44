import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EXPANDED_ASSETS } from '@/lib/assetDatabase';
import { base44 } from '@/api/base44Client';
import { deriveSignal } from '@/api/signalEngine';

export default function TrekSignalsPreview() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    async function fetchSignals() {
      try {
        const stockSymbols = ['NVDA', 'AMZN', 'TSLA', 'META', 'AAPL', 'MSFT'];
        
        // Fetch stock prices with full data (price, prevClose, change)
        const res = await base44.functions.invoke('stockPrices', { symbols: stockSymbols });
        const stockPrices = res?.data?.prices || {};

        // Fetch crypto prices
        const cryptoRes = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
        );
        const cryptoData = await cryptoRes.json();
        
        const cryptoPrices = {
          BTC: {
            price: cryptoData.bitcoin?.usd || 0,
            change: cryptoData.bitcoin?.usd_24h_change || 0,
            prevClose: cryptoData.bitcoin?.usd / (1 + (cryptoData.bitcoin?.usd_24h_change || 0) / 100)
          },
          ETH: {
            price: cryptoData.ethereum?.usd || 0,
            change: cryptoData.ethereum?.usd_24h_change || 0,
            prevClose: cryptoData.ethereum?.usd / (1 + (cryptoData.ethereum?.usd_24h_change || 0) / 100)
          }
        };

        // Derive signals for each asset
        const derivedSignals = [];
        [...stockSymbols, 'BTC', 'ETH'].forEach(symbol => {
          const asset = EXPANDED_ASSETS.find(a => a.symbol === symbol);
          if (!asset) return;

          const priceInfo = symbol === 'BTC' || symbol === 'ETH' 
            ? cryptoPrices[symbol]
            : stockPrices[symbol];

          if (!priceInfo || !priceInfo.price) return;

          const signal = deriveSignal(asset, {
            price: priceInfo.price,
            prevClose: priceInfo.prevClose || priceInfo.price,
            change24h: priceInfo.change || 0,
            high24h: priceInfo.price * 1.02,
            low24h: priceInfo.price * 0.98
          }, {
            marketSentiment: priceInfo.change > 2 ? 'BULLISH' : priceInfo.change < -2 ? 'BEARISH' : 'NEUTRAL'
          });

          derivedSignals.push({
            symbol,
            ...signal
          });
        });

        // Sort by confidence (highest first) and take top 4
        derivedSignals.sort((a, b) => b.confidence - a.confidence);
        setSignals(derivedSignals.slice(0, 4));
        setLastUpdate(new Date());
      } catch (error) {
        console.error('Error fetching signals:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSignals();
    
    // Refresh every 60 seconds
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