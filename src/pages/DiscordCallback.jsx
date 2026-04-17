import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function DiscordCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Connecting Discord...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error || !code) {
      setStatus('Connection cancelled.');
      setTimeout(() => navigate('/Settings'), 2000);
      return;
    }

    base44.functions.invoke('discordOAuth', { code })
      .then((res) => {
        const data = res.data;
        if (data?.success) {
          setStatus(`✅ Connected as @${data.discord_username}`);
        } else {
          setStatus('❌ Connection failed. Please try again.');
        }
        setTimeout(() => navigate('/Settings'), 2500);
      })
      .catch(() => {
        setStatus('❌ Connection failed. Please try again.');
        setTimeout(() => navigate('/Settings'), 2500);
      });
  }, []);

  return (
    <div className="min-h-screen app-bg flex items-center justify-center p-6">
      <div className="rounded-2xl p-8 text-center max-w-sm w-full"
        style={{ background: 'rgba(10,22,52,0.85)', border: '1px solid rgba(88,101,242,0.3)' }}>
        <div className="text-4xl mb-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="#5865F2" className="mx-auto">
            <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028z"/>
          </svg>
        </div>
        <p className="text-white font-bold text-lg mb-2">{status}</p>
        <p className="text-white/40 text-sm">Redirecting to Settings...</p>
      </div>
    </div>
  );
}