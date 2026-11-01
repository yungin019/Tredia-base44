import React from 'react';

/** Plain-text, newest-first feed — readable by a person and by an AI assistant. */
export default function LiveFeed({ lines }) {
  if (!lines || lines.length === 0) {
    return <p className="text-[11px] text-white/30 py-6 text-center">Nothing logged in the last 24 hours.</p>;
  }
  return (
    <div className="rounded-xl p-3 font-mono text-[10.5px] leading-relaxed overflow-x-auto"
      style={{ background: '#0B0D13', border: '1px solid rgba(255,255,255,0.07)' }}>
      {lines.map((line, index) => {
        const text = line.text || '';
        const tone = / ERROR | CRITICAL | FAILING | RED | PROVIDER ERROR | AI ERROR | AUTH FAIL/i.test(text)
          ? 'text-rose-400'
          : / YELLOW | WARNING | RATE LIMIT/i.test(text)
            ? 'text-amber-300'
            : 'text-white/55';
        return (
          <p key={`${line.at}-${index}`} className={`whitespace-pre-wrap break-words ${tone}`}>
            {text}
          </p>
        );
      })}
    </div>
  );
}