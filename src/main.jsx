import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import './lib/i18n';

// Set initial RTL direction based on stored language
const storedLang = localStorage.getItem('i18nextLng')?.slice(0, 2);
if (storedLang === 'ar') {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'ar';
} else if (storedLang) {
  document.documentElement.lang = storedLang;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)