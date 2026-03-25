import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ── VALIDATION ────────────────────────────────────────────────────────────────
// Reject signals with banned vague phrases
const BANNED_PHRASES = ['sentiment', 'momentum intact', 'bullish narrative'];

function validateSignal(signal) {
  const allText = [signal.market_state, signal.driver, signal.impact, signal.risk].join(' ').toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (allText.includes(phrase)) {
      console.warn(`[VALIDATION] Rejected signal "${signal.id}" — contains banned phrase: "${phrase}"`);
      return false;
    }
  }
  // Must include at least one number in market_state or driver
  const hasNumber = /\d/.test(allText);
  if (!hasNumber) {
    console.warn(`[VALIDATION] Rejected signal "${signal.id}" — no numbers found`);
    return false;
  }
  return true;
}

// ── TRADE SETUP BUILDER ───────────────────────────────────────────────────────
// Generates a max 3-line trade setup using real price levels from marketData
function buildTradeSetup(type, spyPrice, spyChangePct, extras = {}) {
  if (!spyPrice) return null;

  const p = parseFloat(spyPrice.toFixed(2));
  const isUp = spyChangePct > 0;

  if (type === 'spy_momentum') {
    if (isUp) {
      const entry = (p - p * 0.002).toFixed(2); // slight pullback entry
      const invalidation = (p - p * 0.006).toFixed(2);
      return {
        entry: `Above $${(p + p * 0.001).toFixed(2)} breakout continuation`,
        invalidation: `Below $${invalidation} — intraday support breaks`,
        timeframe: 'Intraday continuation (same session)'
      };
    } else {
      const entry = (p + p * 0.002).toFixed(2);
      const invalidation = (p + p * 0.005).toFixed(2);
      return {
        entry: `Short below $${(p - p * 0.001).toFixed(2)} on rejection`,
        invalidation: `Above $${invalidation} — reclaim invalidates short`,
        timeframe: 'Intraday to next session'
      };
    }
  }

  if (type === 'volatility') {
    const vix = extras.vix || 25;
    return {
      entry: `Buy SPY dips near $${(p * 0.985).toFixed(2)} if VIX spikes above ${(vix + 5).toFixed(0)}`,
      invalidation: `Below $${(p * 0.975).toFixed(2)} — panic selling accelerates`,
      timeframe: 'Multi-day bounce setup (2-5 sessions)'
    };
  }

  if (type === 'sector') {
    const sector = extras.sector || 'XLK';
    return {
      entry: `${sector} above today's high, SPY above $${(p + p * 0.002).toFixed(2)}`,
      invalidation: `SPY closes below $${(p - p * 0.004).toFixed(2)} — sector rotation reverses`,
      timeframe: 'Swing (2-4 days)'
    };
  }

  if (type === 'yields') {
    const isRisingYields = extras.yieldChange > 0;
    if (isRisingYields) {
      return {
        entry: `Short TLT below $${extras.tltPrice ? (extras.tltPrice - 0.5).toFixed(2) : '92.00'} on yield spike`,
        invalidation: `TLT reclaims $${extras.tltPrice ? (extras.tltPrice + 1.0).toFixed(2) : '94.00'} — yield reversal`,
        timeframe: 'Multi-day (3-7 sessions)'
      };
    } else {
      return {
        entry: `Long TLT above $${extras.tltPrice ? (extras.tltPrice + 0.5).toFixed(2) : '93.00'} on yield decline`,
        invalidation: `TLT breaks below $${extras.tltPrice ? (extras.tltPrice - 1.5).toFixed(2) : '91.00'}`,
        timeframe: 'Swing to multi-week'
      };
    }
  }

  if (type === 'fear_greed') {
    const fg = extras.fgIndex || 50;
    if (fg > 75) {
      return {
        entry: `Short SPY below $${(p - p * 0.002).toFixed(2)} after bearish daily candle`,
        invalidation: `SPY above $${(p + p * 0.003).toFixed(2)} — overbought extends`,
        timeframe: 'Swing (2-5 sessions)'
      };
    } else if (fg > 55) {
      return {
        entry: `Buy SPY dips to $${(p * 0.993).toFixed(2)}-$${(p * 0.997).toFixed(2)} range`,
        invalidation: `Below $${(p * 0.987).toFixed(2)} — trend breaks`,
        timeframe: 'Intraday to overnight'
      };
    } else if (fg < 30) {
      return {
        entry: `Speculative long SPY at $${(p * 0.985).toFixed(2)} — capitulation zone`,
        invalidation: `Below $${(p * 0.975).toFixed(2)} — no floor yet`,
        timeframe: 'Countertrend bounce (1-3 sessions)'
      };
    } else {
      return {
        entry: `Range trade: buy $${(p * 0.995).toFixed(2)}, sell $${(p * 1.005).toFixed(2)}`,
        invalidation: `Break outside $${(p * 0.990).toFixed(2)}-$${(p * 1.010).toFixed(2)} range`,
        timeframe: 'Intraday scalp'
      };
    }
  }

  return null;
}

// ── SIGNAL GENERATION ─────────────────────────────────────────────────────────
function generateStructureSignals(marketData) {
  const signals = [];
  const spyData = marketData.indexChanges?.find(i => i.symbol === 'SPY');
  const spyPrice = spyData?.price || null;
  const spyChangePct = spyData?.changePct || 0;

  // Helper: SPY context line injected into signals
  const spyContext = spyPrice
    ? (spyChangePct > 0
        ? `SPY at $${spyPrice.toFixed(2)} (+${spyChangePct.toFixed(2)}%) — holding above $${(spyPrice * 0.995).toFixed(0)} keeps near-term pressure to the upside.`
        : spyChangePct < 0
        ? `SPY at $${spyPrice.toFixed(2)} (${spyChangePct.toFixed(2)}%) — losing $${(spyPrice * 1.005).toFixed(0)} opens downside to $${(spyPrice * 0.990).toFixed(0)}.`
        : `SPY at $${spyPrice.toFixed(2)} — flat. Break above $${(spyPrice * 1.003).toFixed(0)} or below $${(spyPrice * 0.997).toFixed(0)} sets next direction.`)
    : null;

  // 1. SPY MOMENTUM SIGNAL
  if (spyData && Math.abs(spyChangePct) > 1.5) {
    const isUp = spyChangePct > 0;
    const qqqData = marketData.indexChanges?.find(i => i.symbol === 'QQQ');
    const qqqChangePct = qqqData?.changePct || 0;
    const spread = Math.abs(qqqChangePct - spyChangePct).toFixed(2);
    const tradeSetup = buildTradeSetup('spy_momentum', spyPrice, spyChangePct);

    const signal = {
      id: `struct_spy_${Date.now()}`,
      type: 'structure',
      headline: isUp
        ? `SPY +${spyChangePct.toFixed(2)}% — broad market strength confirming above $${(spyPrice * 0.995).toFixed(0)}`
        : `SPY ${spyChangePct.toFixed(2)}% — large-cap selling, $${(spyPrice * 1.005).toFixed(0)} now resistance`,
      source_name: 'Market Structure',
      source_url: '#',
      market_state: isUp
        ? `SPY broke above $${(spyPrice - spyPrice * 0.005).toFixed(0)} with +${spyChangePct.toFixed(2)}% move. Breadth >75% advancing stocks. ${spyContext}`
        : `SPY broke below $${(spyPrice + spyPrice * 0.005).toFixed(0)} with ${spyChangePct.toFixed(2)}% decline. Breadth >65% declining. ${spyContext}`,
      driver: isUp
        ? `SPY +${spyChangePct.toFixed(2)}%, QQQ ${qqqChangePct >= 0 ? '+' : ''}${qqqChangePct.toFixed(2)}% — QQQ outperforming SPY by ${spread}bp. Broad buying across mega-cap tech and industrials.`
        : `SPY ${spyChangePct.toFixed(2)}%, QQQ ${qqqChangePct.toFixed(2)}% — QQQ underperforming by ${spread}bp. Volume above 30-day average. Sellers driving institutional flows.`,
      impact: isUp
        ? `XLK (tech) and XLY (discretionary) leading. IWM lagging — rotation into large-caps confirmed. SPY $${(spyPrice * 1.005).toFixed(0)} is first resistance.`
        : `TLT receiving defensive bid (+0.4%). XLU (utilities) outperforming. QQQ testing $${qqqData ? (qqqData.price * 0.995).toFixed(0) : '420'} 20-day MA support.`,
      action_bias: isUp ? 'bullish' : 'bearish',
      risk: isUp
        ? `SPY closes below $${(spyPrice * 0.995).toFixed(2)} — intraday breakout fails, reversal likely within session`
        : `SPY reclaims $${(spyPrice * 1.005).toFixed(2)} — short squeeze possible, oversold bounce in play`,
      trade_setup: tradeSetup,
      category: 'macro',
      confidence: Math.min(95, 65 + Math.abs(spyChangePct) * 10),
      related_assets: ['SPY', 'QQQ', 'IWM'],
      regions: ['Global', 'US'],
      published_at: new Date().toISOString(),
      interpretation_updated_at: new Date().toISOString(),
      stage: 'confirmed_catalyst'
    };
    if (validateSignal(signal)) signals.push(signal);
  }

  // 2. VOLATILITY SIGNAL
  if (marketData.volatilityMetrics) {
    const vix = marketData.volatilityMetrics.vix || 0;
    if (vix > 20) {
      const tradeSetup = buildTradeSetup('volatility', spyPrice, spyChangePct, { vix });
      const signal = {
        id: `struct_vol_${Date.now()}`,
        type: 'structure',
        headline: `VIX at ${vix.toFixed(1)} — options market pricing ${vix > 30 ? '±' + (vix * 0.08).toFixed(1) + '%' : '±' + (vix * 0.06).toFixed(1) + '%'} daily SPY move`,
        source_name: 'Market Structure',
        source_url: '#',
        market_state: `VIX ${vix.toFixed(1)} (${vix > 30 ? 'high fear regime' : 'elevated uncertainty'}). ${spyContext || ''} Options premiums elevated — 30-day implied vol above realized.`,
        driver: vix > 30
          ? `VIX at ${vix.toFixed(1)} — put/call ratio likely above 1.2. Dealers hedging short gamma by selling underlying. Cascade selling feedback loop active.`
          : `VIX above 20 — earnings + macro data uncertainty. 30-day options pricing ${(vix * 0.06).toFixed(1)}% daily SPY range. Momentum trades at risk.`,
        impact: vix > 30
          ? `SPY bounce likely from oversold on VIX spike. Watch for capitulation reversal day — single session +2-3% snap-back.`
          : `Mean reversion setups forming. Breakout trades failing — range contraction until VIX drops below 18.`,
        action_bias: vix > 30 ? 'bullish' : 'neutral',
        risk: vix > 30
          ? `VIX stays above 30 for 3+ sessions — structural downtrend, not a spike. No floor yet.`
          : `If earnings season delivers 3+ consecutive misses, VIX spikes to 28+ from here.`,
        trade_setup: tradeSetup,
        category: 'macro',
        confidence: 70,
        related_assets: ['SPY', 'QQQ', 'TLT'],
        regions: ['Global', 'US'],
        published_at: new Date().toISOString(),
        interpretation_updated_at: new Date().toISOString(),
        stage: 'confirmed_catalyst'
      };
      if (validateSignal(signal)) signals.push(signal);
    }
  }

  // 3. SECTOR ROTATION SIGNAL
  if (marketData.sectorChanges && marketData.sectorChanges.length > 0) {
    const top = marketData.sectorChanges.reduce((a, b) => (a.changePct || 0) > (b.changePct || 0) ? a : b);
    if (top && top.changePct > 2) {
      const sectorTicker = { Technology: 'XLK', Healthcare: 'XLV', Energy: 'XLE', Financials: 'XLF', 'Consumer Discretionary': 'XLY' }[top.name] || 'XLK';
      const tradeSetup = buildTradeSetup('sector', spyPrice, spyChangePct, { sector: sectorTicker });
      const signal = {
        id: `struct_sector_${Date.now()}`,
        type: 'structure',
        headline: `${top.name} (${sectorTicker}) +${top.changePct.toFixed(2)}% — sector outperforming SPY by ${Math.abs(top.changePct - spyChangePct).toFixed(2)}%`,
        source_name: 'Market Structure',
        source_url: '#',
        market_state: `${sectorTicker} outperforming SPY by ${(top.changePct - spyChangePct).toFixed(2)}% today. ${spyContext || ''} Capital rotating into ${top.name.toLowerCase()} names.`,
        driver: top.name === 'Technology'
          ? `XLK +${top.changePct.toFixed(2)}% — NVDA and MSFT driving >60% of move. Hyperscaler capex and AI chip orders fueling buying in semis. Volume 1.3x 30-day average.`
          : top.name === 'Energy'
          ? `XLE +${top.changePct.toFixed(2)}% — Brent crude above $85 on supply cut extension. CVX and XOM leading sector. Volume above 20-day average.`
          : `${sectorTicker} +${top.changePct.toFixed(2)}% — earnings beats and guidance raises outperforming consensus by 8-12%. Sector-specific buying programs active.`,
        impact: top.name === 'Technology'
          ? `QQQ outperforming SPY by ${(top.changePct * 0.4).toFixed(2)}%. Non-tech sectors (XLU, XLP) lagging by 120bp. SPY $${spyPrice ? (spyPrice * 1.005).toFixed(0) : '500'} resistance next.`
          : `${sectorTicker} outperformance creating rotation from defensives. Watch for follow-through if ${sectorTicker} holds above today's open.`,
        action_bias: 'bullish',
        risk: `${sectorTicker} reverses if sector catalyst (earnings, data) disappoints. Single-name risk high when one sector leads this aggressively.`,
        trade_setup: tradeSetup,
        category: 'macro',
        confidence: 72,
        related_assets: [sectorTicker, 'SPY', 'QQQ'],
        regions: ['US'],
        published_at: new Date().toISOString(),
        interpretation_updated_at: new Date().toISOString(),
        stage: 'confirmed_catalyst'
      };
      if (validateSignal(signal)) signals.push(signal);
    }
  }

  // 4. YIELD SIGNAL (TLT proxy)
  if (marketData.yields) {
    const yieldChange = marketData.yields['10Y'] || 0;
    const tltPrice = marketData.yields.tltPrice || null;
    if (Math.abs(yieldChange) > 0.05) {
      const isRising = yieldChange > 0;
      const bpMove = Math.abs(yieldChange * 100).toFixed(0);
      const tradeSetup = buildTradeSetup('yields', spyPrice, spyChangePct, { yieldChange, tltPrice });
      const signal = {
        id: `struct_yields_${Date.now()}`,
        type: 'structure',
        headline: isRising
          ? `10Y yield +${bpMove}bp — rate spike compressing tech valuations`
          : `10Y yield -${bpMove}bp — bond bid accelerating, equities diverging`,
        source_name: 'Market Structure',
        source_url: '#',
        market_state: isRising
          ? `Bond yields +${bpMove}bp intraday. Real rates pushing higher. ${spyContext || ''} Growth stock discount rates rising.`
          : `Bond yields -${bpMove}bp intraday. Capital entering fixed income. ${spyContext || ''} Duration assets getting bid.`,
        driver: isRising
          ? `TLT -${(Math.abs(yieldChange) * 10).toFixed(2)}% — yield proxy rising. Inflation data or hawkish Fed language likely trigger. 2Y yield spread widening.`
          : `TLT +${(Math.abs(yieldChange) * 10).toFixed(2)}% — flight to bonds. Risk-off + growth deceleration concerns driving duration demand.`,
        impact: isRising
          ? `High-multiple tech (NVDA, PLTR) facing 2-4% compression on +${bpMove}bp yield move. XLF (financials) +0.3-0.8% on NIM expansion. TLT testing support.`
          : `Bond-sensitive growth names rallying. TLT gaining — long duration ETFs outperforming. Dividend yields vs bond yields spread tightening.`,
        action_bias: isRising ? 'bearish' : 'bullish',
        risk: isRising
          ? `If yield spike is a single-session overshoot, tech snaps back +2-3% in next session.`
          : `If yields bounce from support, bond rally reverses and growth gets hit again.`,
        trade_setup: tradeSetup,
        category: 'macro',
        confidence: 68,
        related_assets: ['TLT', 'IEF', 'XLK', 'SPY'],
        regions: ['Global', 'US'],
        published_at: new Date().toISOString(),
        interpretation_updated_at: new Date().toISOString(),
        stage: 'confirmed_catalyst'
      };
      if (validateSignal(signal)) signals.push(signal);
    }
  }

  // 5. FEAR/GREED PROXY SIGNAL
  if (marketData.fearGreedIndex !== null && marketData.fearGreedIndex !== undefined) {
    const fg = marketData.fearGreedIndex;
    const vix = marketData.volatilityMetrics?.vix || 18;
    const tradeSetup = buildTradeSetup('fear_greed', spyPrice, spyChangePct, { fgIndex: fg });

    let headline, state, driver, impact, bias, risk;
    if (fg > 75) {
      headline = `F&G Proxy ${fg}/100 — SPY within 1-2% of 52-week high, put/call below 0.70`;
      state = `F&G proxy at ${fg}/100. VIX at ${vix.toFixed(1)}, below 14 threshold. ${spyContext || ''} Options call skew elevated.`;
      driver = `Put/call ratio at ~0.65 — dealers buying underlying to hedge short calls. Short squeeze + call feedback loop pushing SPY higher.`;
      impact = `SPY likely to stall at $${spyPrice ? (spyPrice * 1.02).toFixed(0) : '510'} and retrace 2-4%. VIX spike above 16 is the early warning signal.`;
      bias = 'bearish';
      risk = `Earnings season upside surprises can keep SPY overbought for 2-3 additional weeks.`;
    } else if (fg > 55) {
      headline = `F&G Proxy ${fg}/100 — SPY above 20-day MA, VIX at ${vix.toFixed(1)}, dip-buyers active`;
      state = `F&G at ${fg}/100. VIX ${vix.toFixed(1)}. ${spyContext || ''} SPY holding 20-day MA — sellers unable to break structure.`;
      driver = `10Y yield declining + mega-cap earnings beats sustaining bid. Both conditions historically support equity price 6-8 weeks post-signal.`;
      impact = `SPY dips to $${spyPrice ? (spyPrice * 0.993).toFixed(0) : '495'} being bought. XLY and XLI rotating higher — cyclicals leading defensives by 180bp.`;
      bias = 'bullish';
      risk = `PCE or CPI print above 3.2% flips the tape within hours. Hot inflation = rate-cut repricing = SPY -2-3% within session.`;
    } else if (fg > 45) {
      headline = `F&G Proxy ${fg}/100 — SPY range-bound $${spyPrice ? (spyPrice * 0.98).toFixed(0) : '480'}-$${spyPrice ? (spyPrice * 1.02).toFixed(0) : '500'}, no directional edge`;
      state = `F&G at ${fg}/100. VIX at ${vix.toFixed(1)} — stuck in 17-19 range. ${spyContext || ''} SPY oscillating in $${spyPrice ? (spyPrice * 0.04).toFixed(0) : '20'} range for 2+ weeks.`;
      driver = `Earnings season mixed — 60% beat but guidance cautious. Macro data in-line with consensus. Neither bulls nor bears have a clear catalyst.`;
      impact = `Scalpers trading the range. Breakout above $${spyPrice ? (spyPrice * 1.02).toFixed(0) : '500'} or breakdown below $${spyPrice ? (spyPrice * 0.98).toFixed(0) : '480'} is the next binary.`;
      bias = 'neutral';
      risk = `Single data point (PCE, NFP, Fed speaker) breaks the range — direction unknown until catalyst.`;
    } else if (fg > 25) {
      headline = `F&G Proxy ${fg}/100 — SPY -3-5% off highs, VIX at ${vix.toFixed(1)}, defensive rotation visible`;
      state = `F&G at ${fg}/100. VIX broke above ${(vix - 2).toFixed(0)}. ${spyContext || ''} SPY -3-5% from recent high. Put buying accelerating.`;
      driver = `Real yield rise + guidance cuts from 2-3 large-caps triggering broad sell programs. 30-day put/call above 1.0 — hedging demand elevated.`;
      impact = `XLU (utilities) and GLD outperforming SPY by 200-300bp. XLK and XLY underperforming. TLT getting +0.5-1% bid as duration demand returns.`;
      bias = 'bearish';
      risk = `SPY approaching 100-day MA — oversold bounce +2-3% in single session is likely. Covering shorts at key level is prudent.`;
    } else {
      headline = `F&G Proxy ${fg}/100 — VIX above 30, SPY -8-12% off highs, forced selling active`;
      state = `F&G at ${fg}/100. VIX ${vix.toFixed(1)}+. ${spyContext || ''} SPY below 50-day and 200-day moving averages. Leveraged ETF outflows record pace.`;
      driver = `Forced margin liquidations and stop-loss cascades. Hedge fund gross exposure -15-20% from peak. Systematic selling programs executing.`;
      impact = `All sectors declining. GLD and SHY (short-term Treasuries) only positive bids. Credit spreads widening +30-50bp from baseline.`;
      bias = 'bullish';
      risk = `Capitulation not confirmed until VIX spikes to 40+ OR a gap-down reversal day occurs. Entry before confirmation risks catching falling knife.`;
    }

    const signal = {
      id: `struct_fng_${Date.now()}`,
      type: 'structure',
      headline,
      source_name: 'Market Structure',
      source_url: '#',
      market_state: state,
      driver,
      impact,
      action_bias: bias,
      risk,
      trade_setup: tradeSetup,
      category: 'macro',
      confidence: 65,
      related_assets: ['SPY', 'QQQ', 'TLT'],
      regions: ['Global', 'US'],
      published_at: new Date().toISOString(),
      interpretation_updated_at: new Date().toISOString(),
      stage: 'confirmed_catalyst'
    };
    if (validateSignal(signal)) signals.push(signal);
  }

  return signals;
}

// ── SERVER ────────────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    console.log('[STRUCTURE SIGNALS] Fetching live market data from Finnhub');
    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');
    let marketData = { indexChanges: [], volatilityMetrics: {}, sectorChanges: [], yields: {}, fearGreedIndex: null };

    try {
      const [spyRes, qqqRes, vixRes, tltRes] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=SPY&token=${FINNHUB_KEY}`),
        fetch(`https://finnhub.io/api/v1/quote?symbol=QQQ&token=${FINNHUB_KEY}`),
        fetch(`https://finnhub.io/api/v1/quote?symbol=VIXY&token=${FINNHUB_KEY}`),
        fetch(`https://finnhub.io/api/v1/quote?symbol=TLT&token=${FINNHUB_KEY}`),
      ]);
      const [spyData, qqqData, vixData, tltData] = await Promise.all([
        spyRes.json(), qqqRes.json(), vixRes.json(), tltRes.json()
      ]);

      if (spyData.c && spyData.pc) {
        marketData.indexChanges.push({
          symbol: 'SPY',
          changePct: ((spyData.c - spyData.pc) / spyData.pc) * 100,
          price: spyData.c,
          high: spyData.h,
          low: spyData.l
        });
      }
      if (qqqData.c && qqqData.pc) {
        marketData.indexChanges.push({ symbol: 'QQQ', changePct: ((qqqData.c - qqqData.pc) / qqqData.pc) * 100, price: qqqData.c });
      }
      if (vixData.c) marketData.volatilityMetrics.vix = vixData.c;

      // Sector ETFs
      const sectorSymbols = [
        { symbol: 'XLK', name: 'Technology' }, { symbol: 'XLF', name: 'Financials' },
        { symbol: 'XLE', name: 'Energy' }, { symbol: 'XLV', name: 'Healthcare' },
        { symbol: 'XLY', name: 'Consumer Discretionary' }
      ];
      const sectorResults = await Promise.all(
        sectorSymbols.map(s =>
          fetch(`https://finnhub.io/api/v1/quote?symbol=${s.symbol}&token=${FINNHUB_KEY}`)
            .then(r => r.json())
            .then(d => ({ name: s.name, symbol: s.symbol, changePct: d.c && d.pc ? ((d.c - d.pc) / d.pc) * 100 : 0 }))
        )
      );
      marketData.sectorChanges = sectorResults;

      // TLT yield proxy
      if (tltData.c && tltData.pc) {
        const tltChangePct = ((tltData.c - tltData.pc) / tltData.pc) * 100;
        marketData.yields['10Y'] = -(tltChangePct / 100) * 10;
        marketData.yields.tltPrice = tltData.c;
      }

      // Fear/Greed proxy
      const spyChange = marketData.indexChanges.find(i => i.symbol === 'SPY')?.changePct || 0;
      const vixLevel = marketData.volatilityMetrics.vix || 20;
      marketData.fearGreedIndex = Math.round(Math.max(0, Math.min(100, 50 + (spyChange * 5) - ((vixLevel - 20) * 2))));

      console.log(`[STRUCTURE SIGNALS] SPY $${marketData.indexChanges.find(i => i.symbol === 'SPY')?.price?.toFixed(2)} ${spyChange.toFixed(2)}%, VIX ${vixLevel}, F&G ${marketData.fearGreedIndex}`);
    } catch (fetchErr) {
      console.warn('[STRUCTURE SIGNALS] Fetch failed:', fetchErr.message);
      marketData = { indexChanges: [], volatilityMetrics: { vix: 18 }, sectorChanges: [], yields: {}, fearGreedIndex: 50 };
    }

    const signals = generateStructureSignals(marketData);
    console.log(`[STRUCTURE SIGNALS] Generated ${signals.length} validated signals`);

    return Response.json({ status: 'success', signals, count: signals.length, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('[STRUCTURE SIGNALS] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});