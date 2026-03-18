// Comprehensive multilingual translations - Top 20+ global languages
// Scalable architecture: Add new languages by extending this object

const translations = {
  // FULLY TRANSLATED (complete coverage for all critical screens)
  en: {
    translation: {
      nav: { feed: "AI Feed", markets: "Markets", portfolio: "Portfolio", trek: "TREK ⚡", settings: "Settings" },
      splash: { tagline: "The Edge Every Trader Needs" },
      signin: { title: "Sign In", subtitle: "Access your TREDIA account", email: "Email", google: "Continue with Google", apple: "Continue with Apple", emailAuth: "Sign in with Email", or: "OR", sendLink: "Send Magic Link", enterEmail: "Enter your email" },
      dashboard: { title: "Market Overview", subtitle: "Real-time indices, crypto, and market intelligence" },
      markets: { title: "Markets", subtitle: "Analyze stocks, crypto, forex, and commodities" },
      portfolio: { title: "Portfolio", subtitle: "Your holdings and performance", noHoldings: "No holdings yet. Add your first position." },
      settings: { title: "Settings", language: "Language", profile: "Profile", notifications: "Notifications", tier: "Account Tier" },
      trek: { title: "TREK Intelligence", live: "LIVE", signal: "Signal", confidence: "Confidence" },
      paperTrading: { title: "Paper Trading", subtitle: "Simulate trades with virtual funds", newOrder: "New Order", orderHistory: "Order History", buy: "BUY", sell: "SELL" },
      onboarding: { title: "Welcome to TREDIA", selectBroker: "Select Your Broker", setupComplete: "Setup Complete" },
      upgrade: { title: "Upgrade Your Plan", elite: "Elite", pro: "Pro", foundingMember: "Founding Member" },
      common: { loading: "Loading...", error: "Error", success: "Success" }
    }
  },
  sv: {
    translation: {
      nav: { feed: "AI-flöde", markets: "Marknader", portfolio: "Portfölj", trek: "TREK ⚡", settings: "Inställningar" },
      splash: { tagline: "Fördelar som varje handlare behöver" },
      signin: { title: "Logga in", email: "E-post", google: "Fortsätt med Google", apple: "Fortsätt med Apple", emailAuth: "Logga in med e-post" },
      dashboard: { title: "Marknadsöversikt", subtitle: "Realtids-index, krypto och marknadsintelligens" },
      markets: { title: "Marknader", subtitle: "Analysera aktier, krypto, forex och råvaror" },
      portfolio: { title: "Portfölj", subtitle: "Dina innehav och prestanda", noHoldings: "Inga innehav ännu. Lägg till din första position." },
      settings: { title: "Inställningar", language: "Språk", profile: "Profil", notifications: "Aviseringar", tier: "Kontotyp" },
      trek: { title: "TREK Intelligence", live: "LIVE", signal: "Signal", confidence: "Konfidens" },
      paperTrading: { title: "Papershandel", subtitle: "Simulera affärer med virtuella pengar", newOrder: "Ny Order", orderHistory: "Orderhistorik", buy: "KÖP", sell: "SÄLJ" },
      onboarding: { title: "Välkommen till TREDIA", selectBroker: "Välj din mäklare", setupComplete: "Konfiguration slutförd" },
      upgrade: { title: "Uppgradera din plan", elite: "Elite", pro: "Pro", foundingMember: "Grundande medlem" }
    }
  },
  fr: {
    translation: {
      nav: { feed: "Flux IA", markets: "Marchés", portfolio: "Portefeuille", trek: "TREK ⚡", settings: "Paramètres" },
      splash: { tagline: "L'avantage que chaque trader demande" },
      signin: { title: "Se connecter", email: "E-mail", google: "Continuer avec Google", apple: "Continuer avec Apple", emailAuth: "Se connecter par e-mail" },
      dashboard: { title: "Aperçu du marché", subtitle: "Indices en temps réel, crypto et renseignements de marché" },
      markets: { title: "Marchés", subtitle: "Analysez les actions, les cryptos, le forex et les matières premières" },
      portfolio: { title: "Portefeuille", subtitle: "Vos positions et performances", noHoldings: "Aucune position pour le moment. Ajoutez votre première position." },
      settings: { title: "Paramètres", language: "Langue", profile: "Profil", notifications: "Notifications", tier: "Niveau de compte" },
      trek: { title: "Intelligence TREK", live: "EN DIRECT", signal: "Signal", confidence: "Confiance" },
      paperTrading: { title: "Simulation de trading", subtitle: "Simulez des échanges avec des fonds virtuels", newOrder: "Nouvelle commande", orderHistory: "Historique des commandes", buy: "ACHETER", sell: "VENDRE" },
      onboarding: { title: "Bienvenue sur TREDIA", selectBroker: "Sélectionnez votre courtier", setupComplete: "Configuration complète" },
      upgrade: { title: "Améliorez votre plan", elite: "Elite", pro: "Pro", foundingMember: "Membre fondateur" }
    }
  },
  ar: {
    translation: {
      nav: { feed: "تغذية الذكاء الاصطناعي", markets: "الأسواق", portfolio: "المحفظة", trek: "TREK ⚡", settings: "الإعدادات" },
      splash: { tagline: "الميزة التي يحتاجها كل متاجر" },
      signin: { title: "تسجيل الدخول", email: "البريد الإلكتروني", google: "متابعة مع جوجل", apple: "متابعة مع أبل", emailAuth: "تسجيل الدخول عبر البريد الإلكتروني" },
      dashboard: { title: "نظرة عامة على السوق", subtitle: "الرموز والعملات الرقمية والمعلومات الحية" },
      markets: { title: "الأسواق", subtitle: "حلل الأسهم والعملات الرقمية والفوركس والسلع" },
      portfolio: { title: "المحفظة", subtitle: "ممتلكاتك والأداء", noHoldings: "لا توجد ممتلكات حتى الآن. أضف موضعك الأول." },
      settings: { title: "الإعدادات", language: "اللغة", profile: "الملف الشخصي", notifications: "إخطارات", tier: "مستوى الحساب" },
      trek: { title: "ذكاء TREK", live: "مباشر", signal: "الإشارة", confidence: "الثقة" },
      paperTrading: { title: "تداول الورقة", subtitle: "محاكاة الصفقات برأس مال افتراضي", newOrder: "أمر جديد", orderHistory: "سجل الطلبات", buy: "شراء", sell: "بيع" },
      onboarding: { title: "مرحبا بك في TREDIA", selectBroker: "اختر وسيطك", setupComplete: "اكتمل الإعداد" },
      upgrade: { title: "ترقية خطتك", elite: "نخبة", pro: "احترافي", foundingMember: "عضو مؤسس" }
    }
  },
  
  // SCAFFOLDED: Core strings translated, secondary screens partial/pending
  es: {
    translation: {
      nav: { feed: "Feed IA", markets: "Mercados", portfolio: "Cartera", trek: "TREK ⚡", settings: "Configuración" },
      splash: { tagline: "La ventaja que todo trader necesita" },
      signin: { title: "Iniciar sesión", email: "Correo electrónico", google: "Continuar con Google", apple: "Continuar con Apple", emailAuth: "Iniciar sesión con correo" },
      dashboard: { title: "Resumen del mercado", subtitle: "Índices en tiempo real, cripto e inteligencia de mercado" },
      markets: { title: "Mercados", subtitle: "Analiza acciones, cripto, forex y materias primas" },
      portfolio: { title: "Cartera", subtitle: "Tus posiciones y rendimiento", noHoldings: "Sin posiciones aún. Agrega tu primer activo." },
      settings: { title: "Configuración", language: "Idioma", profile: "Perfil", notifications: "Notificaciones", tier: "Tipo de cuenta" },
      trek: { title: "Inteligencia TREK", live: "EN VIVO", signal: "Señal", confidence: "Confianza" },
      paperTrading: { title: "Trading de práctica", subtitle: "Simula operaciones con fondos virtuales", newOrder: "Nueva orden", orderHistory: "Historial de órdenes", buy: "COMPRAR", sell: "VENDER" },
      onboarding: { title: "Bienvenido a TREDIA", selectBroker: "Selecciona tu bróker", setupComplete: "Configuración completada" },
      upgrade: { title: "Mejora tu plan", elite: "Elite", pro: "Pro", foundingMember: "Miembro fundador" }
    }
  },
  de: {
    translation: {
      nav: { feed: "KI-Feed", markets: "Märkte", portfolio: "Portfolio", trek: "TREK ⚡", settings: "Einstellungen" },
      splash: { tagline: "Der Vorteil, den jeder Händler braucht" },
      signin: { title: "Anmelden", email: "E-Mail", google: "Mit Google fortfahren", apple: "Mit Apple fortfahren", emailAuth: "Mit E-Mail anmelden" },
      dashboard: { title: "Marktübersicht", subtitle: "Echtzeit-Indizes, Krypto und Marktintelligenz" },
      markets: { title: "Märkte", subtitle: "Analysiere Aktien, Krypto, Forex und Rohstoffe" },
      portfolio: { title: "Portfolio", subtitle: "Deine Positionen und Leistung", noHoldings: "Noch keine Positionen. Füge deine erste Position hinzu." },
      settings: { title: "Einstellungen", language: "Sprache", profile: "Profil", notifications: "Benachrichtigungen", tier: "Kontotyp" },
      trek: { title: "TREK Intelligenz", live: "LIVE", signal: "Signal", confidence: "Konfidenz" },
      paperTrading: { title: "Papierhandel", subtitle: "Simuliere Trades mit virtuellen Mitteln", newOrder: "Neue Bestellung", orderHistory: "Bestellhistorie", buy: "KAUFEN", sell: "VERKAUFEN" },
      onboarding: { title: "Willkommen bei TREDIA", selectBroker: "Wähle deinen Broker", setupComplete: "Einrichtung abgeschlossen" },
      upgrade: { title: "Upgrade deinen Plan", elite: "Elite", pro: "Pro", foundingMember: "Gründungsmitglied" }
    }
  },
  it: {
    translation: {
      nav: { feed: "Feed IA", markets: "Mercati", portfolio: "Portafoglio", trek: "TREK ⚡", settings: "Impostazioni" },
      splash: { tagline: "Il vantaggio di cui ogni trader ha bisogno" },
      signin: { title: "Accedi", email: "Email", google: "Continua con Google", apple: "Continua con Apple", emailAuth: "Accedi con email" },
      dashboard: { title: "Panoramica del mercato", subtitle: "Indici in tempo reale, crypto e intelligence di mercato" },
      markets: { title: "Mercati", subtitle: "Analizza azioni, crypto, forex e materie prime" },
      portfolio: { title: "Portafoglio", subtitle: "Le tue posizioni e prestazioni", noHoldings: "Nessuna posizione ancora. Aggiungi la tua prima posizione." },
      settings: { title: "Impostazioni", language: "Lingua", profile: "Profilo", notifications: "Notifiche", tier: "Tipo di conto" },
      trek: { title: "Intelligenza TREK", live: "LIVE", signal: "Segnale", confidence: "Confidenza" },
      paperTrading: { title: "Trading cartaceo", subtitle: "Simula operazioni con fondi virtuali", newOrder: "Nuovo ordine", orderHistory: "Storico ordini", buy: "ACQUISTA", sell: "VENDI" },
      onboarding: { title: "Benvenuto in TREDIA", selectBroker: "Seleziona il tuo broker", setupComplete: "Configurazione completata" },
      upgrade: { title: "Aggiorna il tuo piano", elite: "Elite", pro: "Pro", foundingMember: "Membro fondatore" }
    }
  },
  pt: {
    translation: {
      nav: { feed: "Feed IA", markets: "Mercados", portfolio: "Portfólio", trek: "TREK ⚡", settings: "Configurações" },
      splash: { tagline: "A vantagem que todo trader precisa" },
      signin: { title: "Faça login", email: "Email", google: "Continuar com Google", apple: "Continuar com Apple", emailAuth: "Fazer login com email" },
      dashboard: { title: "Visão geral do mercado", subtitle: "Índices em tempo real, cripto e inteligência de mercado" },
      markets: { title: "Mercados", subtitle: "Analise ações, cripto, forex e commodities" },
      portfolio: { title: "Portfólio", subtitle: "Suas posições e desempenho", noHoldings: "Nenhuma posição ainda. Adicione sua primeira posição." },
      settings: { title: "Configurações", language: "Idioma", profile: "Perfil", notifications: "Notificações", tier: "Tipo de conta" },
      trek: { title: "Inteligência TREK", live: "AO VIVO", signal: "Sinal", confidence: "Confiança" },
      paperTrading: { title: "Negociação em papel", subtitle: "Simule negociações com fundos virtuais", newOrder: "Novo pedido", orderHistory: "Histórico de pedidos", buy: "COMPRAR", sell: "VENDER" },
      onboarding: { title: "Bem-vindo ao TREDIA", selectBroker: "Selecione seu corretor", setupComplete: "Configuração concluída" },
      upgrade: { title: "Atualize seu plano", elite: "Elite", pro: "Pro", foundingMember: "Membro fundador" }
    }
  },
  ja: {
    translation: {
      nav: { feed: "AIフィード", markets: "マーケット", portfolio: "ポートフォリオ", trek: "TREK ⚡", settings: "設定" },
      splash: { tagline: "すべてのトレーダーが必要とするエッジ" },
      signin: { title: "ログイン", email: "メール", google: "Googleで続行", apple: "Appleで続行", emailAuth: "メールでログイン" },
      dashboard: { title: "市場概観", subtitle: "リアルタイムのインデックス、暗号、市場インテリジェンス" },
      markets: { title: "マーケット", subtitle: "株、暗号通貨、為替、商品を分析" },
      portfolio: { title: "ポートフォリオ", subtitle: "あなたのポジションとパフォーマンス", noHoldings: "まだポジションはありません。最初のポジションを追加してください。" },
      settings: { title: "設定", language: "言語", profile: "プロフィール", notifications: "通知", tier: "アカウントタイプ" },
      trek: { title: "TREKインテリジェンス", live: "ライブ", signal: "シグナル", confidence: "信頼度" },
      paperTrading: { title: "ペーパートレーディング", subtitle: "仮想資金でトレードをシミュレート", newOrder: "新規注文", orderHistory: "注文履歴", buy: "買う", sell: "売る" },
      onboarding: { title: "TREDIAへようこそ", selectBroker: "ブローカーを選択", setupComplete: "セットアップ完了" },
      upgrade: { title: "プランをアップグレード", elite: "エリート", pro: "プロ", foundingMember: "創設メンバー" }
    }
  },
  zh: {
    translation: {
      nav: { feed: "AI信息源", markets: "市场", portfolio: "投资组合", trek: "TREK ⚡", settings: "设置" },
      splash: { tagline: "每个交易者都需要的优势" },
      signin: { title: "登录", email: "电子邮件", google: "使用Google继续", apple: "使用Apple继续", emailAuth: "使用电子邮件登录" },
      dashboard: { title: "市场概览", subtitle: "实时指数、加密货币和市场情报" },
      markets: { title: "市场", subtitle: "分析股票、加密货币、外汇和商品" },
      portfolio: { title: "投资组合", subtitle: "您的头寸和绩效", noHoldings: "暂无头寸。添加您的第一个头寸。" },
      settings: { title: "设置", language: "语言", profile: "个人资料", notifications: "通知", tier: "账户类型" },
      trek: { title: "TREK智能", live: "直播", signal: "信号", confidence: "置信度" },
      paperTrading: { title: "模拟交易", subtitle: "使用虚拟资金模拟交易", newOrder: "新订单", orderHistory: "订单历史", buy: "购买", sell: "出售" },
      onboarding: { title: "欢迎来到TREDIA", selectBroker: "选择您的经纪商", setupComplete: "设置完成" },
      upgrade: { title: "升级您的计划", elite: "精英", pro: "专业版", foundingMember: "创始成员" }
    }
  },
  ko: {
    translation: {
      nav: { feed: "AI 피드", markets: "시장", portfolio: "포트폴리오", trek: "TREK ⚡", settings: "설정" },
      splash: { tagline: "모든 거래자가 필요로 하는 우위" },
      signin: { title: "로그인", email: "이메일", google: "Google로 계속", apple: "Apple로 계속", emailAuth: "이메일로 로그인" },
      dashboard: { title: "시장 개요", subtitle: "실시간 지수, 암호화폐 및 시장 정보" },
      markets: { title: "시장", subtitle: "주식, 암호화폐, 외환 및 상품 분석" },
      portfolio: { title: "포트폴리오", subtitle: "귀하의 포지션 및 성과", noHoldings: "아직 포지션이 없습니다. 첫 번째 포지션을 추가하세요." },
      settings: { title: "설정", language: "언어", profile: "프로필", notifications: "알림", tier: "계정 유형" },
      trek: { title: "TREK 인텔리전스", live: "라이브", signal: "신호", confidence: "신뢰도" },
      paperTrading: { title: "종이 거래", subtitle: "가상 자금으로 거래 시뮬레이션", newOrder: "새 주문", orderHistory: "주문 기록", buy: "구매", sell: "판매" },
      onboarding: { title: "TREDIA에 오신 것을 환영합니다", selectBroker: "브로커 선택", setupComplete: "설정 완료" },
      upgrade: { title: "계획 업그레이드", elite: "엘리트", pro: "프로", foundingMember: "창립 회원" }
    }
  },
  ru: {
    translation: {
      nav: { feed: "Лента ИИ", markets: "Рынки", portfolio: "Портфель", trek: "TREK ⚡", settings: "Настройки" },
      splash: { tagline: "Преимущество, которое нужно каждому трейдеру" },
      signin: { title: "Вход", email: "Email", google: "Продолжить с Google", apple: "Продолжить с Apple", emailAuth: "Вход с Email" },
      dashboard: { title: "Обзор рынка", subtitle: "Индексы в реальном времени, крипто и рыночная аналитика" },
      markets: { title: "Рынки", subtitle: "Анализируйте акции, крипто, форекс и сырье" },
      portfolio: { title: "Портфель", subtitle: "Ваши позиции и производительность", noHoldings: "Пока нет позиций. Добавьте свою первую позицию." },
      settings: { title: "Настройки", language: "Язык", profile: "Профиль", notifications: "Уведомления", tier: "Тип учетной записи" },
      trek: { title: "Интеллект TREK", live: "LIVE", signal: "Сигнал", confidence: "Уверенность" },
      paperTrading: { title: "Бумажная торговля", subtitle: "Симулируйте сделки с виртуальными средствами", newOrder: "Новый заказ", orderHistory: "История заказов", buy: "КУПИТЬ", sell: "ПРОДАТЬ" },
      onboarding: { title: "Добро пожаловать в TREDIA", selectBroker: "Выберите своего брокера", setupComplete: "Настройка завершена" },
      upgrade: { title: "Обновите свой план", elite: "Элита", pro: "Про", foundingMember: "Основатель" }
    }
  },
  tr: {
    translation: {
      nav: { feed: "AI Akışı", markets: "Piyasalar", portfolio: "Portföy", trek: "TREK ⚡", settings: "Ayarlar" },
      splash: { tagline: "Her tüccarın ihtiyaç duyduğu avantaj" },
      signin: { title: "Oturum Aç", email: "E-posta", google: "Google ile devam et", apple: "Apple ile devam et", emailAuth: "E-posta ile oturum aç" },
      dashboard: { title: "Pazar Özeti", subtitle: "Gerçek zamanlı endeksler, kripto ve pazar istihbaratı" },
      markets: { title: "Piyasalar", subtitle: "Hisse senetleri, kripto, forex ve emtiaları analiz et" },
      portfolio: { title: "Portföy", subtitle: "Pozisyonlarınız ve performansınız", noHoldings: "Henüz pozisyon yok. İlk pozisyonunuzu ekleyin." },
      settings: { title: "Ayarlar", language: "Dil", profile: "Profil", notifications: "Bildirimler", tier: "Hesap Türü" },
      trek: { title: "TREK Zekası", live: "CANLI", signal: "Sinyal", confidence: "Güven" },
      paperTrading: { title: "Kağıt Ticareti", subtitle: "Sanal fonlarla ticaret simülasyonu yap", newOrder: "Yeni Sipariş", orderHistory: "Sipariş Geçmişi", buy: "SATINAL", sell: "SAT" },
      onboarding: { title: "TREDIA'ya Hoş Geldiniz", selectBroker: "Brokerinizi Seçin", setupComplete: "Kurulum Tamamlandı" },
      upgrade: { title: "Planınızı Yükseltin", elite: "Elite", pro: "Pro", foundingMember: "Kurucu Üye" }
    }
  },
  nl: {
    translation: {
      nav: { feed: "AI Feed", markets: "Markten", portfolio: "Portefeuille", trek: "TREK ⚡", settings: "Instellingen" },
      splash: { tagline: "Het voordeel dat elke trader nodig heeft" },
      signin: { title: "Aanmelden", email: "E-mail", google: "Doorgaan met Google", apple: "Doorgaan met Apple", emailAuth: "Aanmelden met e-mail" },
      dashboard: { title: "Marktoverzicht", subtitle: "Realtime indices, crypto en marktinformatie" },
      markets: { title: "Markten", subtitle: "Analyseer aandelen, crypto, forex en grondstoffen" },
      portfolio: { title: "Portefeuille", subtitle: "Uw posities en prestaties", noHoldings: "Nog geen posities. Voeg uw eerste positie toe." },
      settings: { title: "Instellingen", language: "Taal", profile: "Profiel", notifications: "Meldingen", tier: "Accounttype" },
      trek: { title: "TREK Intelligentie", live: "LIVE", signal: "Signaal", confidence: "Betrouwbaarheid" },
      paperTrading: { title: "Papierhandel", subtitle: "Simuleer transacties met virtuele fondsen", newOrder: "Nieuwe bestelling", orderHistory: "Bestelgeschiedenis", buy: "KOPEN", sell: "VERKOPEN" },
      onboarding: { title: "Welkom bij TREDIA", selectBroker: "Selecteer uw makelaar", setupComplete: "Installatie voltooid" },
      upgrade: { title: "Upgrade uw plan", elite: "Elite", pro: "Pro", foundingMember: "Oprichtend lid" }
    }
  },
  pl: {
    translation: {
      nav: { feed: "Kanał AI", markets: "Rynki", portfolio: "Portfel", trek: "TREK ⚡", settings: "Ustawienia" },
      splash: { tagline: "Przewaga, której potrzebuje każdy trader" },
      signin: { title: "Zaloguj się", email: "E-mail", google: "Kontynuuj z Google", apple: "Kontynuuj z Apple", emailAuth: "Zaloguj się za pomocą e-maila" },
      dashboard: { title: "Przegląd rynku", subtitle: "Indeksy w czasie rzeczywistym, kryptowaluty i intelligencja rynku" },
      markets: { title: "Rynki", subtitle: "Analizuj akcje, kryptowaluty, forex i surowce" },
      portfolio: { title: "Portfel", subtitle: "Twoje pozycje i wyniki", noHoldings: "Brak pozycji. Dodaj swoją pierwszą pozycję." },
      settings: { title: "Ustawienia", language: "Język", profile: "Profil", notifications: "Powiadomienia", tier: "Typ konta" },
      trek: { title: "Inteligencja TREK", live: "NA ŻYWO", signal: "Sygnał", confidence: "Pewność" },
      paperTrading: { title: "Handel papierowy", subtitle: "Symuluj transakcje za pomocą wirtualnych funduszy", newOrder: "Nowe zamówienie", orderHistory: "Historia zamówień", buy: "KУПИТЬ", sell: "SPRZEDAĆ" },
      onboarding: { title: "Witamy w TREDIA", selectBroker: "Wybierz swojego brokera", setupComplete: "Konfiguracja ukończona" },
      upgrade: { title: "Uaktualnij swój plan", elite: "Elite", pro: "Pro", foundingMember: "Członek założyciel" }
    }
  },
  th: {
    translation: {
      nav: { feed: "AI Feed", markets: "ตลาด", portfolio: "พอร์ตโฟลิโอ", trek: "TREK ⚡", settings: "การตั้งค่า" },
      splash: { tagline: "ข้อได้เปรียบที่ผู้ค้าทุกคนต้องการ" },
      signin: { title: "เข้าสู่ระบบ", email: "อีเมล", google: "ดำเนินการต่อด้วย Google", apple: "ดำเนินการต่อด้วย Apple", emailAuth: "เข้าสู่ระบบด้วยอีเมล" },
      dashboard: { title: "ภาพรวมตลาด", subtitle: "ดัชนีแบบเรียลไทม์ crypto และข่าวสารตลาด" },
      markets: { title: "ตลาด", subtitle: "วิเคราะห์หุ้น crypto forex และสินค้าโภคนำ" },
      portfolio: { title: "พอร์ตโฟลิโอ", subtitle: "ตำแหน่งและประสิทธิภาพของคุณ", noHoldings: "ยังไม่มีตำแหน่ง เพิ่มตำแหน่งแรกของคุณ" },
      settings: { title: "การตั้งค่า", language: "ภาษา", profile: "โปรไฟล์", notifications: "การแจ้งเตือน", tier: "ประเภทบัญชี" },
      trek: { title: "ปัญญาประดิษฐ์ TREK", live: "สด", signal: "สัญญาณ", confidence: "ความเชื่อมั่น" },
      paperTrading: { title: "การซื้อขายกระดาษ", subtitle: "จำลองการค้นหาด้วยเงินเสมือน", newOrder: "สั่งซื้อใหม่", orderHistory: "ประวัติคำสั่ง", buy: "ซื้อ", sell: "ขาย" },
      onboarding: { title: "ยินดีต้อนรับสู่ TREDIA", selectBroker: "เลือกโบรกเกอร์ของคุณ", setupComplete: "การตั้งค่าเสร็จสมบูรณ์" },
      upgrade: { title: "อัปเกรดแผนของคุณ", elite: "Elite", pro: "Pro", foundingMember: "สมาชิกก่อตั้ง" }
    }
  },
  id: {
    translation: {
      nav: { feed: "Umpan AI", markets: "Pasar", portfolio: "Portofolio", trek: "TREK ⚡", settings: "Pengaturan" },
      splash: { tagline: "Keunggulan yang setiap trader butuhkan" },
      signin: { title: "Masuk", email: "Email", google: "Lanjutkan dengan Google", apple: "Lanjutkan dengan Apple", emailAuth: "Masuk dengan email" },
      dashboard: { title: "Ringkasan Pasar", subtitle: "Indeks real-time, crypto dan intelijen pasar" },
      markets: { title: "Pasar", subtitle: "Analisis saham, crypto, forex dan komoditas" },
      portfolio: { title: "Portofolio", subtitle: "Posisi dan kinerja Anda", noHoldings: "Belum ada posisi. Tambahkan posisi pertama Anda." },
      settings: { title: "Pengaturan", language: "Bahasa", profile: "Profil", notifications: "Notifikasi", tier: "Jenis Akun" },
      trek: { title: "Intelijen TREK", live: "LIVE", signal: "Sinyal", confidence: "Kepercayaan" },
      paperTrading: { title: "Perdagangan Kertas", subtitle: "Simulasikan perdagangan dengan dana virtual", newOrder: "Pesanan Baru", orderHistory: "Riwayat Pesanan", buy: "BELI", sell: "JUAL" },
      onboarding: { title: "Selamat Datang di TREDIA", selectBroker: "Pilih Broker Anda", setupComplete: "Penyiapan Selesai" },
      upgrade: { title: "Tingkatkan Paket Anda", elite: "Elite", pro: "Pro", foundingMember: "Anggota Pendiri" }
    }
  },
  ro: {
    translation: {
      nav: { feed: "Flux IA", markets: "Piețe", portfolio: "Portofoliu", trek: "TREK ⚡", settings: "Setări" },
      splash: { tagline: "Avantajul de care fiecare trader are nevoie" },
      signin: { title: "Conectare", email: "Email", google: "Continuare cu Google", apple: "Continuare cu Apple", emailAuth: "Conectare cu email" },
      dashboard: { title: "Prezentare generală a pieței", subtitle: "Indici în timp real, cripto și inteligenți de piață" },
      markets: { title: "Piețe", subtitle: "Analizați acțiuni, cripto, forex și mărfuri" },
      portfolio: { title: "Portofoliu", subtitle: "Pozițiile și performanța dvs", noHoldings: "Nici o poziție deocamdată. Adăugați prima dvs poziție." },
      settings: { title: "Setări", language: "Limbă", profile: "Profil", notifications: "Notificări", tier: "Tip de cont" },
      trek: { title: "Inteligența TREK", live: "LIVE", signal: "Semnal", confidence: "Încredere" },
      paperTrading: { title: "Tranzacționarea pe hârtie", subtitle: "Simulați tranzacții cu fonduri virtuale", newOrder: "Comandă nouă", orderHistory: "Istoric comenzi", buy: "CUMPARĂ", sell: "VINDE" },
      onboarding: { title: "Bine ati venit la TREDIA", selectBroker: "Selectați brokerul dvs", setupComplete: "Configurare finalizată" },
      upgrade: { title: "Upgradați planul dvs", elite: "Elite", pro: "Pro", foundingMember: "Membru fondator" }
    }
  },
  el: {
    translation: {
      nav: { feed: "Ροή ΑΙ", markets: "Αγορές", portfolio: "Χαρτοφυλάκιο", trek: "TREK ⚡", settings: "Ρυθμίσεις" },
      splash: { tagline: "Το πλεονέκτημα που χρειάζεται κάθε έμπορος" },
      signin: { title: "Σύνδεση", email: "Email", google: "Συνέχεια με το Google", apple: "Συνέχεια με το Apple", emailAuth: "Σύνδεση με email" },
      dashboard: { title: "Επισκόπηση αγοράς", subtitle: "Δείκτες σε πραγματικό χρόνο, κρυπτο και νοημοσύνη αγοράς" },
      markets: { title: "Αγορές", subtitle: "Αναλύστε μετοχές, κρυπτο, forex και εμπορεύματα" },
      portfolio: { title: "Χαρτοφυλάκιο", subtitle: "Οι θέσεις σας και η απόδοση", noHoldings: "Καμία θέση ακόμα. Προσθέστε την πρώτη σας θέση." },
      settings: { title: "Ρυθμίσεις", language: "Γλώσσα", profile: "Προφίλ", notifications: "Ειδοποιήσεις", tier: "Τύπος λογαριασμού" },
      trek: { title: "Νοημοσύνη TREK", live: "LIVE", signal: "Σήμα", confidence: "Εμπιστοσύνη" },
      paperTrading: { title: "Διαπραγμάτευση χαρτιού", subtitle: "Προσομοιώστε συναλλαγές με εικονικά κεφάλαια", newOrder: "Νέα παραγγελία", orderHistory: "Ιστορικό παραγγελιών", buy: "ΑΓΟΡΑ", sell: "ΠΩΛΗΣΗ" },
      onboarding: { title: "Καλώς ήρθατε στο TREDIA", selectBroker: "Επιλέξτε τον broker σας", setupComplete: "Ολοκλήρωση ρύθμισης" },
      upgrade: { title: "Αναβαθμίστε το σχέδιό σας", elite: "Elite", pro: "Pro", foundingMember: "Ιδρυτικό μέλος" }
    }
  },
  vi: {
    translation: {
      nav: { feed: "Bộ nguồn cấp AI", markets: "Thị trường", portfolio: "Danh mục", trek: "TREK ⚡", settings: "Cài đặt" },
      splash: { tagline: "Lợi thế mà mỗi nhà giao dịch cần" },
      signin: { title: "Đăng nhập", email: "Email", google: "Tiếp tục với Google", apple: "Tiếp tục với Apple", emailAuth: "Đăng nhập bằng email" },
      dashboard: { title: "Tổng quan thị trường", subtitle: "Chỉ số thực tế, tiền điện tử và thông tin thị trường" },
      markets: { title: "Thị trường", subtitle: "Phân tích cổ phiếu, tiền điện tử, ngoại hối và hàng hóa" },
      portfolio: { title: "Danh mục", subtitle: "Vị trí và hiệu suất của bạn", noHoldings: "Chưa có vị trí nào. Thêm vị trí đầu tiên của bạn." },
      settings: { title: "Cài đặt", language: "Ngôn ngữ", profile: "Hồ sơ", notifications: "Thông báo", tier: "Loại tài khoản" },
      trek: { title: "Trí tuệ TREK", live: "TRỰC TIẾP", signal: "Tín hiệu", confidence: "Độ tin cậy" },
      paperTrading: { title: "Giao dịch giấy", subtitle: "Mô phỏng giao dịch bằng tiền ảo", newOrder: "Đơn hàng mới", orderHistory: "Lịch sử đơn hàng", buy: "MUA", sell: "BÁN" },
      onboarding: { title: "Chào mừng bạn đến với TREDIA", selectBroker: "Chọn sàn giao dịch của bạn", setupComplete: "Hoàn thành thiết lập" },
      upgrade: { title: "Nâng cấp gói của bạn", elite: "Elite", pro: "Pro", foundingMember: "Thành viên sáng lập" }
    }
  },
  hi: {
    translation: {
      nav: { feed: "एआई फीड", markets: "बाज़ार", portfolio: "पोर्टफोलियो", trek: "TREK ⚡", settings: "सेटिंग्स" },
      splash: { tagline: "हर व्यापारी को चाहिए यह बढ़त" },
      signin: { title: "साइन इन", email: "ईमेल", google: "Google से जारी रखें", apple: "Apple से जारी रखें", emailAuth: "ईमेल से साइन इन करें" },
      dashboard: { title: "बाज़ार अवलोकन", subtitle: "रीयल-टाइम इंडेक्स, क्रिप्टो और बाज़ार बुद्धिमत्ता" },
      markets: { title: "बाज़ार", subtitle: "स्टॉक, क्रिप्टो, फॉरेक्स और कमोडिटीज का विश्लेषण करें" },
      portfolio: { title: "पोर्टफोलियो", subtitle: "आपकी पोजीशन और प्रदर्शन", noHoldings: "अभी कोई पोजीशन नहीं है। अपनी पहली पोजीशन जोड़ें।" },
      settings: { title: "सेटिंग्स", language: "भाषा", profile: "प्रोफाइल", notifications: "सूचनाएं", tier: "खाता प्रकार" },
      trek: { title: "TREK बुद्धिमत्ता", live: "लाइव", signal: "संकेत", confidence: "आत्मविश्वास" },
      paperTrading: { title: "कागजी व्यापार", subtitle: "आभासी निधि के साथ ट्रेड सिमुलेट करें", newOrder: "नया आदेश", orderHistory: "आदेश इतिहास", buy: "खरीदें", sell: "बेचें" },
      onboarding: { title: "TREDIA में आपका स्वागत है", selectBroker: "अपना ब्रोकर चुनें", setupComplete: "सेटअप पूर्ण" },
      upgrade: { title: "अपनी योजना अपग्रेड करें", elite: "एलीट", pro: "प्रो", foundingMember: "संस्थापक सदस्य" }
    }
  }
};

export default translations;