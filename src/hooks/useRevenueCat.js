import { useState, useEffect, useCallback } from 'react';
import { APPLE_IAP_PRODUCTS, getEntitlementForTier } from '@/lib/revenuecat-config';

/**
 * RevenueCat Hook
 * Manages subscriptions, purchases, entitlements, and customer info
 * 
 * Structure:
 * - purchaseInProgress: boolean (during purchase/restore flow)
 * - activeEntitlements: array of active entitlement keys (e.g., ['pro', 'elite'])
 * - customerInfo: object with subscriber details
 * - purchaseError: string | null (last purchase error)
 * - methods: makePurchase, restorePurchases, checkEntitlement
 */
export function useRevenueCat() {
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [activeEntitlements, setActiveEntitlements] = useState([]); // Populated from RevenueCat SDK
  const [customerInfo, setCustomerInfo] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  /**
   * Initialize RevenueCat on mount
   * Calls Purchases.getCustomerInfo() to fetch subscription state from RevenueCat backend
   * If unavailable, defaults to FREE tier (no fallback unlocks)
   */
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        // With real RevenueCat SDK:
        // const Purchases = await import('react-native-purchases');
        // await Purchases.configure({ apiKey: process.env.VITE_REVENUECAT_API_KEY });
        // const info = await Purchases.getCustomerInfo();
        // updateFromCustomerInfo(info);
        
        // For now, RevenueCat SDK not initialized
        // In production, getCustomerInfo() is called here
        // If it fails: default to FREE, no local fallback
        setActiveEntitlements([]); // Empty = FREE tier
        setCustomerInfo(null);
        setIsInitialized(true);
      } catch (error) {
        console.error('RevenueCat initialization failed:', error);
        // STRICT: Do not fall back to localStorage
        // Default to FREE tier only
        setActiveEntitlements([]);
        setCustomerInfo(null);
        setIsInitialized(true);
      }
    };

    initRevenueCat();
  }, []);

  /**
   * Update entitlements from customer info
   * Called after purchase or restore (from RevenueCat SDK only)
   * NO localStorage persistence — RevenueCat is single source of truth
   */
  const updateFromCustomerInfo = useCallback((info) => {
    if (!info) return;

    const entitlements = Object.keys(info.entitlements?.active || {});
    setCustomerInfo(info);
    setActiveEntitlements(entitlements);

    // STRICT: No localStorage fallback
    // RevenueCat is the only source of truth
  }, []);

  /**
   * Initiate a purchase
   * @param {string} productId - Apple IAP product ID
   * @returns {Promise<boolean>} - true if purchase succeeded
   * 
   * STRICT: Calls real RevenueCat SDK only.
   * No mock unlocks. No localStorage. RevenueCat validates receipt.
   */
  const makePurchase = useCallback(async (productId) => {
    if (!productId) {
      setPurchaseError('Invalid product ID');
      return false;
    }

    setPurchaseInProgress(true);
    setPurchaseError(null);

    try {
      // With real RevenueCat SDK (when VITE_REVENUECAT_API_KEY is set):
      // const Purchases = await import('react-native-purchases');
      // const result = await Purchases.purchaseProduct(productId);
      // updateFromCustomerInfo(result.customerInfo);
      // return true;

      // For now, SDK not available
      setPurchaseError('RevenueCat SDK not configured. Please check your API key.');
      return false;
    } catch (error) {
      const msg = error?.message || 'Purchase failed. Please try again.';
      setPurchaseError(msg);
      console.error('Purchase error:', error);
      return false;
    } finally {
      setPurchaseInProgress(false);
    }
  }, [updateFromCustomerInfo]);

  /**
   * Restore previous purchases
   * @returns {Promise<boolean>} - true if restore succeeded
   * 
   * STRICT: Calls real RevenueCat SDK only.
   * No localStorage fallback. RevenueCat validates App Store receipt.
   */
  const restorePurchases = useCallback(async () => {
    setPurchaseInProgress(true);
    setPurchaseError(null);

    try {
      // With real RevenueCat SDK (when VITE_REVENUECAT_API_KEY is set):
      // const Purchases = await import('react-native-purchases');
      // const result = await Purchases.restoreTransactions();
      // updateFromCustomerInfo(result);
      // return true;

      // For now, SDK not available
      setPurchaseError('RevenueCat SDK not configured. Please check your API key.');
      return false;
    } catch (error) {
      const msg = error?.message || 'Restore failed. Please try again.';
      setPurchaseError(msg);
      console.error('Restore error:', error);
      return false;
    } finally {
      setPurchaseInProgress(false);
    }
  }, [updateFromCustomerInfo]);

  /**
   * Check if user has a specific entitlement
   * @param {string} entitlementKey - e.g., 'pro', 'elite'
   * @returns {boolean}
   */
  const checkEntitlement = useCallback((entitlementKey) => {
    return activeEntitlements.includes(entitlementKey);
  }, [activeEntitlements]);

  /**
   * Get current tier based on active entitlements
   * @returns {string} - 'free', 'pro', or 'elite'
   */
  const getCurrentTier = useCallback(() => {
    if (checkEntitlement('elite')) return 'elite';
    if (checkEntitlement('pro')) return 'pro';
    return 'free';
  }, [checkEntitlement]);

  /**
   * Get active subscription product IDs
   * @returns {array}
   */
  const getActiveSubscriptions = useCallback(() => {
    return customerInfo?.activeSubscriptions || [];
  }, [customerInfo]);

  /**
   * Check if subscription is active and not expired
   * @returns {boolean}
   */
  const hasActiveSubscription = useCallback(() => {
    return activeEntitlements.length > 0;
  }, [activeEntitlements]);

  return {
    // State
    purchaseInProgress,
    activeEntitlements,
    customerInfo,
    purchaseError,
    isInitialized,
    
    // Methods
    makePurchase,
    restorePurchases,
    checkEntitlement,
    getCurrentTier,
    getActiveSubscriptions,
    hasActiveSubscription,
  };
}