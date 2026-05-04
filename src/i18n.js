import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import translations from './locales/translations';
import enExtra from './locales/en-extra';
import alpacaTranslations from './locales/alpaca-translations';
import extraTranslations from './locales/extra-translations';
import coreTranslations from './locales/core-translations';
import portfolioTranslations from './locales/portfolio-translations';
import deTranslations from './locales/de-translations';
import ptTranslations from './locales/pt-translations';
import tradersTranslations, { alpacaConnectorTranslations } from './locales/traders-translations';

const ALL_LANGS = ['en', 'sv', 'fr', 'de', 'it', 'es', 'pt', 'ar', 'ja', 'zh', 'ko', 'ru', 'tr', 'nl', 'pl', 'th', 'id', 'ro', 'el'];

const buildResources = () => {
  const resources = {};
  ALL_LANGS.forEach(lang => {
    const base = translations[lang]?.translation || {};
    const coreKeys = coreTranslations[lang] || {};
    const portfolioKeys = portfolioTranslations[lang] || {};
    const deKeys = deTranslations[lang] || {};
    const ptKeys = ptTranslations[lang] || {};
    const tradersKeys = tradersTranslations[lang] || {};
    const alpacaConnectorKeys = alpacaConnectorTranslations[lang] || {};
    const alpacaKeys = alpacaTranslations[lang] || {};
    const extraKeys = extraTranslations[lang] || {};
    
    const merged = lang === 'en'
      ? { ...base, ...enExtra, ...coreKeys, ...portfolioKeys, ...deKeys, ...ptKeys, ...tradersKeys, ...alpacaConnectorKeys, ...alpacaKeys, ...extraKeys }
      : { ...base, ...coreKeys, ...portfolioKeys, ...deKeys, ...ptKeys, ...tradersKeys, ...alpacaConnectorKeys, ...alpacaKeys, ...extraKeys };
    
    resources[lang] = { translation: merged };
  });
  return resources;
};

const resources = buildResources();

// Initialize ONLY ONCE
if (!i18n.isInitialized) {
  // Force English as default unless the user has explicitly saved a language preference.
  // We do NOT auto-detect from the device locale — prevents Swedish/other device languages
  // from showing up for App Store reviewers and new users.
  const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('tredio_lang') : null;
  const defaultLng = savedLang || 'en';

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: defaultLng,
      fallbackLng: 'en',
      keySeparator: false,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
        transEmptyNodeValue: '',
      },
    })
    .catch(() => {});
}

export default i18n;