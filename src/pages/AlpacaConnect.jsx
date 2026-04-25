import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, BarChart3, Bell, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { base44 } from '@/api/base44Client';

export default function AlpacaConnect() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [connecting, setConnecting] = React.useState(false);

  const FEATURES = [
    { Icon: Zap, title: t('alpaca.feature1Title'), desc: t('alpaca.feature1Desc'), color: '#F59E0B' },
    { Icon: BarChart3, title: t('alpaca.feature2Title'), desc: t('alpaca.feature2Desc'), color: '#3b82f6' },
    { Icon: Bell, title: t('alpaca.feature3Title'), desc: t('alpaca.feature3Desc'), color: '#22c55e' },
  ];

  const handleConnect = async () => {
    setConnecting(true);
    try {
      // Get the OAuth URL from backend — keeps client_id server-side
      const res = await base44.functions.invoke('alpacaOAuth', { action: 'get_auth_url' });
      if (res?.data?.auth_url) {
        window.location.href = res.data.auth_url;
      }
    } catch (e) {
      setConnecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6"
      >
        {/* Header */}
        <div className="text-center">
          <div className="text-3xl font-black tracking-[0.3em] text-[#F59E0B] mb-2">TREDIO</div>
          <h1 className="text-2xl font-black text-white mb-1">{t('alpaca.connectTitle')}</h1>
          <p className="text-sm text-white/40">
            {t('alpaca.providedBy')} <span className="text-white/60 font-semibold">Alpaca Markets</span>
          </p>
        </div>

        {/* Broker Disclosure */}
        <div className="rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-[#F59E0B] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[11px] font-bold text-[#F59E0B] mb-1">{t('alpaca.disclosureTitle')}</p>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {t('alpaca.disclosureBody')}
              </p>
            </div>
          </div>
        </div>

        {/* Feature bullets */}
        <div className="space-y-3">
          {FEATURES.map(({ Icon, title, desc, color }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-lg flex-shrink-0" style={{ background: `${color}15` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="text-xs text-white/40">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConnect}
            disabled={connecting}
            className="w-full py-4 rounded-xl font-black text-base tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}
          >
            {connecting ? t('alpaca.connecting') : t('alpaca.connectBtn')}
          </motion.button>

          <a
            href="https://app.alpaca.markets/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-sm border border-white/[0.1] text-white/60 hover:border-white/20 transition-colors"
          >
            {t('alpaca.openAccount')}
          </a>

          <button
            onClick={() => navigate('/Home')}
            className="w-full py-2.5 text-sm text-white/30 hover:text-white/50 transition-colors"
          >
            {t('alpaca.practiceMode')}
          </button>
        </div>

        <p className="text-[10px] text-white/20 text-center leading-relaxed">
          {t('alpaca.legalNote')}
        </p>
      </motion.div>
    </div>
  );
}