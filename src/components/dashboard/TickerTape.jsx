import React, { useState, useEffect } from 'react';
import { getIndices, getCrypto } from '../MarketData';

export default function TickerTape() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const update = () => {
      setData([...getIndices(), ...getCrypto()]);
    };
    update();
    const interval = setInterval(update, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-secondary/30 border-b border-border/30 overflow-hidden h-7 flex items-center">
      <div className="ticker-animate flex whitespace-nowrap">
        {[...data, ...data].map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-4 text-xs font-mono">
            <span className="text-muted-foreground font-medium">{item.symbol}</span>
            <span className="text-foreground">{item.price.toLocaleString()}</span>
            <span className={item.change >= 0 ? 'text-primary' : 'text-destructive'}>
              {item.change >= 0 ? '+' : ''}{item.change}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}