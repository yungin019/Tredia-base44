import React, { useEffect, useState } from 'react';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import translations from '../locales/translations';
import enExtra from '../locales/en-extra';
import alpacaTranslations from '../locales/alpaca-translations';
import extraTranslations from '../locales/extra-translations';
import coreTranslations from '../locales/core-translations';
import portfolioTranslations from '../locales/portfolio-translations';

// RTL language codes
const RTL_LANGUAGES = ['ar', 'he', 'ur', 'fa', 'yi', 'ji', 'iw', 'ku'];

// All supported languages (union of translations + core)
const ALL_LANGS = Array.from(new Set([
  ...Object.keys(translations),
  ...Object.keys(coreTranslations),
]));

// Build resources from centralized translations object
// core-translations is merged LAST so it wins over stale/partial keys
const buildResources = () => {
  const resources = {};
  ALL_LANGS.forEach(lang => {
    const base = translations[lang]?.translation || {};
    const alpacaKeys = alpacaTranslations[lang] || {};
    const extraKeys = extraTranslations[lang] || {};
    const coreKeys = coreTranslations[lang] || {};
    const portfolioKeys = portfolioTranslations[lang] || {};
    const merged = lang === 'en'
      ? { ...base, ...enExtra, ...alpacaKeys, ...extraKeys, ...coreKeys, ...portfolioKeys }
      : { ...base, ...alpacaKeys, ...extraKeys, ...coreKeys, ...portfolioKeys };
    resources[lang] = { translation: merged };
  });
  return resources;
};

const resources = buildResources();

// Initialize i18n only once globally
if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
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
} else {
  // Already initialized (HMR / re-render) — patch in any new keys.
  ALL_LANGS.forEach(lang => {
    if (resources[lang]) {
      // Also patch in portfolioTranslations on HMR
      const extra = portfolioTranslations[lang] || {};
      i18n.addResourceBundle(lang, 'translation', { ...resources[lang].translation, ...extra }, true, true);
    }
  });
}

export default function Layout({ children, currentPageName }) {
  const [i18nReady, setI18nReady] = useState(i18n.isInitialized);

  useEffect(() => {
    if (!i18n.isInitialized) {
      const checkReady = () => {
        if (i18n.isInitialized) {
          setI18nReady(true);
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    }
  }, []);

  // Ensure language is detected and set in HTML with proper RTL support
  useEffect(() => {
    const currentLng = i18n.language || 'en';
    document.documentElement.lang = currentLng;
    // Check if language is RTL (supports Arabic, Hebrew, Urdu, Persian, etc.)
    const isRTL = RTL_LANGUAGES.some(rtl => currentLng.startsWith(rtl));
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return <>{children}</>;
}