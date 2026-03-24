import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const POLYGON_API_KEY = Deno.env.get('POLYGON_API_KEY');

// Fetch current market data
async function fetchMarketData() {
  console.log('[GLOBAL STATE] Fetching market data');
  
  const data = {
    indices: {},
    yields: null,
    volatility: null,
    timestamp: new Date().toISOString()
  };

  try {
    // Fetch SPY, QQQ, DIA for trend
    const symbols = ['SPY', 'QQQ', 'DIA'];
    for (const symbol of symbols) {
      try {
        const res = await fetch(`https://api.polygon.io/v1/open-close/${symbol}/2026-03-24?apikey=${POLYGON_API_KEY}`);
        const d = await res.json();
        if (d.status === 'OK') {
          const change = ((d.close - d.open) / d.open) * 100;
          const range = d.high - d.low;
          data.indices[symbol] = {
            open: d.open,
            close: d.close,
            change: change.toFixed(2),
            range: range.toFixed(2),
            volume: d.volume
          };
        }
      } catch (e) {
        console.warn(`Could not fetch ${symbol}`);
      }
    }

    // Estimate yield movement (mock for demo)
    const spyChange = parseFloat(data.indices.SPY?.change || 0);
    if (spyChange > 1) {
      data.yields = { direction: 'rising', level: 'elevated' };
    } else if (spyChange < -1) {
      data.yields = { direction: 'falling', level: 'lower' };
    } else {
      data.yields = { direction: 'steady', level: 'stable' };
    }

    // Volatility estimate
    const avgChange = Math.abs(spyChange);
    data.volatility = avgChange > 1.5 ? 'elevated' : avgChange > 0.5 ? 'normal' : 'low';

    console.log('[GLOBAL STATE] ✓ Market data collected');
    return data;
  } catch (error) {
    console.error('[GLOBAL STATE] Market data fetch failed:', error.message);
    return data;
  }
}

// Fetch recent catalysts (if any)
async function fetchRecentCatalysts(base44) {
  console.log('[GLOBAL STATE] Fetching recent catalysts');
  
  try {
    const catalysts = await base44.asServiceRole.entities.Catalyst.list('-published_at', 3);
    console.log(`[GLOBAL STATE] ✓ Found ${catalysts.length} recent catalysts`);
    return catalysts;
  } catch (error) {
    console.warn('[GLOBAL STATE] Catalyst fetch failed:', error.message);
    return [];
  }
}

// Generate global market state using LLM
async function generateMarketState(marketData, catalysts, retryCount = 0) {
  console.log('[GLOBAL STATE] Generating market state (attempt ' + (retryCount + 1) + ')');

  const marketSummary = `
Market Data:
- SPY: ${marketData.indices.SPY?.change}% (open: ${marketData.indices.SPY?.open}, close: ${marketData.indices.SPY?.close})
- QQQ: ${marketData.indices.QQQ?.change}% (tech trend)
- DIA: ${marketData.indices.DIA?.change}% (large cap trend)
- Yields: ${marketData.yields?.direction} (${marketData.yields?.level})
- Volatility: ${marketData.volatility}
`;

  const catalystContext = catalysts.length > 0 
    ? `\n\nRecent Catalysts:\n${catalysts.map(c => `- ${c.headline}: ${c.market_state}`).join('\n')}`
    : '\n\nNo breaking catalysts in system (market moving on structure alone).';

  const forbiddenList = FORBIDDEN_PHRASES.join(', ');

  const systemPrompt = retryCount === 0
    ? `You are a market state summarizer for active traders. Your job is to describe what the market is doing RIGHT NOW in a way that NEVER feels empty.

ABSOLUTELY FORBIDDEN WORDS (will be rejected):
${forbiddenList}

CRITICAL RULES:
1. NEVER use forbidden words above
2. ALWAYS describe a visible market condition (consolidating, rallying, digesting, grinding, bouncing, waiting, pausing, rotating, etc.)
3. Even low-activity days have a STATE: "consolidating after gains", "holding ahead of data", "waiting for confirmation", "momentum cooling after move"
4. Be concrete and specific
5. Use human trader language

OUTPUT EXACTLY THIS FORMAT (no extra text):

MARKET STATE:
[ONE sentence describing what the market is doing RIGHT NOW]

BIAS:
[SHORT directional stance — 1 line max]

WATCH:
[2-3 key upcoming triggers, risks, or data points]`
    : `Rewrite with MORE CONCRETE language. Use ACTIVE verbs: consolidating, rallying, digesting, grinding, bouncing, rotating, waiting, pausing.
FORBIDDEN WORDS (will cause rejection): ${forbiddenList}

Describe a VISIBLE STATE even if low activity. Output exact format again.`;

  const prompt = `${systemPrompt}

${marketSummary}${catalystContext}

Generate the global market state.`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300
      })
    });

    const llmData = await res.json();
    const content = llmData.choices?.[0]?.message?.content || '';
    
    console.log('[GLOBAL STATE] ✓ LLM response received');
    console.log('[GLOBAL STATE] Response:', content.substring(0, 200));

    // Parse the response
    const lines = content.split('\n').map(l => l.trim()).filter(l => l);
    const result = {
      raw: content,
      marketState: '',
      bias: '',
      watch: [],
      valid: false
    };

    let section = null;
    for (const line of lines) {
      if (line.includes('MARKET STATE:')) {
        section = 'state';
      } else if (line.includes('BIAS:')) {
        section = 'bias';
      } else if (line.includes('WATCH:')) {
        section = 'watch';
      } else if (section && line) {
        if (section === 'state') {
          result.marketState = line;
        } else if (section === 'bias') {
          result.bias = line;
        } else if (section === 'watch' && line.startsWith('-')) {
          result.watch.push(line.substring(1).trim());
        } else if (section === 'watch') {
          result.watch.push(line);
        }
      }
    }

    // Multi-layer validation
    const stateText = result.marketState.toLowerCase();
    const biasText = result.bias.toLowerCase();
    const fullText = `${stateText} ${biasText}`;
    
    // Check for forbidden phrases
    const hasForbiddenPhrase = FORBIDDEN_PHRASES.some(phrase => fullText.includes(phrase));
    const hasRequiredFields = result.marketState.length > 10 && result.bias.length > 5 && result.watch.length >= 2;
    const isActionable = stateText.length > 20; // Must have substance
    
    result.valid = !hasForbiddenPhrase && hasRequiredFields && isActionable;
    
    if (hasForbiddenPhrase) {
      console.warn('[GLOBAL STATE] ✗ Forbidden phrase detected, marking invalid');
    }
    if (!hasRequiredFields) {
      console.warn('[GLOBAL STATE] ✗ Missing required fields, marking invalid');
    }
    if (!isActionable) {
      console.warn('[GLOBAL STATE] ✗ Output not actionable, marking invalid');
    }
    
    return result;
  } catch (error) {
    console.error('[GLOBAL STATE] LLM generation error:', error.message);
    return { raw: error.message, valid: false };
  }
}

// Forbidden phrases that indicate empty or generic output
const FORBIDDEN_PHRASES = [
  'market quiet', 'no major moves', 'nothing happening', 'not much action',
  'no action', 'sideways', 'flat', 'neutral', 'mixed', 'uncertain',
  'positive', 'negative', 'sentiment', 'performance', 'recovery',
  'advancement', 'not much', 'lacking', 'no direction', 'without direction'
];

// Fallback state for when LLM fails
const FALLBACK_STATE = {
  marketState: 'Market consolidating after recent moves, traders waiting for next catalyst',
  bias: 'Hold for breakout confirmation',
  watch: [
    'Key support/resistance levels',
    'Volume confirmation on directional move',
    'Macro data releases'
  ],
  valid: true
};

Deno.serve(async (req) => {
  const result = {
    status: 'generating',
    marketState: null,
    catalystCount: 0,
    timestamp: new Date().toISOString(),
    error: null
  };

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Step 1: Fetch market data
    const marketData = await fetchMarketData();
    
    // Step 2: Fetch recent catalysts
    const catalysts = await fetchRecentCatalysts(base44);
    result.catalystCount = catalysts.length;

    // Step 3: Generate market state with retry
    let state = null;
    let retryCount = 0;
    const maxRetries = 2;

    while (retryCount <= maxRetries && !state?.valid) {
      state = await generateMarketState(marketData, catalysts, retryCount);
      if (state?.valid) {
        console.log('[GLOBAL STATE] ✓ Valid state generated');
        break;
      }
      console.log(`[GLOBAL STATE] Invalid, retrying... (attempt ${retryCount + 2})`);
      retryCount++;
    }

    // Use fallback if all attempts failed
    if (!state?.valid) {
      console.log('[GLOBAL STATE] ✗ All retries failed, using fallback');
      state = FALLBACK_STATE;
    }

    result.status = 'success';
    result.marketState = state;

    console.log('[GLOBAL STATE] ✓ Global market state generated');
    return Response.json(result);
  } catch (error) {
    console.error('[GLOBAL STATE] Fatal error:', error.message);
    result.status = 'error';
    result.error = error.message;
    result.marketState = FALLBACK_STATE;
    return Response.json(result);
  }
});