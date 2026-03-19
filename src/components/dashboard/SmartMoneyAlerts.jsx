import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, TrendingDown, Waves, BarChart2, ChevronDown, ChevronUp, Building2 } from 'lucide-react';

const ALERTS = [
  {
    symbol: 'NVDA',
    type: 'Unusual Call Volume',
    label: 'VOLUME SPIKE',
    detail: '+340% above 30-day avg · $900 strike · Exp. Apr 19',
    whyMatters: 'Smart money loading calls. Historically precedes 6%+ move within 10 sessions.',
    amount: '$42M notional',
    time: '7m ago',
    fresh: true,
    icon: BarChart2,
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.2)',
  },
  {
    symbol: 'BTC',
    type: 'Whale Movement',
    label: 'WHALE ALERT',
    detail: '1,200 BTC transferred to exchange · Possible sell pressure',
    whyMatters: 'Large exchange inflows often precede selling. Watch for $68K support test.',
    amount: '$82M moved',
    time: '32m ago',
    fresh: true,
    icon: Waves,
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
  {
    symbol: 'TSLA',
    type: 'Insider Selling',
    label: 'INSIDER',
    detail: 'Director sold $2.3M · 3rd transaction this quarter',
    whyMatters: '3 consecutive insider sells is a bearish pattern. Cluster selling often precedes weakness.',
    amount: '$2.3M sold',
    time: '2h ago',
    fresh: false,
    icon: TrendingDown,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.18)',
  },
  {
    symbol: 'META',
    type: 'Unusual Put Activity',
    label: 'HEDGE DETECTED',
    detail: '$10M in protective puts · June expiry · Smart hedge or bearish bet',
    whyMatters: 'Institutional players hedging or going directional. Risk event likely within 30 days.',
    amount: '$10M puts',
    time: '45m ago',
    fresh: false,
    icon: AlertTriangle,
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.06)',
    border: 'rgba(239,68,68,0.15)',
  },
];

function AlertRow({ alert, i }) {
  const [open, setOpen] = useState(false);
  const Icon = alert.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.06 }}
      style={{
        border: `1px solid ${alert.border}`,
        background: alert.bg,
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      {/* Main row */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
          padding: '11px 14px', background: 'none', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        {/* Icon */}
        <div style={{ width: 32, height: 32, borderRadius: 9, background: `${alert.color}20`, border: `1px solid ${alert.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
          <Icon style={{ width: 14, height: 14, color: alert.color }} />
          {alert.fresh && (
            <span style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: alert.color, boxShadow: `0 0 8px ${alert.color}` }} className="live-pulse" />
          )}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 12, color: 'rgba(255,255,255,0.9)' }}>{alert.symbol}</span>
            <span style={{ fontSize: 8, fontWeight: 800, color: alert.color, letterSpacing: '0.1em', background: `${alert.color}15`, border: `1px solid ${alert.color}30`, borderRadius: 99, padding: '1px 6px' }}>{alert.label}</span>
            {alert.fresh && (
              <span style={{ fontSize: 8, color: '#F59E0B', fontWeight: 700 }}>NEW</span>
            )}
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.3, marginBottom: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{alert.detail}</p>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 800, color: alert.color }}>{alert.amount}</span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>{alert.time}</span>
          {open
            ? <ChevronUp style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.2)' }} />
            : <ChevronDown style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.2)' }} />
          }
        </div>
      </button>

      {/* Expanded: Why it matters */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 14px 12px', borderTop: `1px solid ${alert.border}` }}>
              <p style={{ fontSize: 9, fontWeight: 800, color: alert.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, marginTop: 10 }}>
                ⚡ Why This Matters
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{alert.whyMatters}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SmartMoneyAlerts() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.06 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5 text-white/30" />
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">Smart Money</h2>
          <span className="text-[9px] font-bold text-primary/70 bg-primary/10 border border-primary/20 rounded-full px-2 py-0.5">
            ⚡ Institutional Activity Detected
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] text-white/20 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
          LIVE
        </span>
      </div>
      <div className="space-y-2">
        {ALERTS.map((alert, i) => (
          <AlertRow key={i} alert={alert} i={i} />
        ))}
      </div>
    </motion.div>
  );
}