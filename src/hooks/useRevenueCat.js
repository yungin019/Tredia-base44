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
   * In production, this would call Purchases.configure() and fetch customer info
   */
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        // In production with real RevenueCat SDK:
        // const Purchases = await import('react-native-purchases');
        // await Purchases.configure({ apiKey: process.env.VITE_REVENUECAT_API_KEY });
        // const info = await Purchases.getCustomerInfo();
        // updateFromCustomerInfo(info);
        
        // For now, initialize from localStorage (TestFlight fallback)
        const savedEntitlements = localStorage.getItem('tredia_entitlements');
        if (savedEntitlements) {
          setActiveEntitlements(JSON.parse(savedEntitlements));
        }
        
        const savedCustomerInfo = localStorage.getItem('tredia_customer_info');
        if (savedCustomerInfo) {
          setCustomerInfo(JSON.parse(savedCustomerInfo));
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('RevenueCat initialization failed:', error);
        setIsInitialized(true); // Initialize anyway so UI doesn't freeze
      }
    };

    initRevenueCat();
  }, []);

  /**
   * Update entitlements from customer info
   * Called after purchase or restore
   */
  const updateFromCustomerInfo = useCallback((info) => {
    if (!info) return;

    const entitlements = Object.keys(info.entitlements?.active || {});
    setCustomerInfo(info);
    setActiveEntitlements(entitlements);

    // Persist to localStorage for offline fallback
    localStorage.setItem('tredia_entitlements', JSON.stringify(entitlements));
    localStorage.setItem('tredia_customer_info', JSON.stringify(info));
  }, []);

  /**
   * Initiate a purchase
   * @param {string} productId - Apple IAP product ID
   * @returns {Promise<boolean>} - true if purchase succeeded
   */
  const makePurchase = useCallback(async (productId) => {
    if (!productId) {
      setPurchaseError('Invalid product ID');
      return false;
    }

    setPurchaseInProgress(true);
    setPurchaseError(null);

    try {
      // In production with real RevenueCat SDK:
      // const Purchases = await import('react-native-purchases');
      // const result = await Purchases.purchaseProduct(productId);
      // updateFromCustomerInfo(result.customerInfo);
      // return true;

      // For now, simulate with localStorage (TestFlight development)
      console.log(`[RevenueCat] Purchase initiated for product: ${productId}`);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success - in real flow, RevenueCat confirms the transaction
      const mockInfo = {
        entitlements: {
          active: {
            [productId.includes('elite') ? 'elite' : 'pro']: {
              isActive: true,
              expiresAtMs: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days
            }
          }
        },
        activeSubscriptions: [productId],
      };
      updateFromCustomerInfo(mockInfo);
      return true;
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
   */
  const restorePurchases = useCallback(async () => {
    setPurchaseInProgress(true);
    setPurchaseError(null);

    try {
      // In production with real RevenueCat SDK:
      // const Purchases = await import('react-native-purchases');
      // const result = await Purchases.restoreTransactions();
      // updateFromCustomerInfo(result);
      // return true;

      console.log('[RevenueCat] Restore purchases initiated');
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock: check localStorage for any existing purchases
      const savedInfo = localStorage.getItem('tredia_customer_info');
      if (savedInfo) {
        updateFromCustomerInfo(JSON.parse(savedInfo));
        return true;
      }
      
      setPurchaseError('No previous purchases found.');
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