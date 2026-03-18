/**
 * TREDIA RevenueCat Configuration
 * Apple In-App Purchase Product IDs mapped to subscription tiers
 * 
 * These are the product identifiers that must match your App Store Connect IAP setup.
 * RevenueCat will use these to manage entitlements and customer info.
 */

// Apple In-App Purchase Product IDs
export const APPLE_IAP_PRODUCTS = {
  pro_monthly: 'com.tredia.pro_monthly',      // $19.99/month
  pro_annual: 'com.tredia.pro_annual',        // $179.99/year (roughly $15/mo)
  elite_monthly: 'com.tredia.elite_monthly',  // $49.99/month
  elite_annual: 'com.tredia.elite_annual',    // $449.99/year (roughly $37.50/mo)
};

// Tier to product mapping (user selects tier, we use these product IDs with RevenueCat)
export const TIER_TO_PRODUCTS = {
  pro: {
    monthly: APPLE_IAP_PRODUCTS.pro_monthly,
    annual: APPLE_IAP_PRODUCTS.pro_annual,
  },
  elite: {
    monthly: APPLE_IAP_PRODUCTS.elite_monthly,
    annual: APPLE_IAP_PRODUCTS.elite_annual,
  },
};

// Entitlement identifiers (these are what RevenueCat uses to grant access)
export const ENTITLEMENTS = {
  pro: 'pro',
  elite: 'elite',
};

// RevenueCat SDK Configuration
export const REVENUECAT_CONFIG = {
  // API key will be loaded from environment: VITE_REVENUECAT_API_KEY
  // Should be set in your .env or Base44 secrets
  observerMode: false, // Set to true only if you're manually managing purchases
  usesStoreKit2: true, // iOS 16.0+ uses StoreKit 2
  logLevel: 'debug',   // Set to 'info' in production
};

/**
 * Helper: Get product ID for tier/billing cycle
 * @param {string} tier - 'pro' or 'elite'
 * @param {string} billingCycle - 'monthly' or 'annual'
 * @returns {string} Apple IAP product ID
 */
export function getProductId(tier, billingCycle = 'monthly') {
  return TIER_TO_PRODUCTS[tier]?.[billingCycle] || null;
}

/**
 * Helper: Get entitlement key for tier
 * @param {string} tier - 'free', 'pro', or 'elite'
 * @returns {string|null} Entitlement key or null if free tier
 */
export function getEntitlementForTier(tier) {
  return tier !== 'free' ? ENTITLEMENTS[tier] || null : null;
}