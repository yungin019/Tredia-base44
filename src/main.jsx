import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Set English as the default language
document.documentElement.lang = 'en';

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)