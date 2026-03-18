import React, { useEffect, useState } from 'react';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// Translation resources
const resources = {
  en: {
    translation: {
      nav: {
        feed: "AI Feed",
        markets: "Markets",
        portfolio: "Portfolio",
        trek: "TREK ⚡",
        settings: "Settings"
      },
      dashboard: {
        title: "Market Overview",
        subtitle: "Real-time indices, crypto, and market intelligence"
      },
      markets: {
        title: "Markets",
        subtitle: "Analyze stocks, crypto, forex, and commodities"
      },
      portfolio: {
        title: "Portfolio",
        subtitle: "Your holdings and performance",
        noHoldings: "No holdings yet. Add your first position."
      },
      settings: {
        title: "Settings",
        language: "Language"
      },
      trek: {
        title: "TREK Intelligence",
        live: "LIVE"
      }
    }
  },
  sv: {
    translation: {
      nav: {
        feed: "AI-flöde",
        markets: "Marknader",
        portfolio: "Portfölj",
        trek: "TREK ⚡",
        settings: "Inställningar"
      },
      dashboard: {
        title: "Marknadsöversikt",
        subtitle: "Realtids-index, krypto och marknadsintelligens"
      },
      markets: {
        title: "Marknader",
        subtitle: "Analysera aktier, krypto, forex och råvaror"
      },
      portfolio: {
        title: "Portfölj",
        subtitle: "Dina innehav och prestanda",
        noHoldings: "Inga innehav ännu. Lägg till din första position."
      },
      settings: {
        title: "Inställningar",
        language: "Språk"
      },
      trek: {
        title: "TREK Intelligence",
        live: "LIVE"
      }
    }
  },
  fr: {
    translation: {
      nav: {
        feed: "Flux IA",
        markets: "Marchés",
        portfolio: "Portefeuille",
        trek: "TREK ⚡",
        settings: "Paramètres"
      },
      dashboard: {
        title: "Aperçu du marché",
        subtitle: "Indices en temps réel, crypto et renseignements de marché"
      },
      markets: {
        title: "Marchés",
        subtitle: "Analysez les actions, les cryptos, le forex et les matières premières"
      },
      portfolio: {
        title: "Portefeuille",
        subtitle: "Vos positions et performances",
        noHoldings: "Aucune position pour le moment. Ajoutez votre première position."
      },
      settings: {
        title: "Paramètres",
        language: "Langue"
      },
      trek: {
        title: "Intelligence TREK",
        live: "EN DIRECT"
      }
    }
  },
  ar: {
    translation: {
      nav: {
        feed: "تغذية الذكاء الاصطناعي",
        markets: "الأسواق",
        portfolio: "المحفظة",
        trek: "TREK ⚡",
        settings: "الإعدادات"
      },
      dashboard: {
        title: "نظرة عامة على السوق",
        subtitle: "الرموز والعملات الرقمية والمعلومات الحية"
      },
      markets: {
        title: "الأسواق",
        subtitle: "حلل الأسهم والعملات الرقمية والفوركس والسلع"
      },
      portfolio: {
        title: "المحفظة",
        subtitle: "ممتلكاتك والأداء",
        noHoldings: "لا توجد ممتلكات حتى الآن. أضف موضعك الأول."
      },
      settings: {
        title: "الإعدادات",
        language: "اللغة"
      },
      trek: {
        title: "ذكاء TREK",
        live: "مباشر"
      }
    }
  }
};

// Initialize i18n only once globally
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
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
    })
    .catch(() => {});
}

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

  // Ensure language is detected and set in HTML
  useEffect(() => {
    const currentLng = i18n.language || 'en';
    document.documentElement.lang = currentLng;
    if (currentLng.startsWith('ar')) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  }, [i18n.language]);

  return <>{children}</>;
}