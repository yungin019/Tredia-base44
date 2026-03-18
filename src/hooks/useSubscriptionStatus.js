/**
 * useSubscriptionStatus Hook
 * 
 * Combines useSubscription (local tier storage) and useRevenueCat (Apple subscription state).
 * This is the single source of truth for subscription status across the app.
 * 
 * In TestFlight:
 * - useRevenueCat provides real sandbox purchase state
 * - Falls back to localStorage tier for offline resilience
 * 
 * In production App Store:
 * - useRevenueCat gets entitlements from RevenueCat backend (which validates Apple receipts)
 * - Always trusted source of truth
 */

import { useSubscription } from './useSubscription';
import { useRevenueCat } from './useRevenueCat';
import { useMemo } from 'react';

export function useSubscriptionStatus() {
  const { tier: localTier, hasAccess: hasLocalAccess } = useSubscription();
  const { getCurrentTier: getRevenueCatTier, hasActiveSubscription, checkEntitlement } = useRevenueCat();

  /**
   * Get the authoritative tier:
   * 1. If RevenueCat has active subscription, trust it
   * 2. Otherwise, fall back to local tier (offline or free user)
   */
  const tier = useMemo(() => {
    if (hasActiveSubscription()) {
      const rcTier = getRevenueCatTier();
      if (rcTier !== 'free') return rcTier;
    }
    return localTier;
  }, [hasActiveSubscription, getRevenueCatTier, localTier]);

  /**
   * Check if user has access to a feature
   * Respects both local gating and RevenueCat entitlements
   */
  const hasAccess = (feature) => {
    // If has active subscription, trust RevenueCat entitlements
    if (hasActiveSubscription()) {
      const rcTier = getRevenueCatTier();
      if (rcTier === 'elite') return true;
      if (rcTier === 'pro' && feature !== 'super_ai' && feature !== 'institutional_flow') return true;
    }
    // Fall back to local tier access logic
    return hasLocalAccess(feature);
  };

  /**
   * Check if currently in free tier
   */
  const isFree = tier === 'free' && !hasActiveSubscription();

  /**
   * Check if currently subscribed (pro or elite)
   */
  const isSubscribed = tier !== 'free' && hasActiveSubscription();

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