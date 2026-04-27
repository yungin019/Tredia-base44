import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import translations from '../locales/translations';
import enExtra from '../locales/en-extra';
import alpacaTranslations from '../locales/alpaca-translations';
import extraTranslations from '../locales/extra-translations';
import coreTranslations from '../locales/core-translations';
import portfolioTranslations from '../locales/portfolio-translations';
import deTranslations from '../locales/de-translations';
import ptTranslations from '../locales/pt-translations';
import tradersTranslations, { alpacaConnectorTranslations } from '../locales/traders-translations';

const ALL_LANGS = ['en', 'sv', 'fr', 'de', 'it', 'es', 'pt', 'ar'];

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

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      keySeparator: false, // Translations use flat keys like "alpaca.unlockRealTrading"
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
  
  // Debug: Log resource bundles for all languages
  if (import.meta.env.MODE === 'development') {
    console.log('\n========== i18n RESOURCE BUNDLE DIAGNOSIS ==========');
    ['sv', 'fr'].forEach(lang => {
      const bundle = i18n.getResourceBundle(lang, 'translation');
      const allKeys = Object.keys(bundle);
      console.log(`\n🌐 ${lang.toUpperCase()} Bundle: ${allKeys.length} total keys`);
      
      // Check for specific keys
      const testKeys = [
        'settings.trading',
        'alpaca.unlockRealTrading',
        'alpaca.connectDesc',
        'settings.connectedAccounts',
        'settings.priceAlertsDesc',
        'alpaca.feat1',
        'alpaca.connectAlpacaFree'
      ];
      
      testKeys.forEach(key => {
        const value = bundle[key];
        if (value) {
          console.log(`  ✓ ${key}: "${value.substring(0, 50)}..."`);
        } else {
          console.warn(`  ✗ MISSING: ${key}`);
        }
      });
      
      // Show sample of keys that DO exist
      const sampleKeys = allKeys.filter(k => k.includes('settings') || k.includes('alpaca')).slice(0, 10);
      console.log(`  Sample keys found: ${sampleKeys.join(', ')}`);
    });
    console.log('\n===========================================\n');
  }
}

export default i18n;