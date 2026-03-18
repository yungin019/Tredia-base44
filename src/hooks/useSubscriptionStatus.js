/**
 * useSubscriptionStatus Hook
 * 
 * SINGLE SOURCE OF TRUTH: RevenueCat ONLY
 * No localStorage fallback. No local tier persistence.
 * 
 * If RevenueCat unavailable or user has no entitlements:
 * - Default to FREE tier
 * - NO premium features unlocked
 * - All gating enforced strictly
 */

import { useRevenueCat } from './useRevenueCat';
import { useMemo } from 'react';

export function useSubscriptionStatus() {
  const { getCurrentTier: getRevenueCatTier, hasActiveSubscription, checkEntitlement } = useRevenueCat();

  /**
   * Get the authoritative tier: RevenueCat entitlements ONLY
   * If no active subscription → FREE (strict default)
   */
  const tier = useMemo(() => {
    if (hasActiveSubscription()) {
      const rcTier = getRevenueCatTier();
      if (rcTier === 'elite') return 'elite';
      if (rcTier === 'pro') return 'pro';
    }
    return 'free'; // STRICT: Default to free if no entitlements
  }, [hasActiveSubscription, getRevenueCatTier]);

  /**
   * Check if user has access to a feature
   * STRICT: RevenueCat entitlements ONLY, no fallback
   */
  const hasAccess = (feature) => {
    if (!hasActiveSubscription()) return false; // No subscription = no premium features

    if (checkEntitlement('elite')) return true; // Elite has everything

    if (checkEntitlement('pro')) {
      // Pro restricted features
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
   * Check if currently subscribed (pro or elite)
   */
  const isSubscribed = tier === 'pro' || tier === 'elite';

  return {
    tier,
    isFree,
    isSubscribed,
    isPro: tier === 'pro',
    isElite: tier === 'elite',
    hasAccess,
    hasActiveSubscription,
    checkEntitlement, // Direct RevenueCat check
  };
}