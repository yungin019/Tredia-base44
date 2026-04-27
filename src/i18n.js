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
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      keySeparator: false,
      interpolation: {
        escapeValue: false,
      },
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
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