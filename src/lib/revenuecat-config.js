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
  apiKey: import.meta.env?.VITE_REVENUECAT_API_KEY ?? '',
  entitlements: {
    elite: 'elite_monthly',
    pro: '$rc_monthly',
    yearly: '$rc_annual',
    lifetime: '$rc_lifetime'
  },
  productIds: {
    elite_monthly: 'tredio_elite_monthly',
    elite_annual: 'tredio_elite_annual',
    pro_monthly: 'tredio_pro_monthly',
    pro_annual: 'tredio_pro_annual',
    yearly: 'yearly',
    lifetime: 'lifetime'
  },
  observerMode: false,
  usesStoreKit2: true,
  logLevel: import.meta.env?.PROD ? 'info' : 'debug',
};

export function getEntitlementIdentifier(tier) {
  return REVENUECAT_CONFIG.entitlements[tier] || null;
}

export function getProductId(tier, billingCycle = 'monthly') {
  const key = tier + '_' + billingCycle;
  return REVENUECAT_CONFIG.productIds[key] || REVENUECAT_CONFIG.productIds[tier] || null;
}

export function getTierFromEntitlement(entitlementKey) {
  for (const [tier, entId] of Object.entries(REVENUECAT_CONFIG.entitlements)) {
    if (entId === entitlementKey) return tier;
  }
  return 'free';
}
