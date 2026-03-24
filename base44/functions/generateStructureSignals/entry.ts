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
          ? 'Institutional buying pressure + positive earnings momentum flowing through mega-caps'
          : 'Portfolio rebalancing and profit-taking in overextended positions',
        impact: isUp
          ? 'Growth sectors likely to follow. Tech, consumer discretionary break resistance levels.'
          : 'Bond yields may drop further. Flight-to-safety into defensives and financials.',
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
          ? 'AI demand narrative driving capital flows into mega-cap tech names'
          : sectorOutperformer.name === 'Energy'
          ? 'Geopolitical tensions or supply concerns lifting energy prices'
          : 'Earnings beats and guidance raises in specific sector',
        impact: sectorOutperformer.name === 'Technology'
          ? 'NVIDIA, MSFT, GOOGL likely to extend. Tech momentum could carry into next week.'
          : `Relative outperformance likely to persist. Sector rotation continues.`,
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
      headline = 'Extreme Greed — Market stretched to the upside';
      state = 'Market is overbought and potentially overextended. Euphoria levels rising.';
      driver = 'Relentless buying + short covering + FOMO';
      impact = 'Risk of sharp pullback. Profit-taking could accelerate.';
      bias = 'bearish';
      risk = 'If sentiment reverses, downside could be swift and violent.';
    } else if (fgIndex > 55) {
      headline = 'Greed — Market showing signs of strength';
      state = 'Positive sentiment is driving asset prices higher. Momentum remains intact.';
      driver = 'Earnings beat + bullish macro narrative';
      impact = 'Momentum likely to continue. Dips could be bought.';
      bias = 'bullish';
      risk = 'Watch for sentiment warnings (Fed pivot talk, earnings cuts).';
    } else if (fgIndex > 45) {
      headline = 'Neutral — No clear conviction either way';
      state = 'Market in balance. Both buyers and sellers have conviction.';
      driver = 'Mixed signals from macro + earnings';
      impact = 'Expect consolidation and range-bound trading.';
      bias = 'neutral';
      risk = 'Could break higher or lower on next catalyst.';
    } else if (fgIndex > 25) {
      headline = 'Fear — Risk appetite declining';
      state = 'Selloff gathering momentum. Defensive positioning underway.';
      driver = 'Macro concerns + earnings disappointments';
      impact = 'More weakness likely. Support levels being tested.';
      bias = 'bearish';
      risk = 'Technical breakdown could cascade further.';
    } else {
      headline = 'Extreme Fear — Capitulation conditions possible';
      state = 'Market in panic. Indiscriminate selling across sectors.';
      driver = 'Forced liquidations + forced selling from leveraged accounts';
      impact = 'Classic dip-buying opportunities forming. Rebounds can be fast.';
      bias = 'bullish';
      risk = 'Could get worse before it gets better.';
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

    // Fetch market data for structure analysis
    console.log('[STRUCTURE SIGNALS] Fetching market data for structure analysis');
    
    // Mock market data (in production, call real market data API)
    const mockMarketData = {
      indexChanges: [
        { symbol: 'SPY', changePct: 1.2 },
        { symbol: 'QQQ', changePct: 1.8 }
      ],
      volatilityMetrics: {
        vix: 18.5
      },
      sectorChanges: [
        { name: 'Technology', changePct: 2.1 },
        { name: 'Healthcare', changePct: 0.5 },
        { name: 'Energy', changePct: -0.3 }
      ],
      yields: {
        '10Y': -0.04
      },
      fearGreedIndex: 62
    };

    const signals = await generateStructureSignals(mockMarketData);
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