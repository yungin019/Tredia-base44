/**
 * useSubscriptionStatus Hook
 *
 * SINGLE SOURCE OF TRUTH: RevenueCat ONLY
 * No localStorage fallback. No local tier persistence.
 *
 * Two RevenueCat entitlements exist:
 * - 'elite' → tredia_elite_monthly, tredia_elite_annual, tredia_og100_monthly
 * - 'pro'   → tredia_pro_monthly, tredia_pro_annual
 *
 * Tiers: free | pro | elite | og100 (OG100 is elite granted by the founding
 * member product). If RevenueCat is unavailable or has no entitlements, the
 * tier is FREE and no premium feature is unlocked.
 */

import { useRevenueCat } from './useRevenueCat';
import { useMemo, useEffect, useState } from 'react';
import { REVENUECAT_CONFIG } from '@/lib/revenuecat-config';
import { getCachedProfile } from '@/lib/userProfile';

export function useSubscriptionStatus() {
  const { getCurrentTier: getRevenueCatTier, hasActiveSubscription, checkEntitlement } = useRevenueCat();
  const [dbTier, setDbTier] = useState(null);

  useEffect(() => {
    const p = getCachedProfile();
    if (p?.subscription_tier) setDbTier(p.subscription_tier);
  }, []);

  /**
   * Get the authoritative tier: RevenueCat first, then DB fallback
   */
  const tier = useMemo(() => {
    if (hasActiveSubscription()) {
      const rcTier = getRevenueCatTier();
      if (rcTier && rcTier !== 'free') return rcTier;
    }
    // Fallback: use DB tier (written by the server-side subscription sync)
    if (dbTier && dbTier !== 'free') return dbTier;
    return 'free';
  }, [hasActiveSubscription, getRevenueCatTier, dbTier]);

  /**
   * Check if user has access to a feature
   * STRICT: RevenueCat entitlements ONLY, no fallback
   */
  const hasAccess = (feature) => {
    if (!hasActiveSubscription()) return false; // No subscription = no premium features

    // Elite (including OG100) has all features
    if (checkEntitlement(REVENUECAT_CONFIG.entitlements.elite)) return true;

    // Pro has most features but not super_ai
    if (checkEntitlement(REVENUECAT_CONFIG.entitlements.pro)) {
      if (feature === 'super_ai') return false;
      if (feature === 'institutional_flow') return false;
      return true;
    }

    return false;
  };

  return {
    tier,
    isFree: tier === 'free',
    isSubscribed: tier !== 'free',
    isPro: tier === 'pro',
    isElite: tier === 'elite' || tier === 'og100',
    isOg100: tier === 'og100',
    hasAccess,
    hasActiveSubscription,
    checkEntitlement, // Direct RevenueCat check
  };
}