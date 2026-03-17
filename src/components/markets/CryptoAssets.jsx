import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function CryptoAssets({ cryptoData }) {
  if (!cryptoData || cryptoData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/[0.07] bg-[#111118] p-8 text-center"
      >
        <p className="text-white/30 text-sm">Loading crypto data...</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-white/[0.05]">
        <h3 className="text-sm font-bold text-white/80">Cryptocurrencies ({cryptoData.length})</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {['Asset', 'Price', '24h Change', 'Market Cap'].map((h, i) => (
                <th key={i} className={`${i === 0 ? 'text-left px-5' : 'text-right px-4'} py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cryptoData.map((crypto, i) => (
              <tr key={i} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0">
                <td className="px-5 py-3">
                  <div className="font-mono font-black text-[13px] text-white/85">{crypto.symbol?.toUpperCase()}</div>
                  <div className="text-[10px] text-white/30">{crypto.name}</div>
                </td>
                <td className="px-4 py-3 text-right font-mono text-[12px] text-white/85 font-bold">${crypto.price?.toFixed(2) || '—'}</td>
                <td className={`px-4 py-3 text-right font-mono text-[12px] font-bold flex items-center justify-end gap-1 ${crypto.change24h >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                  {crypto.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h?.toFixed(2)}%
                </td>
                <td className="px-4 py-3 text-right text-[11px] text-white/50 font-mono">${crypto.marketCap ? `${(crypto.marketCap / 1e9).toFixed(1)}B` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}