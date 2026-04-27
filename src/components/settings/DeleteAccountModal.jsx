import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

const STEPS = [
  {
    title: 'Delete Account?',
    body: 'This will permanently delete your TREDIO account, all portfolio data, trade history, and AI preferences. This action cannot be undone.',
    cta: 'I understand, continue',
    ctaStyle: { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' },
  },
  {
    title: 'Are you absolutely sure?',
    body: 'You will lose:\n• All portfolio holdings & trade logs\n• Founding Member status & benefits\n• All TREK signal history\n• Your subscription (no refund)',
    cta: 'Yes, delete my account',
    ctaStyle: { background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' },
    requireTyped: true,
  },
];

export default function DeleteAccountModal({ onConfirm, onCancel, loading, error }) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');

  const current = STEPS[step];
  const isLastStep = step === STEPS.length - 1;
  const canProceed = !isLastStep || typed.trim().toLowerCase() === 'delete';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.97 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-sm rounded-2xl border overflow-hidden"
          style={{ background: '#111118', borderColor: 'rgba(239,68,68,0.25)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <AlertTriangle className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-red-500/60">
                  Step {step + 1} of {STEPS.length}
                </p>
                <p className="text-sm font-black text-white/90">{current.title}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              <X className="h-4 w-4 text-white/40" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4">
            <p className="text-sm text-white/60 leading-relaxed whitespace-pre-line">
              {current.body}
            </p>

            {current.requireTyped && (
              <div>
                <p className="text-[11px] text-white/35 mb-2">
                  Type <span className="font-mono font-bold text-red-400">delete</span> to confirm
                </p>
                <input
                  type="text"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  placeholder="delete"
                  autoFocus
                  className="w-full rounded-lg px-3 py-2.5 text-sm font-mono text-white/85 outline-none"
                  style={{
                    background: 'rgba(239,68,68,0.06)',
                    border: `1px solid ${typed.trim().toLowerCase() === 'delete' ? 'rgba(239,68,68,0.5)' : 'rgba(239,68,68,0.2)'}`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-5 mb-2 px-3 py-2 rounded-lg text-xs text-red-400 bg-red-500/10 border border-red-500/20">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="px-5 pb-5 flex gap-2">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl text-sm font-bold border border-white/[0.08] text-white/40 hover:border-white/[0.15] hover:text-white/60 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (isLastStep) {
                  onConfirm();
                } else {
                  setStep(s => s + 1);
                }
              }}
              disabled={!canProceed || loading}
              className="flex-1 py-3 rounded-xl text-sm font-black transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              style={current.ctaStyle}
            >
              {loading ? (
                <span className="animate-pulse">Deleting...</span>
              ) : (
                <>
                  {isLastStep && <Trash2 className="h-3.5 w-3.5" />}
                  {current.cta}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}