import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, TrendingUp, AlertTriangle, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const today = new Date();
const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

const CHECKIN = {
  bestSetup: { symbol: 'NVDA', signal: 'BUY', note: 'Momentum breakout confirmed. 92% confidence. Entry $871.', color: '#22c55e' },
  biggestRisk: { symbol: 'VIX', note: 'VIX term structure inversion — elevated volatility likely next 5 sessions. Reduce exposure.', color: '#ef4444' },
  sentiment: { label: 'GREED', value: 68, note: 'Markets pricing in rate cuts optimism. Watch for overbought reversal above 75.', color: '#F59E0B' },
};

export default function DailyCheckIn() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #0e0e1a 0%, #111118 100%)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 14,
        overflow: 'hidden',
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left', minHeight: '56px',
        }}
        className="card-press"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          >
            <Sun style={{ width: 15, height: 15, color: '#F59E0B' }} />
          </motion.div>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.04em' }}>
            Daily Check-In
          </span>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace' }}>
            {dateStr}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Quick pills */}
          <span style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 99, padding: '2px 8px' }}>
            {CHECKIN.bestSetup.symbol} BUY
          </span>
          <span style={{ fontSize: 9, color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 99, padding: '2px 8px', fontWeight: 700 }}>
            VIX ⚠
          </span>
          {open
            ? <ChevronUp style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.2)' }} />
            : <ChevronDown style={{ width: 13, height: 13, color: 'rgba(255,255,255,0.2)' }} />
          }
        </div>
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {/* Best Setup */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/Asset/${CHECKIN.bestSetup.symbol}`);
                }}
                className="card-press"
                style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 10, padding: '10px 12px', cursor: 'pointer', textAlign: 'left', width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <TrendingUp style={{ width: 11, height: 11, color: '#22c55e' }} />
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Best Setup</span>
                </div>
                <p style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 900, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>
                  {CHECKIN.bestSetup.symbol} {CHECKIN.bestSetup.signal}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{CHECKIN.bestSetup.note}</p>
              </button>

              {/* Biggest Risk */}
              <div style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <AlertTriangle style={{ width: 11, height: 11, color: '#ef4444' }} />
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Biggest Risk</span>
                </div>
                <p style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 900, color: 'rgba(255,255,255,0.9)', marginBottom: 4 }}>
                  {CHECKIN.biggestRisk.symbol}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{CHECKIN.biggestRisk.note}</p>
              </div>

              {/* Market Sentiment */}
              <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                  <Activity style={{ width: 11, height: 11, color: '#F59E0B' }} />
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Sentiment</span>
                </div>
                <p style={{ fontSize: 12, fontFamily: 'monospace', fontWeight: 900, color: '#F59E0B', marginBottom: 4 }}>
                  {CHECKIN.sentiment.label} {CHECKIN.sentiment.value}
                </p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{CHECKIN.sentiment.note}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}