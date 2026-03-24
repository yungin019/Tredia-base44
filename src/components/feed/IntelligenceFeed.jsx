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

const ALL_REACTIONS = [
  // ── US ──────────────────────────────────────────────────────────────────
  {
    id: 'fed-pause',
    marketState: 'Tech rally forming as Fed signals rate pause',
    regions: ['US'],
    timing: 'Live',
    driver: 'Fed members hint at end of rate hike cycle; bond yields falling 8–10bp',
    impactText: 'Growth sectors rotating in. Bonds benefiting from lower yields. Tech entering early recovery phase.',
    relatedAssets: [
      { symbol: 'NVDA', direction: 'up' }, { symbol: 'AAPL', direction: 'up' },
      { symbol: 'QQQ',  direction: 'up' }, { symbol: 'TLT',  direction: 'up' },
      { symbol: 'UUP',  direction: 'down' },
    ],
    direction: 'bullish',
    importance: 9,
    actionBias: 'Early recovery phase. Buy dips in large-cap tech. QQQ/NVDA leading. Avoid defensives short-term.',
    riskInvalidation: 'Fed reverts hawkish or PCE inflation reignites above 3.5%',
    macroContext: 'Rate cycle nearing peak historically leads to 6–12 month equity outperformance. Duration favored.',
    watchNext: 'PCE inflation report (Friday) + Fed Chair speech. Break above QQQ $450 = confirmation.',
    sectors: ['Technology', 'Growth'],
  },
  {
    id: 'nvidia-earnings',
    marketState: 'AI boom accelerating — semis breaking out higher',
    regions: ['US'],
    timing: 'Developing',
    driver: 'NVIDIA beats earnings and raises guidance; AI demand stronger than consensus expected',
    impactText: 'Semiconductor sector rallying broadly. AI-related names breaking resistance. QQQ outperforming SPY.',
    relatedAssets: [
      { symbol: 'NVDA', direction: 'up' }, { symbol: 'AMD',  direction: 'up' },
      { symbol: 'SMCI', direction: 'up' }, { symbol: 'SPY',  direction: 'up' },
      { symbol: 'QQQ',  direction: 'up' },
    ],
    direction: 'bullish',
    importance: 8,
    actionBias: 'Structural breakout forming. Buy dips in semi peers. Watch for follow-through volume confirmation.',
    riskInvalidation: 'Profit-taking cascade or broader tech sell-off on macro risk-off',
    macroContext: 'AI capex cycle is multi-year. NVDA earnings are a proxy for entire hyperscaler buildout.',
    watchNext: 'MSFT Azure AI revenue next. Watch TSM for global semi confirmation.',
    sectors: ['Semiconductors', 'Technology'],
  },
  {
    id: 'us-jobs-strong',
    marketState: 'Strong jobs data pressures equities, lifts dollar',
    regions: ['US'],
    timing: 'Follow-up',
    driver: 'Non-farm payrolls beat by 60K; unemployment drops to 3.7%; wage growth ticks up',
    impactText: 'Fed expectations repriced higher. Short-duration bonds sell off. Dollar index rallying. Growth stocks under pressure.',
    relatedAssets: [
      { symbol: 'SPY',  direction: 'down' }, { symbol: 'TLT',  direction: 'down' },
      { symbol: 'QQQ',  direction: 'down' }, { symbol: 'GLD',  direction: 'down' },
      { symbol: 'XLF',  direction: 'up' },
    ],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Reduce growth exposure. Rotate into financials (XLF) and short-duration plays. Avoid long bonds.',
    riskInvalidation: 'Subsequent CPI print comes in soft — market quickly reverses Fed expectations',
    macroContext: 'Historically, strong jobs + tighter Fed = equity vol spike for 2–3 weeks before re-pricing.',
    watchNext: 'CPI next week. If under 3.2%, all of this reverses fast.',
    sectors: ['Finance', 'Value'],
  },

  // ── EUROPE ──────────────────────────────────────────────────────────────
  {
    id: 'ecb-inflation',
    marketState: 'EUR strength as inflation stays above ECB target',
    regions: ['EU'],
    timing: 'Live',
    driver: 'Eurozone inflation expectations surge; ECB likely to extend rate hike cycle further',
    impactText: 'Euro rallying vs dollar. Financials and energy outperforming. Consumer discretionary under pressure from higher rates.',
    relatedAssets: [
      { symbol: 'EURUSD', direction: 'up' },  { symbol: 'FEZ',  direction: 'down' },
      { symbol: 'ASML',   direction: 'down' }, { symbol: 'EWG',  direction: 'down' },
      { symbol: 'TLT',    direction: 'down' },
    ],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Rate hike cycle not finished. Favor European financials and energy. Avoid consumer discretionary.',
    riskInvalidation: 'ECB signals pause or unexpected easing data from Eurozone',
    macroContext: 'ECB started hiking later than Fed. Still more room to go. EUR/USD key level at 1.10.',
    watchNext: 'Next ECB meeting + Eurozone CPI flash estimate. Bund 10Y yield direction key.',
    sectors: ['Financials', 'Energy'],
  },
  {
    id: 'stoxx-recovery',
    marketState: 'European equities catching up to US tech rally',
    regions: ['EU'],
    timing: 'Developing',
    driver: 'ASML and SAP beat earnings; Germany PMI stabilizes; EUR holds support',
    impactText: 'DAX and STOXX 50 outperforming. European tech and industrials leading. Banks benefiting from higher rates.',
    relatedAssets: [
      { symbol: 'ASML',   direction: 'up' }, { symbol: 'SAP',   direction: 'up' },
      { symbol: 'EWG',    direction: 'up' }, { symbol: 'FEZ',   direction: 'up' },
      { symbol: 'EURUSD', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'European cyclicals catching a bid. EWG (Germany ETF) and FEZ (Euro Stoxx) are clean plays.',
    riskInvalidation: 'ECB surprises hawkish or Russian energy disruption resumes',
    macroContext: 'European equities cheap vs US historically. Earnings recovery cycle could run 6–12 months.',
    watchNext: 'Germany IFO sentiment + STOXX 50 breakout above key resistance.',
    sectors: ['Industrials', 'Technology'],
  },
  {
    id: 'eu-energy-crunch',
    marketState: 'European energy costs stabilizing — industrial relief forming',
    regions: ['EU'],
    timing: 'Developing',
    driver: 'Gas storage levels above seasonal average; LNG imports offsetting Russian supply cuts',
    impactText: 'European industrials recovering. Chemical and manufacturing sectors outperforming. EUR holding bid.',
    relatedAssets: [
      { symbol: 'EWG', direction: 'up' }, { symbol: 'FEZ',    direction: 'up' },
      { symbol: 'TTE', direction: 'up' }, { symbol: 'EURUSD', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'Rotation into European industrials and energy. Undervalued vs US peers on P/E basis.',
    riskInvalidation: 'Cold winter spike in gas demand or new supply disruption',
    macroContext: 'Energy normalization is the single biggest tailwind for European equities in 2024.',
    watchNext: 'EU gas storage weekly report. TTF natural gas price vs €40/MWh.',
    sectors: ['Energy', 'Industrials'],
  },

  // ── ASIA ────────────────────────────────────────────────────────────────
  {
    id: 'china-gdp-miss',
    marketState: 'China GDP miss opens stimulus window — risk/reward shifts',
    regions: ['APAC'],
    timing: 'Live',
    driver: 'Q4 GDP growth misses estimates; PBOC expected to respond with targeted easing',
    impactText: 'Hang Seng under pressure short-term. CNY weakening. Commodity currencies (AUD, NZD) at risk. Long-term: stimulus setup forming.',
    relatedAssets: [
      { symbol: 'FXI',  direction: 'down' }, { symbol: 'BABA', direction: 'down' },
      { symbol: 'EWJ',  direction: 'up'  }, { symbol: 'KWEB', direction: 'down' },
      { symbol: 'EWY',  direction: 'down' },
    ],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Short-term: avoid longs in China tech. Medium-term: watch for PBOC cut signal — stimulus setup building for re-entry.',
    riskInvalidation: 'Stimulus announced or US-China trade tensions ease unexpectedly',
    macroContext: 'China slowdown hits commodity exporters broadly. PBOC easing historically takes 2–3 quarters to flow through.',
    watchNext: 'PBOC rate decision + MLF liquidity injections. PMI data for March.',
    sectors: ['Emerging Markets', 'Commodities'],
  },
  {
    id: 'japan-boj',
    marketState: 'Yen surges as BoJ hints at yield curve control exit',
    regions: ['APAC'],
    timing: 'Developing',
    driver: 'Bank of Japan signals potential YCC adjustment; inflation expectations rising in Japan',
    impactText: 'JPY strengthening sharply. Nikkei under pressure from yen headwind. Japanese exporters at risk.',
    relatedAssets: [
      { symbol: 'USDJPY', direction: 'down' }, { symbol: 'EWJ', direction: 'down' },
      { symbol: 'TM',     direction: 'down' }, { symbol: 'JGB', direction: 'up'  },
    ],
    direction: 'bearish',
    importance: 7,
    actionBias: 'Avoid Nikkei longs. JPY strength plays (long USDJPY puts). Watch global bond markets — BoJ is a global rates risk.',
    riskInvalidation: 'BoJ explicitly reaffirms YCC or Ueda backtracks at press conference',
    macroContext: 'BoJ is the last major dovish central bank. Normalization = global ripple. Watch US 10Y reaction.',
    watchNext: 'BoJ policy meeting statement. USDJPY 145 level critical.',
    sectors: ['FX', 'Automotive'],
  },
  {
    id: 'india-growth',
    marketState: 'India outperforming as domestic demand surges',
    regions: ['APAC'],
    timing: 'Developing',
    driver: 'India GDP beats; infrastructure spending + digital economy driving structural growth',
    impactText: 'Indian equities outperforming EM peers. INR holding steady. Domestic consumption names leading.',
    relatedAssets: [
      { symbol: 'INDA', direction: 'up' }, { symbol: 'EPI', direction: 'up' },
      { symbol: 'INFY', direction: 'up' }, { symbol: 'HDB', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'INDA ETF is the cleanest entry. Financials and IT services are structural growth plays.',
    riskInvalidation: 'RBI tightens aggressively or global risk-off crushes EM broadly',
    macroContext: 'India is the fastest-growing major economy. Demographic tailwind for 10+ years.',
    watchNext: 'RBI rate decision. India CPI. INDA breakout above $50.',
    sectors: ['Emerging Markets', 'Technology'],
  },

  // ── AFRICA ───────────────────────────────────────────────────────────────
  {
    id: 'africa-commodities',
    marketState: 'Africa-exposed assets react to commodity cycle shift',
    regions: ['Africa'],
    timing: 'Follow-up',
    driver: 'Global commodity demand slowdown hits Sub-Saharan exporters; USD strength adds FX pressure',
    impactText: 'South African rand, Nigerian naira under pressure. Mining stocks (gold, platinum) impacted. Oil exporters watching Brent.',
    relatedAssets: [
      { symbol: 'GLD',  direction: 'up'  }, { symbol: 'VALE', direction: 'down' },
      { symbol: 'BHP',  direction: 'down'}, { symbol: 'AEM',  direction: 'up'  },
      { symbol: 'EZA',  direction: 'down'},
    ],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Watch commodity cycle for re-entry. Gold miners offer relative value. Avoid EM FX plays until DXY stabilizes.',
    riskInvalidation: 'China stimulus drives commodity demand recovery; DXY reverses lower',
    macroContext: 'Africa macro heavily commodity-dependent. China demand = primary leading indicator for the region.',
    watchNext: 'China stimulus announcement. DXY break below 103. Brent crude direction.',
    sectors: ['Mining', 'Commodities', 'EM FX'],
  },
  {
    id: 'africa-gold-play',
    marketState: 'Gold cycle benefits African miners disproportionately',
    regions: ['Africa'],
    timing: 'Developing',
    driver: 'Gold above $2,000/oz as rate cut expectations build; African miners levered to gold price',
    impactText: 'Gold miners in South Africa and West Africa outperforming. EZA getting a partial bid. GLD rising.',
    relatedAssets: [
      { symbol: 'GLD',  direction: 'up' }, { symbol: 'GDX',  direction: 'up' },
      { symbol: 'AEM',  direction: 'up' }, { symbol: 'EZA',  direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'Gold miners offer leveraged exposure to gold price moves. GDX ETF is the cleanest vehicle.',
    riskInvalidation: 'Real yields spike — Fed reverses course. DXY surges above 107.',
    macroContext: 'Gold outperforms in late-cycle environments as real yields fall. Africa benefits structurally.',
    watchNext: 'Gold spot vs $2,100 resistance. GDX ETF volume. US real yield direction.',
    sectors: ['Mining', 'Gold'],
  },

  // ── LATAM ────────────────────────────────────────────────────────────────
  {
    id: 'latam-em',
    marketState: 'LatAm EM squeeze — Brazil/Mexico under dual pressure',
    regions: ['LatAm'],
    timing: 'Live',
    driver: 'USD strength + commodity weakness hitting BRL/MXN; Brazil rate cut bets repriced',
    impactText: 'Brazilian real and Mexican peso weakening. Petrobras, Vale at risk from commodity + FX double hit. EM bond spreads widening.',
    relatedAssets: [
      { symbol: 'EWZ',  direction: 'down' }, { symbol: 'EWW',  direction: 'down' },
      { symbol: 'PBR',  direction: 'down' }, { symbol: 'VALE', direction: 'down' },
    ],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Avoid LatAm equity longs until USD peaks. Watch Petrobras oil correlation — if Brent > $90, partial reversal possible.',
    riskInvalidation: 'Fed cuts materialize → EM rally. Commodity super-cycle resumes.',
    macroContext: 'LatAm markets highly sensitive to US rates + commodity prices. Fed pivot = massive EM tailwind.',
    watchNext: 'Fed dot plot + Brazil Selic rate decision. EWZ support at $28.',
    sectors: ['EM FX', 'Commodities', 'Energy'],
  },
  {
    id: 'latam-copper',
    marketState: 'Chile copper exports benefit from green energy demand',
    regions: ['LatAm'],
    timing: 'Developing',
    driver: 'Copper demand surging from EV and grid infrastructure buildout globally',
    impactText: 'Chilean peso strengthening. Copper miners outperforming. Infrastructure ETFs catching a bid.',
    relatedAssets: [
      { symbol: 'COPX', direction: 'up' }, { symbol: 'FCX',  direction: 'up' },
      { symbol: 'ECH',  direction: 'up' }, { symbol: 'SCCO', direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'Copper miners (FCX, SCCO) offer structural upside. Chile ETF (ECH) as a region play.',
    riskInvalidation: 'China construction demand collapses or EV adoption slows sharply',
    macroContext: 'Copper is the new oil for the energy transition. Long-term structural demand story.',
    watchNext: 'China copper imports data. LME copper price vs $9,000/t.',
    sectors: ['Mining', 'Energy Transition'],
  },
  {
    id: 'mexico-nearshoring',
    marketState: 'Mexico nearshoring wave accelerating — structural inflows',
    regions: ['LatAm'],
    timing: 'Developing',
    driver: 'US companies reshoring manufacturing from China; Mexico benefiting from geographic proximity',
    impactText: 'MXN holding strength vs EM peers. Industrial parks and manufacturing ETFs outperforming. FDI at record highs.',
    relatedAssets: [
      { symbol: 'EWW',  direction: 'up' }, { symbol: 'MCHI', direction: 'down' },
      { symbol: 'IEV',  direction: 'up' },
    ],
    direction: 'bullish',
    importance: 7,
    actionBias: 'EWW (Mexico ETF) is the cleanest play on nearshoring. Long MXN vs CNY is the macro expression.',
    riskInvalidation: 'US recession reduces capex or tariffs escalate against Mexico',
    macroContext: 'Nearshoring is a multi-year structural theme. Mexico at the center of US supply chain diversification.',
    watchNext: 'Mexico industrial output + FDI quarterly data. MXN/USD direction.',
    sectors: ['Industrials', 'Manufacturing'],
  },

  // ── GLOBAL (cross-market only — shown ONLY in Global feed) ───────────────
  {
    id: 'global-rates',
    marketState: 'Peak rate cycle: bonds leading, growth tech front-running cuts',
    regions: ['Global'],
    timing: 'Developing',
    driver: 'Multiple G10 central banks signaling rate plateau; inflation globally subsiding from 2022 peaks; Fed, ECB and BoE all on pause',
    impactText: 'Long-duration bonds rallying globally. Growth tech regaining leadership vs defensives. EM equities and gold benefiting from softer DXY.',
    relatedAssets: [
      { symbol: 'TLT',  direction: 'up' },  { symbol: 'QQQ',  direction: 'up' },
      { symbol: 'GLD',  direction: 'up' },  { symbol: 'EEM',  direction: 'up' },
      { symbol: 'NVDA', direction: 'up' },  { symbol: 'BTC',  direction: 'up' },
      { symbol: 'DXY',  direction: 'down' },
    ],
    direction: 'bullish',
    importance: 9,
    actionBias: 'Favor long duration bonds, large-cap growth tech, EM equities, gold, BTC. Reduce cash, short-duration, defensives.',
    riskInvalidation: 'Inflation re-accelerates globally (oil spike, wage surge). Geopolitical risk premium spikes.',
    macroContext: 'Peak rate environments historically precede 6–12 months of equity outperformance. Duration trade is the structural setup.',
    watchNext: 'US Core PCE (Fri) + Fed dot plot. Eurozone CPI flash. BoJ June meeting.',
    sectors: ['Growth', 'Bonds', 'Gold', 'Crypto'],
  },
  {
    id: 'global-dxy-softening',
    marketState: 'Dollar softening — EM and commodities getting relief',
    regions: ['Global'],
    timing: 'Live',
    driver: 'US rate expectations repriced lower; DXY breaking key support; capital flowing back to EM',
    impactText: 'EM equities and currencies rallying. Commodities benefiting from weaker dollar. Gold breaking out.',
    relatedAssets: [
      { symbol: 'EEM',  direction: 'up'  }, { symbol: 'GLD',  direction: 'up'  },
      { symbol: 'BTC',  direction: 'up'  }, { symbol: 'DXY',  direction: 'down' },
      { symbol: 'TLT',  direction: 'up'  },
    ],
    direction: 'bullish',
    importance: 8,
    actionBias: 'DXY break = buy EM equities, gold, commodities. Position before the crowd catches on.',
    riskInvalidation: 'US data surprises strong — Fed hawks return. DXY recaptures 104.',
    macroContext: 'DXY is the global macro risk dial. Softer dollar = EM relief valve + commodity tailwind simultaneously.',
    watchNext: 'DXY 103 support. Fed speakers tone. US ISM manufacturing.',
    sectors: ['EM', 'Gold', 'Commodities'],
  },
  {
    id: 'global-ai-capex',
    marketState: 'AI infrastructure buildout is a multi-year cross-market theme',
    regions: ['Global'],
    timing: 'Developing',
    driver: 'Hyperscaler capex guidance raised across MSFT, GOOGL, AMZN, META; data center buildout accelerating',
    impactText: 'Semiconductor supply chains globally stretched. Power and cooling infrastructure demand surging. AI proxy names leading across US and Asian markets.',
    relatedAssets: [
      { symbol: 'NVDA', direction: 'up' }, { symbol: 'TSM',  direction: 'up' },
      { symbol: 'ASML', direction: 'up' }, { symbol: 'AMD',  direction: 'up' },
      { symbol: 'QQQ',  direction: 'up' },
    ],
    direction: 'bullish',
    importance: 8,
    actionBias: 'AI is not a single-country trade. NVDA (US), ASML (EU), TSM (Asia) are all legs of the same structural story.',
    riskInvalidation: 'Hyperscaler capex guidance cut or AI demand plateaus short-term',
    macroContext: 'AI capex cycle is the most coordinated global investment theme since internet infrastructure in the late 1990s.',
    watchNext: 'Q4 earnings from MSFT, GOOGL, AMZN. TSMC monthly revenue. NVDA data center segment.',
    sectors: ['Semiconductors', 'Technology', 'Infrastructure'],
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