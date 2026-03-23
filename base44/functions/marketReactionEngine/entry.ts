import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { marketEvent, userRegion } = body;

    if (!marketEvent) {
      return Response.json({ error: 'Missing marketEvent' }, { status: 400 });
    }

    const reaction = generateReaction(marketEvent, userRegion || 'US');
    return Response.json(reaction);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateReaction(event, userRegion) {
  const reactions = {
    'FED_RATE_HIKE': {
      what: 'Federal Reserve raises interest rates by 25 basis points',
      why: 'Fighting persistent inflation while trying to avoid recession',
      impactedAssets: ['EURUSD', 'AUDUSD', 'SPY', 'QQQ', 'BTC'],
      direction: 'MIXED',
      trekTake: 'This is hawkish but expected. Strong dollar near-term, but watch earnings season next week for real pain.',
      watch: ['10Y yield', 'USD index', 'Tech earnings guidance', 'Consumer spending data'],
      risks: ['Earnings recession fears spike', 'Credit spreads widen', 'EM currencies crater'],
      action: 'De-risk tech exposure into earnings. Dollar strength = headwind for exporters.',
    },
    'EARNINGS_MISS': {
      what: 'Major tech company misses earnings guidance significantly',
      why: 'AI capex eating margins or demand weaker than expected',
      impactedAssets: ['NVDA', 'META', 'MSFT', 'GOOGL', 'QQQ'],
      direction: 'BEARISH',
      trekTake: 'Sector rotation alert. AI bubble narrative back on. Watch if it spreads to semis and cloud.',
      watch: ['Forward guidance cuts', 'Competitive commentary', 'Other megacap guidance', 'Margin pressure'],
      risks: ['Cascade effect to entire tech sector', 'AI narrative collapses', 'Fund redemptions'],
      action: 'Wait for sector breadth. One miss ≠ trend. But tighten stops on your AI positions.',
    },
    'GEOPOLITICAL_SHOCK': {
      what: 'Major geopolitical escalation (sanctions, conflict escalation)',
      why: 'Disrupts supply chains and energy flows',
      impactedAssets: ['Crude Oil', 'EURUSD', 'Defensives (XLV, XLY)', 'Tech (supply chain)'],
      direction: 'RISK_OFF',
      trekTake: 'Risk-off means flight to quality. Gold, bonds, USD catch bids. Energy spikes. This feeds inflation.',
      watch: ['Oil prices', 'VIX levels', 'Treasury yields', 'Safe haven flows'],
      risks: ['Oil spike hits margins', 'Demand destruction', 'Recession fears', 'Geopolitical escalation'],
      action: 'Lock in profits on cyclicals. Add to defensive sectors. Oil hedge if energy-exposed.',
    },
    'ECONOMIC_SURPRISE': {
      what: 'Major economic data beats or misses consensus significantly',
      why: 'Signals stronger/weaker economy than expected',
      impactedAssets: ['DXY (USD)', 'Bonds', 'Cyclicals', 'Commodities'],
      direction: 'MIXED',
      trekTake: 'If strong: inflation fears, rate hike odds rise. If weak: recession fears spike. Watch market repricing.',
      watch: ['Fed reaction', 'Treasury yield moves', 'Dollar action', 'Risk-on/off reversal'],
      risks: ['Market repricing event', 'Vol spike', 'Carry unwind', 'Narrative flip'],
      action: 'Don\'t fight the data. Size into trend. Small position first, scale if momentum builds.',
    },
    'CRYPTO_BREAKOUT': {
      what: 'Bitcoin/Ethereum breakthrough technical level or macro catalyst',
      why: 'Institutional adoption, ETF flows, or macro shift',
      impactedAssets: ['BTC', 'ETH', 'Crypto stocks (MSTR, RIOT)', 'Tech (correlated)'],
      direction: 'BULLISH',
      trekTake: 'Crypto rally pulls in retail and flows. Watch if it spills into tech and growth. Legs higher possible.',
      watch: ['BTC dominance', 'Alt season breadth', 'Stablecoin flows', 'Leverage levels'],
      risks: ['Leverage unwound fast', 'Narrative collapse', 'Regulatory FUD', 'Profit taking'],
      action: 'Play breakout but use stops. Momentum is real but fragile. Consider profit-taking at key levels.',
    },
  };

  return reactions[event.type] || {
    what: event.headline,
    why: 'Event requires analysis',
    impactedAssets: [],
    direction: 'UNKNOWN',
    trekTake: 'Monitor for market reaction and follow the capital flows.',
    watch: ['Market breadth', 'Volatility', 'Sector rotation'],
    risks: ['Unintended consequences', 'Narrative shift'],
    action: 'Wait for clarity on impact before scaling positions.',
  };
}