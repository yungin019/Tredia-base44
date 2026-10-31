/**
 * TREDIO pricing — single source of truth for displayed plan prices (USD base).
 *
 * The App Store / RevenueCat product prices must mirror these exactly.
 * Every display value goes through useCurrency().formatPrice(usd).
 */

export const PLAN_PRICES = {
  pro: { monthly: 9.99, annual: 79.99 },
  elite: { monthly: 17.99, annual: 149.99 },
  og100: { monthly: 8.99 },
};

export const TRIAL_DAYS = 7;

/** Whole-percent saving of the annual price vs paying monthly for 12 months. */
export function annualSavingsPct(plan) {
  const p = PLAN_PRICES[plan];
  if (!p?.monthly || !p?.annual) return 0;
  return Math.round((1 - p.annual / (p.monthly * 12)) * 100);
}

/** The largest annual saving across paid plans — used for the toggle badge. */
export const MAX_ANNUAL_SAVING = Math.max(
  annualSavingsPct('pro'),
  annualSavingsPct('elite'),
);

export const FREE_TIER_LIMITS = {
  signalsPerDay: 5,
  chatsPerDay: 3,
};

export const PRO_CHATS_PER_DAY = 30;