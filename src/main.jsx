import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
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
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  })
  .catch(() => {})

// Set English as the default language
document.documentElement.lang = 'en';

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)