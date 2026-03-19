import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function fmt(price) {
  if (price == null) return '—';
  if (price >= 1000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CRYPTO_LABELS = {
  BTC: 'Bitcoin',
  ETH: 'Ethereum',
  SOL: 'Solana',
  BNB: 'BNB',
};

export default function CryptoLiveCards({ crypto }) {
  const items = crypto || [{ symbol: 'BTC' }, { symbol: 'ETH' }, { symbol: 'SOL' }];

  return (
    <div className="grid grid-cols-3 gap-3 h-full">
      {items.slice(0, 3).map((c) => {
        const up = c.change24h >= 0;
        const hasData = c.price != null;
        const Icon = up ? TrendingUp : TrendingDown;
        return (
          <div
            key={c.symbol}
            className="rounded-xl border border-white/[0.07] bg-[#111118] p-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black tracking-[0.15em] uppercase text-white/30">{c.symbol}</span>
              {hasData && c.change24h != null && (
                <Icon
                  className="h-3 w-3"
                  style={{ color: up ? '#22c55e' : '#ef4444' }}
                />
              )}
            </div>

            <div className="text-xl font-black font-mono leading-none text-white/90 mb-1">
              {hasData ? fmt(c.price) : <span className="text-white/20 animate-pulse">Loading</span>}
            </div>

            <div>
              <div className="text-[9px] text-white/25 mb-1">{CRYPTO_LABELS[c.symbol] || c.symbol}</div>
              {hasData && c.change24h != null ? (
                <span
                  className="text-[10px] font-bold font-mono"
                  style={{ color: up ? '#22c55e' : '#ef4444' }}
                >
                  {up ? '+' : ''}{c.change24h.toFixed(2)}%
                </span>
              ) : (
                <span className="text-[10px] text-white/20">— 24h</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}