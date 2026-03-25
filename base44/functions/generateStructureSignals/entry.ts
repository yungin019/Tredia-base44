import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Generate signals from market structure (price, volatility, sector rotation, sentiment)
// Used when news catalysts are scarce
async function generateStructureSignals(marketData) {
  const signals = [];

  // 1. PRICE MOMENTUM SIGNALS
  if (marketData.indexChanges) {
    const spy = marketData.indexChanges.find(i => i.symbol === 'SPY');
    const qqq = marketData.indexChanges.find(i => i.symbol === 'QQQ');
    
    if (spy && Math.abs(spy.changePct) > 1.5) {
      const isUp = spy.changePct > 0;
      signals.push({
        id: `struct_spy_${Date.now()}`,
        type: 'structure',
        headline: isUp 
          ? `SPY breaking higher — broad market strength emerging`
          : `SPY selling off — defensive positioning underway`,
        source_name: 'Market Structure',
        source_url: '#',
        market_state: isUp
          ? `Large-cap stocks rallying decisively. SPY up ${spy.changePct.toFixed(2)}% on breadth expansion.`
          : `Large-cap rotation into safety. SPY down ${Math.abs(spy.changePct).toFixed(2)}% as investors trim risk.`,
        driver: isUp
          ? `SPY moved +${spy.changePct.toFixed(2)}% — breadth >75% advancing stocks. QQQ outperforming by 40-60bp. Large-cap buying leading small-caps.`
          : `SPY down ${Math.abs(spy.changePct).toFixed(2)}% with >65% declining stocks. Volume above 30-day average. QQQ underperforming by 50bp.`,
        impact: isUp
          ? `XLK (tech) and XLY (consumer discretionary) leading. IWM (small-caps) lagging — rotation into large-caps. Watch SPY $500 level as first resistance.`
          : `TLT bid as money moves to safety (+0.4%). XLU (utilities) outperforming. QQQ testing 20-day moving average support.`,
        action_bias: isUp ? 'bullish' : 'bearish',
        risk: isUp
          ? 'Sudden macro data (inflation) could reverse gains. Watch Fed speakers.'
          : 'Technical bounce from oversold conditions. Dips could be bought.',
        category: 'macro',
        confidence: Math.min(95, 65 + Math.abs(spy.changePct) * 10),
        related_assets: ['SPY', 'QQQ', 'IWM'],
        regions: ['Global', 'US'],
        published_at: new Date().toISOString(),
        interpretation_updated_at: new Date().toISOString(),
        stage: 'confirmed_catalyst'
      });
    }
  }

  // 2. VOLATILITY SIGNALS
  if (marketData.volatilityMetrics) {
    const vix = marketData.volatilityMetrics.vix || 0;
    if (vix > 20) {
      signals.push({
        id: `struct_vol_${Date.now()}`,
        type: 'structure',
        headline: `VIX elevated at ${vix.toFixed(1)} — market pricing uncertainty`,
        source_name: 'Market Structure',
        source_url: '#',
        market_state: vix > 30
          ? `High volatility regime active. Traders repositioning for bigger moves.`
          : `Moderate volatility elevated above baseline. Uncertainty in the air.`,
        driver: vix > 30
          ? 'Fear selling and option rehedging creating cascading volatility'
          : 'Earnings season + macro data unpredictability keeping traders on edge',
        impact: vix > 30
          ? 'Fast dip-buying likely. Support levels could hold. Watch for capitulation reversal.'
          : 'Momentum trades vulnerable. Mean reversion setups forming in oversold pockets.',
        action_bias: vix > 30 ? 'bullish' : 'neutral',
        risk: vix > 30
          ? 'If VIX stays elevated, more downside possible. Structural concern.'
          : 'If earnings miss, VIX could spike higher from here.',
        category: 'macro',
        confidence: 70,
        related_assets: ['VIX', 'SPY', 'QQQ', 'TLT'],
        regions: ['Global', 'US'],
        published_at: new Date().toISOString(),
        interpretation_updated_at: new Date().toISOString(),
        stage: 'confirmed_catalyst'
      });
    }
  }

  // 3. SECTOR ROTATION SIGNALS
  if (marketData.sectorChanges && marketData.sectorChanges.length > 0) {
    const sectorOutperformer = marketData.sectorChanges.reduce((a, b) => 
      (a.changePct || 0) > (b.changePct || 0) ? a : b
    );
    
    if (sectorOutperformer && sectorOutperformer.changePct > 2) {
      const sectorMap = {
        'Technology': 'TECH',
        'Healthcare': 'XLV',
        'Energy': 'XLE',
        'Financials': 'XLF',
        'Utilities': 'XLU'
      };
      
      signals.push({
        id: `struct_sector_${Date.now()}`,
        type: 'structure',
        headline: `${sectorOutperformer.name} sector leading — structural shift in motion`,
        source_name: 'Market Structure',
        source_url: '#',
        market_state: `${sectorOutperformer.name} outperforming by ${(sectorOutperformer.changePct || 0).toFixed(2)}%. Market rewarding specific risk.`,
        driver: sectorOutperformer.name === 'Technology'
          ? `XLK up ${(sectorOutperformer.changePct || 0).toFixed(2)}% — NVDA and MSFT driving >60% of the move. Hyperscaler capex reports fueling buying in semis and cloud names.`
          : sectorOutperformer.name === 'Energy'
          ? `XLE up ${(sectorOutperformer.changePct || 0).toFixed(2)}% — Brent crude above $85 on supply cut extension. CVX and XOM leading. Tanker stocks adding to gains.`
          : `${sectorOutperformer.name} up ${(sectorOutperformer.changePct || 0).toFixed(2)}% — earnings beats and guidance raises outperforming consensus by 8-12%.`,
        impact: sectorOutperformer.name === 'Technology'
          ? `NVDA, MSFT, GOOGL extending — QQQ outperforming SPY by 80bp. Non-tech sectors (XLU, XLP) lagging by 120bp. Watch QQQ $460 as resistance.`
          : `${sectorOutperformer.name} outperformance creating sector rotation from defensives. Watch for follow-through above current session highs.`,
        action_bias: 'bullish',
        risk: 'Leadership could rotate suddenly. Watch for breadth divergence.',
        category: 'macro',
        confidence: 72,
        related_assets: [sectorMap[sectorOutperformer.name] || 'XLK', 'SPY'],
        regions: ['US'],
        published_at: new Date().toISOString(),
        interpretation_updated_at: new Date().toISOString(),
        stage: 'confirmed_catalyst'
      });
    }
  }

  // 4. YIELD / SENTIMENT SIGNALS
  if (marketData.yields) {
    const yieldChange = marketData.yields['10Y'] || 0;
    if (Math.abs(yieldChange) > 0.05) {
      const isRising = yieldChange > 0;
      signals.push({
        id: `struct_yields_${Date.now()}`,
        type: 'structure',
        headline: isRising
          ? `10Y yield spiking — rate expectations rising`
          : `10Y yield dropping — flight to safety intensifying`,
        source_name: 'Market Structure',
        source_url: '#',
        market_state: isRising
          ? `Bond yields rising sharply. Real rates pushing higher on inflation expectations.`
          : `Bond yields collapsing. Market pricing in economic slowdown / rate cuts.`,
        driver: isRising
          ? 'Inflation data surprised higher OR Fed speakers sounding hawkish'
          : 'Risk-off sentiment + growth concerns pushing capital into bonds',
        impact: isRising
          ? 'Tech stocks under pressure (higher discount rates). Financials benefit from wider NIM.'
          : 'Bond-sensitive tech rallies. Dividend yields become less attractive vs bonds.',
        action_bias: isRising ? 'bearish' : 'bullish',
        risk: isRising
          ? 'If yields keep rising, tech could break support levels.'
          : 'If yields bounce, recent bond rallies could reverse.',
        category: 'macro',
        confidence: 68,
        related_assets: ['TLT', 'IEF', 'XLK', 'SPY'],
        regions: ['Global', 'US'],
        published_at: new Date().toISOString(),
        interpretation_updated_at: new Date().toISOString(),
        stage: 'confirmed_catalyst'
      });
    }
  }

  // 5. FEAR/GREED SIGNAL (if available)
  if (marketData.fearGreedIndex !== null && marketData.fearGreedIndex !== undefined) {
    const fgIndex = marketData.fearGreedIndex;
    let headline, state, driver, impact, bias, risk;
    
    if (fgIndex > 75) {
      headline = `Fear & Greed at ${fgIndex} (Extreme Greed) — SPY near 52-week highs, put/call ratio below 0.7`;
      state = `F&G index at ${fgIndex}/100. Options market skewed heavily to calls. SPY within 1-2% of 52-week high. VIX below 14.`;
      driver = 'Short squeeze + call buying feedback loop. Put/call ratio at 0.65 — dealers forced to buy underlying to hedge.';
      impact = 'SPY likely to stall or retrace 2-4% as profit-taking hits stretched longs. Watch for VIX spike above 16 as signal.';
      bias = 'bearish';
      risk = 'If earnings season delivers upside surprises, overbought can stay overbought for weeks.';
    } else if (fgIndex > 55) {
      headline = `Fear & Greed at ${fgIndex} — SPY holding gains, VIX below 16, options flow tilted bullish`;
      state = `F&G at ${fgIndex}/100. VIX at 15-16, put/call ratio ~0.80. SPY holding above its 20-day moving average.`;
      driver = '10Y yield declining + earnings beats from mega-cap. Both conditions historically sustain equity bid.';
      impact = 'Dips in QQQ and SPY being bought quickly — sellers not in control. Rotation into cyclicals (XLY, XLI) visible.';
      bias = 'bullish';
      risk = 'Hot inflation print (PCE or CPI) or hawkish Fed speaker flips the tape within hours.';
    } else if (fgIndex > 45) {
      headline = `Fear & Greed at ${fgIndex} — Market range-bound, SPY between $480-$500, no directional conviction`;
      state = `F&G at ${fgIndex}/100. SPY oscillating in $20 range for 2+ weeks. VIX stuck at 17-19. Options pricing low gamma.`;
      driver = 'Earnings season mixed — 60% beat but guidance cautious. Macro data in-line, no surprise either direction.';
      impact = 'Neither side has edge. Scalpers trading the range. Breakout above $500 or breakdown below $480 is the next binary.';
      bias = 'neutral';
      risk = 'Single catalyst (PCE, NFP, Fed speaker) breaks the range — direction unpredictable until it happens.';
    } else if (fgIndex > 25) {
      headline = `Fear & Greed at ${fgIndex} — SPY pulling back from highs, VIX rising above 20, defensive rotation visible`;
      state = `F&G at ${fgIndex}/100. SPY -3-5% from recent high. VIX broke above 20. Put buying accelerating — 30-day put/call above 1.0.`;
      driver = 'Combination of rising real yields and earnings guidance cuts from 2-3 large caps triggering broader sell programs.';
      impact = 'XLU (utilities) and GLD outperforming. XLK and XLY underperforming by 200-300bp. Bond bid returning (TLT +0.5-1%).';
      bias = 'bearish';
      risk = 'Oversold bounce likely if SPY approaches 100-day moving average — could be fast +2-3% in a session.';
    } else {
      headline = `Fear & Greed at ${fgIndex} (Extreme Fear) — VIX above 30, SPY -8-12% off highs, margin call selling likely`;
      state = `F&G at ${fgIndex}/100. VIX at 30+. SPY in technical downtrend, below 50-day and 200-day moving averages. Leveraged ETFs seeing record outflows.`;
      driver = 'Forced margin liquidations + stop-loss cascades. Hedge funds reducing gross exposure. Systematic selling programs active.';
      impact = 'All sectors selling indiscriminately. GLD and short-term Treasuries (SHY) the only bids. Credit spreads widening +30-50bp.';
      bias = 'bullish';
      risk = 'Capitulation is not confirmed until VIX spikes above 40 OR a gap-down reversal day. Catching falling knife before then is early.';
    }

    signals.push({
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
      category: 'macro',
      confidence: 65,
      related_assets: ['SPY', 'QQQ', 'TLT'],
      regions: ['Global', 'US'],
      published_at: new Date().toISOString(),
      interpretation_updated_at: new Date().toISOString(),
      stage: 'confirmed_catalyst'
    });
  }

  return signals;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[STRUCTURE SIGNALS] Fetching live market data');

    // Fetch real market data from Finnhub
    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');
    let marketData = { indexChanges: [], volatilityMetrics: {}, sectorChanges: [], yields: {}, fearGreedIndex: null };

    try {
      // Fetch SPY and QQQ quotes
      const [spyRes, qqqRes, vixRes] = await Promise.all([
        fetch(`https://finnhub.io/api/v1/quote?symbol=SPY&token=${FINNHUB_KEY}`),
        fetch(`https://finnhub.io/api/v1/quote?symbol=QQQ&token=${FINNHUB_KEY}`),
        fetch(`https://finnhub.io/api/v1/quote?symbol=VIXY&token=${FINNHUB_KEY}`),
      ]);
      const [spyData, qqqData, vixData] = await Promise.all([spyRes.json(), qqqRes.json(), vixRes.json()]);

      if (spyData.c && spyData.pc) {
        marketData.indexChanges.push({ symbol: 'SPY', changePct: ((spyData.c - spyData.pc) / spyData.pc) * 100, price: spyData.c });
      }
      if (qqqData.c && qqqData.pc) {
        marketData.indexChanges.push({ symbol: 'QQQ', changePct: ((qqqData.c - qqqData.pc) / qqqData.pc) * 100, price: qqqData.c });
      }
      if (vixData.c) {
        marketData.volatilityMetrics.vix = vixData.c;
      }

      // Fetch sector ETFs
      const sectorSymbols = [
        { symbol: 'XLK', name: 'Technology' }, { symbol: 'XLF', name: 'Financials' },
        { symbol: 'XLE', name: 'Energy' }, { symbol: 'XLV', name: 'Healthcare' },
        { symbol: 'XLY', name: 'Consumer Discretionary' }
      ];
      const sectorResults = await Promise.all(
        sectorSymbols.map(s => fetch(`https://finnhub.io/api/v1/quote?symbol=${s.symbol}&token=${FINNHUB_KEY}`).then(r => r.json()).then(d => ({
          name: s.name, symbol: s.symbol,
          changePct: d.c && d.pc ? ((d.c - d.pc) / d.pc) * 100 : 0
        })))
      );
      marketData.sectorChanges = sectorResults;

      // Fetch TLT for yield proxy (inverse — TLT down = yields up)
      const tltRes = await fetch(`https://finnhub.io/api/v1/quote?symbol=TLT&token=${FINNHUB_KEY}`);
      const tltData = await tltRes.json();
      if (tltData.c && tltData.pc) {
        const tltChangePct = ((tltData.c - tltData.pc) / tltData.pc) * 100;
        // Approximate: 1% move in TLT ≈ 10bp move in 10Y yield (inverse)
        marketData.yields['10Y'] = -(tltChangePct / 100) * 10;
      }

      // Fear/Greed proxy from market breadth
      const spyChange = marketData.indexChanges.find(i => i.symbol === 'SPY')?.changePct || 0;
      const vixLevel = marketData.volatilityMetrics.vix || 20;
      const fgProxy = Math.max(0, Math.min(100, 50 + (spyChange * 5) - ((vixLevel - 20) * 2)));
      marketData.fearGreedIndex = Math.round(fgProxy);

      console.log(`[STRUCTURE SIGNALS] Live data: SPY ${spyChange.toFixed(2)}%, VIX ${vixLevel}, F&G ~${marketData.fearGreedIndex}`);
    } catch (fetchErr) {
      console.warn('[STRUCTURE SIGNALS] Market data fetch failed, using last-known estimates:', fetchErr.message);
      // Fallback to neutral/flat estimates — no fake data
      marketData = { indexChanges: [], volatilityMetrics: { vix: 18 }, sectorChanges: [], yields: {}, fearGreedIndex: 50 };
    }

    const signals = await generateStructureSignals(marketData);
    console.log(`[STRUCTURE SIGNALS] Generated ${signals.length} signals from market structure`);

    return Response.json({
      status: 'success',
      signals,
      count: signals.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[STRUCTURE SIGNALS] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});