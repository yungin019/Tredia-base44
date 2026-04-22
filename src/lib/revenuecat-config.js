/**
 * TREDIO RevenueCat Configuration
 *
 * Matches exactly with RevenueCat Dashboard:
 * - Elite Monthly → identifier: elite_monthly → product: tredio_elite_monthly
 * - Monthly (Pro) → identifier: $rc_monthly → product: tredio_pro_monthly
 * - Yearly → identifier: $rc_annual → product: yearly
 * - Lifetime → identifier: $rc_lifetime → product: lifetime
 */

export const REVENUECAT_CONFIG = {
  apiKey: process.env.VITE_REVENUECAT_API_KEY,
  entitlements: {
    elite: 'elite_monthly',
    pro: '$rc_monthly',
    yearly: '$rc_annual',
    lifetime: '$rc_lifetime'
  },
  productIds: {
    elite: 'tredio_elite_monthly',
    pro: 'tredio_pro_monthly',
    yearly: 'yearly',
    lifetime: 'lifetime'
  },
  // SDK Configuration
  observerMode: false, // Set to true only if you're manually managing purchases
  usesStoreKit2: true, // iOS 16.0+ uses StoreKit 2
  logLevel: 'debug',   // Set to 'info' in production
};

/**
 * Get entitlement identifier for tier
 * @param {string} tier - 'free', 'elite', 'pro', 'yearly', or 'lifetime'
 * @returns {string|null}
 */
export function getEntitlementIdentifier(tier) {
  return REVENUECAT_CONFIG.entitlements[tier] || null;
}

/**
 * Get product ID for tier
 * @param {string} tier - 'elite', 'pro', 'yearly', or 'lifetime'
 * @returns {string|null}
 */
export function getProductId(tier) {
  return REVENUECAT_CONFIG.productIds[tier] || null;
}

/**
 * Check if a given entitlement key matches a tier
 * @param {string} entitlementKey - RevenueCat entitlement identifier
 * @returns {string} - Tier name or 'free'
 */
export function getTierFromEntitlement(entitlementKey) {
  for (const [tier, entId] of Object.entries(REVENUECAT_CONFIG.entitlements)) {
    if (entId === entitlementKey) return tier;
  }
  return 'free';
}