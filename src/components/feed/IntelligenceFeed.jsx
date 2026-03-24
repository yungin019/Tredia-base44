import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import FeedReactionBlock from './FeedReactionBlock';
import RegionSwitcher from './RegionSwitcher';

// ── FULL REACTION DATABASE (region-tagged) ─────────────────────────────────

const ALL_REACTIONS = [
  // ── US ──────────────────────────────────────────────────────────────────
  {
    id: 'fed-pause',
    marketState: 'Tech rally forming as Fed signals rate pause',
    region: 'US',
    timing: 'Live',
    driver: 'Fed members hint at end of rate hike cycle; bond yields falling 8–10bp',
    impactText: 'Growth sectors rotating in. Bonds benefiting from lower yields. Tech entering early recovery phase.',
    relatedAssets: [
      { symbol: 'NVDA', direction: 'up' }, { symbol: 'AAPL', direction: 'up' },
      { symbol: 'QQQ',  direction: 'up' }, { symbol: 'TLT',  direction: 'up' },
      { symbol: 'UUP',  direction: 'down' },
    ],
    affectedRegions: ['US', 'Global'],
    direction: 'bullish',
    importance: 9,
    actionBias: 'Early recovery phase. Buy dips in large-cap tech. QQQ/NVDA leading. Avoid defensives and energy short-term.',
    riskInvalidation: 'Fed reverts hawkish or PCE inflation reignites above 3.5%',
    macroContext: 'Rate cycle nearing peak historically leads to 6–12 month equity outperformance. Duration favored.',
    watchNext: 'PCE inflation report (Friday) + Fed Chair speech. Break above QQQ $450 = confirmation.',
    sectors: ['Technology', 'Growth'],
  },
  {
    id: 'nvidia-earnings',
    marketState: 'AI boom accelerating — semis breaking out higher',
    region: 'US',
    timing: 'Developing',
    driver: 'NVIDIA beats earnings and raises guidance; AI demand stronger than consensus expected',
    impactText: 'Semiconductor sector rallying broadly. AI-related names breaking resistance. QQQ outperforming SPY.',
    relatedAssets: [
      { symbol: 'NVDA', direction: 'up' }, { symbol: 'AMD',  direction: 'up' },
      { symbol: 'SMCI', direction: 'up' }, { symbol: 'ASML', direction: 'up' },
      { symbol: 'QQQ',  direction: 'up' },
    ],
    affectedRegions: ['US', 'EU'],
    direction: 'bullish',
    importance: 8,
    actionBias: 'Structural breakout forming. Buy dips in peer stocks. Watch for follow-through continuation.',
    riskInvalidation: 'Profit-taking cascade or broader tech sell-off on macro risk-off',
    macroContext: 'AI capex cycle is multi-year. NVDA earnings are a proxy for entire hyperscaler buildout.',
    watchNext: 'MSFT Azure AI revenue next. Watch TSM for global semi confirmation.',
    sectors: ['Semiconductors', 'Technology'],
  },
  {
    id: 'us-jobs-strong',
    marketState: 'Strong jobs data pressures equities, lifts dollar',
    region: 'US',
    timing: 'Follow-up',
    driver: 'Non-farm payrolls beat by 60K; unemployment drops to 3.7%; wage growth ticks up',
    impactText: 'Fed expectations repriced higher. Short-duration bonds sell off. Dollar index rallying. Growth stocks under pressure.',
    relatedAssets: [
      { symbol: 'DXY',  direction: 'up' },   { symbol: 'TLT',  direction: 'down' },
      { symbol: 'QQQ',  direction: 'down' },  { symbol: 'GLD',  direction: 'down' },
      { symbol: 'XLF',  direction: 'up' },
    ],
    affectedRegions: ['US', 'Global'],
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
    region: 'Europe',
    timing: 'Live',
    driver: 'Eurozone inflation expectations surge; ECB likely to extend rate hike cycle further',
    impactText: 'Euro rallying vs dollar. Financials and energy outperforming. Consumer discretionary under pressure from higher rates.',
    relatedAssets: [
      { symbol: 'EURUSD', direction: 'up' },   { symbol: 'STOXX',  direction: 'down' },
      { symbol: 'SAP',    direction: 'up' },    { symbol: 'ASML',   direction: 'down' },
      { symbol: 'BNP',    direction: 'up' },
    ],
    affectedRegions: ['EU', 'UK', 'Global'],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Rate hike cycle not finished. Favor financial stocks and energy. Avoid consumer discretionary and rate-sensitive names.',
    riskInvalidation: 'ECB signals pause or unexpected easing data from Eurozone',
    macroContext: 'ECB started hiking later than Fed. Still more room to go. EUR/USD key level at 1.10.',
    watchNext: 'Next ECB meeting + Eurozone CPI flash estimate. Bund 10Y yield direction key.',
    sectors: ['Financials', 'Energy'],
  },
  {
    id: 'stoxx-recovery',
    marketState: 'European equities catching up to US tech rally',
    region: 'Europe',
    timing: 'Developing',
    driver: 'ASML and SAP beat earnings; Germany PMI stabilizes; EUR holds support',
    impactText: 'DAX and STOXX 50 outperforming. European tech and industrials leading. Banks benefiting from higher rates.',
    relatedAssets: [
      { symbol: 'ASML',   direction: 'up' }, { symbol: 'SAP',   direction: 'up' },
      { symbol: 'EWG',    direction: 'up' }, { symbol: 'FEZ',   direction: 'up' },
      { symbol: 'EURUSD', direction: 'up' },
    ],
    affectedRegions: ['EU'],
    direction: 'bullish',
    importance: 7,
    actionBias: 'European cyclicals catching a bid. EWG (Germany ETF) and FEZ (Euro Stoxx) are clean plays.',
    riskInvalidation: 'ECB surprises hawkish or Russian energy disruption resumes',
    macroContext: 'European equities cheap vs US historically. Earnings recovery cycle could run 6–12 months.',
    watchNext: 'Germany IFO sentiment + STOXX 50 breakout above key resistance.',
    sectors: ['Industrials', 'Technology'],
  },

  // ── ASIA ────────────────────────────────────────────────────────────────
  {
    id: 'china-gdp-miss',
    marketState: 'China GDP miss opens stimulus window — risk/reward shifts',
    region: 'Asia',
    timing: 'Live',
    driver: 'Q4 GDP growth misses estimates; PBOC expected to respond with targeted easing',
    impactText: 'Hang Seng under pressure short-term. CNY weakening. Commodity currencies (AUD, NZD) at risk. Long-term: stimulus setup forming.',
    relatedAssets: [
      { symbol: 'FXI',  direction: 'down' }, { symbol: 'BABA', direction: 'down' },
      { symbol: 'AUD',  direction: 'down' }, { symbol: 'KWEB', direction: 'down' },
      { symbol: 'VALE', direction: 'down' },
    ],
    affectedRegions: ['APAC', 'Africa', 'LatAm'],
    direction: 'bearish',
    importance: 8,
    actionBias: 'Short-term: avoid longs in China tech. Medium-term: watch for PBOC cut signal — stimulus setup building for re-entry.',
    riskInvalidation: 'Stimulus announced or US-China trade tensions ease unexpectedly',
    macroContext: 'China slowdown hits commodity exporters globally — Africa, LatAm, Australia all exposed.',
    watchNext: 'PBOC rate decision + MLF liquidity injections. PMI data for March.',
    sectors: ['Emerging Markets', 'Commodities'],
  },
  {
    id: 'japan-boj',
    marketState: 'Yen surges as BoJ hints at yield curve control exit',
    region: 'Asia',
    timing: 'Developing',
    driver: 'Bank of Japan signals potential YCC adjustment; inflation expectations rising in Japan',
    impactText: 'JPY strengthening sharply. Nikkei under pressure from yen headwind. Japanese exporters at risk.',
    relatedAssets: [
      { symbol: 'USDJPY', direction: 'down' }, { symbol: 'EWJ',  direction: 'down' },
      { symbol: 'TM',     direction: 'down' }, { symbol: 'SNY',  direction: 'up' },
      { symbol: 'JGB',    direction: 'up' },
    ],
    affectedRegions: ['APAC'],
    direction: 'bearish',
    importance: 7,
    actionBias: 'Avoid Nikkei longs. JPY strength plays (long USDJPY puts). Watch global bond markets — BoJ is a global rates risk.',
    riskInvalidation: 'BoJ explicitly reaffirms YCC or Ueda backtracks at press conference',
    macroContext: 'BoJ is the last major dovish central bank. Normalization = global ripple. Watch US 10Y reaction.',
    watchNext: 'BoJ policy meeting statement. USDJPY 145 level critical.',
    sectors: ['FX', 'Automotive'],
  },

  // ── AFRICA ───────────────────────────────────────────────────────────────
  {
    id: 'africa-commodities',
    marketState: 'Africa-exposed assets react to commodity cycle shift',
    region: 'Africa',
    timing: 'Follow-up',
    driver: 'Global commodity demand slowdown hits Sub-Saharan exporters; USD strength adds FX pressure',
    impactText: 'South African rand, Nigerian naira under pressure. Mining stocks (gold, platinum) impacted. Oil exporters watching Brent.',
    relatedAssets: [
      { symbol: 'ZARUSD', direction: 'down' }, { symbol: 'ANG',  direction: 'down' },
      { symbol: 'GLD',    direction: 'up' },   { symbol: 'VALE', direction: 'down' },
      { symbol: 'BHP',    direction: 'down' },
    ],
    affectedRegions: ['Africa', 'Global'],
    direction: 'bearish',
    importance: 7,
    actionBias: 'Watch commodity cycle for re-entry. Gold miners offer relative value. Avoid EM FX plays until DXY stabilizes.',
    riskInvalidation: 'China stimulus drives commodity demand recovery; DXY reverses lower',
    macroContext: 'Africa macro heavily commodity-dependent. China slowdown is the primary risk driver for the region.',
    watchNext: 'China stimulus announcement. DXY break below 103. Brent crude direction.',
    sectors: ['Mining', 'Commodities', 'EM FX'],
  },

  // ── LATAM ────────────────────────────────────────────────────────────────
  {
    id: 'latam-em',
    marketState: 'LatAm EM squeeze — Brazil/Mexico under dual pressure',
    region: 'LatAm',
    timing: 'Live',
    driver: 'USD strength + commodity weakness hitting BRL/MXN; Brazil rate cut bets repriced',
    impactText: 'Brazilian real and Mexican peso weakening. Petrobras, Vale at risk from commodity + FX double hit. EM bond spreads widening.',
    relatedAssets: [
      { symbol: 'EWZ',  direction: 'down' }, { symbol: 'EWW',  direction: 'down' },
      { symbol: 'PBR',  direction: 'down' }, { symbol: 'VALE', direction: 'down' },
      { symbol: 'BRL',  direction: 'down' },
    ],
    affectedRegions: ['LatAm', 'Global'],
    direction: 'bearish',
    importance: 7,
    actionBias: 'Avoid LatAm equity longs until USD peaks. Watch Petrobras oil correlation — if Brent > $90, partial reversal possible.',
    riskInvalidation: 'Fed cuts materialize → EM rally. Commodity super-cycle resumes.',
    macroContext: 'LatAm markets highly sensitive to US rates + commodity prices. Fed pivot = massive EM tailwind.',
    watchNext: 'Fed dot plot + Brazil Selic rate decision. EWZ support at $28.',
    sectors: ['EM FX', 'Commodities', 'Energy'],
  },
  {
    id: 'latam-copper',
    marketState: 'Chile copper exports benefit from green energy demand',
    region: 'LatAm',
    timing: 'Developing',
    driver: 'Copper demand surging from EV and grid infrastructure buildout globally',
    impactText: 'Chilean peso strengthening. Copper miners outperforming. Infrastructure ETFs catching a bid.',
    relatedAssets: [
      { symbol: 'COPX', direction: 'up' },  { symbol: 'FCX',  direction: 'up' },
      { symbol: 'ECH',  direction: 'up' },  { symbol: 'SCCO', direction: 'up' },
    ],
    affectedRegions: ['LatAm', 'Global'],
    direction: 'bullish',
    importance: 7,
    actionBias: 'Copper miners (FCX, SCCO) offer structural upside. Chile ETF (ECH) as a region play.',
    riskInvalidation: 'China construction demand collapses or EV adoption slows sharply',
    macroContext: 'Copper is the new oil for the energy transition. Long-term structural demand story.',
    watchNext: 'China copper imports data. LME copper price vs $9,000/t.',
    sectors: ['Mining', 'Energy Transition'],
  },

  // ── GLOBAL ───────────────────────────────────────────────────────────────
  {
    id: 'global-rates',
    marketState: 'Peak rate cycle: bonds leading, growth tech front-running cuts',
    region: 'Global',
    timing: 'Developing',
    driver: 'Multiple G10 central banks signaling rate plateau; inflation globally subsiding from 2022 peaks; Fed, ECB and BoE all on pause',
    impactText: 'Long-duration bonds rallying globally. Growth tech regaining leadership vs defensives. EM equities and gold benefiting from softer DXY. Short-duration and cash losing relative ground.',
    relatedAssets: [
      { symbol: 'TLT',  direction: 'up' },  { symbol: 'QQQ',  direction: 'up' },
      { symbol: 'GLD',  direction: 'up' },  { symbol: 'EEM',  direction: 'up' },
      { symbol: 'NVDA', direction: 'up' },  { symbol: 'BTC',  direction: 'up' },
      { symbol: 'DXY',  direction: 'down' },
    ],
    affectedRegions: ['US', 'EU', 'APAC', 'LatAm', 'Africa', 'Global'],
    direction: 'bullish',
    importance: 9,
    actionBias: 'Favor long duration bonds, large-cap growth tech, EM equities, gold, BTC. Reduce cash, short-duration, defensives.',
    riskInvalidation: 'Inflation re-accelerates globally (oil spike, wage surge). Geopolitical risk premium spikes unexpectedly.',
    macroContext: 'Peak rate environments historically precede 6–12 months of equity outperformance. Duration trade is the structural setup. Equities front-run cuts by 9–12 months — the window is now.',
    watchNext: 'US Core PCE (Fri) + Fed dot plot. Eurozone CPI flash. BoJ June meeting. Break above QQQ $450 = full confirmation.',
    sectors: ['Growth', 'Bonds', 'Gold', 'Crypto'],
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

// ── RANKING ──────────────────────────────────────────────────────────────────
// Global: show only reactions tagged affectedRegions includes 'Global', ranked by importance desc.
// This makes Global first-class (high-impact cross-market) not a fallback dump.
// Regional: score = regional match (10) + region tag (5) + importance. Pure JS, no backend.

function rankForRegion(reactions, region) {
  if (region === 'Global') {
    return reactions
      .filter(r => r.affectedRegions?.includes('Global'))
      .sort((a, b) => b.importance - a.importance);
  }
  return reactions
    .map(r => ({
      ...r,
      _score:
        (r.affectedRegions?.includes(region) ? 10 : 0) +
        (r.region === region || r.region === 'Global' ? 5 : 0) +
        r.importance,
    }))
    .sort((a, b) => b._score - a._score);
}

// ── CONTEXT BLURB (region-aware) ────────────────────────────────────────────

const CONTEXT_BLURBS = {
  Global: { headline: 'Cross-market macro regime — highest impact signals', text: 'Peak rate cycle globally. Bond markets leading equities. DXY is the compass: softer dollar = EM relief, growth tech, gold. Watch US PCE + BoJ as the two global swing factors.' },
  US:     { headline: 'Fed pivot = growth rotation', text: 'Rate hike cycle nearing end. Historically: growth tech wins 6–12 months post-peak. Duration trade building. Watch yields + PCE.' },
  EU:     { headline: 'ECB still hawkish, but earnings recovering', text: 'European equities cheap vs US. Earnings season positive. ECB may overtighten — watch banking sector for stress.' },
  APAC:   { headline: 'China stimulus vs BoJ tightening = split APAC', text: 'PBOC expected to ease while BoJ exits YCC. Opposite forces. Favor Japan exporters hedge plays; watch CNY for China re-entry signal.' },
  Africa: { headline: 'Commodity cycle is the Africa macro dial', text: 'Sub-Saharan economies co-move with commodity prices and DXY. China demand = primary leading indicator for the region.' },
  LatAm:  { headline: 'EM cycle tied to Fed + commodities', text: 'LatAm is a leveraged bet on commodities + DXY softness. Fed cut cycle = EM bull market. Copper structural tailwind for Chile.' },
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
      setReactions(rankForRegion([...ALL_REACTIONS], activeRegion).slice(0, 4));
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
        <div className="rounded-xl px-4 py-3 border border-white/[0.06]" style={{ background: 'rgba(16,185,129,0.04)' }}>
          <p className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-1">{context.headline}</p>
          <p className="text-xs text-white/55 leading-relaxed">{context.text}</p>
        </div>

        {/* ── TOP REACTIONS ────────────────────────────────────── */}
        {reactions.slice(0, 2).map((r, i) => (
          <FeedReactionBlock key={r.id} reaction={r} index={i} />
        ))}

        {/* ── SEPARATOR: TREK Watching ─────────────────────────── */}
        <FeedSeparator label="Trek is watching" />

        {/* ── WATCH LAYER ──────────────────────────────────────── */}
        <div className="rounded-xl border border-white/[0.06] px-4 py-3.5 space-y-2.5" style={{ background: 'rgba(11,15,25,0.6)' }}>
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