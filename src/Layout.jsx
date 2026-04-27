import React, { useEffect, useState } from 'react';
import i18n from 'i18next';

const RTL_LANGUAGES = ['ar', 'he', 'ur', 'fa', 'yi', 'ji', 'iw', 'ku'];

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

  // Ensure language is detected and set in HTML with proper RTL support
  useEffect(() => {
    const currentLng = i18n.language || 'en';
    document.documentElement.lang = currentLng;
    // Check if language is RTL (supports Arabic, Hebrew, Urdu, Persian, etc.)
    const isRTL = RTL_LANGUAGES.some(rtl => currentLng.startsWith(rtl));
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
  }, [i18n.language]);

  return <>{children}</>;
}