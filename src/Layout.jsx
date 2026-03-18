import React, { useEffect, useState } from 'react';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import translations from '../locales/translations';

// RTL language codes
const RTL_LANGUAGES = ['ar', 'he', 'ur', 'fa', 'yi', 'ji', 'iw', 'ku'];

// Build resources from centralized translations object
const buildResources = () => {
  const resources = {};
  Object.keys(translations).forEach(lang => {
    resources[lang] = {
      translation: translations[lang].translation
    };
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
    })
    .catch(() => {});
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

  // Ensure language is detected and set in HTML
  useEffect(() => {
    const currentLng = i18n.language || 'en';
    document.documentElement.lang = currentLng;
    if (currentLng.startsWith('ar')) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [i18n.language]);

  return <>{children}</>;
}