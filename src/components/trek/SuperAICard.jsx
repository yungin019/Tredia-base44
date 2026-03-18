import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Lock, ChevronDown, ChevronUp, CheckCircle, XCircle, Minus } from 'lucide-react';

const SIGNAL_COLORS = {
  BUY:   { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)' },
  SELL:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)' },
  HOLD:  { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.2)' },
  WATCH: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
};

const MODELS = [
  { key: 'claudeResult',   label: 'Claude',   dot: '#a78bfa' },
  { key: 'gptResult',      label: 'GPT-4o',   dot: '#34d399' },
  { key: 'geminiResult',   label: 'Gemini',   dot: '#60a5fa' },
  { key: 'mistralResult',  label: 'Mistral',  dot: '#fb923c' },
];

function ModelRow({ model, data }) {
  if (!data) return null;
  const sc = SIGNAL_COLORS[data.signal] || SIGNAL_COLORS.HOLD;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: model.dot, flexShrink: 0, display: 'inline-block' }} />
      <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.55)', width: 58, flexShrink: 0 }}>{model.label}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 99, padding: '2px 8px', letterSpacing: '0.05em' }}>
        {data.signal}
      </span>
      {data.confidence !== undefined && (
        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#F59E0B', marginLeft: 4 }}>{data.confidence}%</span>
      )}
      {data.reason && (
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {data.reason}
        </span>
      )}
    </div>
  );
}

function LockedOverlay() {
  return (
    <div style={{
      position: 'absolute', inset: 0, borderRadius: 16,
      background: 'rgba(10,10,15,0.82)', backdropFilter: 'blur(6px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, zIndex: 10,
    }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Lock style={{ width: 18, height: 18, color: '#F59E0B' }} />
      </div>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.04em' }}>Elite Only</p>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textAlign: 'center', maxWidth: 160, lineHeight: 1.5 }}>
        Multi-model AI consensus requires an Elite subscription.
      </p>
    </div>
  );
}

export default function SuperAICard({ result, isElite }) {
  const [expanded, setExpanded] = useState(false);

  const finalSc = SIGNAL_COLORS[result?.finalSignal] || SIGNAL_COLORS.HOLD;
  const models = result?.modelResults || {};
  const agreementCount = result?.agreementCount ?? 0;
  const totalModels = MODELS.filter(m => models[m.key]).length;

  return (
    <div style={{ position: 'relative', background: '#111118', border: '1px solid rgba(245,158,11,0.18)', borderRadius: 16, padding: 16, overflow: 'hidden' }}>
      {/* Elite glow accent */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)', opacity: 0.6 }} />

      {!isElite && <LockedOverlay />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain style={{ width: 15, height: 15, color: '#F59E0B' }} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.02em' }}>Super AI Consensus</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>4-Model Agreement Engine</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Agreement pill */}
          <span style={{ fontSize: 10, fontWeight: 700, color: agreementCount >= 3 ? '#22c55e' : agreementCount === 2 ? '#F59E0B' : '#ef4444', background: agreementCount >= 3 ? 'rgba(34,197,94,0.1)' : agreementCount === 2 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${agreementCount >= 3 ? 'rgba(34,197,94,0.25)' : agreementCount === 2 ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 99, padding: '3px 9px' }}>
            {agreementCount}/{totalModels} agree
          </span>
          {/* Final signal */}
          {result?.finalSignal && (
            <span style={{ fontSize: 11, fontWeight: 800, color: finalSc.color, background: finalSc.bg, border: `1px solid ${finalSc.border}`, borderRadius: 99, padding: '4px 12px', letterSpacing: '0.05em' }}>
              {result.finalSignal}
            </span>
          )}
        </div>
      </div>

      {/* Confidence bar */}
      {result?.confidence !== undefined && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Consensus Confidence</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 800, color: '#F59E0B' }}>{result.confidence}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.confidence}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #F59E0B, #FCD34D)', borderRadius: 99 }}
            />
          </div>
        </div>
      )}

      {/* One-liner */}
      {result?.oneLiner && (
        <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.38)', marginBottom: 12, lineHeight: 1.55 }}>
          {result.oneLiner}
        </p>
      )}

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
          padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'none', border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)',
          cursor: 'pointer', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em',
          textTransform: 'uppercase', fontWeight: 600, transition: 'color 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(245,158,11,0.7)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
      >
        {expanded ? <><ChevronUp style={{ width: 12, height: 12 }} /> Hide Models</> : <><ChevronDown style={{ width: 12, height: 12 }} /> View Model Results</>}
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Model rows */}
              <div>
                <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>Individual Model Signals</p>
                {MODELS.map(m => <ModelRow key={m.key} model={m} data={models[m.key]} />)}
              </div>

              {/* Synthesis */}
              {result?.synthesis && (
                <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5 }}>AI Synthesis</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{result.synthesis}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}