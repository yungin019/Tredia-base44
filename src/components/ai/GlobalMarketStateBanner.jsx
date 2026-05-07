import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

export default function GlobalMarketStateBanner() {
  const { t } = useTranslation();
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarketState = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await base44.functions.invoke('globalMarketState', { lang: i18n.language || 'en' });

        // Guard: if native returned HTML instead of JSON, treat as unavailable
        const raw = response.data;
        if (typeof raw === 'string' && raw.trim().startsWith('<')) {
          console.warn('[GlobalMarketStateBanner] Received HTML instead of JSON — API URL misconfigured');
          setError('unavailable');
          return;
        }

        if (raw?.marketState) {
          setState(raw.marketState);
        } else {
          setError('No market state received');
        }
      } catch (err) {
        console.error('[GlobalMarketStateBanner] Error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketState();
    const interval = setInterval(fetchMarketState, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl px-4 py-3.5 space-y-3 animate-pulse"
        style={{ background: 'rgba(8, 18, 42, 0.65)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(100,220,255,0.09)' }}>
        <div className="h-4 bg-white/10 rounded w-24" />
        <div className="h-3 bg-white/10 rounded w-full" />
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="rounded-xl px-4 py-3.5 space-y-3"
        style={{ background: 'rgba(8, 18, 42, 0.65)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(100,220,255,0.09)' }}>
        <h3 className="text-xs font-black text-white/80 uppercase tracking-widest">{t('feed.marketState', 'Market State')}</h3>
        <p className="text-[11px] text-white/60">{t('feed.unableToLoad', 'Unable to load market state. Please refresh.')}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl px-4 py-3.5 space-y-3"
      style={{ background: 'rgba(8, 18, 42, 0.65)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(100,220,255,0.09)' }}>
      <h3 className="text-xs font-black text-white/80 uppercase tracking-widest">{t('feed.marketState', 'Market State')}</h3>
      <p className="text-[11px] text-white/60 leading-snug">{state.marketState}</p>
      <div className="flex items-start gap-2 pt-1">
        <span className="text-sm flex-shrink-0" style={{ color: 'rgb(14,200,220)' }}>⚡</span>
        <span className="text-[10px] font-bold text-white/70">{t('feed.bias', 'Bias')}: {state.bias}</span>
      </div>
      <div className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(14,200,220,0.04)', border: '1px solid rgba(14,200,220,0.1)' }}>
        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-1.5">{t('trek.watch', 'Watch')}</p>
        <div className="space-y-1">
          {state.watch && state.watch.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-[9px] text-white/25 flex-shrink-0">•</span>
              <span className="text-[10px] text-white/50">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
