/**
 * useRevenueCat — Capacitor-native RevenueCat hook
 *
 * Uses @revenuecat/purchases-capacitor on iOS/Android only.
 * The import is hidden from Vite's static analyzer via new Function()
 * so the web build never tries to resolve the native-only package.
 *
 * The RevenueCat app user id is the Firebase uid, so the backend can read this
 * customer's entitlements with its secret key and store the verified tier.
 */
import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { REVENUECAT_CONFIG, resolveTier } from '@/lib/revenuecat-config';
import { reportPurchaseFailure } from '@/lib/errorReporter';
import { syncSubscriptionTier } from '@/api/subscriptionSync';
import { auth } from '@/lib/firebase';
import { invokeFunction } from '@/api/functionsClient';

const IS_NATIVE = Capacitor.isNativePlatform();

let _rcModule = null;
async function getRCModule() {
  if (_rcModule) return _rcModule;
  // new Function hides this from Vite's static import resolver
  _rcModule = await new Function('return import("@revenuecat/purchases-capacitor")')();
  return _rcModule;
}

// The public "appl_" key identifies the app, not an account, so it is safe in
// the client. The build never receives app secrets though, so the compiled
// value is normally empty and the key is read from the app's own endpoint.
let _publicKey = null;
async function loadPublicKey() {
  if (REVENUECAT_CONFIG.apiKey) return REVENUECAT_CONFIG.apiKey;
  if (_publicKey) return _publicKey;
  try {
    const res = await invokeFunction('revenueCatPublicKey', {});
    if (typeof res?.key === 'string' && res.key.startsWith('appl_')) _publicKey = res.key;
  } catch (error) {
    console.warn('[RC] public key lookup failed:', error?.message || error);
  }
  return _publicKey || '';
}

// The signed-in Firebase user identifies the RevenueCat customer.
async function identify(Purchases) {
  const uid = auth?.currentUser?.uid;
  if (!uid) return;
  try {
    await Purchases.logIn({ appUserID: uid });
  } catch (error) {
    console.warn('[RC] logIn failed:', error?.message || JSON.stringify(error));
  }
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
    // Launch, purchase and restore all land here: the tier is written to the
    // profile server-side, where it is read back from RevenueCat.
    if (IS_NATIVE) {
      syncSubscriptionTier().catch((error) => {
        console.warn('[RC] tier sync skipped:', error?.message || error);
      });
    }
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
        const apiKey = await loadPublicKey();
        if (!apiKey) {
          console.error('[RevenueCat] FATAL: no appl_ SDK key available — purchases cannot start.');
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
        await identify(Purchases);
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
      await identify(Purchases);
      const { offerings } = await Purchases.getOfferings();
      const offering = offerings?.current || offerings?.all?.default || null;
      const allPackages = offering?.availablePackages || [];
      // Match on the App Store product id, never the package name: the Pro
      // packages are called '$rc_monthly'/'$rc_annual', which says nothing
      // about which product they contain.
      const pkg = allPackages.find(
        (p) => (p.product?.identifier || p.storeProduct?.identifier) === productId
      );

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
      reportPurchaseFailure(error, 'purchase');
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
      await identify(Purchases);
      const { customerInfo: info } = await Purchases.restorePurchases();
      updateFromCustomerInfo(info);
      return true;
    } catch (error) {
      reportPurchaseFailure(error, 'restore');
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
    return resolveTier(activeEntitlements, customerInfo?.activeSubscriptions || []);
  }, [activeEntitlements, customerInfo]);

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