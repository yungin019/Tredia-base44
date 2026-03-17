import React from 'react';

function fmt(price) {
  if (price == null) return '—';
  if (price >= 1000) return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function CryptoLiveCards({ crypto, fearGreed }) {
  const fgColor = fearGreed
    ? fearGreed.value >= 60 ? '#22C55E' : fearGreed.value >= 40 ? '#F59E0B' : '#EF4444'
    : '#F59E0B';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Fear & Greed */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-4 flex flex-col gap-1">
        <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/30">Fear & Greed</span>
        {fearGreed ? (
          <>
            <span className="text-3xl font-black font-mono leading-none" style={{ color: fgColor }}>
              {fearGreed.value}
            </span>
            <span className="text-[10px] font-semibold" style={{ color: fgColor }}>
              {fearGreed.classification}
            </span>
          </>
        ) : (
          <span className="text-lg font-mono text-white/20">—</span>
        )}
      </div>

      {/* Crypto cards */}
      {(crypto || [{ symbol: 'BTC' }, { symbol: 'ETH' }, { symbol: 'SOL' }]).map((c) => {
        const up = c.change24h >= 0;
        return (
          <div key={c.symbol} className="rounded-xl border border-white/[0.07] bg-[#111118] p-4 flex flex-col gap-1">
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-white/30">{c.symbol} / USD</span>
            <span className="text-xl font-black font-mono leading-none text-white/90">
              {fmt(c.price)}
            </span>
            {c.change24h != null ? (
              <span className="text-[10px] font-bold" style={{ color: up ? '#22C55E' : '#EF4444' }}>
                {up ? '+' : ''}{c.change24h.toFixed(2)}% 24h
              </span>
            ) : (
              <span className="text-[10px] text-white/20">— 24h</span>
            )}
          </div>
        );
      })}
    </div>
  );
}