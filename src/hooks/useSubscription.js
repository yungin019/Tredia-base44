import { useState, useEffect } from 'react';

export const TIER_ACCESS = {
  free: ['basic_signals', 'paper_trading', 'limited_chat'],
  pro: ['advanced_signals', 'jump_detection', 'smart_money', 'broker_sync', 'real_time', 'unlimited_chat', 'confidence_breakdown'],
  elite: ['super_ai', 'institutional_flow', 'priority_trek', 'portfolio_review', 'all_pro_features'],
};

export function useSubscription() {
  const [tier, setTier] = useState('free');

  useEffect(() => {
    const saved = localStorage.getItem('tredia_tier');
    if (saved && TIER_ACCESS[saved]) setTier(saved);
  }, []);

  function hasAccess(feature) {
    if (tier === 'elite') return true;
    if (tier === 'pro') return [...TIER_ACCESS.pro, ...TIER_ACCESS.free].includes(feature);
    return TIER_ACCESS.free.includes(feature);
  }

  function upgradeTier(newTier) {
    if (TIER_ACCESS[newTier]) {
      setTier(newTier);
      localStorage.setItem('tredia_tier', newTier);
    }
  }

  return { tier, hasAccess, upgradeTier };
}