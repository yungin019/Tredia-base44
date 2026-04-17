import React from 'react';

const INVITE_URL = 'https://discord.gg/DtB4Nczj';

function DiscordLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/>
    </svg>
  );
}

export default function DiscordWidget() {
  return (
    <div className="rounded-2xl p-5" style={{
      background: 'linear-gradient(135deg, rgba(88,101,242,0.12), rgba(88,101,242,0.06))',
      border: '1px solid rgba(88,101,242,0.25)',
    }}>
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(88,101,242,0.2)', border: '1px solid rgba(88,101,242,0.3)' }}>
          <DiscordLogo size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-black text-white">TREDIO Community Discord</p>
            <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
              <span className="h-1.5 w-1.5 rounded-full bg-[#22c55e] animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-xs text-white/50 mb-4">
            Join traders discussing live signals, market moves, and TREK analysis in real time.
          </p>
          <div className="flex flex-wrap gap-2 mb-4 text-[10px] text-white/35">
            <span>📊 #trek-signals</span>
            <span>💬 #market-chat</span>
            <span>👑 #elite-picks</span>
            <span>🚀 #paper-trading</span>
          </div>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all tap-feedback"
            style={{
              background: '#5865F2',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(88,101,242,0.3)',
            }}
          >
            <DiscordLogo size={16} />
            Join Discord Server →
          </a>
        </div>
      </div>
    </div>
  );
}