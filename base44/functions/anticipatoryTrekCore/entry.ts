import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const POLYGON_API_KEY = Deno.env.get('POLYGON_API_KEY');
const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');

// Forbidden words that contaminate signals
const FORBIDDEN_WORDS = ['neutral', 'positive', 'negative', 'mixed', 'uncertain', 'sentiment', 'performance', 'recovery', 'advancement'];

// Safe fallback
const FALLBACK_SIGNAL = {
  market_state: 'Market structure unclear — insufficient signal',
  driver: 'No strong structural catalyst identified',
  impact: 'Low conviction environment',
  action_bias: 'bearish',
  risk: 'Unexpected volatility from data gaps',
  confidence: 40
};

function validateSignal(sig) {
  const checkText = `${sig.market_state || ''} ${sig.driver || ''} ${sig.impact || ''} ${sig.action_bias || ''}`.toLowerCase();
  const hasForbidden = FORBIDDEN_WORDS.some(word => checkText.includes(word));
  const validBias = ['bullish', 'bearish'].includes((sig.action_bias || '').toLowerCase());
  const hasRequiredFields = sig.market_state && sig.driver && sig.impact && sig.action_bias && typeof sig.confidence === 'number';
  
  return { isValid: !hasForbidden && validBias && hasRequiredFields, hasForbidden, validBias, hasRequiredFields };
}

// STEP 1: Fetch market structure (price, sentiment, sector, macro)
async function analyzeMarketStructure() {
  console.log('[ANTICIPATORY TREK] Step 1: Analyzing market structure');
  
  const structure = {
    indices: {},
    sectors: {},
    macro: {},
    sentiment: {},
    volatility: {},
    analysis: null
  };

  try {
    // Fetch SPY, QQQ, DIA to establish market trend
    const symbols = ['SPY', 'QQQ', 'DIA'];
    for (const symbol of symbols) {
      try {
        const res = await fetch(`https://api.polygon.io/v1/open-close/${symbol}/2026-03-24?apikey=${POLYGON_API_KEY}`);
        const data = await res.json();
        if (data.status === 'OK') {
          const change = ((data.close - data.open) / data.open) * 100;
          structure.indices[symbol] = {
            open: data.open,
            close: data.close,
            high: data.high,
            low: data.low,
            change: change.toFixed(2),
            volume: data.volume
          };
          console.log(`[ANTICIPATORY TREK] ${symbol}: ${change > 0 ? '↗' : '↘'} ${Math.abs(change).toFixed(2)}%`);
        }
      } catch (e) {
        console.warn(`[ANTICIPATORY TREK] Could not fetch ${symbol}:`, e.message);
      }
    }

    // Estimate sentiment from index direction
    const spyChange = parseFloat(structure.indices.SPY?.change || 0);
    const spy = spyChange;
    
    if (spy > 1) structure.sentiment.regime = 'risk-on';
    else if (spy < -1) structure.sentiment.regime = 'risk-off';
    else structure.sentiment.regime = 'neutral-constructive';
    
    structure.sentiment.level = spy > 2 ? 'greed' : spy > 0.5 ? 'optimism' : spy < -2 ? 'fear' : spy < -0.5 ? 'caution' : 'balanced';

    // VIX proxy: if major drops, volatility likely elevated
    structure.volatility.elevated = Math.abs(spy) > 1.5;
    
    console.log(`[ANTICIPATORY TREK] Market regime: ${structure.sentiment.regime} (${structure.sentiment.level})`);
    console.log(`[ANTICIPATORY TREK] Volatility elevated: ${structure.volatility.elevated}`);

    return structure;
  } catch (error) {
    console.error('[ANTICIPATORY TREK] Market structure analysis failed:', error.message);
    return structure;
  }
}

// STEP 2: Fetch news for confirmation/acceleration
async function fetchNewsForConfirmation() {
  console.log('[ANTICIPATORY TREK] Step 2: Fetching news for confirmation');
  
  try {
    const res = await fetch(`https://api.polygon.io/v2/reference/news?limit=5&apikey=${POLYGON_API_KEY}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('[ANTICIPATORY TREK] News fetch failed:', error.message);
    return [];
  }
}

// STEP 3: Generate anticipatory signal (structure-first, news as confirmation)
async function generateAnticipatorySig(marketStructure, newsArticles, retryCount = 0) {
  const systemPrompt = retryCount === 0
    ? `You are an anticipatory market analyst. Your job is to reveal what the MARKET STRUCTURE was already showing BEFORE the news broke.

CRITICAL: Do NOT describe the headline. Describe the market positioning that PRECEDED it.

FORBIDDEN: "neutral", "positive", "negative", "mixed", "uncertain", "recovery", "advancement", "performance", "sentiment"

STRUCTURE ANALYSIS:
- Market trend: ${marketStructure.indices.SPY?.change > 0 ? 'up' : 'down'} (SPY: ${marketStructure.indices.SPY?.change}%)
- Regime: ${marketStructure.sentiment.regime}
- Sentiment: ${marketStructure.sentiment.level}
- Volatility: ${marketStructure.volatility.elevated ? 'elevated' : 'normal'}

Your signal MUST feel like:
"Before the headline, the market was already [action]..."
NOT:
"The headline caused [action]..."

Describe concrete price/structure observation, why it was building structurally, what it means for assets.`
    : `Rewrite using ONLY structural market observations. Remove any headline-dependent language.
Use active verbs (rallying, selling, bouncing, breaking).
action_bias must be EXACTLY "bullish" or "bearish".
Output ONLY valid JSON.`;

  const newsContext = newsArticles.length > 0 
    ? `\n\nNews for context (use only to confirm structure, not as driver):\n${newsArticles.slice(0, 2).map(n => `- ${n.title}`).join('\n')}`
    : '\n\nNo breaking news. Signal based on pure market structure.';

  const llmResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: systemPrompt
      }, {
        role: 'user',
        content: `Based on market structure analysis, generate an anticipatory signal.${newsContext}

Respond with ONLY this JSON:
{
  "market_state": "what the market structure was already showing",
  "driver": "why this was building structurally",
  "impact": "what assets/sectors reflect this positioning",
  "action_bias": "bullish or bearish",
  "risk": "what would invalidate this structure",
  "confidence": 0-100
}`
      }],
      temperature: 0.7
    })
  });

  const llmData = await llmResponse.json();
  const content = llmData.choices?.[0]?.message?.content || '{}';
  const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(jsonStr);
}

Deno.serve(async (req) => {
  const report = {
    pipeline: 'ANTICIPATORY_TREK',
    phase: null,
    marketStructure: null,
    newsAvailable: 0,
    signalGenerated: null,
    validationResult: null,
    catalystInserted: false,
    failurePoint: null
  };

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // PHASE 1: Market Structure Analysis (ALWAYS RUN)
    report.phase = 'MARKET_STRUCTURE';
    const marketStructure = await analyzeMarketStructure();
    report.marketStructure = marketStructure;
    console.log('[ANTICIPATORY TREK] ✓ Market structure analyzed');

    // PHASE 2: Fetch news for confirmation (optional)
    report.phase = 'NEWS_FETCH';
    const newsArticles = await fetchNewsForConfirmation();
    report.newsAvailable = newsArticles.length;
    console.log(`[ANTICIPATORY TREK] ✓ Fetched ${newsArticles.length} articles for confirmation`);

    // PHASE 3: Generate anticipatory signal
    report.phase = 'SIGNAL_GENERATION';
    let signal = null;
    let validationResult = null;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries) {
      try {
        signal = await generateAnticipatorySig(marketStructure, newsArticles, retryCount);
        validationResult = validateSignal(signal);

        if (validationResult.isValid) {
          console.log(`[ANTICIPATORY TREK] ✓ Signal valid (attempt ${retryCount + 1})`);
          break;
        } else {
          console.warn(`[ANTICIPATORY TREK] ✗ Attempt ${retryCount + 1} failed validation`);
          retryCount++;
        }
      } catch (parseError) {
        console.error(`[ANTICIPATORY TREK] Attempt ${retryCount + 1} parse error:`, parseError.message);
        retryCount++;
      }
    }

    // Fallback if all retries failed
    if (!validationResult?.isValid) {
      console.error(`[ANTICIPATORY TREK] ✗ All retries failed. Using fallback.`);
      signal = FALLBACK_SIGNAL;
      validationResult = { isValid: false, reason: 'fallback' };
    }

    report.signalGenerated = signal;
    report.validationResult = validationResult;

    // PHASE 4: Insert catalyst
    report.phase = 'CATALYST_INSERT';
    const catalyst = {
      headline: newsArticles[0]?.title || 'Market structure signal (no news)',
      source_url: newsArticles[0]?.article_url || '',
      source_name: newsArticles[0]?.source?.name || 'TREK Structural Analysis',
      market_state: signal.market_state,
      driver: signal.driver,
      impact: signal.impact,
      action_bias: (signal.action_bias || 'bearish').toLowerCase(),
      risk: signal.risk,
      stage: 'confirmed_catalyst',
      regions: ['Global'],
      category: 'macro',
      confidence: Math.max(0, Math.min(100, signal.confidence || 50)),
      related_assets: [],
      published_at: new Date().toISOString(),
      interpretation_updated_at: new Date().toISOString()
    };

    try {
      await base44.asServiceRole.entities.Catalyst.create(catalyst);
      report.catalystInserted = true;
      console.log('[ANTICIPATORY TREK] ✓ Catalyst inserted');
    } catch (dbError) {
      console.error('[ANTICIPATORY TREK] DB insert error:', dbError.message);
      report.failurePoint = 'DB_INSERT_FAILED';
    }

    return Response.json(report);
  } catch (error) {
    console.error('[ANTICIPATORY TREK] Fatal error:', error.message);
    report.failurePoint = 'FATAL_ERROR';
    report.phase = 'ERROR';
    return Response.json(report, { status: 500 });
  }
});