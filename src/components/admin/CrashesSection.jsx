import React, { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';

function time(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('sv-SE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function CopyButton({ text, label = 'Copy fix prompt' }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) { /* clipboard blocked */ }
  };
  return (
    <button type="button" onClick={copy}
      className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold tap-feedback"
      style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B' }}>
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : label}
    </button>
  );
}

export default function CrashesSection({ crashes, onStatusChange, busyId }) {
  const [openId, setOpenId] = useState(null);

  if (!crashes || crashes.length === 0) {
    return <p className="text-[11px] text-white/30 py-6 text-center">No open crash groups.</p>;
  }

  return (
    <div className="space-y-2">
      {crashes.map((crash) => {
        const open = openId === crash.id;
        const hot = (crash.affectedUsers || 0) >= 5;
        return (
          <div key={crash.id} className="rounded-xl p-3"
            style={{ background: '#101218', border: `1px solid ${hot ? 'rgba(244,63,94,0.35)' : 'rgba(255,255,255,0.07)'}` }}>
            <button type="button" onClick={() => setOpenId(open ? null : crash.id)}
              className="flex items-start gap-2 w-full text-left">
              {open ? <ChevronDown className="h-3.5 w-3.5 text-white/40 mt-0.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 text-white/40 mt-0.5 shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-white/85 leading-snug break-words">{crash.message}</p>
                <p className="text-[10px] text-white/35 mt-0.5 font-mono truncate">
                  {crash.route || crash.functionName || 'unknown'} · {crash.count} hits · {crash.affectedUsers} users · last {time(crash.lastSeen)}
                  {crash.reopenedCount > 0 ? ` · reopened ${crash.reopenedCount}×` : ''}
                </p>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                style={{ background: hot ? 'rgba(244,63,94,0.15)' : 'rgba(255,255,255,0.06)', color: hot ? '#fb7185' : 'rgba(255,255,255,0.5)' }}>
                {crash.status}
              </span>
            </button>

            {open && (
              <div className="mt-2 pl-5 space-y-2">
                <pre className="text-[10px] whitespace-pre-wrap break-words text-white/55 rounded-lg p-2 max-h-64 overflow-y-auto"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {crash.fixPrompt || 'Fix prompt is being written — it appears here once the model has responded.'}
                </pre>
                <div className="flex items-center gap-2 flex-wrap">
                  {crash.fixPrompt && <CopyButton text={crash.fixPrompt} />}
                  <button type="button" disabled={busyId === crash.id}
                    onClick={() => onStatusChange(crash.id, 'fixed')}
                    className="rounded-md px-2 py-1 text-[10px] font-bold tap-feedback disabled:opacity-50"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                    Mark fixed
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}