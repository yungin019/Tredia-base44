import React, { useState } from 'react';
import { Send } from 'lucide-react';

/** Asks the cheap model a question about the last 24h of diagnostics. */
export default function AskDiagnostics({ onAsk, digest }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    const text = question.trim();
    if (!text || busy) return;
    setBusy(true);
    setError('');
    setAnswer('');
    try {
      const result = await onAsk(text);
      setAnswer(result?.answer || 'No answer returned.');
    } catch (err) {
      setError(err.message || 'Could not reach the diagnostics model.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={submit} className="rounded-xl p-3" style={{ background: '#101218', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-[11px] font-bold text-white/70 mb-2">Ask about diagnostics</p>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          maxLength={600}
          placeholder="Why did sign-ins fail this morning? What is costing the most?"
          className="w-full rounded-lg px-2.5 py-2 text-[12px] text-white/85 outline-none resize-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-white/30">
            Sends the last 24h metrics ({digest ? `${digest.totals.errors24h} errors` : 'loading'}) to the cheap model.
          </span>
          <button type="submit" disabled={busy || !question.trim()}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold tap-feedback disabled:opacity-40"
            style={{ background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.32)', color: '#F59E0B' }}>
            <Send className="h-3 w-3" />
            {busy ? 'Asking…' : 'Ask'}
          </button>
        </div>
      </form>

      {error && <p className="text-[11px] text-rose-400">{error}</p>}

      {answer && (
        <div className="rounded-xl p-3" style={{ background: '#0B0D13', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Answer</p>
          <p className="text-[12px] leading-relaxed text-white/75 whitespace-pre-wrap">{answer}</p>
        </div>
      )}

      {digest?.latestReport && (
        <div className="rounded-xl p-3" style={{ background: '#101218', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[9px] uppercase tracking-wider text-white/30 mb-1">
            Daily AI summary · {digest.latestReport.date}
          </p>
          <p className="text-[11.5px] leading-relaxed text-white/70 whitespace-pre-wrap">{digest.latestReport.summary}</p>
        </div>
      )}
    </div>
  );
}