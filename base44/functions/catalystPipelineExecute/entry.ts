import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// NOTE: This function now delegates to anticipatoryTrekCore for market-structure-first analysis
// Legacy reactive pipeline preserved for reference, but anticipatory mode is primary

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const POLYGON_API_KEY = Deno.env.get('POLYGON_API_KEY');

// Forbidden words that must NEVER be in database
const FORBIDDEN_WORDS = ['neutral', 'positive', 'negative', 'mixed', 'uncertain', 'sentiment', 'performance', 'recovery', 'advancement'];

// Safe fallback for failed interpretations
const FALLBACK_INTERPRETATION = {
  market_state: 'Market activity unclear — insufficient signal',
  driver: 'No strong catalyst identified',
  impact: 'Low conviction environment',
  action_bias: 'bearish',
  risk: 'Sudden volatility from unexpected news',
  confidence: 40
};

// Validation function
function validateInterpretation(interp) {
  const checkText = `${interp.market_state || ''} ${interp.driver || ''} ${interp.impact || ''} ${interp.action_bias || ''}`.toLowerCase();
  const hasForbidden = FORBIDDEN_WORDS.some(word => checkText.includes(word));
  const validBias = ['bullish', 'bearish'].includes((interp.action_bias || '').toLowerCase());
  const hasRequiredFields = interp.market_state && interp.driver && interp.impact && interp.action_bias && typeof interp.confidence === 'number';
  
  return { isValid: !hasForbidden && validBias && hasRequiredFields, hasForbidden, validBias, hasRequiredFields };
}

// LLM generation with retry support
async function generateInterpretation(headline, retryCount = 0) {
  const systemPrompt = retryCount === 0 
    ? `You are a market decision engine. Output ONLY concrete, visual intelligence.

FORBIDDEN: "neutral", "positive", "negative", "mixed", "uncertain", "recovery", "advancement", "performance"

RULES:
- market_state: Visual observation (e.g., "stocks bouncing after heavy selling")
- driver: Concrete CAUSE (e.g., "Fed signals pause, yields falling 8bps")
- impact: Direct EFFECT on assets (e.g., "Tech rallying, bonds gaining")
- action_bias: ONLY "bullish" or "bearish" (never neutral)
- risk: Specific invalidation event (e.g., "PCE inflation spikes above 3.5%")

Output ONLY valid JSON, no markdown.`
    : `Rewrite the market intelligence using ONLY concrete, specific observations.
CRITICAL: Do NOT use any of these words: neutral, positive, negative, mixed, uncertain, recovery, advancement, performance, sentiment
- Use active verbs (rallying, selling, falling, rising)
- Be specific about WHAT is happening in the market RIGHT NOW
- action_bias must be EXACTLY "bullish" or "bearish"
- Output ONLY valid JSON`;

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
        content: `Headline: ${headline}

Respond with ONLY this JSON structure:
{
  "market_state": "concrete visual market observation",
  "driver": "specific cause",
  "impact": "direct asset/sector effects",
  "action_bias": "bullish or bearish",
  "risk": "specific invalidation event",
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
    source: 'TREK_ANTICIPATORY_HYBRID',
    phase: 'INITIALIZATION',
    anticipatoryMode: true,
    rawStatusCode: null,
    rawResponseBody: null,
    rawNewsCount: 0,
    acceptedNewsCount: 0,
    interpretedCatalystCount: 0,
    dbInsertCount: 0,
    queryCount: 0,
    rejectionLog: [],
    failurePoint: null,
    realFixApplied: null
  };

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // ROUTE TO ANTICIPATORY TREK CORE
    console.log('[CATALYST PIPELINE] ✓ Delegating to anticipatoryTrekCore for market-structure-first analysis');
    const anticipatoryResponse = await base44.asServiceRole.functions.invoke('anticipatoryTrekCore', {});
    
    if (anticipatoryResponse.data?.catalystInserted) {
      report.phase = 'ANTICIPATORY_SUCCESS';
      report.realFixApplied = 'TREK upgraded to anticipatory mode: market structure → news confirmation → signal generation';
      report.interpretedCatalystCount = 1;
      report.dbInsertCount = 1;
      console.log('[CATALYST PIPELINE] ✓ Anticipatory signal generated and inserted');
      return Response.json(report);
    } else {
      console.warn('[CATALYST PIPELINE] ✗ Anticipatory mode returned no catalyst');
      report.failurePoint = 'ANTICIPATORY_MODE_NO_OUTPUT';
      return Response.json(report);
    }
    

    // STEP 1: Fetch real market news from Polygon.io
    console.log('[CATALYST PIPELINE] Step 1: Fetch raw news from Polygon.io');
    console.log(`[CATALYST PIPELINE] POLYGON_API_KEY present: ${!!POLYGON_API_KEY}`);
    
    const polygonUrl = `https://api.polygon.io/v2/reference/news?limit=10&apikey=${POLYGON_API_KEY}`;
    console.log(`[CATALYST PIPELINE] Polygon URL: ${polygonUrl.replace(POLYGON_API_KEY, '***')}`);

    let polygonResponse;
    let rawResponseText;

    try {
      polygonResponse = await fetch(polygonUrl);
      report.rawStatusCode = polygonResponse.status;
      rawResponseText = await polygonResponse.text();
      report.rawResponseBody = rawResponseText.substring(0, 500);
      
      console.log(`[CATALYST PIPELINE] Polygon Status: ${polygonResponse.status}`);
      console.log(`[CATALYST PIPELINE] Polygon Response (first 500 chars): ${rawResponseText.substring(0, 500)}`);
    } catch (fetchError) {
      console.error('[CATALYST PIPELINE] Polygon fetch failed:', fetchError.message);
      report.failurePoint = 'POLYGON_FETCH_ERROR';
      report.realFixApplied = `Network error: ${fetchError.message}`;
      return Response.json(report);
    }

    if (!polygonResponse.ok) {
      console.error(`[CATALYST PIPELINE] Polygon returned HTTP ${polygonResponse.status}`);
      report.failurePoint = 'POLYGON_HTTP_ERROR';
      report.realFixApplied = `HTTP ${polygonResponse.status}: ${rawResponseText.substring(0, 200)}`;
      return Response.json(report);
    }

    let rawNews = [];
    try {
      const parsed = JSON.parse(rawResponseText);
      rawNews = parsed.results || [];
      report.rawNewsCount = rawNews.length;
      console.log(`[CATALYST PIPELINE] Parsed ${rawNews.length} raw news items from Polygon.io`);
    } catch (parseError) {
      console.error('[CATALYST PIPELINE] JSON parse error:', parseError.message);
      report.failurePoint = 'POLYGON_JSON_PARSE_ERROR';
      report.realFixApplied = `Parse error: ${parseError.message}`;
      return Response.json(report);
    }

    if (rawNews.length === 0) {
      console.log('[CATALYST PIPELINE] Polygon returned 0 articles');
      report.failurePoint = 'NO_NEWS_AVAILABLE';
      report.realFixApplied = 'Polygon.io API returned empty news list. This is a real condition, not an error.';
      return Response.json(report);
    }

    // STEP 2: Accept valid news items (title + url required)
    const acceptedNews = rawNews.slice(0, 3).filter(item => (item.title || item.headline) && item.article_url);
    report.acceptedNewsCount = acceptedNews.length;
    console.log(`[CATALYST PIPELINE] Accepted ${acceptedNews.length} valid news items`);

    if (acceptedNews.length === 0) {
      console.log('[CATALYST PIPELINE] No valid news items found');
      report.failurePoint = 'NO_VALID_NEWS_ITEMS';
      report.realFixApplied = 'Finnhub articles present but none meet validation criteria (headline + url required)';
      return Response.json(report);
    }

    // STEP 3: Interpret via OpenAI with Quality Gate
    console.log('[CATALYST PIPELINE] Step 2: LLM interpretation with quality gate');
    const catalysts = [];

    for (const news of acceptedNews) {
      try {
        const headline = news.title || news.headline;
        let interp = null;
        let validationResult = null;
        let retryCount = 0;
        const maxRetries = 2;

        // Try up to 2 retries
        while (retryCount <= maxRetries) {
          try {
            interp = await generateInterpretation(headline, retryCount);
            validationResult = validateInterpretation(interp);

            if (validationResult.isValid) {
              console.log(`[CATALYST PIPELINE] ✓ Interpretation valid (attempt ${retryCount + 1}): ${headline}`);
              break;
            } else {
              console.warn(`[CATALYST PIPELINE] ✗ Attempt ${retryCount + 1} failed validation for: ${headline}`);
              console.warn(`  - hasForbidden: ${validationResult.hasForbidden}, validBias: ${validationResult.validBias}, hasRequiredFields: ${validationResult.hasRequiredFields}`);
              retryCount++;
            }
          } catch (parseError) {
            console.error(`[CATALYST PIPELINE] Attempt ${retryCount + 1} parse error:`, parseError.message);
            retryCount++;
          }
        }

        // If all retries failed, use fallback and log rejection
        if (!validationResult?.isValid) {
          console.error(`[CATALYST PIPELINE] ✗ All retry attempts failed. Using fallback for: ${headline}`);
          
          report.rejectionLog.push({
            headline,
            reason: `Invalid after ${maxRetries + 1} attempts`,
            lastOutput: interp,
            validation: validationResult
          });

          interp = FALLBACK_INTERPRETATION;
        }

        // Infer regions from headline
        const headlineLower = headline.toLowerCase();
        const regions = [];
        if (headlineLower.match(/us|usa|fed|nasdaq|trump/)) regions.push('US');
        if (headlineLower.match(/eu|europe|ecb|germany|london|stoxx/)) regions.push('EU');
        if (headlineLower.match(/asia|japan|china|nikkei|shanghai/)) regions.push('APAC');
        if (headlineLower.match(/africa|south africa/)) regions.push('Africa');
        if (headlineLower.match(/latam|brazil|mexico/)) regions.push('LatAm');
        if (regions.length === 0) regions.push('Global');

        // Ensure bias is valid
        const bias = (interp.action_bias || 'bearish').toLowerCase();
        if (!['bullish', 'bearish'].includes(bias)) {
          interp.action_bias = 'bearish';
        }

        catalysts.push({
          headline,
          source_url: news.article_url,
          source_name: news.source?.name || 'Polygon.io',
          market_state: interp.market_state,
          driver: interp.driver,
          impact: interp.impact,
          action_bias: bias,
          risk: interp.risk,
          stage: 'confirmed_catalyst',
          regions,
          category: 'macro',
          confidence: Math.max(0, Math.min(100, interp.confidence || 50)),
          related_assets: [],
          published_at: news.published_utc ? new Date(news.published_utc).toISOString() : new Date().toISOString(),
          interpretation_updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error('[CATALYST PIPELINE] Fatal interpretation error:', e.message);
        report.rejectionLog.push({
          headline: news.title || news.headline,
          reason: `Fatal error: ${e.message}`
        });
      }
    }

    report.interpretedCatalystCount = catalysts.length;
    console.log(`[CATALYST PIPELINE] Interpreted ${catalysts.length} catalysts via OpenAI (with quality gate)`);

    if (catalysts.length === 0) {
      console.log('[CATALYST PIPELINE] All interpretations failed or rejected');
      report.failurePoint = 'LLM_INTERPRETATION_FAILED';
      report.realFixApplied = 'All catalyst interpretations failed quality gate. Check rejection log.';
      return Response.json(report);
    }

    // STEP 4: Insert to DB
    console.log('[CATALYST PIPELINE] Step 3: Insert catalysts to database');
    try {
      await base44.asServiceRole.entities.Catalyst.bulkCreate(catalysts);
      report.dbInsertCount = catalysts.length;
      console.log(`[CATALYST PIPELINE] DB insert successful: ${catalysts.length} catalysts`);
    } catch (dbError) {
      console.error('[CATALYST PIPELINE] DB insert error:', dbError.message);
      report.failurePoint = 'DB_INSERT_FAILED';
      report.realFixApplied = `Database error: ${dbError.message}`;
      return Response.json(report);
    }

    // STEP 5: Query back from DB
    console.log('[CATALYST PIPELINE] Step 4: Query catalysts from database');
    try {
      const queryResult = await base44.asServiceRole.entities.Catalyst.list();
      report.queryCount = queryResult.length;
      console.log(`[CATALYST PIPELINE] DB query returned: ${queryResult.length} catalysts`);
    } catch (queryError) {
      console.error('[CATALYST PIPELINE] DB query error:', queryError.message);
      report.failurePoint = 'DB_QUERY_FAILED';
      report.realFixApplied = `Query error: ${queryError.message}`;
      return Response.json(report);
    }

    // Success
    report.failurePoint = null;
    report.realFixApplied = 'PIPELINE COMPLETE: Real catalysts from Polygon.io → OpenAI interpretation (with quality gate) → Database';

    return Response.json(report);
  } catch (error) {
    console.error('[CATALYST PIPELINE] Fatal error:', error.message);
    report.failurePoint = 'FATAL_ERROR';
    report.realFixApplied = error.message;
    return Response.json(report, { status: 500 });
  }
});