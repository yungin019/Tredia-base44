import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

Deno.serve(async (req) => {
  const metrics = {
    rawNewsCount: 0,
    acceptedNewsCount: 0,
    interpretedCatalystCount: 0,
    dbInsertCount: 0,
    feedQueryCount: 0,
    failurePoint: null,
    fixApplied: null
  };

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // STEP 1: Fetch raw news
    console.log('[CATALYST PIPELINE] Step 1: Fetch raw news from Finnhub');
    const newsResponse = await fetch(
      `https://finnhub.io/api/news?category=general&minId=0&apikey=${FINNHUB_API_KEY}`
    );
    const newsData = await newsResponse.json();
    const rawNews = Array.isArray(newsData) ? newsData : [];
    metrics.rawNewsCount = rawNews.length;

    if (rawNews.length === 0) {
      metrics.failurePoint = 'NEWS_FETCH_EMPTY';
      metrics.fixApplied = 'Finnhub returned 0 articles. Check API key and network.';
      return Response.json(metrics);
    }

    console.log(`[CATALYST PIPELINE] Raw news count: ${rawNews.length}`);

    // STEP 2: Accept valid news items
    const acceptedNews = rawNews.slice(0, 3).filter(item => item.headline && item.url);
    metrics.acceptedNewsCount = acceptedNews.length;

    console.log(`[CATALYST PIPELINE] Accepted news count: ${acceptedNews.length}`);

    if (acceptedNews.length === 0) {
      metrics.failurePoint = 'NO_VALID_NEWS_ITEMS';
      return Response.json(metrics);
    }

    // STEP 3: Interpret via LLM
    console.log('[CATALYST PIPELINE] Step 2: LLM interpretation');
    const catalysts = [];

    for (const news of acceptedNews) {
      try {
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
              content: `News: ${news.headline}`
            }],
            temperature: 0.7
          })
        });

        const llmData = await llmResponse.json();
        const content = llmData.choices?.[0]?.message?.content || '{}';
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const interp = JSON.parse(jsonStr);

        // Infer regions from headline
        const headline = news.headline.toLowerCase();
        const regions = [];
        if (headline.match(/us|usa|fed|nasdaq|trump/)) regions.push('US');
        if (headline.match(/eu|europe|ecb|germany|london|stoxx/)) regions.push('EU');
        if (headline.match(/asia|japan|china|nikkei|shanghai/)) regions.push('APAC');
        if (headline.match(/africa|south africa/)) regions.push('Africa');
        if (headline.match(/latam|brazil|mexico/)) regions.push('LatAm');
        if (regions.length === 0) regions.push('Global');

        catalysts.push({
          headline: news.headline,
          source_url: news.url,
          source_name: news.source || 'News',
          market_state: interp.market_state || 'Market shift',
          driver: interp.driver || news.headline,
          impact: interp.impact || 'Volatility expected',
          action_bias: (interp.action_bias || 'neutral').toLowerCase(),
          risk: interp.risk || 'Unexpected developments',
          stage: 'confirmed_catalyst',
          regions,
          category: 'macro',
          confidence: interp.confidence || 70,
          related_assets: [],
          published_at: news.datetime ? new Date(news.datetime * 1000).toISOString() : new Date().toISOString(),
          interpretation_updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.error('[CATALYST PIPELINE] LLM error:', e.message);
      }
    }

    metrics.interpretedCatalystCount = catalysts.length;
    console.log(`[CATALYST PIPELINE] Interpreted catalysts: ${catalysts.length}`);

    if (catalysts.length === 0) {
      metrics.failurePoint = 'LLM_INTERPRETATION_FAILED';
      metrics.fixApplied = 'All LLM calls failed. Check OpenAI API key and quota.';
      return Response.json(metrics);
    }

    // STEP 4: Insert to DB
    console.log('[CATALYST PIPELINE] Step 3: Insert to database');
    try {
      const createResult = await base44.asServiceRole.entities.Catalyst.bulkCreate(catalysts);
      metrics.dbInsertCount = catalysts.length;
      console.log(`[CATALYST PIPELINE] DB insert successful: ${catalysts.length} catalysts`);
    } catch (dbError) {
      console.error('[CATALYST PIPELINE] DB error:', dbError.message);
      metrics.failurePoint = 'DB_INSERT_FAILED';
      metrics.fixApplied = `Error: ${dbError.message}`;
      return Response.json(metrics);
    }

    // STEP 5: Query back from DB
    console.log('[CATALYST PIPELINE] Step 4: Query DB');
    try {
      const queryResult = await base44.asServiceRole.entities.Catalyst.list();
      metrics.feedQueryCount = queryResult.length;
      console.log(`[CATALYST PIPELINE] Feed query returned: ${queryResult.length} catalysts`);
    } catch (queryError) {
      console.error('[CATALYST PIPELINE] Query error:', queryError.message);
      metrics.failurePoint = 'FEED_QUERY_FAILED';
      metrics.fixApplied = `Error: ${queryError.message}`;
      return Response.json(metrics);
    }

    // Success
    metrics.failurePoint = null;
    metrics.fixApplied = 'PIPELINE COMPLETE';

    return Response.json(metrics);
  } catch (error) {
    console.error('[CATALYST PIPELINE] Fatal error:', error.message);
    metrics.failurePoint = 'FATAL_ERROR';
    metrics.fixApplied = error.message;
    return Response.json(metrics, { status: 500 });
  }
});