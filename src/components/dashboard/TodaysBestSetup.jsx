import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SETUP = {
  symbol: 'NVDA',
  signal: 'BUY',
  title: 'Momentum Breakout — $870 Cleared',
  whyNow: 'RSI just broke 60 after 3 weeks of consolidation. Volume spike detected in last 2 hours (+318% vs avg). Institutional accumulation pattern confirmed.',
  confidence: 92,
  entry: '871',
  target: '942',
  stop: '848',
  risk: '-2.6%',
  reward: '+8.2%',
  timeframe: '2W',
  detectedMinsAgo: 7,
  conviction: 'HIGH',
};

const CONVICTION_COLORS = {
  HIGH: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', glow: 'rgba(34,197,94,0.15)' },
  MEDIUM: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', glow: 'rgba(245,158,11,0.12)' },
  LOW: { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)', glow: 'none' },
};

export default function TodaysBestSetup() {
  const navigate = useNavigate();
  const [showPlan, setShowPlan] = useState(false);
  const [elapsed, setElapsed] = useState(SETUP.detectedMinsAgo);
  const cv = CONVICTION_COLORS[SETUP.conviction];

  // Live elapsed timer
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 60000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #111118 100%)',
        border: `1px solid ${cv.border}`,
        borderLeft: `4px solid ${cv.color}`,
        borderRadius: 16,
        padding: '18px 20px',
        boxShadow: `0 0 40px ${cv.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated background pulse */}
      <motion.div
        animate={{ opacity: [0.03, 0.07, 0.03] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 20% 50%, ${cv.color} 0%, transparent 60%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative' }}>
        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', boxShadow: '0 0 10px rgba(245,158,11,0.6)' }}
            />
            <span style={{ fontSize: 10, fontWeight: 800, color: '#F59E0B', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              ⚡ Today's Best Setup
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock style={{ width: 9, height: 9 }} />
              Detected {elapsed}m ago
            </span>
            <span style={{ fontSize: 9, fontWeight: 800, color: cv.color, background: cv.bg, border: `1px solid ${cv.border}`, borderRadius: 99, padding: '2px 8px', letterSpacing: '0.1em' }}>
              {SETUP.conviction} CONVICTION
            </span>
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 28, color: 'rgba(255,255,255,0.95)', lineHeight: 1 }}>
                {SETUP.symbol}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: cv.color, background: cv.bg, border: `1px solid ${cv.border}`, borderRadius: 99, padding: '5px 14px', letterSpacing: '0.06em' }}>
                {SETUP.signal}
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 18, color: '#22c55e' }}>
                +{SETUP.reward}
              </span>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginBottom: 10, lineHeight: 1.4 }}>
              {SETUP.title}
            </p>

            {/* Why Now */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
              <p style={{ fontSize: 9, fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 5 }}>
                ⚡ Why Now?
              </p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>
                {SETUP.whyNow}
              </p>
            </div>

            {/* Risk bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <ShieldAlert style={{ width: 11, height: 11, color: '#ef4444', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Risk if support breaks:</span>
              <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 800, color: '#ef4444' }}>{SETUP.risk}</span>
              <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', maxWidth: 80 }}>
                <div style={{ height: '100%', width: '26%', background: '#ef4444', borderRadius: 99 }} />
              </div>
            </div>
          </div>

          {/* Right: confidence + CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, minWidth: 120 }}>
            {/* Confidence ring */}
            <div style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 36, fontFamily: 'monospace', fontWeight: 900, color: cv.color, lineHeight: 1 }}>
                {SETUP.confidence}%
              </span>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 2 }}>
                confidence
              </p>
            </div>

            {/* View Plan button */}
            <button
              onClick={() => setShowPlan(v => !v)}
              style={{
                padding: '9px 18px',
                background: showPlan ? cv.bg : `linear-gradient(135deg, ${cv.color}, ${cv.color}cc)`,
                border: `1px solid ${cv.border}`,
                borderRadius: 99, cursor: 'pointer',
                fontSize: 11, fontWeight: 800,
                color: showPlan ? cv.color : '#0A0A0F',
                letterSpacing: '0.04em', whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {showPlan ? 'Hide Plan' : '📋 View Plan'}
            </button>

            <button
              onClick={() => navigate('/AIInsights')}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 10, color: 'rgba(255,255,255,0.3)',
                fontWeight: 600, letterSpacing: '0.05em',
              }}
            >
              All signals <ChevronRight style={{ width: 11, height: 11 }} />
            </button>
          </div>
        </div>

        {/* Trade Plan (expandable) */}
        <AnimatePresence>
          {showPlan && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 16px' }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>
                  Trade Plan
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {[
                    { label: 'Entry', value: `$${SETUP.entry}`, color: 'rgba(255,255,255,0.8)' },
                    { label: 'Target', value: `$${SETUP.target}`, color: '#22c55e' },
                    { label: 'Stop Loss', value: `$${SETUP.stop}`, color: '#ef4444' },
                    { label: 'Timeframe', value: SETUP.timeframe, color: '#F59E0B' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{item.label}</p>
                      <p style={{ fontSize: 16, fontFamily: 'monospace', fontWeight: 900, color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}