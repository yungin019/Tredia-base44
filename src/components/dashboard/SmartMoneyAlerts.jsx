import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const ALERTS = [
  { symbol: 'TSLA', type: 'Insider sold $2.3M', time: '2h ago', emoji: '🔴' },
  { symbol: 'NVDA', type: 'Unusual calls +340% vol', time: '1h ago', emoji: '🟢' },
  { symbol: 'BTC', type: 'Whale moved 1,200 BTC to exchange', time: '30m ago', emoji: '🐋' },
];

export default function SmartMoneyAlerts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <h2 className="text-sm font-bold mb-4">🔍 Smart Money Alerts</h2>
      <div className="space-y-3">
        {ALERTS.map((alert, i) => (
          <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-lg">{alert.emoji}</span>
              <div>
                <div className="text-xs font-bold text-white/80">
                  {alert.symbol} — {alert.type}
                </div>
                <div className="text-[10px] text-white/30 mt-0.5">{alert.time}</div>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-white/20" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}