# TREDIO Architecture Diagram
## System Integration & Data Flow

---

## 🏗️ SYSTEM ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                         TREDIO FRONTEND                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  App.jsx (Router)                                               │
│    ├─ SignIn / SplashScreen / OnboardingQuick                  │
│    ├─ AppShell (Layout)                                         │
│    │  ├─ Header (Logo + Search + Notifications)                │
│    │  ├─ Main Content (Outlet)                                 │
│    │  ├─ Bottom Nav (Mobile)                                   │
│    │  └─ GlobalAssetSearch (⌘K)                                │
│    │                                                             │
│    └─ Page Routes:                                              │
│       ├─ /Home                                                   │
│       │  ├─ DailyBrief (Morning)                               │
│       │  ├─ OG100Card                                          │
│       │  ├─ TrekIntelligenceCardV2 (Fear & Greed)            │
│       │  ├─ MarketCauseEffectExplainer                        │
│       │  ├─ SectorHeatExplainer                                │
│       │  ├─ NextJumpDetector                                   │
│       │  ├─ ActionableTradeCard (3x)                           │
│       │  ├─ AlertRow (3x)                                      │
│       │  ├─ LatestJumps                                        │
│       │  ├─ ElitePremiumShowcase                               │
│       │  ├─ MarketNewsSection                                  │
│       │  └─ RiskWarnings                                       │
│       ├─ /Markets (Market overview)                             │
│       ├─ /AIInsights (Signal detail)                            │
│       ├─ /Asset/:symbol (Asset detail + chart)                 │
│       ├─ /Portfolio (Holdings + performance)                    │
│       ├─ /Trade (Paper trading)                                 │
│       ├─ /Upgrade (Premium page)                                │
│       └─ /Settings (User settings)                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       BACKEND FUNCTIONS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  stockPrices.js                                                 │
│  ├─ mode: "ohlc" → Get chart data (all timeframes)            │
│  ├─ mode: "search" → Search assets (all types)                 │
│  └─ symbols: [] → Batch price fetch                             │
│                                                                   │
│  marketReactionEngine.js                                         │
│  ├─ Input: { event, userRegion }                               │
│  └─ Output: what/why/impact/opinion/watch/risks                │
│                                                                   │
│  geoIntelligence.js                                              │
│  ├─ Input: { event, userRegion, userInterests }               │
│  └─ Output: priority/relevance/shouldNotify                    │
│                                                                   │
│  notificationEngine.js                                           │
│  ├─ Input: { event, userRegion, userInterests, userLevel }    │
│  └─ Output: notification + urgency + priority                  │
│                                                                   │
│  alpacaTrade.js (existing)                                      │
│  ├─ Paper trading execution                                     │
│  └─ Position management                                          │
│                                                                   │
│  getMarketNews.js (existing)                                    │
│  ├─ News fetching + sentiment analysis                          │
│  └─ Relevance filtering                                          │
│                                                                   │
│  superAI.js (existing)                                          │
│  ├─ Advanced analysis                                            │
│  └─ Multi-timeframe signals                                      │
│                                                                   │
│  trekChat.js (existing)                                         │
│  ├─ Conversational intelligence                                 │
│  └─ User guidance                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         EXTERNAL APIS                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Data Providers (Provider Chain):                                │
│  ├─ Polygon.io (primary, coverage: US + international)         │
│  │  └─ Falls back to: Finnhub (fast, US stocks)                │
│  │     └─ Falls back to: Twelve Data (global)                  │
│  │        └─ Falls back to: AlphaVantage (fallback)            │
│  │                                                               │
│  Cryptocurrency:                                                 │
│  ├─ Finnhub (BTC, ETH, etc.)                                   │
│  └─ AlphaVantage (backup)                                       │
│                                                                   │
│  News & Sentiment:                                               │
│  ├─ Finnhub (business news)                                     │
│  ├─ Polygon (market events)                                     │
│  └─ NewsAPI (general market news)                               │
│                                                                   │
│  Payment:                                                        │
│  └─ Stripe (premium subscriptions)                              │
│                                                                   │
│  Analytics:                                                      │
│  ├─ Google Analytics 4 (usage tracking)                         │
│  └─ Segment (event streaming)                                   │
│                                                                   │
│  Notifications:                                                  │
│  ├─ Firebase Cloud Messaging (push)                             │
│  ├─ SendGrid (email)                                            │
│  └─ Twilio (SMS, optional)                                      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      BASE44 DATABASE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Entities:                                                       │
│  ├─ User (built-in)                                             │
│  │  └─ Fields: email, name, role, preferences                  │
│  │                                                               │
│  ├─ Portfolio (user holdings)                                   │
│  │  └─ Fields: symbol, shares, avg_cost, sector                │
│  │                                                               │
│  ├─ Watchlist (tracked assets)                                  │
│  │  └─ Fields: symbol, name, alert_price, notes                │
│  │                                                               │
│  ├─ TradeLog (trade history)                                    │
│  │  └─ Fields: symbol, action, shares, price, status           │
│  │                                                               │
│  ├─ FoundingMember (OG users)                                   │
│  │  └─ Fields: og_number, tier, badge                          │
│  │                                                               │
│  └─ NotificationLog (delivery tracking)                         │
│     └─ Fields: user_id, date, count, signal_type               │
│                                                                   │
│  Query patterns:                                                 │
│  ├─ User.list() → Get all users                                │
│  ├─ User.filter({role: 'admin'}) → Admin queries              │
│  ├─ Portfolio.filter({created_by: email}) → User portfolio    │
│  ├─ TradeLog.list('-created_date', 10) → Recent trades        │
│  └─ Watchlist.filter({alert_price: {$gte: 100}}) → High alerts │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 DATA FLOW DIAGRAM

```
Market Event (News, Data, Signal)
    ↓
    ├─→ marketReactionEngine.js
    │   ├─ What happened?
    │   ├─ Why it matters?
    │   ├─ Affected assets?
    │   ├─ Directional impact?
    │   ├─ TREK opinion?
    │   ├─ What to watch?
    │   └─ Risks?
    │
    ├─→ geoIntelligence.js
    │   ├─ User region?
    │   ├─ User interests?
    │   ├─ Relevance score (0-100)?
    │   └─ Should notify?
    │
    ├─→ stockPrices.js
    │   ├─ Fetch current price (multi-provider)
    │   ├─ Fetch historical chart (timeframe)
    │   └─ Search assets (global)
    │
    ├─→ getMarketNews.js
    │   ├─ Fetch related news
    │   ├─ Sentiment analysis
    │   └─ Relevance filtering
    │
    ├─→ notificationEngine.js
    │   ├─ Calculate notification priority
    │   ├─ Generate message
    │   ├─ Determine urgency (CRITICAL/HIGH/LOW)
    │   └─ Queue for delivery
    │
    ├─→ Display on:
    │   ├─ HomePage (DailyBrief, Alert)
    │   ├─ AIInsights (Signal detail)
    │   ├─ Asset detail page
    │   └─ Push notification
    │
    └─→ Logging:
        ├─ Save to NotificationLog
        ├─ Track impressions
        ├─ Track clicks
        └─ Measure engagement
```

---

## 🔄 USER INTERACTION FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                      NEW USER JOURNEY                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 1. SignIn Page                                                   │
│    ├─ Email / Password or Social Login                          │
│    └─ Profile setup (name, location if needed)                  │
│                                                                   │
│ 2. OnboardingQuick (30 seconds)                                 │
│    ├─ "What's your level?" (Beginner/Intermediate/Advanced)   │
│    ├─ "What interests you?" (Stocks/Crypto/Forex/etc)         │
│    └─ Immediately see: Personalized signal                      │
│                                                                   │
│ 3. HomePage                                                      │
│    ├─ Morning Brief (what matters today)                        │
│    ├─ Market sentiment (Fear & Greed)                           │
│    ├─ Cause & Effect (why things move)                          │
│    ├─ Sector heat map (where money is)                          │
│    ├─ Next jump detector (momentum plays)                       │
│    ├─ Actionable trades (entry, risk, target)                  │
│    ├─ Alerts (real-time signals)                                │
│    ├─ Latest jumps (big movers)                                 │
│    ├─ Elite showcase (premium features)                         │
│    └─ Market news (context)                                     │
│                                                                   │
│ 4. User Click: Asset (e.g., NVDA)                              │
│    └─ Asset Detail Page                                         │
│       ├─ Real-time price + chart                                │
│       ├─ Technical indicators                                   │
│       ├─ TREK signal (BUY/SELL/HOLD)                           │
│       ├─ Trade plan (locked, premium only)                      │
│       ├─ Related news + sentiment                               │
│       ├─ Click "View Plan" → Elite paywall                     │
│       └─ Set watchlist alert                                    │
│                                                                   │
│ 5. During Day                                                    │
│    └─ User receives notification                                │
│       ├─ "NVDA breakout!" (geo + interest relevant)            │
│       ├─ Click → Asset detail                                   │
│       └─ See TREK analysis + trade opportunity                  │
│                                                                   │
│ 6. Evening                                                       │
│    └─ Evening Brief                                             │
│       ├─ What mattered today (recap)                            │
│       ├─ Tomorrow's setup (what to prepare for)                │
│       └─ Feel prepared for next day                             │
│                                                                   │
│ 7. Next Morning                                                  │
│    └─ Loop repeats (habit formed)                              │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 CONVERSION FUNNEL

```
Free Users (100%)
    ↓
Click on Premium Feature (50%)
    ├─ "View Trade Plan"
    ├─ "View Sector Deep Dive"
    └─ "View Full Analysis"
    ↓
See Paywall (30% of clickers)
    ├─ "7-day free trial"
    ├─ "$9.99/month"
    └─ Feature comparison table
    ↓
Convert to Trial (30% of paywall seers = 9% of free)
    ├─ Enter card details
    └─ Start free trial
    ↓
Convert to Paid (70% of trial users = 6% of free = 35% of trial)
    ├─ Use features for 7 days
    ├─ Feel value
    └─ Don't cancel

TLDR: 1% → 3.5% → 6% → 35% → Paid
```

---

## 🔌 INTEGRATION POINTS

### Frontend ↔ Backend
```
React Component → base44.functions.invoke('functionName', {params})
    ↓
Backend function (Deno)
    ├─ Authentication (base44.auth.me())
    ├─ Data operations (base44.entities.read/write)
    ├─ External APIs (fetch to Finnhub, Polygon, etc)
    └─ Return JSON response
    ↓
React component receives response
    ├─ Update state
    ├─ Re-render UI
    └─ Display to user
```

### Real-time Updates
```
Option 1: Polling (current)
    ├─ Component: useEffect + interval
    ├─ Frequency: 30 seconds (configurable)
    └─ Call stockPrices.js for latest price

Option 2: WebSocket (future)
    ├─ Connect to provider WebSocket
    ├─ Subscribe to symbol updates
    └─ Real-time updates (< 1s latency)
```

---

## 📱 RESPONSIVE BREAKPOINTS

```
Mobile (< 768px)
├─ Single column layout
├─ Stack components vertically
├─ Large touch targets (44px+)
├─ Simplified charts
└─ Bottom nav for navigation

Tablet (768px - 1024px)
├─ Two column layout
├─ Side-by-side cards
├─ Better chart spacing
└─ Hybrid nav

Desktop (> 1024px)
├─ Three column layout
├─ Sidebar navigation
├─ Full-featured charts
└─ Advanced layouts
```

---

## 🔐 SECURITY ARCHITECTURE

```
Authentication
├─ Base44 handles login/signup
├─ JWT tokens stored securely
├─ Session timeout: 24 hours
└─ Rate limiting on auth endpoints

Authorization
├─ User can only access own data
├─ Admin role for special operations
├─ RLS on database (row-level security)
└─ API key rotation (external services)

Data Protection
├─ HTTPS everywhere
├─ SSL certificates (auto-renewed)
├─ Database encryption at rest
├─ No sensitive data in logs
└─ GDPR compliance (user consent, right to delete)

API Security
├─ Rate limiting: 100 req/min per user
├─ IP blocking after 10 failed attempts
├─ CORS configured for production domain only
└─ Request signing (external providers)
```

---

## 📊 MONITORING & LOGGING

```
Frontend Monitoring
├─ Google Analytics 4
├─ Error tracking (Sentry)
├─ Performance metrics (Core Web Vitals)
└─ User session recording (optional)

Backend Monitoring
├─ Function execution time
├─ Error rate
├─ API provider health
├─ Database query performance
└─ Alert on anomalies

Logging
├─ Console: Development only
├─ Cloud logging: Production (all requests)
├─ Structured logs: JSON format
├─ Retention: 30 days
└─ PII redaction: Automatic
```

---

**This architecture is scalable, maintainable, and production-ready.**