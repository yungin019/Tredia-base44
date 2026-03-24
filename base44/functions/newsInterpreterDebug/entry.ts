import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

Deno.serve(async (req) => {
  const logs = [];
  const addLog = (msg) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${msg}`;
    logs.push(logEntry);
    console.log(logEntry);
  };

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    addLog('═══ STEP 1: FINNHUB NEWS INGESTION ═══');

    // Fetch from Finnhub
    const categories = ['general', 'forex', 'crypto', 'merger', 'earnings'];
    const allNews = [];

    for (const category of categories) {
      try {
        addLog(`Fetching ${category} news from Finnhub...`);
        const res = await fetch(
          `https://finnhub.io/api/news?category=${category}&minId=0&apikey=${FINNHUB_API_KEY}`
        );
        const data = await res.json();
        addLog(`  → ${category}: received ${Array.isArray(data) ? data.length : 0} items`);
        
        if (data && Array.isArray(data)) {
          allNews.push(...data.slice(0, 5));
        }
      } catch (error) {
        addLog(`  ✗ ${category} fetch failed: ${error.message}`);
      }
    }

    addLog(`Total raw news items: ${allNews.length}`);

    if (allNews.length === 0) {
      addLog('✗ NO NEWS ITEMS FOUND - PIPELINE STOPS HERE');
      return Response.json({
        success: false,
        logs,
        rawNewsCount: 0,
        interpretedCount: 0,
        catalysts: []
      });
    }

    // Log sample items
    addLog('\nSample raw news (first 2):');
    allNews.slice(0, 2).forEach((item, i) => {
      addLog(`  [${i}] "${item.headline?.substring(0, 60)}..."`);
      addLog(`      Source: ${item.source}`);
      addLog(`      URL: ${item.url}`);
      addLog(`      Time: ${new Date(item.datetime * 1000).toISOString()}`);
    });

    addLog('\n═══ STEP 2: TREK INTERPRETATION ═══');

    const catalysts = [];
    let interpretationFailures = 0;

    // Process news items
    for (let idx = 0; idx < Math.min(allNews.length, 3); idx++) {
      const item = allNews[idx];
      addLog(`\nProcessing item [${idx}]: "${item.headline.substring(0, 50)}..."`);

      // Infer metadata
      function inferRegions(headline, source) {
        const regions = [];
        const text = `${headline} ${source}`.toLowerCase();
        if (text.match(/us|usa|america|fed|sec|treasury|nasdaq|dow|s&p|nyse|trump|washington/)) regions.push('US');
        if (text.match(/eu|europe|ecb|germany|france|italy|london|stoxx|ftse|dax|frankfurt/)) regions.push('EU');
        if (text.match(/asia|japan|china|india|hong kong|nikkei|shanghai|bse|singapore|apac/)) regions.push('APAC');
        if (text.match(/africa|south africa|nigerian|naira|kenyan|cairo/)) regions.push('Africa');
        if (text.match(/latam|brazil|mexico|argentina|bogota|sao paulo|brl|mxn/)) regions.push('LatAm');
        return regions.length > 0 ? regions : ['Global'];
      }

      function inferCategory(headline, source) {
        const text = `${headline} ${source}`.toLowerCase();
        if (text.match(/fed|ecb|boj|interest rate|rate hike|rate cut|monetary policy/)) return 'central_bank';
        if (text.match(/earnings|q[1-4]\s*results|eps|guidance|revenue/)) return 'earnings';
        if (text.match(/war|conflict|tension|geopolitical|sanctions|iran|russia|ukraine|nato/)) return 'geopolitical';
        if (text.match(/gdp|inflation|cpi|pce|unemployment|jobs|nfp|payroll/)) return 'economic_data';
        if (text.match(/merger|acquisition|ipo|buyback|restructuring|bankruptcy/)) return 'corporate';
        return 'macro';
      }

      function inferAssets(headline, source) {
        const text = `${headline} ${source}`.toUpperCase();
        const symbols = [];
        const commonSymbols = ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'SPY', 'QQQ', 'DIA', 'TLT', 'GLD', 'USO', 'XLF', 'EURUSD', 'USDJPY', 'GBPUSD', 'BTC', 'ETH'];
        for (const sym of commonSymbols) {
          if (text.includes(sym)) symbols.push(sym);
        }
        return symbols.slice(0, 5);
      }

      const regions = inferRegions(item.headline, item.source);
      const category = inferCategory(item.headline, item.source);
      const assets = inferAssets(item.headline, item.source);

      addLog(`  Regions: ${regions.join(', ')}`);
      addLog(`  Category: ${category}`);
      addLog(`  Assets: ${assets.length > 0 ? assets.join(', ') : 'none'}`);

      // Call LLM
      addLog(`  Calling OpenAI for interpretation...`);
      let interpretation = null;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: `You are TREK, a market intelligence engine. Interpret news into market signals.
Output ONLY valid JSON with no markdown:
{
  "market_state": "brief context (15 words max)",
  "driver": "what drives this (10 words max)",
  "impact": "market impact (20 words max)",
  "action_bias": "bullish|bearish|neutral",
  "risk": "invalidation risk (15 words max)",
  "confidence": 75
}`
              },
              {
                role: 'user',
                content: `Interpret this news as a market signal:\n\nHeadline: ${item.headline}\nSource: ${item.source}\n\nRespond with ONLY the JSON object.`
              }
            ],
            temperature: 0.7
          })
        });

        const result = await response.json();
        const content = result.choices?.[0]?.message?.content || '';
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        interpretation = JSON.parse(jsonStr);

        addLog(`  ✓ Interpretation success:`);
        addLog(`    Market State: ${interpretation.market_state}`);
        addLog(`    Driver: ${interpretation.driver}`);
        addLog(`    Impact: ${interpretation.impact}`);
        addLog(`    Action Bias: ${interpretation.action_bias}`);
        addLog(`    Risk: ${interpretation.risk}`);
        addLog(`    Confidence: ${interpretation.confidence}`);
      } catch (error) {
        addLog(`  ✗ Interpretation FAILED: ${error.message}`);
        interpretationFailures++;

        // Create fallback catalyst from raw news
        interpretation = {
          market_state: item.headline,
          driver: `${item.source} news`,
          impact: 'Awaiting market interpretation',
          action_bias: 'neutral',
          risk: 'Interpretation pending',
          confidence: 0
        };
        addLog(`  → Using fallback interpretation`);
      }

      const catalyst = {
        headline: item.headline,
        source_url: item.url || '',
        source_name: item.source || 'Unknown',
        market_state: interpretation.market_state,
        driver: interpretation.driver,
        impact: interpretation.impact,
        action_bias: interpretation.action_bias,
        risk: interpretation.risk,
        stage: 'confirmed_catalyst',
        regions,
        category,
        confidence: interpretation.confidence || 0,
        related_assets: assets,
        published_at: new Date(item.datetime * 1000).toISOString(),
        interpretation_updated_at: new Date().toISOString()
      };

      catalysts.push(catalyst);
      addLog(`  ✓ Catalyst created`);
    }

    addLog(`\n═══ STEP 3: DATABASE STORAGE ═══`);
    addLog(`Creating ${catalysts.length} catalysts in database...`);

    try {
      if (catalysts.length > 0) {
        await base44.asServiceRole.entities.Catalyst.bulkCreate(catalysts);
        addLog(`✓ Successfully created ${catalysts.length} catalysts`);
      }
    } catch (error) {
      addLog(`✗ Database creation failed: ${error.message}`);
    }

    addLog(`\n═══ FINAL RESULTS ═══`);
    addLog(`Raw news items: ${allNews.length}`);
    addLog(`Successfully interpreted: ${catalysts.length - interpretationFailures}`);
    addLog(`Interpretation failures: ${interpretationFailures}`);
    addLog(`Total catalysts created: ${catalysts.length}`);

    return Response.json({
      success: true,
      logs,
      rawNewsCount: allNews.length,
      interpretedCount: catalysts.length,
      interpretationFailures,
      catalysts,
      sampleCatalysts: catalysts.slice(0, 2)
    });
  } catch (error) {
    addLog(`✗ FATAL ERROR: ${error.message}`);
    return Response.json({
      success: false,
      logs,
      error: error.message
    }, { status: 500 });
  }
});