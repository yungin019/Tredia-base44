import { useMemo } from 'react';

/**
 * useCurrency — local display currency for USD base prices.
 *
 * RevenueCat / App Store prices are defined in USD ($8.99 Pro, $17.99 Elite).
 * The app shows the local equivalent based on the user's language.
 */

const CURRENCY_BY_LANGUAGE = {
  sv: 'SEK', nb: 'NOK', no: 'NOK', da: 'DKK', fi: 'EUR', de: 'EUR', fr: 'EUR',
  es: 'EUR', it: 'EUR', nl: 'EUR', pt: 'EUR', el: 'EUR', ro: 'RON', pl: 'PLN',
  tr: 'TRY', ja: 'JPY', ko: 'KRW', zh: 'CNY', th: 'THB', id: 'IDR', ru: 'RUB',
};

const RATES = {
  USD: 1, SEK: 9.9, NOK: 10.6, DKK: 6.9, EUR: 0.92, GBP: 0.79, PLN: 4, RON: 4.6,
  TRY: 34, JPY: 150, KRW: 1350, CNY: 7.2, THB: 36, IDR: 15800, RUB: 92,
};

const NO_DECIMALS = new Set(['SEK', 'NOK', 'DKK', 'JPY', 'KRW', 'THB', 'IDR', 'RUB']);

export function detectCurrency() {
  let lang = 'en';
  try {
    lang = localStorage.getItem('tredio_lang') || navigator.language || 'en';
  } catch (_) {}
  const base = String(lang).toLowerCase().split('-')[0];
  return CURRENCY_BY_LANGUAGE[base] || 'USD';
}

export function formatPriceUSD(usd, currency = detectCurrency()) {
  const rate = RATES[currency] || 1;
  const value = Number(usd) * rate;
  const digits = NO_DECIMALS.has(currency) ? 0 : 2;
  const rounded = Math.round(value * Math.pow(10, digits)) / Math.pow(10, digits);
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(rounded);
  } catch (_) {
    return `${currency} ${rounded}`;
  }
}

export function useCurrency() {
  return useMemo(() => {
    const currency = detectCurrency();
    return {
      currency,
      formatPrice: (usd) => formatPriceUSD(usd, currency),
    };
  }, []);
}

export default useCurrency;