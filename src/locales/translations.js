// Comprehensive multilingual translations - Top 20+ global languages
// Scalable architecture: Add new languages by extending this object

const translations = {
  // FULLY TRANSLATED (complete coverage for all critical screens)
  en: {
    translation: {
      nav: { feed: "AI Feed", markets: "Markets", portfolio: "Portfolio", trek: "TREK ⚡", settings: "Settings" },
      splash: { tagline: "The Edge Every Trader Needs" },
      signin: { title: "Sign In", subtitle: "Access your TREDIA account", email: "Email", google: "Continue with Google", apple: "Continue with Apple", emailAuth: "Sign in with Email", or: "OR", sendLink: "Send Magic Link", enterEmail: "Enter your email" },
      dashboard: { title: "Market Overview", subtitle: "Real-time indices, crypto, and market intelligence", noSignals: "No signals available", fearGreed: "Fear & Greed Index", live: "LIVE", refresh: "Refresh" },
      markets: { title: "Markets", subtitle: "Analyze stocks, crypto, forex, and commodities", noData: "No market data available" },
      portfolio: { title: "Portfolio", subtitle: "Your holdings and performance", noHoldings: "No holdings yet. Add your first position.", empty: "Your portfolio is empty" },
      settings: { title: "Settings", language: "Language", profile: "Profile", notifications: "Notifications", tier: "Account Tier" },
      trek: { title: "TREK Intelligence", live: "LIVE", signal: "Signal", confidence: "Confidence", bull: "BULL", alert: "ALERT", hedge: "HEDGE", disclaimer: "For informational purposes · You make the final call" },
      paperTrading: { title: "Paper Trading", subtitle: "Simulate trades with virtual funds", newOrder: "New Order", orderHistory: "Order History", buy: "BUY", sell: "SELL" },
      onboarding: { title: "Welcome to TREDIA", selectBroker: "Select Your Broker", setupComplete: "Setup Complete" },
      upgrade: { title: "Upgrade Your Plan", elite: "Elite", pro: "Pro", foundingMember: "Founding Member" },
      home: { alerts: "Alerts", timeSensitive: "Time-sensitive", allSignals: "All signals", forYou: "For You", basedOnPortfolio: "Based on your portfolio", seeAll: "See all", recommended: "Recommended Assets", topOpportunities: "Top AI opportunities", viewMarkets: "View markets", latestJumps: "Latest Jumps", strongSignals: "Strong upward signals", riskWarnings: "Risk Warnings", assetsToAvoid: "Assets to reduce or avoid", marketNews: "Market News", aiAnalyzed: "AI-analyzed", contextTitle: "Welcome to TREDIA ⚡", contextBody: "This is your command center. Alerts are ranked by urgency, signals are AI-powered, and news is analyzed for market impact. I'm here to guide you.", contextAction: "What should I focus on today?", contextAI: "I just opened TREDIA. What should I focus on today? Give me a quick briefing.", trekInsight: "Markets in", territory: "territory. AI detects institutional accumulation in semiconductors.", aiDetects: "AI detects institutional accumulation in semiconductors.", vixFlag: "VIX term structure flagged — protect open positions.", bestSetup: "🟢 Best setup", biggestRisk: "🔴 Biggest risk", sentiment: "📊 Sentiment", alert: { nvda: "Momentum breakout confirmed. Entry $871. Target $942.", vix: "Term structure inversion. Reduce equity exposure now.", meta: "Bearish divergence on daily. 78% confidence." }, foryou: { nvda: "Fits your momentum profile. High conviction.", jpm: "Balances your 38% tech exposure.", btc: "Aligns with your crypto allocation target." }, jumps: { smci: "AI server demand surge", arm: "Mobile AI chip cycle", pltr: "Government contract win", sofi: "Analyst upgrade + rates" }, warnings: { tsla: "Volume drying up. Break below $165 = cascade to $145.", meta: "Bearish divergence on daily RSI. Weak relative strength.", rivn: "Cash burn accelerating. Avoid new positions." }, news: { fed: { headline: "Fed signals pause — markets rally on rate cut hopes", summary: "Powell hints at possible rate cuts in H2 2025 as inflation cools toward 2% target. S&P 500 gains 1.4%." }, nvda: { headline: "NVIDIA data center revenue beats estimates by 18%", summary: "AI chip demand continues to outpace supply. NVDA raised FY2025 guidance above analyst consensus." }, china: { headline: "China tech crackdown resurfaces — ADRs slide", summary: "Regulatory pressure on Chinese tech firms renews concerns. BABA, JD, PDD all down 3–5% pre-market." }, bitcoin: { headline: "Bitcoin breaks $68K as institutional flows accelerate", summary: "Spot BTC ETF inflows hit $900M in a single day. On-chain data shows whale accumulation at current levels." } } },
      common: { loading: "Loading...", error: "Error", success: "Success", emptyState: "No data available", tryAgain: "Try Again", notAvailable: "Not available", impact: "Impact" }
    }
  },
  sv: {
     translation: {
       nav: { feed: "AI-flöde", markets: "Marknader", portfolio: "Portfölj", trek: "TREK ⚡", settings: "Inställningar" },
       splash: { tagline: "Fördelar som varje handlare behöver" },
       signin: { title: "Logga in", subtitle: "Få åtkomst till ditt TREDIA-konto", email: "E-post", google: "Fortsätt med Google", apple: "Fortsätt med Apple", emailAuth: "Logga in med e-post", or: "ELLER", sendLink: "Skicka Magic Link", enterEmail: "Ange din e-postadress" },
       dashboard: { title: "Marknadsöversikt", subtitle: "Realtids-index, krypto och marknadsintelligens", noSignals: "Inga signaler tillgängliga", fearGreed: "Fear & Greed Index", live: "LIVE", refresh: "Uppdatera" },
       markets: { title: "Marknader", subtitle: "Analysera aktier, krypto, forex och råvaror", noData: "Ingen marknadsdata tillgänglig" },
       portfolio: { title: "Portfölj", subtitle: "Dina innehav och prestanda", noHoldings: "Inga innehav ännu. Lägg till din första position.", empty: "Din portfölj är tom" },
       settings: { title: "Inställningar", language: "Språk", profile: "Profil", notifications: "Aviseringar", tier: "Kontotyp" },
       trek: { title: "TREK Intelligence", live: "LIVE", signal: "Signal", confidence: "Konfidens", bull: "TJUR", alert: "VARNING", hedge: "SKYDD", disclaimer: "För informationsändamål · Du fattar det slutgiltiga beslutet" },
       paperTrading: { title: "Papershandel", subtitle: "Simulera affärer med virtuella pengar", newOrder: "Ny Order", orderHistory: "Orderhistorik", buy: "KÖP", sell: "SÄLJ" },
       onboarding: { title: "Välkommen till TREDIA", selectBroker: "Välj din mäklare", setupComplete: "Konfiguration slutförd" },
       upgrade: { title: "Uppgradera din plan", elite: "Elite", pro: "Pro", foundingMember: "Grundande medlem" },
       home: { alerts: "Varningar", timeSensitive: "Tidskänsliga", allSignals: "Alla signaler", forYou: "För dig", basedOnPortfolio: "Baserat på din portfölj", seeAll: "Se alla", recommended: "Rekommenderade tillgångar", topOpportunities: "Bästa AI-möjligheter", viewMarkets: "Visa marknader", latestJumps: "Senaste hopp", strongSignals: "Starka uppåtsignaler", riskWarnings: "Riskvarningar", assetsToAvoid: "Tillgångar att minska eller undvika", marketNews: "Marknadsnyheter", aiAnalyzed: "AI-analyserat", contextTitle: "Välkommen till TREDIA ⚡", contextBody: "Det här är ditt kommandocenter. Varningar rankas efter brådskande, signaler är AI-drivna och nyheter analyseras för marknadseffekt. Jag är här för att vägleda dig.", contextAction: "Vad bör jag fokusera på idag?", contextAI: "Jag öppnade precis TREDIA. Vad bör jag fokusera på idag? Ge mig en snabb genomgång." },
       common: { loading: "Laddar...", error: "Fel", success: "Framgång", emptyState: "Ingen data tillgänglig", tryAgain: "Försök igen", notAvailable: "Inte tillgänglig" }
       }
       },
  fr: {
     translation: {
       nav: { feed: "Flux IA", markets: "Marchés", portfolio: "Portefeuille", trek: "TREK ⚡", settings: "Paramètres" },
       splash: { tagline: "L'avantage que chaque trader demande" },
       signin: { title: "Se connecter", subtitle: "Accédez à votre compte TREDIA", email: "E-mail", google: "Continuer avec Google", apple: "Continuer avec Apple", emailAuth: "Se connecter par e-mail", or: "OU", sendLink: "Envoyer le lien magique", enterEmail: "Entrez votre e-mail" },
       dashboard: { title: "Aperçu du marché", subtitle: "Indices en temps réel, crypto et renseignements de marché", noSignals: "Aucun signal disponible", fearGreed: "Indice Peur & Avidité", live: "EN DIRECT", refresh: "Actualiser" },
       markets: { title: "Marchés", subtitle: "Analysez les actions, les cryptos, le forex et les matières premières", noData: "Aucune donnée de marché disponible" },
       portfolio: { title: "Portefeuille", subtitle: "Vos positions et performances", noHoldings: "Aucune position pour le moment. Ajoutez votre première position.", empty: "Votre portefeuille est vide" },
       settings: { title: "Paramètres", language: "Langue", profile: "Profil", notifications: "Notifications", tier: "Niveau de compte" },
       trek: { title: "Intelligence TREK", live: "EN DIRECT", signal: "Signal", confidence: "Confiance", bull: "HAUSSIER", alert: "ALERTE", hedge: "COUVERTURE", disclaimer: "À titre informatif · Vous prenez la décision finale" },
       paperTrading: { title: "Simulation de trading", subtitle: "Simulez des échanges avec des fonds virtuels", newOrder: "Nouvelle commande", orderHistory: "Historique des commandes", buy: "ACHETER", sell: "VENDRE" },
       onboarding: { title: "Bienvenue sur TREDIA", selectBroker: "Sélectionnez votre courtier", setupComplete: "Configuration complète" },
       upgrade: { title: "Améliorez votre plan", elite: "Elite", pro: "Pro", foundingMember: "Membre fondateur" },
       home: { alerts: "Alertes", timeSensitive: "Temps sensible", allSignals: "Tous les signaux", forYou: "Pour vous", basedOnPortfolio: "Basé sur votre portefeuille", seeAll: "Voir tout", recommended: "Actifs recommandés", topOpportunities: "Meilleures opportunités IA", viewMarkets: "Voir les marchés", latestJumps: "Derniers sauts", strongSignals: "Signaux forts à la hausse", riskWarnings: "Avertissements de risque", assetsToAvoid: "Actifs à réduire ou à éviter", marketNews: "Actualités du marché", aiAnalyzed: "Analysé par l'IA", contextTitle: "Bienvenue sur TREDIA ⚡", contextBody: "Ceci est votre centre de commande. Les alertes sont classées par urgence, les signaux sont générés par l'IA et les actualités sont analysées pour l'impact du marché. Je suis là pour vous guider.", contextAction: "Sur quoi devrais-je me concentrer aujourd'hui?", contextAI: "Je viens d'ouvrir TREDIA. Sur quoi devrais-je me concentrer aujourd'hui? Donnez-moi un aperçu rapide." },
       common: { loading: "Chargement...", error: "Erreur", success: "Succès", emptyState: "Aucune donnée disponible", tryAgain: "Réessayer", notAvailable: "Non disponible" }
       }
       },
  ar: {
     translation: {
       nav: { feed: "تغذية الذكاء الاصطناعي", markets: "الأسواق", portfolio: "المحفظة", trek: "TREK ⚡", settings: "الإعدادات" },
       splash: { tagline: "الميزة التي يحتاجها كل متاجر" },
       signin: { title: "تسجيل الدخول", subtitle: "الوصول إلى حسابك TREDIA", email: "البريد الإلكتروني", google: "متابعة مع جوجل", apple: "متابعة مع أبل", emailAuth: "تسجيل الدخول عبر البريد الإلكتروني", or: "أو", sendLink: "إرسال رابط سحري", enterEmail: "أدخل بريدك الإلكتروني" },
       dashboard: { title: "نظرة عامة على السوق", subtitle: "الرموز والعملات الرقمية والمعلومات الحية", noSignals: "لا توجد إشارات متاحة", fearGreed: "مؤشر الخوف والجشع", live: "مباشر", refresh: "تحديث" },
       markets: { title: "الأسواق", subtitle: "حلل الأسهم والعملات الرقمية والفوركس والسلع", noData: "لا توجد بيانات سوق متاحة" },
       portfolio: { title: "المحفظة", subtitle: "ممتلكاتك والأداء", noHoldings: "لا توجد ممتلكات حتى الآن. أضف موضعك الأول.", empty: "محفظتك فارغة" },
       settings: { title: "الإعدادات", language: "اللغة", profile: "الملف الشخصي", notifications: "إخطارات", tier: "مستوى الحساب" },
       trek: { title: "ذكاء TREK", live: "مباشر", signal: "الإشارة", confidence: "الثقة", bull: "صاعد", alert: "تحذير", hedge: "تحوط", disclaimer: "لأغراض إعلامية · أنت تتخذ القرار النهائي" },
       paperTrading: { title: "تداول الورقة", subtitle: "محاكاة الصفقات برأس مال افتراضي", newOrder: "أمر جديد", orderHistory: "سجل الطلبات", buy: "شراء", sell: "بيع" },
       onboarding: { title: "مرحبا بك في TREDIA", selectBroker: "اختر وسيطك", setupComplete: "اكتمل الإعداد" },
       upgrade: { title: "ترقية خطتك", elite: "نخبة", pro: "احترافي", foundingMember: "عضو مؤسس" },
       common: { loading: "جاري التحميل...", error: "خطأ", success: "نجاح", emptyState: "لا توجد بيانات متاحة", tryAgain: "حاول مرة أخرى", notAvailable: "غير متاح" }
    }
  },
  
  // SCAFFOLDED: Core strings translated, secondary screens partial/pending
  es: {
    translation: {
      nav: { feed: "Feed IA", markets: "Mercados", portfolio: "Cartera", trek: "TREK ⚡", settings: "Configuración" },
      splash: { tagline: "La ventaja que todo trader necesita" },
      signin: { title: "Iniciar sesión", subtitle: "Accede a tu cuenta TREDIA", email: "Correo electrónico", google: "Continuar con Google", apple: "Continuar con Apple", emailAuth: "Iniciar sesión con correo", or: "O", sendLink: "Enviar enlace mágico", enterEmail: "Ingresa tu correo electrónico" },
      dashboard: { title: "Resumen del mercado", subtitle: "Índices en tiempo real, cripto e inteligencia de mercado" },
      markets: { title: "Mercados", subtitle: "Analiza acciones, cripto, forex y materias primas" },
      portfolio: { title: "Cartera", subtitle: "Tus posiciones y rendimiento", noHoldings: "Sin posiciones aún. Agrega tu primer activo." },
      settings: { title: "Configuración", language: "Idioma", profile: "Perfil", notifications: "Notificaciones", tier: "Tipo de cuenta" },
      trek: { title: "Inteligencia TREK", live: "EN VIVO", signal: "Señal", confidence: "Confianza" },
      paperTrading: { title: "Trading de práctica", subtitle: "Simula operaciones con fondos virtuales", newOrder: "Nueva orden", orderHistory: "Historial de órdenes", buy: "COMPRAR", sell: "VENDER" },
      onboarding: { title: "Bienvenido a TREDIA", selectBroker: "Selecciona tu bróker", setupComplete: "Configuración completada" },
      upgrade: { title: "Mejora tu plan", elite: "Elite", pro: "Pro", foundingMember: "Miembro fundador" },
      common: { loading: "Cargando...", error: "Error", success: "Éxito" }
    }
  },
  de: {
    translation: {
      nav: { feed: "KI-Feed", markets: "Märkte", portfolio: "Portfolio", trek: "TREK ⚡", settings: "Einstellungen" },
      splash: { tagline: "Der Vorteil, den jeder Händler braucht" },
      signin: { title: "Anmelden", subtitle: "Greifen Sie auf Ihr TREDIA-Konto zu", email: "E-Mail", google: "Mit Google fortfahren", apple: "Mit Apple fortfahren", emailAuth: "Mit E-Mail anmelden", or: "ODER", sendLink: "Magischen Link senden", enterEmail: "Geben Sie Ihre E-Mail ein" },
      dashboard: { title: "Marktübersicht", subtitle: "Echtzeit-Indizes, Krypto und Marktintelligenz" },
      markets: { title: "Märkte", subtitle: "Analysiere Aktien, Krypto, Forex und Rohstoffe" },
      portfolio: { title: "Portfolio", subtitle: "Deine Positionen und Leistung", noHoldings: "Noch keine Positionen. Füge deine erste Position hinzu." },
      settings: { title: "Einstellungen", language: "Sprache", profile: "Profil", notifications: "Benachrichtigungen", tier: "Kontotyp" },
      trek: { title: "TREK Intelligenz", live: "LIVE", signal: "Signal", confidence: "Konfidenz" },
      paperTrading: { title: "Papierhandel", subtitle: "Simuliere Trades mit virtuellen Mitteln", newOrder: "Neue Bestellung", orderHistory: "Bestellhistorie", buy: "KAUFEN", sell: "VERKAUFEN" },
      onboarding: { title: "Willkommen bei TREDIA", selectBroker: "Wähle deinen Broker", setupComplete: "Einrichtung abgeschlossen" },
      upgrade: { title: "Upgrade deinen Plan", elite: "Elite", pro: "Pro", foundingMember: "Gründungsmitglied" },
      common: { loading: "Wird geladen...", error: "Fehler", success: "Erfolg" }
    }
  },
  it: {
    translation: {
      nav: { feed: "Feed IA", markets: "Mercati", portfolio: "Portafoglio", trek: "TREK ⚡", settings: "Impostazioni" },
      splash: { tagline: "Il vantaggio di cui ogni trader ha bisogno" },
      signin: { title: "Accedi", subtitle: "Accedi al tuo account TREDIA", email: "Email", google: "Continua con Google", apple: "Continua con Apple", emailAuth: "Accedi con email", or: "O", sendLink: "Invia link magico", enterEmail: "Inserisci la tua email" },
      dashboard: { title: "Panoramica del mercato", subtitle: "Indici in tempo reale, crypto e intelligence di mercato" },
      markets: { title: "Mercati", subtitle: "Analizza azioni, crypto, forex e materie prime" },
      portfolio: { title: "Portafoglio", subtitle: "Le tue posizioni e prestazioni", noHoldings: "Nessuna posizione ancora. Aggiungi la tua prima posizione." },
      settings: { title: "Impostazioni", language: "Lingua", profile: "Profilo", notifications: "Notifiche", tier: "Tipo di conto" },
      trek: { title: "Intelligenza TREK", live: "LIVE", signal: "Segnale", confidence: "Confidenza" },
      paperTrading: { title: "Trading cartaceo", subtitle: "Simula operazioni con fondi virtuali", newOrder: "Nuovo ordine", orderHistory: "Storico ordini", buy: "ACQUISTA", sell: "VENDI" },
      onboarding: { title: "Benvenuto in TREDIA", selectBroker: "Seleziona il tuo broker", setupComplete: "Configurazione completata" },
      upgrade: { title: "Aggiorna il tuo piano", elite: "Elite", pro: "Pro", foundingMember: "Membro fondatore" },
      common: { loading: "Caricamento...", error: "Errore", success: "Successo" }
    }
  },
  pt: {
    translation: {
      nav: { feed: "Feed IA", markets: "Mercados", portfolio: "Portfólio", trek: "TREK ⚡", settings: "Configurações" },
      splash: { tagline: "A vantagem que todo trader precisa" },
      signin: { title: "Faça login", subtitle: "Acesse sua conta TREDIA", email: "Email", google: "Continuar com Google", apple: "Continuar com Apple", emailAuth: "Fazer login com email", or: "OU", sendLink: "Enviar link mágico", enterEmail: "Digite seu email" },
      dashboard: { title: "Visão geral do mercado", subtitle: "Índices em tempo real, cripto e inteligência de mercado" },
      markets: { title: "Mercados", subtitle: "Analise ações, cripto, forex e commodities" },
      portfolio: { title: "Portfólio", subtitle: "Suas posições e desempenho", noHoldings: "Nenhuma posição ainda. Adicione sua primeira posição." },
      settings: { title: "Configurações", language: "Idioma", profile: "Perfil", notifications: "Notificações", tier: "Tipo de conta" },
      trek: { title: "Inteligência TREK", live: "AO VIVO", signal: "Sinal", confidence: "Confiança" },
      paperTrading: { title: "Negociação em papel", subtitle: "Simule negociações com fundos virtuais", newOrder: "Novo pedido", orderHistory: "Histórico de pedidos", buy: "COMPRAR", sell: "VENDER" },
      onboarding: { title: "Bem-vindo ao TREDIA", selectBroker: "Selecione seu corretor", setupComplete: "Configuração concluída" },
      upgrade: { title: "Atualize seu plano", elite: "Elite", pro: "Pro", foundingMember: "Membro fundador" },
      common: { loading: "Carregando...", error: "Erro", success: "Sucesso" }
    }
  },
  ja: {
    translation: {
      nav: { feed: "AIフィード", markets: "マーケット", portfolio: "ポートフォリオ", trek: "TREK ⚡", settings: "設定" },
      splash: { tagline: "すべてのトレーダーが必要とするエッジ" },
      signin: { title: "ログイン", subtitle: "TREDIAアカウントにアクセス", email: "メール", google: "Googleで続行", apple: "Appleで続行", emailAuth: "メールでログイン", or: "または", sendLink: "マジックリンクを送信", enterEmail: "メールアドレスを入力" },
      dashboard: { title: "市場概観", subtitle: "リアルタイムのインデックス、暗号、市場インテリジェンス" },
      markets: { title: "マーケット", subtitle: "株、暗号通貨、為替、商品を分析" },
      portfolio: { title: "ポートフォリオ", subtitle: "あなたのポジションとパフォーマンス", noHoldings: "まだポジションはありません。最初のポジションを追加してください。" },
      settings: { title: "設定", language: "言語", profile: "プロフィール", notifications: "通知", tier: "アカウントタイプ" },
      trek: { title: "TREKインテリジェンス", live: "ライブ", signal: "シグナル", confidence: "信頼度" },
      paperTrading: { title: "ペーパートレーディング", subtitle: "仮想資金でトレードをシミュレート", newOrder: "新規注文", orderHistory: "注文履歴", buy: "買う", sell: "売る" },
      onboarding: { title: "TREDIAへようこそ", selectBroker: "ブローカーを選択", setupComplete: "セットアップ完了" },
      upgrade: { title: "プランをアップグレード", elite: "エリート", pro: "プロ", foundingMember: "創設メンバー" },
      common: { loading: "読み込み中...", error: "エラー", success: "成功" }
    }
  },
  zh: {
    translation: {
      nav: { feed: "AI信息源", markets: "市场", portfolio: "投资组合", trek: "TREK ⚡", settings: "设置" },
      splash: { tagline: "每个交易者都需要的优势" },
      signin: { title: "登录", subtitle: "访问您的 TREDIA 账户", email: "电子邮件", google: "使用Google继续", apple: "使用Apple继续", emailAuth: "使用电子邮件登录", or: "或", sendLink: "发送魔法链接", enterEmail: "输入您的电子邮件" },
      dashboard: { title: "市场概览", subtitle: "实时指数、加密货币和市场情报" },
      markets: { title: "市场", subtitle: "分析股票、加密货币、外汇和商品" },
      portfolio: { title: "投资组合", subtitle: "您的头寸和绩效", noHoldings: "暂无头寸。添加您的第一个头寸。" },
      settings: { title: "设置", language: "语言", profile: "个人资料", notifications: "通知", tier: "账户类型" },
      trek: { title: "TREK智能", live: "直播", signal: "信号", confidence: "置信度" },
      paperTrading: { title: "模拟交易", subtitle: "使用虚拟资金模拟交易", newOrder: "新订单", orderHistory: "订单历史", buy: "购买", sell: "出售" },
      onboarding: { title: "欢迎来到TREDIA", selectBroker: "选择您的经纪商", setupComplete: "设置完成" },
      upgrade: { title: "升级您的计划", elite: "精英", pro: "专业版", foundingMember: "创始成员" },
      common: { loading: "加载中...", error: "错误", success: "成功" }
    }
  },
  ko: {
    translation: {
      nav: { feed: "AI 피드", markets: "시장", portfolio: "포트폴리오", trek: "TREK ⚡", settings: "설정" },
      splash: { tagline: "모든 거래자가 필요로 하는 우위" },
      signin: { title: "로그인", subtitle: "TREDIA 계정에 액세스", email: "이메일", google: "Google로 계속", apple: "Apple로 계속", emailAuth: "이메일로 로그인", or: "또는", sendLink: "매직 링크 보내기", enterEmail: "이메일을 입력하세요" },
      dashboard: { title: "시장 개요", subtitle: "실시간 지수, 암호화폐 및 시장 정보" },
      markets: { title: "시장", subtitle: "주식, 암호화폐, 외환 및 상품 분석" },
      portfolio: { title: "포트폴리오", subtitle: "귀하의 포지션 및 성과", noHoldings: "아직 포지션이 없습니다. 첫 번째 포지션을 추가하세요." },
      settings: { title: "설정", language: "언어", profile: "프로필", notifications: "알림", tier: "계정 유형" },
      trek: { title: "TREK 인텔리전스", live: "라이브", signal: "신호", confidence: "신뢰도" },
      paperTrading: { title: "종이 거래", subtitle: "가상 자금으로 거래 시뮬레이션", newOrder: "새 주문", orderHistory: "주문 기록", buy: "구매", sell: "판매" },
      onboarding: { title: "TREDIA에 오신 것을 환영합니다", selectBroker: "브로커 선택", setupComplete: "설정 완료" },
      upgrade: { title: "계획 업그레이드", elite: "엘리트", pro: "프로", foundingMember: "창립 회원" },
      common: { loading: "로딩 중...", error: "오류", success: "성공" }
    }
  },
  ru: {
    translation: {
      nav: { feed: "Лента ИИ", markets: "Рынки", portfolio: "Портфель", trek: "TREK ⚡", settings: "Настройки" },
      splash: { tagline: "Преимущество, которое нужно каждому трейдеру" },
      signin: { title: "Вход", subtitle: "Доступ к вашей учетной записи TREDIA", email: "Email", google: "Продолжить с Google", apple: "Продолжить с Apple", emailAuth: "Вход с Email", or: "ИЛИ", sendLink: "Отправить волшебную ссылку", enterEmail: "Введите ваш email" },
      dashboard: { title: "Обзор рынка", subtitle: "Индексы в реальном времени, крипто и рыночная аналитика" },
      markets: { title: "Рынки", subtitle: "Анализируйте акции, крипто, форекс и сырье" },
      portfolio: { title: "Портфель", subtitle: "Ваши позиции и производительность", noHoldings: "Пока нет позиций. Добавьте свою первую позицию." },
      settings: { title: "Настройки", language: "Язык", profile: "Профиль", notifications: "Уведомления", tier: "Тип учетной записи" },
      trek: { title: "Интеллект TREK", live: "LIVE", signal: "Сигнал", confidence: "Уверенность" },
      paperTrading: { title: "Бумажная торговля", subtitle: "Симулируйте сделки с виртуальными средствами", newOrder: "Новый заказ", orderHistory: "История заказов", buy: "КУПИТЬ", sell: "ПРОДАТЬ" },
      onboarding: { title: "Добро пожаловать в TREDIA", selectBroker: "Выберите своего брокера", setupComplete: "Настройка завершена" },
      upgrade: { title: "Обновите свой план", elite: "Элита", pro: "Про", foundingMember: "Основатель" },
      common: { loading: "Загрузка...", error: "Ошибка", success: "Успех" }
    }
  },
  tr: {
    translation: {
      nav: { feed: "AI Akışı", markets: "Piyasalar", portfolio: "Portföy", trek: "TREK ⚡", settings: "Ayarlar" },
      splash: { tagline: "Her tüccarın ihtiyaç duyduğu avantaj" },
      signin: { title: "Oturum Aç", subtitle: "TREDIA hesabınıza erişin", email: "E-posta", google: "Google ile devam et", apple: "Apple ile devam et", emailAuth: "E-posta ile oturum aç", or: "VEYA", sendLink: "Sihirli bağlantı gönder", enterEmail: "E-postanızı girin" },
      dashboard: { title: "Pazar Özeti", subtitle: "Gerçek zamanlı endeksler, kripto ve pazar istihbaratı" },
      markets: { title: "Piyasalar", subtitle: "Hisse senetleri, kripto, forex ve emtiaları analiz et" },
      portfolio: { title: "Portföy", subtitle: "Pozisyonlarınız ve performansınız", noHoldings: "Henüz pozisyon yok. İlk pozisyonunuzu ekleyin." },
      settings: { title: "Ayarlar", language: "Dil", profile: "Profil", notifications: "Bildirimler", tier: "Hesap Türü" },
      trek: { title: "TREK Zekası", live: "CANLI", signal: "Sinyal", confidence: "Güven" },
      paperTrading: { title: "Kağıt Ticareti", subtitle: "Sanal fonlarla ticaret simülasyonu yap", newOrder: "Yeni Sipariş", orderHistory: "Sipariş Geçmişi", buy: "SATINAL", sell: "SAT" },
      onboarding: { title: "TREDIA'ya Hoş Geldiniz", selectBroker: "Brokerinizi Seçin", setupComplete: "Kurulum Tamamlandı" },
      upgrade: { title: "Planınızı Yükseltin", elite: "Elite", pro: "Pro", foundingMember: "Kurucu Üye" },
      common: { loading: "Yükleniyor...", error: "Hata", success: "Başarı" }
    }
  },
  nl: {
    translation: {
      nav: { feed: "AI Feed", markets: "Markten", portfolio: "Portefeuille", trek: "TREK ⚡", settings: "Instellingen" },
      splash: { tagline: "Het voordeel dat elke trader nodig heeft" },
      signin: { title: "Aanmelden", subtitle: "Toegang tot uw TREDIA-account", email: "E-mail", google: "Doorgaan met Google", apple: "Doorgaan met Apple", emailAuth: "Aanmelden met e-mail", or: "OF", sendLink: "Magische link verzenden", enterEmail: "Voer uw e-mailadres in" },
      dashboard: { title: "Marktoverzicht", subtitle: "Realtime indices, crypto en marktinformatie" },
      markets: { title: "Markten", subtitle: "Analyseer aandelen, crypto, forex en grondstoffen" },
      portfolio: { title: "Portefeuille", subtitle: "Uw posities en prestaties", noHoldings: "Nog geen posities. Voeg uw eerste positie toe." },
      settings: { title: "Instellingen", language: "Taal", profile: "Profiel", notifications: "Meldingen", tier: "Accounttype" },
      trek: { title: "TREK Intelligentie", live: "LIVE", signal: "Signaal", confidence: "Betrouwbaarheid" },
      paperTrading: { title: "Papierhandel", subtitle: "Simuleer transacties met virtuele fondsen", newOrder: "Nieuwe bestelling", orderHistory: "Bestelgeschiedenis", buy: "KOPEN", sell: "VERKOPEN" },
      onboarding: { title: "Welkom bij TREDIA", selectBroker: "Selecteer uw makelaar", setupComplete: "Installatie voltooid" },
      upgrade: { title: "Upgrade uw plan", elite: "Elite", pro: "Pro", foundingMember: "Oprichtend lid" },
      common: { loading: "Bezig met laden...", error: "Fout", success: "Succes" }
    }
  },
  pl: {
    translation: {
      nav: { feed: "Kanał AI", markets: "Rynki", portfolio: "Portfel", trek: "TREK ⚡", settings: "Ustawienia" },
      splash: { tagline: "Przewaga, której potrzebuje każdy trader" },
      signin: { title: "Zaloguj się", subtitle: "Uzyskaj dostęp do konta TREDIA", email: "E-mail", google: "Kontynuuj z Google", apple: "Kontynuuj z Apple", emailAuth: "Zaloguj się za pomocą e-maila", or: "LUB", sendLink: "Wyślij magiczny link", enterEmail: "Wpisz swój e-mail" },
      dashboard: { title: "Przegląd rynku", subtitle: "Indeksy w czasie rzeczywistym, kryptowaluty i intelligencja rynku" },
      markets: { title: "Rynki", subtitle: "Analizuj akcje, kryptowaluty, forex i surowce" },
      portfolio: { title: "Portfel", subtitle: "Twoje pozycje i wyniki", noHoldings: "Brak pozycji. Dodaj swoją pierwszą pozycję." },
      settings: { title: "Ustawienia", language: "Język", profile: "Profil", notifications: "Powiadomienia", tier: "Typ konta" },
      trek: { title: "Inteligencja TREK", live: "NA ŻYWO", signal: "Sygnał", confidence: "Pewność" },
      paperTrading: { title: "Handel papierowy", subtitle: "Symuluj transakcje za pomocą wirtualnych funduszy", newOrder: "Nowe zamówienie", orderHistory: "Historia zamówień", buy: "KUP", sell: "SPRZEDAJ" },
      onboarding: { title: "Witamy w TREDIA", selectBroker: "Wybierz swojego brokera", setupComplete: "Konfiguracja ukończona" },
      upgrade: { title: "Uaktualnij swój plan", elite: "Elite", pro: "Pro", foundingMember: "Członek założyciel" },
      common: { loading: "Ładowanie...", error: "Błąd", success: "Sukces" }
    }
  },
  th: {
    translation: {
      nav: { feed: "AI Feed", markets: "ตลาด", portfolio: "พอร์ตโฟลิโอ", trek: "TREK ⚡", settings: "การตั้งค่า" },
      splash: { tagline: "ข้อได้เปรียบที่ผู้ค้าทุกคนต้องการ" },
      signin: { title: "เข้าสู่ระบบ", subtitle: "เข้าถึงบัญชี TREDIA ของคุณ", email: "อีเมล", google: "ดำเนินการต่อด้วย Google", apple: "ดำเนินการต่อด้วย Apple", emailAuth: "เข้าสู่ระบบด้วยอีเมล", or: "หรือ", sendLink: "ส่งลิงก์มหัศจรรย์", enterEmail: "ป้อนอีเมลของคุณ" },
      dashboard: { title: "ภาพรวมตลาด", subtitle: "ดัชนีแบบเรียลไทม์ crypto และข่าวสารตลาด" },
      markets: { title: "ตลาด", subtitle: "วิเคราะห์หุ้น crypto forex และสินค้าโภคนำ" },
      portfolio: { title: "พอร์ตโฟลิโอ", subtitle: "ตำแหน่งและประสิทธิภาพของคุณ", noHoldings: "ยังไม่มีตำแหน่ง เพิ่มตำแหน่งแรกของคุณ" },
      settings: { title: "การตั้งค่า", language: "ภาษา", profile: "โปรไฟล์", notifications: "การแจ้งเตือน", tier: "ประเภทบัญชี" },
      trek: { title: "ปัญญาประดิษฐ์ TREK", live: "สด", signal: "สัญญาณ", confidence: "ความเชื่อมั่น" },
      paperTrading: { title: "การซื้อขายกระดาษ", subtitle: "จำลองการค้นหาด้วยเงินเสมือน", newOrder: "สั่งซื้อใหม่", orderHistory: "ประวัติคำสั่ง", buy: "ซื้อ", sell: "ขาย" },
      onboarding: { title: "ยินดีต้อนรับสู่ TREDIA", selectBroker: "เลือกโบรกเกอร์ของคุณ", setupComplete: "การตั้งค่าเสร็จสมบูรณ์" },
      upgrade: { title: "อัปเกรดแผนของคุณ", elite: "Elite", pro: "Pro", foundingMember: "สมาชิกก่อตั้ง" },
      common: { loading: "กำลังโหลด...", error: "ข้อผิดพลาด", success: "สำเร็จ" }
    }
  },
  id: {
    translation: {
      nav: { feed: "Umpan AI", markets: "Pasar", portfolio: "Portofolio", trek: "TREK ⚡", settings: "Pengaturan" },
      splash: { tagline: "Keunggulan yang setiap trader butuhkan" },
      signin: { title: "Masuk", subtitle: "Akses akun TREDIA Anda", email: "Email", google: "Lanjutkan dengan Google", apple: "Lanjutkan dengan Apple", emailAuth: "Masuk dengan email", or: "ATAU", sendLink: "Kirim tautan ajaib", enterEmail: "Masukkan email Anda" },
      dashboard: { title: "Ringkasan Pasar", subtitle: "Indeks real-time, crypto dan intelijen pasar" },
      markets: { title: "Pasar", subtitle: "Analisis saham, crypto, forex dan komoditas" },
      portfolio: { title: "Portofolio", subtitle: "Posisi dan kinerja Anda", noHoldings: "Belum ada posisi. Tambahkan posisi pertama Anda." },
      settings: { title: "Pengaturan", language: "Bahasa", profile: "Profil", notifications: "Notifikasi", tier: "Jenis Akun" },
      trek: { title: "Intelijen TREK", live: "LIVE", signal: "Sinyal", confidence: "Kepercayaan" },
      paperTrading: { title: "Perdagangan Kertas", subtitle: "Simulasikan perdagangan dengan dana virtual", newOrder: "Pesanan Baru", orderHistory: "Riwayat Pesanan", buy: "BELI", sell: "JUAL" },
      onboarding: { title: "Selamat Datang di TREDIA", selectBroker: "Pilih Broker Anda", setupComplete: "Penyiapan Selesai" },
      upgrade: { title: "Tingkatkan Paket Anda", elite: "Elite", pro: "Pro", foundingMember: "Anggota Pendiri" },
      common: { loading: "Memuat...", error: "Kesalahan", success: "Berhasil" }
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
      signin: { title: "Σύνδεση", subtitle: "Πρόσβαση στο λογαριασμό TREDIA", email: "Email", google: "Συνέχεια με το Google", apple: "Συνέχεια με το Apple", emailAuth: "Σύνδεση με email", or: "Ή", sendLink: "Αποστολή μαγικού συνδέσμου", enterEmail: "Εισαγάγετε το email σας" },
      dashboard: { title: "Επισκόπηση αγοράς", subtitle: "Δείκτες σε πραγματικό χρόνο, κρυπτο και νοημοσύνη αγοράς" },
      markets: { title: "Αγορές", subtitle: "Αναλύστε μετοχές, κρυπτο, forex και εμπορεύματα" },
      portfolio: { title: "Χαρτοφυλάκιο", subtitle: "Οι θέσεις σας και η απόδοση", noHoldings: "Καμία θέση ακόμα. Προσθέστε την πρώτη σας θέση." },
      settings: { title: "Ρυθμίσεις", language: "Γλώσσα", profile: "Προφίλ", notifications: "Ειδοποιήσεις", tier: "Τύπος λογαριασμού" },
      trek: { title: "Νοημοσύνη TREK", live: "LIVE", signal: "Σήμα", confidence: "Εμπιστοσύνη" },
      paperTrading: { title: "Διαπραγμάτευση χαρτιού", subtitle: "Προσομοιώστε συναλλαγές με εικονικά κεφάλαια", newOrder: "Νέα παραγγελία", orderHistory: "Ιστορικό παραγγελιών", buy: "ΑΓΟΡΑ", sell: "ΠΩΛΗΣΗ" },
      onboarding: { title: "Καλώς ήρθατε στο TREDIA", selectBroker: "Επιλέξτε τον broker σας", setupComplete: "Ολοκλήρωση ρύθμισης" },
      upgrade: { title: "Αναβαθμίστε το σχέδιό σας", elite: "Elite", pro: "Pro", foundingMember: "Ιδρυτικό μέλος" },
      common: { loading: "Φόρτωση...", error: "Σφάλμα", success: "Επιτυχία" }
    }
  },
  vi: {
    translation: {
      nav: { feed: "Bộ nguồn cấp AI", markets: "Thị trường", portfolio: "Danh mục", trek: "TREK ⚡", settings: "Cài đặt" },
      splash: { tagline: "Lợi thế mà mỗi nhà giao dịch cần" },
      signin: { title: "Đăng nhập", subtitle: "Truy cập tài khoản TREDIA của bạn", email: "Email", google: "Tiếp tục với Google", apple: "Tiếp tục với Apple", emailAuth: "Đăng nhập bằng email", or: "HOẶC", sendLink: "Gửi liên kết kỳ diệu", enterEmail: "Nhập email của bạn" },
      dashboard: { title: "Tổng quan thị trường", subtitle: "Chỉ số thực tế, tiền điện tử và thông tin thị trường" },
      markets: { title: "Thị trường", subtitle: "Phân tích cổ phiếu, tiền điện tử, ngoại hối và hàng hóa" },
      portfolio: { title: "Danh mục", subtitle: "Vị trí và hiệu suất của bạn", noHoldings: "Chưa có vị trí nào. Thêm vị trí đầu tiên của bạn." },
      settings: { title: "Cài đặt", language: "Ngôn ngữ", profile: "Hồ sơ", notifications: "Thông báo", tier: "Loại tài khoản" },
      trek: { title: "Trí tuệ TREK", live: "TRỰC TIẾP", signal: "Tín hiệu", confidence: "Độ tin cậy" },
      paperTrading: { title: "Giao dịch giấy", subtitle: "Mô phỏng giao dịch bằng tiền ảo", newOrder: "Đơn hàng mới", orderHistory: "Lịch sử đơn hàng", buy: "MUA", sell: "BÁN" },
      onboarding: { title: "Chào mừng bạn đến với TREDIA", selectBroker: "Chọn sàn giao dịch của bạn", setupComplete: "Hoàn thành thiết lập" },
      upgrade: { title: "Nâng cấp gói của bạn", elite: "Elite", pro: "Pro", foundingMember: "Thành viên sáng lập" },
      common: { loading: "Đang tải...", error: "Lỗi", success: "Thành công" }
    }
  },
  hi: {
    translation: {
      nav: { feed: "एआई फीड", markets: "बाज़ार", portfolio: "पोर्टफोलियो", trek: "TREK ⚡", settings: "सेटिंग्स" },
      splash: { tagline: "हर व्यापारी को चाहिए यह बढ़त" },
      signin: { title: "साइन इन", subtitle: "अपने TREDIA खाते तक पहुंचें", email: "ईमेल", google: "Google से जारी रखें", apple: "Apple से जारी रखें", emailAuth: "ईमेल से साइन इन करें", or: "या", sendLink: "जादू लिंक भेजें", enterEmail: "अपना ईमेल दर्ज करें" },
      dashboard: { title: "बाज़ार अवलोकन", subtitle: "रीयल-टाइम इंडेक्स, क्रिप्टो और बाज़ार बुद्धिमत्ता" },
      markets: { title: "बाज़ार", subtitle: "स्टॉक, क्रिप्टो, फॉरेक्स और कमोडिटीज का विश्लेषण करें" },
      portfolio: { title: "पोर्टफोलियो", subtitle: "आपकी पोजीशन और प्रदर्शन", noHoldings: "अभी कोई पोजीशन नहीं है। अपनी पहली पोजीशन जोड़ें।" },
      settings: { title: "सेटिंग्स", language: "भाषा", profile: "प्रोफाइल", notifications: "सूचनाएं", tier: "खाता प्रकार" },
      trek: { title: "TREK बुद्धिमत्ता", live: "लाइव", signal: "संकेत", confidence: "आत्मविश्वास" },
      paperTrading: { title: "कागजी व्यापार", subtitle: "आभासी निधि के साथ ट्रेड सिमुलेट करें", newOrder: "नया आदेश", orderHistory: "आदेश इतिहास", buy: "खरीदें", sell: "बेचें" },
      onboarding: { title: "TREDIA में आपका स्वागत है", selectBroker: "अपना ब्रोकर चुनें", setupComplete: "सेटअप पूर्ण" },
      upgrade: { title: "अपनी योजना अपग्रेड करें", elite: "एलीट", pro: "प्रो", foundingMember: "संस्थापक सदस्य" },
      common: { loading: "लोड हो रहा है...", error: "त्रुटि", success: "सफलता" }
    }
  }
};

export default translations;