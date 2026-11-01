/**
 * TREDIO RevenueCat configuration — iOS App Store products.
 *
 * Exactly two entitlements exist in the RevenueCat dashboard, and only these
 * two are ever looked up:
 *
 *   pro   ← tredia_pro_monthly, tredia_pro_annual
 *   elite ← tredia_elite_monthly, tredia_elite_annual, tredia_og100_monthly
 *
 * OG100 is the founding-member product: it grants the elite entitlement and is
 * reported as its own tier ('og100') so the app can show the founder badge.
 *
 * The SDK key (public, starts with "appl_") is compiled into the app.
 */

/**
 * Public iOS SDK key. Public by design (it identifies the app, not the account)
 * and compiled into the binary, so it can live here.
 * Paste the key from RevenueCat → Project settings → API keys → iOS (starts
 * with "appl_"). Setting VITE_REVENUECAT_IOS_KEY overrides this value.
 */
const IOS_PUBLIC_API_KEY = '';

const resolveApiKey = () => import.meta.env?.VITE_REVENUECAT_IOS_KEY || IOS_PUBLIC_API_KEY;

export const REVENUECAT_CONFIG = {
  apiKey: resolveApiKey(),
  entitlements: {
    pro: 'pro',
    elite: 'elite',
  },
  productIds: {
    elite_monthly: 'tredia_elite_monthly',
    elite_annual: 'tredia_elite_annual',
    pro_monthly: 'tredia_pro_monthly',
    pro_annual: 'tredia_pro_annual',
    // OG100 = elite benefits at $8.99/mo for life, attached to the elite entitlement
    og100_monthly: 'tredia_og100_monthly',
  },
  og100ProductId: 'tredia_og100_monthly',
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

/**
 * The tier a customer is on, from RevenueCat's own answer: active entitlements
 * decide pro/elite, and the OG100 product upgrades elite to 'og100'.
 */
export function resolveTier(activeEntitlements = [], activeSubscriptions = []) {
  const ents = activeEntitlements || [];
  const products = activeSubscriptions || [];
  if (ents.includes(REVENUECAT_CONFIG.entitlements.elite)) {
    return products.includes(REVENUECAT_CONFIG.og100ProductId) ? 'og100' : 'elite';
  }
  if (ents.includes(REVENUECAT_CONFIG.entitlements.pro)) return 'pro';
  return 'free';
}