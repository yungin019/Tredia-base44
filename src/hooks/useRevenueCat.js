/**
 * useRevenueCat — Capacitor-native RevenueCat hook
 *
 * Uses @revenuecat/purchases-capacitor on iOS/Android.
 * Falls back gracefully on web (purchase buttons show Apple IAP unavailable message).
 *
 * RevenueCat is the ONLY source of truth for entitlements.
 * No localStorage fallback, no mock unlocks.
 */
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { REVENUECAT_CONFIG } from '@/lib/revenuecat-config';

// Dynamic import path stored in a variable so Rollup/Vite does NOT
// statically analyse it as a module dependency at build time.
const RC_PKG = '@revenuecat/purchases-capacitor';

const IS_NATIVE = Capacitor.isNativePlatform();

export function useRevenueCat() {
  const [purchaseInProgress, setPurchaseInProgress] = useState(false);
  const [activeEntitlements, setActiveEntitlements] = useState([]);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [purchaseError, setPurchaseError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const updateFromCustomerInfo = useCallback((info) => {
    if (!info) return;
    const entitlements = Object.keys(info.entitlements?.active || {});
    setCustomerInfo(info);
    setActiveEntitlements(entitlements);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (!IS_NATIVE) {
        setActiveEntitlements([]);
        setCustomerInfo(null);
        setIsInitialized(true);
        return;
      }
      try {
        const apiKey = REVENUECAT_CONFIG.apiKey;
        if (!apiKey) {
          console.error('[RevenueCat] FATAL: apiKey is empty. Set VITE_REVENUECAT_IOS_KEY in environment variables. Purchases will be unavailable.');
          setIsInitialized(false);
          return;
        }
        console.log('[RevenueCat] Initializing with key prefix:', apiKey.substring(0, 8) + '...');
        const { Purchases, LOG_LEVEL } = await import(/* @vite-ignore */ RC_PKG);
        const logLevel = REVENUECAT_CONFIG.logLevel === 'debug' ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO;
        await Purchases.setLogLevel({ level: logLevel });
        await Purchases.configure({ apiKey });
        console.log('[RevenueCat] Configured successfully');
        const { customerInfo: info } = await Purchases.getCustomerInfo();
        console.log('[RevenueCat] CustomerInfo loaded, active entitlements:', Object.keys(info?.entitlements?.active || {}));
        updateFromCustomerInfo(info);
        setIsInitialized(true);
      } catch (error) {
        const errMsg = error?.message || error?.code || JSON.stringify(error) || 'unknown error';
        console.error('[RevenueCat] init failed:', errMsg, error);
        setActiveEntitlements([]);
        setCustomerInfo(null);
        // Leave isInitialized=false so UI can show "not ready" state
        setIsInitialized(false);
      }
    };
    init();
  }, [updateFromCustomerInfo]);

  const makePurchase = useCallback(async (productId) => {
    if (!productId) { setPurchaseError('Invalid product ID'); return false; }
    if (!IS_NATIVE) { setPurchaseError('In-app purchases are only available on iOS and Android.'); return false; }
    if (!isInitialized) { setPurchaseError('Purchases are not ready yet. Please wait a moment and try again.'); return false; }

    setPurchaseInProgress(true);
    setPurchaseError(null);

    try {
      const { Purchases } = await import(/* @vite-ignore */ RC_PKG);
      const { offerings } = await Purchases.getOfferings();
      const current = offerings?.current;
      const allPackages = current?.availablePackages || [];
      const pkg = allPackages.find(p => p.product?.identifier === productId);

      if (!pkg) {
        setPurchaseError('Product "' + productId + '" not found in current offering.');
        return false;
      }

      const { customerInfo: info } = await Purchases.purchasePackage({ aPackage: pkg });
      updateFromCustomerInfo(info);
      return true;
    } catch (error) {
      if (error?.code === 'PURCHASE_CANCELLED' || error?.userCancelled) {
        setPurchaseError(null);
        return false;
      }
      const msg = error?.message || 'Purchase failed. Please try again.';
      setPurchaseError(msg);
      console.error('[RevenueCat] purchase error:', error);
      return false;
    } finally {
      setPurchaseInProgress(false);
    }
  }, [isInitialized, updateFromCustomerInfo]);

  const restorePurchases = useCallback(async () => {
    if (!IS_NATIVE) { setPurchaseError('Restore is only available on iOS and Android.'); return false; }

    setPurchaseInProgress(true);
    setPurchaseError(null);

    try {
      const { Purchases } = await import(/* @vite-ignore */ RC_PKG);
      const { customerInfo: info } = await Purchases.restorePurchases();
      updateFromCustomerInfo(info);
      return true;
    } catch (error) {
      const msg = error?.message || 'Restore failed. Please try again.';
      setPurchaseError(msg);
      console.error('[RevenueCat] restore error:', error);
      return false;
    } finally {
      setPurchaseInProgress(false);
    }
  }, [updateFromCustomerInfo]);

  const checkEntitlement = useCallback((entitlementKey) => {
    return activeEntitlements.includes(entitlementKey);
  }, [activeEntitlements]);

  const getCurrentTier = useCallback(() => {
    if (checkEntitlement(REVENUECAT_CONFIG.entitlements.lifetime)) return 'lifetime';
    if (checkEntitlement(REVENUECAT_CONFIG.entitlements.yearly)) return 'yearly';
    if (checkEntitlement(REVENUECAT_CONFIG.entitlements.elite)) return 'elite';
    if (checkEntitlement(REVENUECAT_CONFIG.entitlements.pro)) return 'pro';
    return 'free';
  }, [checkEntitlement]);

  const getActiveSubscriptions = useCallback(() => {
    return customerInfo?.activeSubscriptions || [];
  }, [customerInfo]);

  const hasActiveSubscription = useCallback(() => {
    return activeEntitlements.length > 0;
  }, [activeEntitlements]);

  return {
    purchaseInProgress,
    activeEntitlements,
    customerInfo,
    purchaseError,
    isInitialized,
    makePurchase,
    restorePurchases,
    checkEntitlement,
    getCurrentTier,
    getActiveSubscriptions,
    hasActiveSubscription,
  };
}
