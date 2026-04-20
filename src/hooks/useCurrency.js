import { useTranslation } from 'react-i18next';

const CURRENCY_MAP = {
  sv: { code: 'SEK', symbol: 'kr', locale: 'sv-SE', rate: 10.5 },
  en: { code: 'USD', symbol: '$', locale: 'en-US', rate: 1 },
  fr: { code: 'EUR', symbol: '€', locale: 'fr-FR', rate: 0.92 },
  de: { code: 'EUR', symbol: '€', locale: 'de-DE', rate: 0.92 },
  es: { code: 'EUR', symbol: '€', locale: 'es-ES', rate: 0.92 },
  ar: { code: 'USD', symbol: '$', locale: 'en-US', rate: 1 },
  pt: { code: 'BRL', symbol: 'R$', locale: 'pt-BR', rate: 5.0 },
  no: { code: 'NOK', symbol: 'kr', locale: 'nb-NO', rate: 10.8 },
  da: { code: 'DKK', symbol: 'kr', locale: 'da-DK', rate: 7.0 },
  fi: { code: 'EUR', symbol: '€', locale: 'fi-FI', rate: 0.92 },
  nl: { code: 'EUR', symbol: '€', locale: 'nl-NL', rate: 0.92 },
  it: { code: 'EUR', symbol: '€', locale: 'it-IT', rate: 0.92 },
  pl: { code: 'PLN', symbol: 'zł', locale: 'pl-PL', rate: 4.0 },
  tr: { code: 'USD', symbol: '$', locale: 'en-US', rate: 1 },
  ja: { code: 'JPY', symbol: '¥', locale: 'ja-JP', rate: 150 },
  zh: { code: 'CNY', symbol: '¥', locale: 'zh-CN', rate: 7.2 },
  ko: { code: 'KRW', symbol: '₩', locale: 'ko-KR', rate: 1350 },
  ru: { code: 'USD', symbol: '$', locale: 'en-US', rate: 1 },
  hi: { code: 'INR', symbol: '₹', locale: 'hi-IN', rate: 83 },
  th: { code: 'USD', symbol: '$', locale: 'en-US', rate: 1 },
};

export function useCurrency() {
  const { i18n } = useTranslation();
  const lang = (i18n.language || 'en').split('-')[0].toLowerCase();
  const config = CURRENCY_MAP[lang] || CURRENCY_MAP['en'];

  const format = (amountUSD) => {
    const converted = amountUSD * config.rate;
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: config.code === 'JPY' || config.code === 'KRW' ? 0 : 2,
        maximumFractionDigits: config.code === 'JPY' || config.code === 'KRW' ? 0 : 2,
      }).format(converted);
    } catch {
      return `${config.symbol}${converted.toFixed(2)}`;
    }
  };

  // Format a raw number (already in local currency, no conversion)
  const formatLocal = (amount) => {
    try {
      return new Intl.NumberFormat(config.locale, {
        style: 'currency',
        currency: config.code,
        minimumFractionDigits: config.code === 'JPY' || config.code === 'KRW' ? 0 : 2,
        maximumFractionDigits: config.code === 'JPY' || config.code === 'KRW' ? 0 : 2,
      }).format(amount);
    } catch {
      return `${config.symbol}${Number(amount).toFixed(2)}`;
    }
  };

  return {
    code: config.code,
    symbol: config.symbol,
    locale: config.locale,
    rate: config.rate,
    format,        // converts from USD
    formatLocal,   // formats already-local amount
  };
}