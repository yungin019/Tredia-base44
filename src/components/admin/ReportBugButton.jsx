import React, { useState } from 'react';
import { Bug, X } from 'lucide-react';
import { sendError } from '@/lib/errorReporter';

/**
 * Small floating bug button, rendered only for the admin. Saves the current
 * route, the last 10 actions, console errors and failed network calls to
 * ErrorLog with severity "manual", plus an optional note.
 */
export default function ReportBugButton() {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [state, setState] = useState('idle'); // idle | saving | saved | failed

  const submit = async () => {
    setState('saving');
    const ok = await sendError({
      message: note.trim() ? `Manual report: ${note.trim()}` : `Manual report from ${window.location.pathname}`,
      kind: 'manual',
      severity: 'manual',
      note: note.trim() || null,
    });
    setState(ok ? 'saved' : 'failed');
    if (ok) {
      setNote('');
      setTimeout(() => { setState('idle'); setOpen(false); }, 2200);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setState('idle'); }}
        aria-label="Report a bug"
        className="fixed z-[60] flex items-center justify-center h-11 w-11 rounded-full transition-colors"
        style={{
          right: '16px',
          bottom: 'calc(88px + env(safe-area-inset-bottom))',
          background: 'rgba(245,158,11,0.14)',
          border: '1px solid rgba(245,158,11,0.35)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
        }}
      >
        {open ? <X className="h-4 w-4" style={{ color: '#F59E0B' }} /> : <Bug className="h-4 w-4" style={{ color: '#F59E0B' }} />}
      </button>

      {open && (
        <div
          className="fixed z-[60] rounded-xl p-3 w-[280px]"
          style={{
            right: '16px',
            bottom: 'calc(140px + env(safe-area-inset-bottom))',
            background: '#101218',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.55)',
          }}
        >
          <p className="text-[11px] font-bold text-white/80 mb-2">Report a bug</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What went wrong? (optional)"
            className="w-full rounded-lg px-2.5 py-2 text-[12px] text-white/80 outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button
            type="button"
            onClick={submit}
            disabled={state === 'saving'}
            className="mt-2 w-full rounded-lg py-2 text-[12px] font-bold tap-feedback"
            style={{ background: 'rgba(245,158,11,0.16)', border: '1px solid rgba(245,158,11,0.35)', color: '#F59E0B' }}
          >
            {state === 'saving' ? 'Saving…' : 'Save to ErrorLog'}
          </button>
          <p className="mt-2 text-[10px] leading-snug" style={{ color: state === 'failed' ? '#f87171' : 'rgba(255,255,255,0.45)' }}>
            {state === 'saved' && 'Saved to ErrorLog'}
            {state === 'failed' && 'Could not save — try again.'}
            {(state === 'idle' || state === 'saving') && 'Route, last 10 actions, console and network errors are attached.'}
          </p>
        </div>
      )}
    </>
  );
}