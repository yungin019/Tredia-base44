import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import translations from '../locales/translations';

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
        order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
        lookupQuerystring: 'lang',
        lookupLocalStorage: 'tredia_language',
        caches: ['localStorage'],
      },
    });
}

export default i18n;