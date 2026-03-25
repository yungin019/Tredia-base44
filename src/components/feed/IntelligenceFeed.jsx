import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import FeedReactionBlock from './FeedReactionBlock';

// ── REACTION DATABASE ──────────────────────────────────────────────────────
//
// FILTERING RULES (enforced in filterForRegion below):
//   - Each card has a `regions` array — the EXCLUSIVE set of regions that card belongs to.
//   - Regional feed (US/EU/APAC/Africa/LatAm): shows ONLY cards where regions includes that key.
//   - Global feed: shows ONLY cards where regions includes 'Global'. These are cross-market cards.
//   - A US card NEVER appears in Europe view. An Africa card NEVER appears in US view.
//   - Global is the only mixed mode.
//
// `regions` key mapping: US | EU | APAC | Africa | LatAm | Global

// ── SIGNAL VALIDATION ────────────────────────────────────────────────────────
const BANNED = ['sentiment', 'narrative', 'momentum', 'uncertain'];
function isValid(r) {
  const t = [r.marketState, r.driver, r.impactText, r.riskInvalidation].join(' ').toLowerCase();
  return !BANNED.some(p => t.includes(p)) && /\d/.test(t);
}

const ALL_REACTIONS = [
  // ── US ──────────────────────────────────────────────────────────────────
  {
    id: 'fed-pause',
    marketState: 'QQQ broke $420 resistance as traders price in the end of rate hikes. 10Y yield dropped -9bp in two sessions.',
    regions: ['US'],
    timing: 'Live',
    source_name: 'Market Structure',
    published_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
    driver: 'Three Fed governors signaled no more rate hikes this cycle; Fed funds futures repriced terminal rate from 5.5% to 5.25%',
    impactText: 'NVDA +2.5%, AAPL +1.8%, TLT +1.2%. Dollar weakening (-0.6% DXY). Growth leads, defensives lagging by 180bp.',
    relatedAssets: [
      { symbol: 'QQQ', direction: 'up' }, { symbol: 'TLT', direction: 'up' },
      { symbol: 'NVDA', direction: 'up' }, { symbol: 'DXY', direction: 'down' },
    ],
    direction: 'bullish',
    importance: 9,
    actionBias: 'QQQ above $420 = confirmation. Buy dips in large-cap tech. TLT long-duration bonds benefiting. PCE print Friday is the make-or-break.',
    riskInvalidation: 'PCE inflation >3.2% on Friday OR Fed speakers turn hawkish = full reversal within 24h',
    watchNext: 'PCE print Friday — if >3.2% the whole trade reverses. QQQ needs to hold $418 on any pullback.',
    sectors: ['Technology', 'Bonds'],
    action_bias: 'bullish',
    confidence: 82,
    watch_next: 'PCE print Friday (>3.2% = reversal). Powell speech Thursday. QQQ must hold $418 on any pullback.',
    risk: 'PCE inflation >3.2% on Friday OR Fed speakers turn hawkish',
    related_assets: ['QQQ', 'TLT', 'NVDA', 'AAPL', 'SPY'],
    trade_setup: {
      entry: 'QQQ above $420 on volume, SPY above $518',
      invalidation: 'QQQ closes below $418 — breakout fails, reversal in play',
      timeframe: 'Intraday to 2-session follow-through',
    },
  },
  {
    id: 'nvidia-earnings',
    marketState: 'NVDA gapped up $8 after beating earnings by 12%. Data center revenue hit $18.1B vs $16.9B expected — semis confirming AI capex cycle.',
    regions: ['US'],
    timing: 'Developing',
    source_name: 'Earnings',
    published_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    driver: 'NVDA Q4 data center revenue $18.1B (+200% YoY). Full-year guidance raised to $120B from $110B. H100 backlog sold out through Q2.',
    impactText: 'AMD +3.2%, SMCI +4.1%, TSM +2.8% in sympathy. QQQ outperforming SPY by 180bp. NVDA $180 is now first support.',
    relatedAssets: [
      { symbol: 'NVDA', direction: 'up' }, { symbol: 'AMD', direction: 'up' },
      { symbol: 'SMCI', direction: 'up' }, { symbol: 'TSM', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 8,
    actionBias: 'Semi breakout confirmed. AMD earnings next week = the next binary event. NVDA $180 is the new support to hold.',
    riskInvalidation: 'AMD misses next week or MSFT/GOOG cut AI capex guidance — entire pyramid unwinds',
    watchNext: 'AMD earnings in 7 days. NVDA hold above $180. MSFT Azure AI revenue in next quarterly call.',
    sectors: ['Semiconductors', 'AI Infrastructure'],
    action_bias: 'bullish',
    confidence: 85,
    watch_next: 'AMD earnings in 7 days — miss = semi selloff. NVDA must hold $180 as new support.',
    risk: 'AMD misses OR MSFT/GOOG cut AI capex guidance — entire sector pyramid unwinds',
    related_assets: ['NVDA', 'AMD', 'SMCI', 'TSM', 'QQQ'],
    trade_setup: {
      entry: 'NVDA above $180 gap fill, AMD above pre-earnings close',
      invalidation: 'NVDA closes below $175 — gap filling reverses, exit semis',
      timeframe: 'Swing 3-5 days into AMD earnings',
    },
  },
  {
    id: 'us-jobs-strong',
    marketState: 'NFP beat by 60K jobs, unemployment 3.7%, wage growth +0.4% MoM — bond market repricing 2 more Fed hikes.',
    regions: ['US'],
    timing: 'Follow-up',
    source_name: 'Economic Data',
    published_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    driver: 'Non-farm payrolls +253K vs 190K expected. Unemployment fell to 3.7%. Wage growth +4.4% YoY — well above Fed target zone.',
    impactText: 'TLT -1.8%, SPY -0.9%, QQQ -1.4%. DXY +0.7%. XLF (financials) +0.4% — only sector holding. 2Y yield spiked +14bp.',
    relatedAssets: [
      { symbol: 'SPY', direction: 'down' }, { symbol: 'TLT', direction: 'down' },
      { symbol: 'QQQ', direction: 'down' }, { symbol: 'XLF', direction: 'up' },
    ],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Trim growth, rotate into financials (XLF) and short-duration. Avoid long bonds until CPI prints soft.',
    riskInvalidation: 'CPI next week prints <3.2% — market immediately reprices the hike risk back down',
    watchNext: 'CPI next Tuesday. 2Y yield vs 5.25% — if it breaks higher, equity pain continues.',
    sectors: ['Financials', 'Value'],
    action_bias: 'bearish',
    confidence: 78,
    watch_next: 'CPI Tuesday — <3.2% would reverse this. 2Y yield direction is the tell.',
    risk: 'CPI comes in soft next week — market reverses fast',
    related_assets: ['SPY', 'TLT', 'QQQ', 'XLF', 'DXY'],
    trade_setup: {
      entry: 'Short TLT below $93, rotate into XLF above $38',
      invalidation: 'TLT reclaims $95 — yield spike reversing, exit shorts',
      timeframe: 'Hold until CPI print next Tuesday',
    },
  },

  // ── EUROPE ──────────────────────────────────────────────────────────────
  {
    id: 'ecb-inflation',
    marketState: 'Eurozone CPI at 2.6% YoY — ECB held rates at 4.0% and pushed back on June cut expectations.',
    regions: ['EU'],
    timing: 'Live',
    source_name: 'Central Bank',
    published_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    driver: 'ECB March meeting: rates unchanged at 4.0%. Lagarde said cuts need 3+ months of data — June is not guaranteed. Bund 10Y +8bp.',
    impactText: 'EUR/USD broke above 1.085 (+0.5%). European banks outperforming (BNP +1.3%, Deutsche +0.8%). Consumer stocks down -0.6%.',
    relatedAssets: [
      { symbol: 'EURUSD', direction: 'up' }, { symbol: 'FEZ', direction: 'down' },
      { symbol: 'EWG', direction: 'down' }, { symbol: 'TLT', direction: 'down' },
    ],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Favor European banks (they benefit from rates staying high). Avoid rate-sensitive consumer names. EUR/USD above 1.085 = stay long EUR.',
    riskInvalidation: 'Eurozone PMI drops below 48 or Lagarde signals emergency cut — EUR/USD reverses to 1.07',
    watchNext: 'Eurozone PMI flash (April). Lagarde speech April 11. EUR/USD above 1.09 = next resistance.',
    sectors: ['Financials', 'FX'],
    action_bias: 'bearish',
    confidence: 75,
    watch_next: 'Eurozone PMI flash next week. Lagarde speech April 11. EUR/USD 1.09 = next level.',
    risk: 'Eurozone PMI collapses below 47 — cuts back on the table immediately',
    related_assets: ['EURUSD', 'FEZ', 'ASML', 'EWG'],
    trade_setup: {
      entry: 'Long EUR/USD above 1.085, long European banks (BNP, Deutsche)',
      invalidation: 'EUR/USD drops below 1.078 — ECB cut bets repriced',
      timeframe: 'Hold until PMI flash data or Lagarde speech',
    },
  },
  {
    id: 'stoxx-recovery',
    marketState: 'DAX broke 18,200 all-time high as ASML beat Q4 estimates by €400M and SAP raised full-year guidance.',
    regions: ['EU'],
    timing: 'Developing',
    source_name: 'Earnings',
    published_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    driver: 'ASML Q4 revenue €7.24B vs €6.85B est (+5.7% beat). SAP FY guidance raised €200M. Germany PMI stabilized at 47.4 from 45.5.',
    impactText: 'DAX +1.8%, STOXX 50 +1.3%. ASML +4.2%, SAP +3.1%. EWG ETF testing breakout above $30. EUR/USD holding 1.085.',
    relatedAssets: [
      { symbol: 'ASML', direction: 'up' }, { symbol: 'SAP', direction: 'up' },
      { symbol: 'EWG', direction: 'up' }, { symbol: 'FEZ', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'EWG (Germany ETF) and FEZ (Euro Stoxx ETF) are the cleanest plays. ASML is the high-conviction single name.',
    riskInvalidation: 'ECB turns hawkish again or German PMI drops back below 46',
    watchNext: 'Germany IFO confidence Thursday. STOXX 50 breakout above 4,950. Next ASML order intake data.',
    sectors: ['Technology', 'Industrials'],
    action_bias: 'bullish',
    confidence: 72,
    watch_next: 'Germany IFO Thursday. STOXX 50 above 4,950 = confirmed breakout. ASML order intake.',
    risk: 'ECB turns more hawkish OR German PMI slips below 46',
    related_assets: ['ASML', 'SAP', 'EWG', 'FEZ'],
    trade_setup: {
      entry: 'EWG above $30, ASML above post-earnings close',
      invalidation: 'DAX closes below 18,000 — breakout fails',
      timeframe: 'Swing 1-2 weeks into IFO data',
    },
  },
  {
    id: 'eu-energy-crunch',
    marketState: 'EU gas storage 64% full vs 5-year average of 58% — TTF natural gas at €28/MWh, down from €340 peak.',
    regions: ['EU'],
    timing: 'Developing',
    source_name: 'Market Structure',
    published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    driver: 'EU gas storage refilled ahead of schedule. LNG import capacity +45% YoY. Russian pipeline dependency down from 40% to 8%.',
    impactText: 'German chemical sector (BASF +2.1%) and manufacturing (Siemens +1.4%) outperforming. TTF below €30 = cost floor removed for industry.',
    relatedAssets: [
      { symbol: 'EWG', direction: 'up' }, { symbol: 'FEZ', direction: 'up' },
      { symbol: 'TTE', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'Rotation into European industrials and chemicals — biggest beneficiaries of lower energy costs. FEZ is the broad play.',
    riskInvalidation: 'Cold snap in March drives TTF above €40/MWh — storage draw accelerates',
    watchNext: 'EU gas storage weekly report (Thursdays). TTF vs €30/MWh. BASF Q1 margin guidance.',
    sectors: ['Energy', 'Industrials', 'Chemicals'],
    action_bias: 'bullish',
    confidence: 70,
    watch_next: 'EU gas storage Thursday. TTF must stay below €35. BASF Q1 results March 28.',
    risk: 'Late cold snap drives TTF above €40 — margins compress again fast',
    related_assets: ['EWG', 'FEZ', 'TTE'],
    trade_setup: {
      entry: 'FEZ above $43 or BASF on dips below €45',
      invalidation: 'TTF breaks above €35 — energy cost headwind returns',
      timeframe: 'Multi-week position into Q1 earnings season',
    },
  },

  // ── ASIA ────────────────────────────────────────────────────────────────
  {
    id: 'china-gdp-miss',
    marketState: 'China Q4 GDP +4.9% vs 5.2% expected. Hang Seng dropped -2.1%. CNY weakening to 7.24 vs USD.',
    regions: ['APAC'],
    timing: 'Live',
    source_name: 'Economic Data',
    published_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    driver: 'Q4 GDP missed by 30bp. Property sector drag: Evergrande liquidation order, Country Garden missing payments. PBOC cut MLF rate -10bp.',
    impactText: 'FXI -3.1%, BABA -2.4%, KWEB -3.6%. AUD/USD -0.5% on iron ore demand concerns. EWJ +0.9% — benefiting from China outflows.',
    relatedAssets: [
      { symbol: 'FXI', direction: 'down' }, { symbol: 'BABA', direction: 'down' },
      { symbol: 'KWEB', direction: 'down' }, { symbol: 'EWJ', direction: 'up' },
    ],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Avoid China tech longs. AUD/NZD shorts on China demand concern. PBOC stimulus would be the re-entry signal.',
    riskInvalidation: 'PBOC announces RRR cut or NPC stimulus package >5 trillion yuan',
    watchNext: 'PBOC MLF rate March 15. China PMI March 31 — needs to hold above 50. NPC stimulus size.',
    sectors: ['China Tech', 'EM Commodities'],
    action_bias: 'bearish',
    confidence: 80,
    watch_next: 'PBOC MLF March 15. China PMI March 31 must hold 50+. NPC fiscal package size.',
    risk: 'PBOC announces large RRR cut — China names reverse fast +5-8%',
    related_assets: ['FXI', 'BABA', 'KWEB', 'EWJ', 'EWY'],
    trade_setup: {
      entry: 'Short FXI below $25, AUD/USD short below 0.645',
      invalidation: 'PBOC announces RRR cut — FXI spikes +5%, exit all shorts immediately',
      timeframe: 'Hold until PBOC meeting or China PMI print',
    },
  },
  {
    id: 'japan-boj',
    marketState: 'BoJ ended negative rates at March meeting — first hike in 17 years. USDJPY dropped from 151 to 148.5.',
    regions: ['APAC'],
    timing: 'Developing',
    source_name: 'Central Bank',
    published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    driver: 'BoJ raised rates to 0.1% from -0.1%. Ended YCC bond yield cap. Spring wage negotiations (shunto) showed +5.3% wage growth — highest since 1991.',
    impactText: 'USDJPY -1.8% to 148.5. Nikkei -1.2% (yen headwind for exporters). Toyota -2.1%, Honda -1.7%. JGB 10Y yield +6bp to 0.77%.',
    relatedAssets: [
      { symbol: 'EWJ', direction: 'down' }, { symbol: 'TM', direction: 'down' },
    ],
    direction: 'bearish',
    importance: 7,
    actionBias: 'Avoid Japanese exporter stocks (yen strength = margin compression). Watch USDJPY 147 — if breaks, next stop 145.',
    riskInvalidation: 'BoJ flags one-and-done at next meeting — USDJPY bounces back to 150+',
    watchNext: 'BoJ April meeting statement. USDJPY 147 level. Japan CPI April 19 — must confirm inflation is sticky.',
    sectors: ['FX', 'Japanese Exporters'],
    action_bias: 'bearish',
    confidence: 74,
    watch_next: 'USDJPY 147 level — if breaks, target 145. BoJ April meeting April 26.',
    risk: 'BoJ signals pause — USDJPY snaps back to 150+, Nikkei recovers',
    related_assets: ['EWJ', 'TM', 'USDJPY'],
    trade_setup: {
      entry: 'Short USDJPY below 148.5, avoid EWJ and Toyota',
      invalidation: 'USDJPY reclaims 150 — BoJ pause confirmed, exit yen longs',
      timeframe: 'Hold through BoJ April 26 meeting',
    },
  },
  {
    id: 'india-growth',
    marketState: 'India Q3 GDP +8.4% — highest in 18 months. INDA ETF at $50, up 12% YTD vs EM peers flat.',
    regions: ['APAC'],
    timing: 'Developing',
    source_name: 'Economic Data',
    published_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    driver: 'India GDP +8.4% vs 6.6% expected. Government capex +Rs 11.1 trillion — infrastructure buildout. IT sector revenue growing +12% YoY.',
    impactText: 'INDA +1.8%, EPI +2.1%. INFY and HDB hitting 52-week highs. INR stable at 83 vs USD despite EM FX pressure.',
    relatedAssets: [
      { symbol: 'INDA', direction: 'up' }, { symbol: 'EPI', direction: 'up' },
      { symbol: 'INFY', direction: 'up' }, { symbol: 'HDB', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'INDA ETF cleanest entry above $50. INFY and HDB are the individual stock plays. Avoid selling into strength here.',
    riskInvalidation: 'RBI tightens aggressively or global risk-off sells EM as a bloc',
    watchNext: 'RBI rate decision April 5. India CPI March 12. INDA breakout above $52 = next target.',
    sectors: ['EM Growth', 'IT Services'],
    action_bias: 'bullish',
    confidence: 76,
    watch_next: 'RBI April 5. India CPI March 12. INDA above $52 = confirmed breakout.',
    risk: 'RBI surprise hike or global EM risk-off — INR weakens, INDA pulls back to $47',
    related_assets: ['INDA', 'EPI', 'INFY', 'HDB'],
    trade_setup: {
      entry: 'INDA above $50 on breakout, INFY on any dip to $18',
      invalidation: 'INDA closes below $48 — EM risk-off in play',
      timeframe: 'Swing 2-4 weeks into RBI decision April 5',
    },
  },

  // ── AFRICA ───────────────────────────────────────────────────────────────
  {
    id: 'africa-commodities',
    marketState: 'DXY above 104.5 + Brent below $82 = double squeeze on African commodity exporters. ZAR at 19.1 vs USD.',
    regions: ['Africa'],
    timing: 'Follow-up',
    source_name: 'Market Structure',
    published_at: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
    driver: 'USD strength (DXY +1.2% on hot jobs data) combined with China growth miss (-demand) — iron ore -4%, copper -2.5% this week.',
    impactText: 'EZA (South Africa ETF) -2.8%. ZAR at 19.1, NGN at record low. BHP -2.1%, VALE -3.4%. Gold is the only buffer — GLD flat.',
    relatedAssets: [
      { symbol: 'GLD', direction: 'up' }, { symbol: 'EZA', direction: 'down' },
      { symbol: 'BHP', direction: 'down' }, { symbol: 'VALE', direction: 'down' },
    ],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Avoid EM FX and commodity miners until DXY breaks below 103. Gold (GLD/GDX) is the only African-adjacent trade with positive setup.',
    riskInvalidation: 'China announces RRR cut or infrastructure stimulus — commodity demand expectations flip in 24h',
    watchNext: 'China NPC stimulus announcement. DXY vs 103 support. Brent crude vs $80 — key floor for Nigerian fiscal balance.',
    sectors: ['Mining', 'EM FX'],
    action_bias: 'bearish',
    confidence: 77,
    watch_next: 'China stimulus announcement. DXY below 103 = reversal signal. Brent crude vs $80 floor.',
    risk: 'China announces stimulus — commodity demand flips, Africa names reverse +5-8%',
    related_assets: ['GLD', 'EZA', 'BHP', 'VALE', 'AEM'],
    trade_setup: {
      entry: 'Long GLD/GDX above $175 — only clean trade with DXY above 104',
      invalidation: 'DXY breaks below 103 — EM reversal, exit defensive positioning',
      timeframe: 'Hold until China NPC stimulus announcement',
    },
  },
  {
    id: 'africa-gold-play',
    marketState: 'Gold at $2,180/oz — 3rd consecutive all-time high. Real yields falling -15bp this week, DXY softening to 103.8.',
    regions: ['Africa'],
    timing: 'Developing',
    source_name: 'Market Structure',
    published_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    driver: 'US real yields dropped -15bp as Fed cut bets repriced. Gold broke $2,100 resistance, now $2,180. GDX (miners) up 8% in 5 sessions.',
    impactText: 'GDX +8.1% in 5 days. AEM (Agnico Eagle) +7.4%. EZA getting a partial bid (+1.8%). South African gold miners outperforming EM peers.',
    relatedAssets: [
      { symbol: 'GLD', direction: 'up' }, { symbol: 'GDX', direction: 'up' },
      { symbol: 'AEM', direction: 'up' }, { symbol: 'EZA', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'GDX offers 3-4x leveraged move vs gold spot. GLD for direct exposure. EZA for Africa equity expression.',
    riskInvalidation: 'Real yields spike above 2.2% (inflation surprise) — gold drops back to $2,050 fast',
    watchNext: 'Gold spot vs $2,200 resistance. GDX needs to hold $32. US real yield 10Y — watch TIPS.',
    sectors: ['Gold Miners', 'Precious Metals'],
    action_bias: 'bullish',
    confidence: 73,
    watch_next: 'Gold spot $2,200 resistance. GDX hold above $32. US 10Y real yield — TIPS are the tell.',
    risk: 'Inflation surprise pushes real yields above 2.2% — gold drops to $2,050',
    related_assets: ['GLD', 'GDX', 'AEM', 'EZA'],
    trade_setup: {
      entry: 'GDX above $32, GLD above $200 — breakout continuation',
      invalidation: 'Gold spot drops below $2,100 — real yield spike reversing the trade',
      timeframe: 'Swing 1-3 weeks while real yields declining',
    },
  },

  // ── LATAM ────────────────────────────────────────────────────────────────
  {
    id: 'latam-em',
    marketState: 'BRL at 5.02 vs USD, MXN at 17.3 — both under pressure as DXY holds above 104 and Brazil cuts Selic -50bp.',
    regions: ['LatAm'],
    timing: 'Live',
    source_name: 'Central Bank',
    published_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    driver: 'Brazil cut Selic rate -50bp to 11.25% — 4th consecutive cut. USD still strong (DXY 104.2). Brent below $82 pressuring PBR.',
    impactText: 'EWZ -2.1%, EWW -1.4%. PBR -3.2% on dual hit (rate cuts + oil). VALE -2.8% on China demand. EM bond spreads +15bp.',
    relatedAssets: [
      { symbol: 'EWZ', direction: 'down' }, { symbol: 'EWW', direction: 'down' },
      { symbol: 'PBR', direction: 'down' }, { symbol: 'VALE', direction: 'down' },
    ],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Avoid LatAm equity longs until DXY breaks below 103. EWZ support at $28 — if breaks, next stop $25.',
    riskInvalidation: 'Fed signals cuts → DXY drops below 103 → EM money flows reverse immediately',
    macroContext: 'LatAm = high sensitivity to US rates and commodity prices. Selic cuts positive for growth but BRL weakens more on USD strength.',
    watchNext: 'Brazil Selic next decision April 17. EWZ $28 support — critical level. DXY vs 103.',
    sectors: ['EM FX', 'Energy', 'Mining'],
    action_bias: 'bearish',
    confidence: 79,
    watch_next: 'Brazil Selic April 17. EWZ $28 — if breaks, next $25. DXY 103 is the pivot.',
    risk: 'Fed signals cuts — DXY drops, EM rallies hard and fast',
    related_assets: ['EWZ', 'EWW', 'PBR', 'VALE'],
  },
  {
    id: 'latam-copper',
    marketState: 'Copper at $8,900/t on LME. COPX ETF up 6.4% YTD. Chilean peso (CLP) strengthening vs EM peers.',
    regions: ['LatAm'],
    timing: 'Developing',
    driver: 'EV battery orders: CATL raised copper demand forecast +18%. US grid infrastructure bill allocating $65B — copper-intensive. China green energy push.',
    impactText: 'FCX +5.8%, SCCO +4.2%, COPX +6.4% YTD. CLP strengthened 1.2% vs USD. Chilean trade surplus widening on copper revenue.',
    relatedAssets: [
      { symbol: 'COPX', direction: 'up' }, { symbol: 'FCX', direction: 'up' },
      { symbol: 'ECH', direction: 'up' }, { symbol: 'SCCO', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'FCX and SCCO for direct miner exposure. COPX ETF for basket. ECH (Chile ETF) as FX + equity play.',
    riskInvalidation: 'China property sector collapse cuts copper demand — LME below $8,000/t',
    macroContext: 'Each GW of solar requires 5 tons of copper. Each EV requires 4x copper vs combustion engine. Structural demand floor is rising.',
    watchNext: 'LME copper vs $9,000/t resistance. China copper import data (monthly). CATL production schedule.',
    sectors: ['Mining', 'Green Energy'],
    action_bias: 'bullish',
    confidence: 74,
    watch_next: 'LME copper vs $9,000 resistance. China copper import data. CATL production updates.',
    risk: 'China property collapses further — copper back to $8,000 fast',
    related_assets: ['COPX', 'FCX', 'SCCO', 'ECH'],
  },
  {
    id: 'mexico-nearshoring',
    marketState: 'Mexico FDI hit $36B in 2023 — record high. EWW broke $60 resistance, MXN at 16.9 vs USD — strongest in 8 years.',
    regions: ['LatAm'],
    timing: 'Developing',
    driver: 'Apple shifted $15B assembly to Mexico. Tesla Monterrey gigafactory confirmed. US-China tariffs driving 43% of surveyed companies to consider Mexico reshoring.',
    impactText: 'EWW +14% YTD, MXN +4% vs USD YTD. FIBRA (Mexican industrial REITs) +18% — industrial park occupancy at 97%. FDI +8% YoY.',
    relatedAssets: [
      { symbol: 'EWW', direction: 'up' }, { symbol: 'IEV', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'EWW is the cleanest play. Watch industrial REITs (FIBRAMQ) for pure nearshoring exposure. Long MXN vs CNY is the macro expression.',
    riskInvalidation: 'US tariffs extended to Mexico or US recession kills capex spend',
    macroContext: 'Nearshoring is not speculative — Apple, Tesla, and Samsung have signed 10-year leases in Monterrey. The FDI is locked in.',
    watchNext: 'Mexico industrial output April 12. FDI Q1 report. EWW above $62 = next resistance. MXN vs 17.0.',
    sectors: ['Industrials', 'Manufacturing'],
    action_bias: 'bullish',
    confidence: 75,
    watch_next: 'Mexico industrial output April 12. EWW above $62 = next target. MXN holding below 17.0.',
    risk: 'US recession or tariff extension to Mexico — FDI pipeline dries up',
    related_assets: ['EWW', 'IEV'],
  },

  // ── GLOBAL (cross-market only — shown ONLY in Global feed) ───────────────
  {
    id: 'global-rates',
    marketState: 'Fed, ECB, and BoE all on hold. US 10Y at 4.2%, down from 5.0% peak in Oct 2023. QQQ +12% YTD, TLT +4%.',
    regions: ['Global'],
    timing: 'Developing',
    driver: 'US Core PCE at 2.8% — falling toward 2% target. Fed dot plot shows 3 cuts in 2024. ECB and BoE signaling H2 cuts. G10 rate plateau is coordinated.',
    impactText: 'QQQ +12% YTD, TLT +4%, GLD +8%, EEM +3%. DXY -2% from Jan peak. Long-duration assets outperforming cash and short-term bonds.',
    relatedAssets: [
      { symbol: 'TLT', direction: 'up' }, { symbol: 'QQQ', direction: 'up' },
      { symbol: 'GLD', direction: 'up' }, { symbol: 'EEM', direction: 'up' },
      { symbol: 'DXY', direction: 'down' },
    ],
    direction: 'bullish',
    importance: 9,
    actionBias: 'Overweight long-duration bonds (TLT), growth tech (QQQ), gold (GLD), and EM equities (EEM). Reduce cash and short-duration instruments.',
    riskInvalidation: 'Core PCE re-accelerates above 3.0% OR oil spike drives headline CPI back above 4%',
    macroContext: 'Rate peaks have historically been followed by 6-12 months of equity outperformance. 2024 is the year the long-duration trade pays.',
    watchNext: 'US Core PCE monthly (March 29). Fed dot plot June. Eurozone CPI flash April 17. BoJ April 26.',
    sectors: ['Growth', 'Bonds', 'Gold'],
    action_bias: 'bullish',
    confidence: 83,
    watch_next: 'Core PCE March 29. Fed dot plot June meeting. Brent crude vs $90 = the risk.',
    risk: 'Core PCE re-accelerates above 3.0% or oil spikes above $95 — cuts repriced out',
    related_assets: ['TLT', 'QQQ', 'GLD', 'EEM', 'NVDA'],
  },
  {
    id: 'global-dxy-softening',
    marketState: 'DXY at 103.8, down from 107 in Jan. Gold at all-time high $2,180. EM currencies recovering — BRL, MXN, INR all +2-4% YTD.',
    regions: ['Global'],
    timing: 'Live',
    driver: 'Fed rate cut timeline priced in (3 cuts 2024). US 10Y fell from 5.0% to 4.2%. DXY broke 104 support — capital rotating back to EM.',
    impactText: 'EEM +3.2% since DXY break. GLD +8% YTD. BTC +60% YTD benefiting from softer dollar. Commodities (copper, oil) recovering from January lows.',
    relatedAssets: [
      { symbol: 'EEM', direction: 'up' }, { symbol: 'GLD', direction: 'up' },
      { symbol: 'BTC', direction: 'up' }, { symbol: 'DXY', direction: 'down' },
    ],
    direction: 'bullish',
    importance: 8,
    actionBias: 'DXY below 104 = buy EM equities, gold, commodities. The trade works until PCE re-accelerates or US data strengthens again.',
    riskInvalidation: 'Hot PCE or jobs data — DXY recaptures 105, EM trades reverse in 1-2 sessions',
    macroContext: 'DXY is the single most important global macro lever. Every 1% move in DXY = 2-3% move in EM equities and commodities.',
    watchNext: 'DXY 103 support level. US ISM Manufacturing April 1. PCE March 29. Fed speaker calendar.',
    sectors: ['EM Equities', 'Gold', 'Commodities'],
    action_bias: 'bullish',
    confidence: 80,
    watch_next: 'DXY 103 support is critical. PCE March 29. US ISM April 1.',
    risk: 'Hot US data — DXY back to 105, EM reversal immediate',
    related_assets: ['EEM', 'GLD', 'BTC', 'DXY', 'TLT'],
  },
  {
    id: 'global-ai-capex',
    marketState: 'Microsoft capex +$10B YoY. Google +$12B. Meta +$35B AI infrastructure plan. NVDA data center backlog sold out through Q2 2025.',
    regions: ['Global'],
    timing: 'Developing',
    driver: 'MSFT Q3 capex $14B vs $10B last year (+40%). GOOGL raised AI infrastructure budget by $12B. META committed $35B-40B for 2024. NVDA H100 allocation rationed.',
    impactText: 'NVDA +90% YTD. ASML orders +80% in Q4. TSM capacity utilization at 95%. Power grid stocks (VST, CEG) up 40%+ on data center electricity demand.',
    relatedAssets: [
      { symbol: 'NVDA', direction: 'up' }, { symbol: 'TSM', direction: 'up' },
      { symbol: 'ASML', direction: 'up' }, { symbol: 'AMD', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 8,
    actionBias: 'NVDA is the core position. ASML (EU) and TSM (Asia) are legs of the same trade. Watch power infrastructure (VST, CEG) as the adjacent winner.',
    riskInvalidation: 'Any major hyperscaler cuts capex guidance in next earnings — entire AI infrastructure trade reprices -20% fast',
    macroContext: 'AI capex is now the single largest coordinated global investment cycle since the 2000 internet bubble — but with real revenue this time.',
    watchNext: 'MSFT Azure AI revenue next quarterly. TSMC monthly revenue April 10. NVDA GTC conference March 18-21.',
    sectors: ['Semiconductors', 'AI Infrastructure', 'Power'],
    action_bias: 'bullish',
    confidence: 86,
    watch_next: 'TSMC monthly revenue April 10. MSFT next earnings. NVDA must hold $800 on any pullback.',
    risk: 'Any hyperscaler cuts AI capex guidance — infrastructure trade reprices -20% across the board',
    related_assets: ['NVDA', 'TSM', 'ASML', 'AMD', 'QQQ'],
  },
];

// ── WATCH LAYER DATA (region-specific) ──────────────────────────────────────

const WATCH_LAYER = {
  Global: [
    { label: 'PCE Inflation (Fri)', urgency: 'high' },
    { label: 'Fed speakers this week', urgency: 'medium' },
    { label: 'VIX above 20 = vol reset', urgency: 'medium' },
  ],
  US: [
    { label: 'PCE + Core CPI print (Fri)', urgency: 'high' },
    { label: 'QQQ $450 breakout level', urgency: 'high' },
    { label: 'NVDA follow-through at open', urgency: 'medium' },
  ],
  EU: [
    { label: 'ECB minutes release', urgency: 'high' },
    { label: 'Germany IFO confidence', urgency: 'medium' },
    { label: 'STOXX 50 key resistance', urgency: 'medium' },
  ],
  APAC: [
    { label: 'PBOC liquidity injection', urgency: 'high' },
    { label: 'BoJ press conference', urgency: 'high' },
    { label: 'USDJPY 145 level', urgency: 'medium' },
  ],
  Africa: [
    { label: 'China stimulus announcement', urgency: 'high' },
    { label: 'ZAR / DXY correlation', urgency: 'medium' },
    { label: 'Brent crude $90 test', urgency: 'medium' },
  ],
  LatAm: [
    { label: 'Brazil Selic rate decision', urgency: 'high' },
    { label: 'EWZ $28 support', urgency: 'high' },
    { label: 'Copper LME $9,000', urgency: 'medium' },
  ],
};

// ── AUTO-RANKING SYSTEM (CRITICAL) ────────────────────────────────────────────
// System automatically ranks signals by strength + relevance.
// User NEVER chooses what matters. The system decides.
//
// FILTERING: STRICT FILTER FIRST — a card only appears if its `regions` array contains the active region.
// Global: ONLY cards with regions=['Global'] — no regional cards bleed in.
// US/EU/APAC/Africa/LatAm: ONLY cards tagged for that exact region — no cross-contamination.
//
// RANKING: Sort by importance (descending), place strongest signal as HERO
// Zero network calls. Pure JS array filter + sort.

function filterAndRank(reactions, region) {
  return reactions
    .filter(r => r.regions?.includes(region))
    .sort((a, b) => {
      // Primary: importance (strength)
      if (b.importance !== a.importance) return b.importance - a.importance;
      // Secondary: timing (Live > Developing > Follow-up)
      const timingScore = { 'Live': 3, 'Developing': 2, 'Follow-up': 1 };
      return (timingScore[b.timing] || 0) - (timingScore[a.timing] || 0);
    });
}

// ── CONTEXT BLURB (region-aware) ────────────────────────────────────────────

const CONTEXT_BLURBS = {
  Global: { headline: 'Fed pause spreading globally', text: 'Central banks are done hiking. Bond yields falling. Growth stocks rallying. Dollar weakening. This is the setup for a 6-month equity bull run.' },
  US:     { headline: 'Fed stops = tech wins', text: 'When the Fed stops raising rates, big tech stocks typically spike hard for months. Watch bond yields dropping and tech breaking out.' },
  EU:     { headline: 'European stocks cheap vs US, earnings beating', text: 'European companies are winning on earnings. Stock prices still below US levels. Could be a bet on for 6-12 months.' },
  APAC:   { headline: 'China easing vs Japan tightening = opposite forces', text: 'China central bank loosening money. Japan central bank tightening. China stocks could bounce. Japan stocks could sell off.' },
  Africa: { headline: 'Commodity prices = Africa stock direction', text: 'When oil, copper, gold rise → African stocks rise. When they fall → African stocks fall. Watch commodity prices as your leading indicator.' },
  LatAm:  { headline: 'Commodities rallying = Brazil, Mexico rally', text: 'When dollar weakens and commodity prices rise, LatAm currencies strengthen and stocks spike. This is that moment now.' },
};

// ── SEPARATOR ───────────────────────────────────────────────────────────────

function FeedSeparator({ label }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-white/[0.05]" />
      <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.12em] px-2">{label}</span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>
  );
}

// ── WATCH ROW ────────────────────────────────────────────────────────────────

function WatchRow({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-2.5"
    >
      <div className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${item.urgency === 'high' ? 'bg-gold animate-pulse' : 'bg-white/20'}`} />
      <span className="text-xs text-white/60">{item.label}</span>
      {item.urgency === 'high' && (
        <span className="text-[9px] font-bold text-gold/70 bg-gold/10 border border-gold/20 px-1.5 py-0.5 rounded-full ml-auto">Watch</span>
      )}
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function IntelligenceFeed({ activeRegion, onRegionChange }) {
  const [reactions, setReactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setReactions(filterAndRank([...ALL_REACTIONS], activeRegion).slice(0, 4));
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [activeRegion]);

  const context = CONTEXT_BLURBS[activeRegion] || CONTEXT_BLURBS.Global;
  const watchItems = WATCH_LAYER[activeRegion] || WATCH_LAYER.Global;

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeRegion}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
        className="space-y-3"
      >
        {/* ── MACRO CONTEXT BLURB ─────────────────────────────── */}
        <div className="rounded-xl px-4 py-3.5" style={{
          background: 'rgba(14,200,220,0.06)',
          border: '1px solid rgba(14,200,220,0.14)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'rgba(14,200,220,0.75)' }}>{context.headline}</p>
          <p className="text-xs leading-relaxed" style={{ color: 'rgba(200,230,255,0.6)' }}>{context.text}</p>
        </div>

        {/* ── TOP REACTIONS ────────────────────────────────────── */}
        {reactions.slice(0, 2).map((r, i) => (
          <FeedReactionBlock key={r.id} reaction={r} index={i} />
        ))}

        {/* ── SEPARATOR: TREK Watching ─────────────────────────── */}
        <FeedSeparator label="Trek is watching" />

        {/* ── WATCH LAYER ──────────────────────────────────────── */}
        <div className="rounded-xl px-4 py-3.5 space-y-2.5" style={{
          background: 'rgba(3, 7, 18, 0.82)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(100,220,255,0.07)',
        }}>
          <div className="flex items-center gap-2 mb-1">
            <Eye className="h-3.5 w-3.5 text-primary/50" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">On the radar</span>
          </div>
          {watchItems.map((item, i) => (
            <WatchRow key={i} item={item} index={i} />
          ))}
        </div>

        {/* ── REMAINING REACTIONS ──────────────────────────────── */}
        {reactions.slice(2).length > 0 && <FeedSeparator label="More context" />}
        {reactions.slice(2).map((r, i) => (
          <FeedReactionBlock key={r.id} reaction={r} index={i + 2} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}