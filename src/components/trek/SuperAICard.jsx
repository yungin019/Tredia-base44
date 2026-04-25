import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, ChevronDown, ChevronUp, Share2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SIGNAL_COLORS = {
  BUY:   { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)' },
  SELL:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)' },
  HOLD:  { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.2)' },
  WATCH: { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
};

const MODELS = [
  { key: 'claudeResult',  label: 'Claude',  dot: '#a78bfa' },
  { key: 'gptResult',     label: 'GPT-4',   dot: '#34d399' },
  { key: 'geminiResult',  label: 'Gemini',  dot: '#60a5fa' },
  { key: 'mistralResult', label: 'Mistral', dot: '#fb923c' },
];

// Blurred fake signals for the locked preview
const FAKE_SIGNALS = [
  { symbol: 'NVDA', signal: 'BUY', conf: 94 },
  { symbol: 'AAPL', signal: 'BUY', conf: 87 },
  { symbol: 'SPX',  signal: 'SELL', conf: 81 },
  { symbol: 'META', signal: 'WATCH', conf: 76 },
];

function ModelRow({ model, data }) {
  if (!data) return null;
  const sc = SIGNAL_COLORS[data.signal] || SIGNAL_COLORS.HOLD;
  const conf = data.confidence ?? 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: model.dot, flexShrink: 0, display: 'inline-block', boxShadow: `0 0 6px ${model.dot}88` }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.65)', flex: 1 }}>{model.label}</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 99, padding: '2px 9px', letterSpacing: '0.05em' }}>
          {data.signal}
        </span>
        <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 800, color: model.dot, width: 36, textAlign: 'right' }}>{conf}%</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden', marginLeft: 16 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${conf}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{ height: '100%', background: model.dot, borderRadius: 99, opacity: 0.8 }}
        />
      </div>
    </div>
  );
}

function LockedCard() {
  const navigate = useNavigate();

  return (
    <div style={{ background: '#111118', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 16, overflow: 'hidden', position: 'relative' }}>
      {/* Gold scan line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)' }} />

      {/* Blurred signal preview */}
      <div style={{ padding: '16px 16px 0', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          <span style={{ fontSize: 9, fontWeight: 800, color: '#F59E0B', letterSpacing: '0.15em', textTransform: 'uppercase' }}>⚡ Super AI — 4 Models Aligned</span>
        </div>

        {/* Blurred fake signals */}
        <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none', marginBottom: 0 }}>
          {FAKE_SIGNALS.map((s, i) => {
            const sc = SIGNAL_COLORS[s.signal];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 14, color: 'rgba(255,255,255,0.9)', width: 50 }}>{s.symbol}</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: sc.color, background: sc.bg, border: `1px solid ${sc.border}`, borderRadius: 99, padding: '2px 10px' }}>{s.signal}</span>
                <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.conf}%`, background: sc.color, borderRadius: 99 }} />
                </div>
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: 12, color: sc.color }}>{s.conf}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lock overlay */}
      <div style={{
        position: 'relative',
        background: 'linear-gradient(to bottom, rgba(10,10,15,0.7) 0%, rgba(10,10,15,0.97) 100%)',
        padding: '24px 24px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center',
        marginTop: -30,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Lock style={{ width: 20, height: 20, color: '#F59E0B' }} />
        </div>

        <div>
          <p style={{ fontSize: 13, fontWeight: 900, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.04em', marginBottom: 5 }}>
            Unlock Super AI
          </p>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, marginBottom: 2 }}>
            4 AI models — Claude, GPT-4, Gemini, Mistral
          </p>
          <p style={{ fontSize: 10, color: 'rgba(245,158,11,0.65)', fontWeight: 700, letterSpacing: '0.04em' }}>
            Cross-validates every signal for maximum accuracy
          </p>
        </div>

        {/* Model dots */}
        <div style={{ display: 'flex', items: 'center', gap: 6 }}>
          {MODELS.map(m => (
            <div key={m.key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, display: 'inline-block', boxShadow: `0 0 6px ${m.dot}` }} />
              {m.label}
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate('/Upgrade')}
          style={{
            marginTop: 4, padding: '11px 28px',
            background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
            border: 'none', borderRadius: 99, cursor: 'pointer',
            fontSize: 12, fontWeight: 800, color: '#0A0A0F', letterSpacing: '0.04em',
            boxShadow: '0 0 24px rgba(245,158,11,0.35)', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Unlock Elite — Get the Edge
        </button>
      </div>
    </div>
  );
}

export function SuperAICard({ result, isElite = false, assetType = 'STOCK' }) {
  const [expanded, setExpanded] = useState(false);
  const [sharing, setSharing] = useState(false);

  const handleShareToDiscord = async (e) => {
    e.stopPropagation();
    setSharing(true);
    try {
      await base44.functions.invoke('discordWebhook', {
        symbol: result?.symbol || 'UNKNOWN',
        action: result?.finalSignal || 'HOLD',
        confidence: result?.confidence || 0,
        reason: result?.oneLiner || result?.synthesis || 'Multi-model consensus signal',
        bullishReasoning: result?.synthesis?.split('bullish')[1]?.split('bearish')[0]?.trim() || result?.oneLiner || '',
        bearishReasoning: result?.synthesis?.split('bearish')[1]?.trim() || '',
        assetType,
        isAutoTrek: false,
      });
      toast.success(`Signal shared to Discord!`);
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share signal');
    } finally {
      setSharing(false);
    }
  };

  if (!isElite) return <LockedCard />;

  const models = result?.modelResults || {};
  const finalSc = SIGNAL_COLORS[result?.finalSignal] || SIGNAL_COLORS.HOLD;
  const confidence = result?.confidence ?? 0;
  const agreementCount = result?.agreementCount ?? 0;
  const totalModels = MODELS.filter(m => models[m.key]).length;

  return (
    <div style={{ background: '#111118', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, #F59E0B, transparent)', opacity: 0.7 }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Zap style={{ width: 14, height: 14, color: '#F59E0B' }} />
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Super AI</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Multi-Model Consensus</p>
          </div>
        </div>
        <button
          onClick={handleShareToDiscord}
          disabled={sharing}
          style={{ background: 'none', border: 'none', cursor: sharing ? 'not-allowed' : 'pointer', padding: '6px 8px', opacity: sharing ? 0.5 : 1 }}
          title="Share to Discord"
        >
          {sharing ? (
            <Loader2 style={{ width: 14, height: 14, color: '#F59E0B', animation: 'spin 1s linear infinite' }} />
          ) : (
            <Share2 style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.4)', transition: 'color 0.2s' }} />
          )}
        </button>
      </div>

      <div style={{ marginBottom: 14 }}>
        {MODELS.map(m => <ModelRow key={m.key} model={m} data={models[m.key]} />)}
      </div>

      <div style={{ background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: 12, padding: '12px 14px', marginBottom: 12 }}>
        <p style={{ fontSize: 9, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Super AI Verdict</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          {result?.finalSignal && (
            <span style={{ fontSize: 13, fontWeight: 800, color: finalSc.color, background: finalSc.bg, border: `1px solid ${finalSc.border}`, borderRadius: 99, padding: '4px 14px', letterSpacing: '0.06em' }}>
              {result.finalSignal}
            </span>
          )}
          <span style={{ fontSize: 10, fontWeight: 700, color: agreementCount >= 3 ? '#22c55e' : '#F59E0B', background: agreementCount >= 3 ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${agreementCount >= 3 ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.2)'}`, borderRadius: 99, padding: '3px 10px' }}>
            {agreementCount}/{totalModels} models aligned
          </span>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Confidence</span>
            <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 800, color: '#F59E0B' }}>{confidence}%</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #F59E0B, #FCD34D)', borderRadius: 99 }}
            />
          </div>
        </div>
      </div>

      {result?.oneLiner && (
        <p style={{ fontSize: 11, fontStyle: 'italic', color: 'rgba(255,255,255,0.38)', marginBottom: 10, lineHeight: 1.55 }}>
          "{result.oneLiner}"
        </p>
      )}

      {result?.synthesis && (
        <>
          <button
            onClick={() => setExpanded(v => !v)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(245,158,11,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
          >
            {expanded ? <><ChevronUp style={{ width: 12, height: 12 }} /> Hide Synthesis</> : <><ChevronDown style={{ width: 12, height: 12 }} /> View Synthesis</>}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                <div style={{ paddingTop: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 12, marginTop: 8 }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 6 }}>AI Synthesis</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{result.synthesis}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}

export default SuperAICard;