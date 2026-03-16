import React, { useState, useEffect } from 'react';
import { getIndices, getCrypto } from '../MarketData';

export default function TickerTape() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const update = () => setData([...getIndices(), ...getCrypto()]);
    update();
    const interval = setInterval(update, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/[0.02] border-b border-white/[0.05] overflow-hidden h-8 flex items-center">
      <div className="flex-shrink-0 flex items-center gap-2 px-3 border-r border-white/[0.06] h-full">
        <span className="text-[9px] font-mono font-bold tracking-[0.15em] text-primary/70">MARKETS</span>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="ticker-animate flex whitespace-nowrap items-center h-full">
          {[...data, ...data].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2 px-4 text-[11px] font-mono border-r border-white/[0.04]">
              <span className="text-white/50 font-semibold tracking-wider">{item.symbol}</span>
              <span className="text-white/80">{item.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className={item.change >= 0 ? 'text-chart-3' : 'text-destructive'}>
                {item.change >= 0 ? '▲' : '▼'} {Math.abs(item.change).toFixed(2)}%
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}