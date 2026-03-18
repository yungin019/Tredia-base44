import React, { useEffect, useState } from 'react';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

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
        subtitle: "Your holdings and performance"
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
        subtitle: "Dina innehav och prestanda"
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
        subtitle: "Vos positions et performances"
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
        subtitle: "ممتلكاتك والأداء"
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

// Initialize i18n once
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
    });
}

export default function AppWrapper({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (i18n.isInitialized) {
      setReady(true);
    }
  }, []);

  return ready ? children : null;
}