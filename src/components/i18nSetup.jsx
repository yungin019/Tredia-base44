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
        subtitle: "Real-time indices, crypto, and market intelligence",
        portfolioValue: "Portfolio Value",
        dayReturn: "Day Return",
        totalReturn: "Total Return",
        balance: "Balance"
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
      trade: {
        title: "Paper Trading",
        balance: "Available Balance"
      },
      settings: {
        title: "Settings",
        profile: "Profile",
        account: "Account",
        notifications: "Notifications",
        brokers: "Brokers",
        tier: "Account Tier",
        language: "Language",
        logout: "Logout"
      },
      trek: {
        title: "TREK Intelligence",
        bullish: "BULLISH SIGNAL",
        bearish: "BEARISH SIGNAL",
        alert: "CATALYST ALERT",
        hedge: "HEDGE SIGNAL",
        confidence: "Confidence",
        live: "LIVE"
      },
      common: {
        loading: "Loading...",
        error: "Something went wrong"
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
        subtitle: "Realtids-index, krypto och marknadsintelligens",
        portfolioValue: "Portföljvärde",
        dayReturn: "Dagens avkastning",
        totalReturn: "Total avkastning",
        balance: "Saldo"
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
      trade: {
        title: "Pappersblandning",
        balance: "Tillgängligt saldo"
      },
      settings: {
        title: "Inställningar",
        profile: "Profil",
        account: "Konto",
        notifications: "Aviseringar",
        brokers: "Mäklare",
        tier: "Kontokategori",
        language: "Språk",
        logout: "Logga ut"
      },
      trek: {
        title: "TREK Intelligence",
        bullish: "HAUSSEARTAD SIGNAL",
        bearish: "BAISSEARTAD SIGNAL",
        alert: "KATALYSATORAVISERING",
        hedge: "SÄKRINGSSIGNAL",
        confidence: "Säkerhet",
        live: "LIVE"
      },
      common: {
        loading: "Laddar...",
        error: "Något gick fel"
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
        subtitle: "Indices en temps réel, crypto et renseignements de marché",
        portfolioValue: "Valeur du portefeuille",
        dayReturn: "Rendement du jour",
        totalReturn: "Rendement total",
        balance: "Solde"
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
      trade: {
        title: "Trading sur papier",
        balance: "Solde disponible"
      },
      settings: {
        title: "Paramètres",
        profile: "Profil",
        account: "Compte",
        notifications: "Notifications",
        brokers: "Courtiers",
        tier: "Niveau de compte",
        language: "Langue",
        logout: "Déconnexion"
      },
      trek: {
        title: "Intelligence TREK",
        bullish: "SIGNAL HAUSSIER",
        bearish: "SIGNAL BAISSIER",
        alert: "ALERTE CATALYSEUR",
        hedge: "SIGNAL DE COUVERTURE",
        confidence: "Confiance",
        live: "EN DIRECT"
      },
      common: {
        loading: "Chargement...",
        error: "Une erreur s'est produite"
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
        subtitle: "الرموز والعملات الرقمية والمعلومات الحية",
        portfolioValue: "قيمة المحفظة",
        dayReturn: "العائد اليومي",
        totalReturn: "العائد الإجمالي",
        balance: "الرصيد"
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
      trade: {
        title: "التداول الورقي",
        balance: "الرصيد المتاح"
      },
      settings: {
        title: "الإعدادات",
        profile: "الملف الشخصي",
        account: "الحساب",
        notifications: "الإخطارات",
        brokers: "الوسطاء",
        tier: "مستوى الحساب",
        language: "اللغة",
        logout: "تسجيل الخروج"
      },
      trek: {
        title: "ذكاء TREK",
        bullish: "إشارة صعودية",
        bearish: "إشارة هبوطية",
        alert: "تنبيه المحفز",
        hedge: "إشارة التحوط",
        confidence: "الثقة",
        live: "مباشر"
      },
      common: {
        loading: "جاري التحميل...",
        error: "حدث خطأ ما"
      }
    }
  }
};

if (!i18n.isInitialized) {
  i18n
    .use(require('i18next-browser-languagedetector').default)
    .use(require('react-i18next').initReactI18next)
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

export default i18n;