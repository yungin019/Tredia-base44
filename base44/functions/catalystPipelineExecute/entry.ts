import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const POLYGON_API_KEY = Deno.env.get('POLYGON_API_KEY');

Deno.serve(async (req) => {
  const report = {
    source: 'Polygon.io',
    rawStatusCode: null,
    rawResponseBody: null,
    rawNewsCount: 0,
    acceptedNewsCount: 0,
    interpretedCatalystCount: 0,
    dbInsertCount: 0,
    queryCount: 0,
    failurePoint: null,
    realFixApplied: null
  };

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // STEP 1: Fetch real market news from Polygon.io (reliable alternative to Finnhub)
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

    // Check HTTP status
    if (!polygonResponse.ok) {
      console.error(`[CATALYST PIPELINE] Polygon returned HTTP ${polygonResponse.status}`);
      report.failurePoint = 'POLYGON_HTTP_ERROR';
      report.realFixApplied = `HTTP ${polygonResponse.status}: ${rawResponseText.substring(0, 200)}`;
      return Response.json(report);
    }

    // Parse JSON
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

    // No fake data. If Polygon returns nothing, return empty state.
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

    // STEP 3: Interpret via OpenAI
    console.log('[CATALYST PIPELINE] Step 2: LLM interpretation via OpenAI');
    const catalysts = [];

    for (const news of acceptedNews) {
      try {
        const headline = news.title || news.headline;
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
              content: 'Output ONLY this JSON: {"market_state":"state","driver":"driver","impact":"impact","action_bias":"bullish|bearish|neutral","risk":"risk","confidence":75}'
            }, {
              role: 'user',
              content: `News: ${headline}`
            }],
            temperature: 0.7
          })
        });

        const llmData = await llmResponse.json();
        const content = llmData.choices?.[0]?.message?.content || '{}';
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const interp = JSON.parse(jsonStr);

        // Infer regions from headline
        const headlineLower = headline.toLowerCase();
        const regions = [];
        if (headlineLower.match(/us|usa|fed|nasdaq|trump/)) regions.push('US');
        if (headlineLower.match(/eu|europe|ecb|germany|london|stoxx/)) regions.push('EU');
        if (headlineLower.match(/asia|japan|china|nikkei|shanghai/)) regions.push('APAC');
        if (headlineLower.match(/africa|south africa/)) regions.push('Africa');
        if (headlineLower.match(/latam|brazil|mexico/)) regions.push('LatAm');
        if (regions.length === 0) regions.push('Global');

        catalysts.push({
          headline,
          source_url: news.article_url,
          source_name: news.source?.name || 'Polygon.io',
          market_state: interp.market_state || 'Market shift',
          driver: interp.driver || headline,
          impact: interp.impact || 'Volatility expected',
          action_bias: (interp.action_bias || 'neutral').toLowerCase(),
          risk: interp.risk || 'Unexpected developments',
          stage: 'confirmed_catalyst',
          regions,
          category: 'macro',
          confidence: interp.confidence || 70,
          related_assets: [],
          published_at: news.published_utc ? new Date(news.published_utc).toISOString() : new Date().toISOString(),
          interpretation_updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error('[CATALYST PIPELINE] LLM interpretation error:', e.message);
      }
    }

    report.interpretedCatalystCount = catalysts.length;
    console.log(`[CATALYST PIPELINE] Interpreted ${catalysts.length} catalysts via OpenAI`);

    if (catalysts.length === 0) {
      console.log('[CATALYST PIPELINE] LLM interpretation failed for all items');
      report.failurePoint = 'LLM_INTERPRETATION_FAILED';
      report.realFixApplied = 'OpenAI API calls failed or returned unparseable responses. Check API key and quota.';
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
    report.realFixApplied = 'PIPELINE COMPLETE: Real catalysts from Polygon.io → OpenAI interpretation → Database';

    return Response.json(report);
  } catch (error) {
    console.error('[CATALYST PIPELINE] Fatal error:', error.message);
    report.failurePoint = 'FATAL_ERROR';
    report.realFixApplied = error.message;
    return Response.json(report, { status: 500 });
  }
});