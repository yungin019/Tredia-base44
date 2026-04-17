import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const DISCORD_CLIENT_ID = '1494690299581042758';
const REDIRECT_URI = 'https://tredia-trade-flow.base44.app/auth/discord/callback';
const INVITE_URL = 'https://discord.gg/DtB4Nczj';

function DiscordLogo({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#5865F2">
      <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/>
    </svg>
  );
}

export default function DiscordConnectSection({ user }) {
  const [discordStat, setDiscordStat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const userId = user.email || user.id;
    base44.entities.UserStat.filter({ user_id: userId })
      .then(stats => {
        const s = stats?.[0];
        if (s?.discord_connected) setDiscordStat(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  const handleConnect = () => {
    const scope = 'identify email';
    const url = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(scope)}`;
    window.location.href = url;
  };

  const handleDisconnect = async () => {
    if (!user) return;
    const userId = user.email || user.id;
    const stats = await base44.entities.UserStat.filter({ user_id: userId }).catch(() => []);
    if (stats?.[0]) {
      await base44.entities.UserStat.update(stats[0].id, { discord_connected: false, discord_id: null, discord_username: null, discord_avatar: null }).catch(() => {});
    }
    setDiscordStat(null);
  };

  if (loading) return <div className="h-16 rounded-xl bg-white/[0.03] animate-pulse" />;

  if (discordStat?.discord_connected) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(88,101,242,0.08)', border: '1px solid rgba(88,101,242,0.25)' }}>
          <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: 'rgba(88,101,242,0.2)' }}>
            {discordStat.discord_avatar
              ? <img src={discordStat.discord_avatar} alt="avatar" className="h-10 w-10 object-cover" />
              : <DiscordLogo size={20} />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <DiscordLogo size={12} />
              <p className="text-sm font-bold text-white">@{discordStat.discord_username}</p>
              <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}>
                CONNECTED
              </span>
            </div>
            <p className="text-[10px] text-white/40">Discord account linked</p>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-[10px] font-bold text-white/35 hover:text-white/60 transition-colors"
          >
            Disconnect
          </button>
        </div>
        <a
          href={INVITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all tap-feedback"
          style={{ background: '#5865F2', color: '#fff' }}
        >
          <DiscordLogo size={14} />
          Open TREDIO Discord Server
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 p-3.5 rounded-xl" style={{ background: 'rgba(88,101,242,0.06)', border: '1px solid rgba(88,101,242,0.15)' }}>
        <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(88,101,242,0.15)' }}>
          <DiscordLogo size={20} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Connect Discord</p>
          <p className="text-[10px] text-white/40">Get a badge, join #elite-picks, sync your TREK signals</p>
        </div>
      </div>
      <button
        onClick={handleConnect}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all tap-feedback"
        style={{ background: '#5865F2', color: '#fff', boxShadow: '0 4px 16px rgba(88,101,242,0.25)' }}
      >
        <DiscordLogo size={16} />
        Connect Discord Account
      </button>
      <a
        href={INVITE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold transition-all"
        style={{ background: 'rgba(88,101,242,0.08)', color: '#7289da', border: '1px solid rgba(88,101,242,0.2)' }}
      >
        Join Discord Server (No account needed) →
      </a>
    </div>
  );
}