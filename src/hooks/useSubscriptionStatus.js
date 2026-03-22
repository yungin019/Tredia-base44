/**
 * useSubscriptionStatus Hook
 * 
 * SINGLE SOURCE OF TRUTH: RevenueCat ONLY
 * No localStorage fallback. No local tier persistence.
 * 
 * Entitlement identifiers from RevenueCat Dashboard:
 * - elite: 'elite_monthly'
 * - pro: '$rc_monthly'
 * - yearly: '$rc_annual'
 * - lifetime: '$rc_lifetime'
 * 
 * If RevenueCat unavailable or user has no entitlements:
 * - Default to FREE tier
 * - NO premium features unlocked
 * - All gating enforced strictly
 */

import { useRevenueCat } from './useRevenueCat';
import { useMemo, useEffect, useState } from 'react';
import { REVENUECAT_CONFIG } from '@/lib/revenuecat-config';
import { base44 } from '@/api/base44Client';

export function useSubscriptionStatus() {
  const { getCurrentTier: getRevenueCatTier, hasActiveSubscription, checkEntitlement } = useRevenueCat();
  const [dbTier, setDbTier] = useState(null);

  useEffect(() => {
    base44.auth.me().then(u => {
      if (u?.subscription_tier) setDbTier(u.subscription_tier);
    }).catch(() => {});
  }, []);

  /**
   * Get the authoritative tier: RevenueCat first, then DB fallback
   */
  const tier = useMemo(() => {
    if (hasActiveSubscription()) {
      const rcTier = getRevenueCatTier();
      if (rcTier === 'elite') return 'elite';
      if (rcTier === 'pro') return 'pro';
    }
    // Fallback: use DB tier (set by admin or claim)
    if (dbTier && dbTier !== 'free') return dbTier;
    return 'free';
  }, [hasActiveSubscription, getRevenueCatTier, dbTier]);

  /**
   * Check if user has access to a feature
   * STRICT: RevenueCat entitlements ONLY, no fallback
   */
  const hasAccess = (feature) => {
    if (!hasActiveSubscription()) return false; // No subscription = no premium features

    // Lifetime and yearly have all features
    if (checkEntitlement(REVENUECAT_CONFIG.entitlements.lifetime)) return true;
    if (checkEntitlement(REVENUECAT_CONFIG.entitlements.yearly)) return true;
    
    // Elite has all features
    if (checkEntitlement(REVENUECAT_CONFIG.entitlements.elite)) return true;

    // Pro has most features but not super_ai
    if (checkEntitlement(REVENUECAT_CONFIG.entitlements.pro)) {
      if (feature === 'super_ai') return false;
      if (feature === 'institutional_flow') return false;
      return true;
    }

    return false;
  };

  /**
   * Check if currently in free tier
   */
  const isFree = tier === 'free';

  /**
   * Check if currently subscribed (pro, elite, yearly, or lifetime)
   */
  const isSubscribed = tier !== 'free';

  return {
    tier,
    isFree,
    isSubscribed,
    isPro: tier === 'pro',
    isElite: tier === 'elite',
    isYearly: tier === 'yearly',
    isLifetime: tier === 'lifetime',
    hasAccess,
    hasActiveSubscription,
    checkEntitlement, // Direct RevenueCat check
  };
}