import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../locales/en.json';
import sv from '../locales/sv.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import de from '../locales/de.json';
import nl from '../locales/nl.json';
import ar from '../locales/ar.json';
import pt from '../locales/pt.json';
import it from '../locales/it.json';
import tr from '../locales/tr.json';
import zh from '../locales/zh.json';
import ja from '../locales/ja.json';
import ko from '../locales/ko.json';
import ru from '../locales/ru.json';
import hi from '../locales/hi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sv: { translation: sv },
      fr: { translation: fr },
      es: { translation: es },
      de: { translation: de },
      nl: { translation: nl },
      ar: { translation: ar },
      pt: { translation: pt },
      it: { translation: it },
      tr: { translation: tr },
      zh: { translation: zh },
      ja: { translation: ja },
      ko: { translation: ko },
      ru: { translation: ru },
      hi: { translation: hi },
    },
    fallbackLng: 'en',
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      cacheUserSelection: 'localStorage',
    },
    interpolation: { escapeValue: false },
  });

export default i18n;