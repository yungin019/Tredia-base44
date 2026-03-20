import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next, I18nextProvider } from 'react-i18next'
import translations from '@/locales/translations'

// Initialize i18n before rendering
const buildResources = () => {
  const resources = {}
  Object.keys(translations).forEach(lang => {
    resources[lang] = { translation: translations[lang].translation }
  })
  return resources
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: buildResources(),
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'tredia_language',
      caches: ['localStorage'],
    },
  })
  .catch(() => {})

i18n.changeLanguage('en')

ReactDOM.createRoot(document.getElementById('root')).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
)