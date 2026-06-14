/**
 * useRevenueCat — Capacitor-native RevenueCat hook
 *
 * Uses @revenuecat/purchases-capacitor on iOS/Android only.
 * The import is hidden from Vite's static analyzer via new Function()
 * so the web build never tries to resolve the native-only package.
 */
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { REVENUECAT_CONFIG } from '@/lib/revenuecat-config';

const IS_NATIVE = Capacitor.isNativePlatform();

let _rcModule = null;
async function getRCModule() {
  if (_rcModule) return _rcModule;
  // new Function hides this from Vite's static import resolver
  _rcModule = await new Function('return import("@revenuecat/purchases-capacitor")')();
  return _rcModule;
}

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
          console.error('[RevenueCat] FATAL: apiKey is empty. Set VITE_REVENUECAT_IOS_KEY in environment variables.');
          setIsInitialized(false);
          return;
        }
        const { Purchases, LOG_LEVEL } = await getRCModule();
        const logLevel = REVENUECAT_CONFIG.logLevel === 'debug' ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO;
        await Purchases.setLogLevel({ level: logLevel });
        try {
          await Purchases.configure({ apiKey });
        } catch (e) {
          console.error('[RC] configure error:', JSON.stringify(e));
          setIsInitialized(false);
          return;
        }
        const { customerInfo: info } = await Purchases.getCustomerInfo();
        updateFromCustomerInfo(info);
        setIsInitialized(true);
      } catch (error) {
        console.error('[RC] init failed:', error?.message || JSON.stringify(error));
        setActiveEntitlements([]);
        setCustomerInfo(null);
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
      const { Purchases } = await getRCModule();
      const { offerings } = await Purchases.getOfferings();
      const allPackages = offerings?.current?.availablePackages || [];
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
      setPurchaseError(error?.message || 'Purchase failed. Please try again.');
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
      const { Purchases } = await getRCModule();
      const { customerInfo: info } = await Purchases.restorePurchases();
      updateFromCustomerInfo(info);
      return true;
    } catch (error) {
      setPurchaseError(error?.message || 'Restore failed. Please try again.');
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