import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ── RULE ──────────────────────────────────────────────────────────────────────
// Every figure in a generated signal must come from a quote this function
// actually fetched. Nothing here is estimated, scaled or invented: if a value
// is not in `data`, the sentence that would have used it is left out.
//
// Input fields (all optional — a signal is skipped when its inputs are missing):
//   spy        { price, prevClose, high, low, changePct }
//   qqq        { price, prevClose, high, low, changePct }
//   vixy       { price, prevClose, high, low, changePct }   (VIXY ETF, not the VIX index)
//   tlt        { price, prevClose, high, low, changePct }
//   sectors[]  { symbol, name, price, prevClose, changePct }
//   fearGreed  number 0-100 (alternative.me)

const BANNED_PHRASES = ['sentiment', 'momentum intact', 'bullish narrative'];

function validateSignal(signal) {
  const allText = [signal.market_state, signal.driver, signal.impact, signal.risk].join(' ').toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (allText.includes(phrase)) {
      console.warn(`[VALIDATION] Rejected signal "${signal.id}" — contains banned phrase: "${phrase}"`);
      return false;
    }
  }
  const hasNumber = /\d/.test(allText);
  if (!hasNumber) {
    console.warn(`[VALIDATION] Rejected signal "${signal.id}" — no numbers found`);
    return false;
  }
  return true;
}

// ── FORMATTERS ────────────────────────────────────────────────────────────────
const pct = (v) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
const usd = (v) => `$${v.toFixed(2)}`;
const pts = (v) => Math.abs(v).toFixed(2);
const REGIONS = ['US', 'Global'];

function makeSignal({ id, headline, market_state, driver, impact, action_bias, risk, confidence, related_assets, published_at }) {
  return {
    id,
    type: 'structure',
    headline,
    source_name: 'Market Structure',
    source_url: '#',
    market_state,
    driver,
    impact,
    action_bias,
    risk,
    category: 'macro',
    confidence: Math.round(confidence),
    related_assets,
    regions: REGIONS,
    published_at,
    interpretation_updated_at: published_at,
    stage: 'confirmed_catalyst',
  };
}

function sectorLine(sectors, exclude) {
  const parts = (sectors || [])
    .filter((s) => s && s.changePct !== null && s.changePct !== undefined && s.symbol !== exclude)
    .map((s) => `${s.symbol} ${pct(s.changePct)}`);
  return parts.length ? `${parts.join(', ')}.` : 'No sector ETFs were quoted for this session.';
}

function rangeLine(q) {
  if (!q || q.high === null || q.low === null || q.high === undefined || q.low === undefined) return '';
  return ` Session range ${usd(q.low)} to ${usd(q.high)}.`;
}

// ── SIGNAL GENERATION ─────────────────────────────────────────────────────────
function generateStructureSignals(data) {
  const { spy, qqq, vixy, tlt, sectors = [], fearGreed } = data;
  const signals = [];
  const now = new Date().toISOString();
  const spyChange = spy?.changePct ?? null;

  // 1. SPY session move — price, prior close, range and QQQ spread only.
  if (spy && spyChange !== null && Math.abs(spyChange) >= 1.5) {
    const up = spyChange > 0;
    const spread = qqq && qqq.changePct !== null ? Math.abs(qqq.changePct - spyChange) : null;
    const signal = makeSignal({
      id: `struct_spy_${Date.now()}`,
      headline: `SPY ${pct(spyChange)} at ${usd(spy.price)} — ${up ? 'higher' : 'lower'} on the session`,
      market_state: `SPY closed at ${usd(spy.price)} against a prior close of ${usd(spy.prevClose)}, a move of ${pct(spyChange)}.${rangeLine(spy)}${qqq ? ` QQQ ${usd(qqq.price)} (${pct(qqq.changePct)}).` : ''}`,
      driver: spread === null
        ? `SPY moved ${pct(spyChange)}. QQQ was not quoted in this session's data.`
        : `SPY ${pct(spyChange)} and QQQ ${pct(qqq.changePct)} — the two indices ended ${pts(spread)} percentage points apart.`,
      impact: sectorLine(sectors, null),
      action_bias: up ? 'bullish' : 'bearish',
      risk: up
        ? `A move back down to the ${usd(spy.low ?? spy.prevClose)} session low would reverse the session's gain.`
        : `A move back up to the ${usd(spy.high ?? spy.prevClose)} session high would reverse the session's decline.`,
      confidence: Math.min(90, 60 + Math.abs(spyChange) * 8),
      related_assets: ['SPY', 'QQQ', ...(sectors || []).slice(0, 2).map((s) => s.symbol)].filter(Boolean),
      published_at: now,
    });
    if (validateSignal(signal)) signals.push(signal);
  }

  // 2. Volatility ETF move — VIXY priced and labelled as VIXY, never as "VIX at X".
  if (vixy && vixy.changePct !== null && Math.abs(vixy.changePct) >= 3) {
    const up = vixy.changePct > 0;
    const signal = makeSignal({
      id: `struct_vol_${Date.now()}`,
      headline: `VIXY ${pct(vixy.changePct)} to ${usd(vixy.price)} — short-dated volatility ETF ${up ? 'bid up' : 'sold off'}`,
      market_state: `VIXY, which tracks short-dated VIX futures, closed at ${usd(vixy.price)} against a prior close of ${usd(vixy.prevClose)} — ${pct(vixy.changePct)}.${spyChange !== null ? ` SPY finished ${pct(spyChange)}.` : ''}`,
      driver: spyChange !== null
        ? `The volatility ETF moved ${pct(vixy.changePct)} while SPY moved ${pct(spyChange)} — ${pts(vixy.changePct - spyChange)} percentage points apart.`
        : `The volatility ETF moved ${pct(vixy.changePct)} on the session.`,
      impact: fearGreed !== null && fearGreed !== undefined
        ? `Fear & Greed index at ${fearGreed}/100 alongside the move. ${sectorLine(sectors, null)}`
        : sectorLine(sectors, null),
      action_bias: up ? 'bearish' : 'bullish',
      risk: `A return to the ${usd(vixy.prevClose)} prior close would fully unwind the ${pct(vixy.changePct)} move.`,
      confidence: Math.min(85, 55 + Math.abs(vixy.changePct) * 4),
      related_assets: ['SPY', 'QQQ', 'VIXY'],
      published_at: now,
    });
    if (validateSignal(signal)) signals.push(signal);
  }

  // 3. Sector rotation — the leading sector ETF's own quote against SPY.
  const quotedSectors = (sectors || []).filter((s) => s && s.changePct !== null && s.changePct !== undefined);
  if (quotedSectors.length > 0 && spyChange !== null) {
    const top = quotedSectors.reduce((a, b) => (Math.abs(b.changePct) > Math.abs(a.changePct) ? b : a));
    if (Math.abs(top.changePct) >= 2) {
      const gap = Math.abs(top.changePct - spyChange);
      const signal = makeSignal({
        id: `struct_sector_${Date.now()}`,
        headline: `${top.name} (${top.symbol}) ${pct(top.changePct)} versus SPY ${pct(spyChange)}`,
        market_state: `${top.symbol} closed at ${usd(top.price)} against a prior close of ${usd(top.prevClose)} — ${pct(top.changePct)}. SPY ${pct(spyChange)} over the same session.`,
        driver: `${top.symbol} and SPY ended ${pts(gap)} percentage points apart.`,
        impact: sectorLine(quotedSectors, top.symbol),
        action_bias: top.changePct > 0 ? 'bullish' : 'bearish',
        risk: `A close back at the ${usd(top.prevClose)} prior close would erase the session move in ${top.symbol}.`,
        confidence: Math.min(85, 58 + Math.abs(top.changePct) * 5),
        related_assets: [top.symbol, 'SPY', 'QQQ'],
        published_at: now,
      });
      if (validateSignal(signal)) signals.push(signal);
    }
  }

  // 4. Long-duration Treasuries — TLT's own quote, no implied yield arithmetic.
  if (tlt && tlt.changePct !== null && Math.abs(tlt.changePct) >= 0.5) {
    const up = tlt.changePct > 0;
    const signal = makeSignal({
      id: `struct_rates_${Date.now()}`,
      headline: `TLT ${pct(tlt.changePct)} at ${usd(tlt.price)} — long-duration Treasuries ${up ? 'bid' : 'offered'}`,
      market_state: `TLT closed at ${usd(tlt.price)} against a prior close of ${usd(tlt.prevClose)} — ${pct(tlt.changePct)}.${spyChange !== null ? ` SPY ${pct(spyChange)}.` : ''}`,
      driver: spyChange !== null
        ? `The Treasury ETF moved ${pct(tlt.changePct)} while SPY moved ${pct(spyChange)}.`
        : `The Treasury ETF moved ${pct(tlt.changePct)} on the session.`,
      impact: qqq ? `QQQ ${pct(qqq.changePct)} over the same session.${sectorLine(sectors, null)}` : sectorLine(sectors, null),
      action_bias: up ? 'bullish' : 'bearish',
      risk: `A move back to the ${usd(tlt.prevClose)} prior close would reverse the session's Treasury move.`,
      confidence: Math.min(80, 55 + Math.abs(tlt.changePct) * 6),
      related_assets: ['TLT', 'SPY', 'QQQ'],
      published_at: now,
    });
    if (validateSignal(signal)) signals.push(signal);
  }

  // 5. Fear & Greed — the index value itself, read from alternative.me.
  if (fearGreed !== null && fearGreed !== undefined) {
    const band = fearGreed > 75 ? 'extreme greed'
      : fearGreed > 55 ? 'greed'
      : fearGreed >= 45 ? 'neutral band'
      : fearGreed > 25 ? 'fear'
      : 'extreme fear';
    const signal = makeSignal({
      id: `struct_fng_${Date.now()}`,
      headline: `Fear & Greed ${fearGreed}/100 — ${band}`,
      market_state: `Fear & Greed index at ${fearGreed}/100.${spy ? ` SPY ${usd(spy.price)} (${pct(spy.changePct)}).` : ''}${vixy ? ` VIXY ${usd(vixy.price)} (${pct(vixy.changePct)}).` : ''}`,
      driver: `${fearGreed}/100 on the index${spy ? ` while SPY moved ${pct(spy.changePct)}` : ''}${vixy ? ` and the volatility ETF VIXY moved ${pct(vixy.changePct)}` : ''}.`,
      impact: sectorLine(sectors, null),
      action_bias: fearGreed > 55 ? 'bullish' : fearGreed < 45 ? 'bearish' : 'neutral',
      risk: `The index is recalculated daily — today's ${fearGreed}/100 does not carry into the next session.`,
      confidence: Math.min(85, 50 + Math.abs(fearGreed - 50) * 0.7),
      related_assets: ['SPY', 'QQQ', 'TLT'],
      published_at: now,
    });
    if (validateSignal(signal)) signals.push(signal);
  }

  return signals;
}

// ── SERVER ────────────────────────────────────────────────────────────────────
const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');

async function quote(symbol) {
  if (!FINNHUB_KEY) return null;
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d || !(d.c > 0)) return null;
    return {
      price: d.c,
      prevClose: d.pc > 0 ? d.pc : null,
      high: d.h > 0 ? d.h : null,
      low: d.l > 0 ? d.l : null,
      changePct: d.pc > 0 ? ((d.c - d.pc) / d.pc) * 100 : null,
    };
  } catch (_) {
    return null;
  }
}

Deno.serve(async (req) => {
  try {
    // Market structure signals are public-safe — no user auth required.
    const sectorDefs = [
      { symbol: 'XLK', name: 'Technology' },
      { symbol: 'XLF', name: 'Financials' },
      { symbol: 'XLE', name: 'Energy' },
      { symbol: 'XLV', name: 'Healthcare' },
      { symbol: 'XLY', name: 'Consumer Discretionary' },
    ];

    console.log('[STRUCTURE SIGNALS] Fetching live quotes from Finnhub');
    const [spy, qqq, vixy, tlt, ...sectorQuotes] = await Promise.all([
      quote('SPY'), quote('QQQ'), quote('VIXY'), quote('TLT'),
      ...sectorDefs.map((s) => quote(s.symbol)),
    ]);

    const sectors = sectorDefs
      .map((def, i) => (sectorQuotes[i] ? { ...def, ...sectorQuotes[i] } : null))
      .filter(Boolean);

    // Fear & Greed — the same index the gauges read (alternative.me).
    let fearGreed = null;
    try {
      const fngRes = await fetch('https://api.alternative.me/fng/', { signal: AbortSignal.timeout(5000) });
      const fngData = await fngRes.json();
      const value = parseInt(fngData?.data?.[0]?.value, 10);
      fearGreed = Number.isFinite(value) ? value : null;
    } catch (e) {
      console.warn('[STRUCTURE SIGNALS] Fear & Greed unavailable:', e.message);
    }

    const signals = generateStructureSignals({ spy, qqq, vixy, tlt, sectors, fearGreed });
    console.log(`[STRUCTURE SIGNALS] Generated ${signals.length} validated signals`);

    return Response.json({ status: 'success', signals, count: signals.length, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[STRUCTURE SIGNALS] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});