import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const STATIC_STOCKS = [
  { symbol: 'SPX', name: 'S&P 500', price: 5180, change: 1.2 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 875, change: 2.8 },
  { symbol: 'TSLA', name: 'Tesla', price: 182, change: -1.5 },
  { symbol: 'AAPL', name: 'Apple', price: 195, change: 0.9 },
];

export default function TickerTape() {
  const [cryptoData, setCryptoData] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true'
        );
        const data = await res.json();
        setCryptoData({
          btc: { symbol: 'BTC', name: 'Bitcoin', price: data.bitcoin.usd, change: data.bitcoin.usd_24h_change },
          eth: { symbol: 'ETH', name: 'Ethereum', price: data.ethereum.usd, change: data.ethereum.usd_24h_change },
        });
      } catch (e) {
        // fallback to static
        setCryptoData({
          btc: { symbol: 'BTC', name: 'Bitcoin', price: 42500, change: 1.2 },
          eth: { symbol: 'ETH', name: 'Ethereum', price: 2450, change: 0.8 },
        });
      }
    };
    fetchCrypto();
    const iv = setInterval(fetchCrypto, 60000); // update every minute
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (cryptoData) {
      const all = [cryptoData.btc, cryptoData.eth, ...STATIC_STOCKS];
      setItems([...all, ...all]); // duplicate for seamless loop
    }
  }, [cryptoData]);

  return (
    <div className="w-full bg-gradient-to-r from-background via-background to-background overflow-hidden border-b border-white/[0.05] py-3 sticky top-0 z-10">
      <div className="ticker-animate flex gap-8 px-4">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap flex-shrink-0">
            <span className="font-mono font-bold text-white/90 text-sm">{item.symbol}</span>
            <span className="font-mono text-white/60 text-xs">${item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
            <div className={`flex items-center gap-1 text-xs font-semibold ${item.change >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
              {item.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{Math.abs(item.change).toFixed(2)}%</span>
            </div>
            <span className="text-white/30 text-xs">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}