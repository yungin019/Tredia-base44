import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UpgradeCall({ onUpgrade }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{
        background: 'rgba(10, 22, 52, 0.70)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        border: '1px solid rgba(14,200,220,0.18)',
        boxShadow: '0 0 32px rgba(14,200,220,0.07), 0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl flex-shrink-0 mt-0.5" style={{ background: 'rgba(14,200,220,0.12)', border: '1px solid rgba(14,200,220,0.25)' }}>
          <Zap className="h-4 w-4" style={{ color: '#0ec8dc' }} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white mb-1">{t('upgrade.unlockPower', 'Unlock the full power of TREK')}</h3>
          <p className="text-sm mb-4" style={{ color: 'rgba(180,210,240,0.6)' }}>
            {t('upgrade.eliteFeature1', 'Unlimited TREK AI signals')} · {t('upgrade.eliteFeature3', 'Real-time price alerts')} · {t('upgrade.eliteFeature4', 'Advanced analytics')}
          </p>
          <button
            onClick={onUpgrade}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{
              background: 'linear-gradient(135deg, rgba(14,200,220,0.88), rgba(8,160,185,0.88))',
              color: '#040d1e',
              boxShadow: '0 4px 20px rgba(14,200,220,0.25)',
            }}
          >
            {t('upgrade.upgrade', 'Upgrade')}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}