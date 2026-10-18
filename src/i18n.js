import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// English is the fallback — always loaded statically
import en from './locales/en.js';

const loadedLangs = new Set(['en']);

// Initialize with English only — other languages are lazy-loaded
if (!i18n.isInitialized) {
  const savedLang = typeof localStorage !== 'undefined' ? localStorage.getItem('tredio_lang') : null;

  i18n
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en } },
      lng: 'en',
      fallbackLng: 'en',
      keySeparator: false,
      interpolation: { escapeValue: false },
      react: {
        useSuspense: false,
        bindI18n: 'languageChanged loaded',
        bindI18nStore: 'added removed',
        transEmptyNodeValue: '',
      },
    })
    .catch(() => {});

  // Load saved language on startup if different from English
  if (savedLang && savedLang !== 'en') {
    loadLanguage(savedLang).catch(() => {});
  }
}

/**
 * Load a language on demand — dynamically imports the language chunk.
 * Call this instead of i18n.changeLanguage() so resources are loaded first.
 */
export async function loadLanguage(lang) {
  if (!lang || lang === 'en') {
    return i18n.changeLanguage('en');
  }
  if (loadedLangs.has(lang)) {
    return i18n.changeLanguage(lang);
  }
  try {
    const mod = await import(`./locales/${lang}.js`);
    i18n.addResourceBundle(lang, 'translation', mod.default, true, true);
    loadedLangs.add(lang);
    return i18n.changeLanguage(lang);
  } catch (e) {
    console.warn(`[i18n] Failed to load language "${lang}", falling back to English`);
    return i18n.changeLanguage('en');
  }
}

export default i18n;