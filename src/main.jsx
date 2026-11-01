import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n' // Import the singleton
import { installErrorReporter } from '@/lib/errorReporter'

// Crash + failed-request capture for web and the packaged iOS app
installErrorReporter()

ReactDOM.createRoot(document.getElementById('root')).render(
  <I18nextProvider i18n={i18n}>
    <App />
  </I18nextProvider>
)