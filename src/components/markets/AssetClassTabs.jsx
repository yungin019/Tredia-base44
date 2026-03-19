import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function AssetClassTabs({ activeTab, onTabChange }) {
  const { t } = useTranslation();
  const TABS = [
    { id: 'stocks', label: t('markets.stocks') },
    { id: 'crypto', label: t('markets.crypto') },
    { id: 'watchlist', label: `⭐ ${t('markets.watchlist')}` },
    { id: 'forex', label: 'Forex' },
    { id: 'commodities', label: t('markets.commodities') },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.02 }}
      className="flex gap-3 border-b border-white/[0.07] pb-0"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="relative px-4 py-3 text-sm font-bold text-white/60 hover:text-white/80 transition-colors"
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5"
              style={{ background: '#F59E0B' }}
              transition={{ type: 'spring', bounce: 0.15, duration: 0.3 }}
            />
          )}
        </button>
      ))}
    </motion.div>
  );
}