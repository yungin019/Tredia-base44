import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FINNHUB_API_KEY = Deno.env.get('FINNHUB_API_KEY');

// Fetch real news from Finnhub
async function fetchGlobalNews() {
  const categories = [
    'general',
    'forex',
    'crypto',
    'merger',
    'earnings'
  ];

  const allNews = [];

  for (const category of categories) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/news?category=${category}&minId=0&apikey=${FINNHUB_API_KEY}`
      );
      const data = await res.json();
      if (data && Array.isArray(data)) {
        allNews.push(...data.slice(0, 5)); // top 5 per category
      }
    } catch (error) {
      console.error(`Error fetching ${category} news:`, error.message);
    }
  }

  return allNews;
}

// Infer region from content and source
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

// Infer category
function inferCategory(headline, source) {
  const text = `${headline} ${source}`.toLowerCase();

  if (text.match(/fed|ecb|boj|interest rate|rate hike|rate cut|monetary policy/)) return 'central_bank';
  if (text.match(/earnings|q[1-4]\s*results|eps|guidance|revenue/)) return 'earnings';
  if (text.match(/war|conflict|tension|geopolitical|sanctions|iran|russia|ukraine|nato/)) return 'geopolitical';
  if (text.match(/gdp|inflation|cpi|pce|unemployment|jobs|nfp|payroll/)) return 'economic_data';
  if (text.match(/merger|acquisition|ipo|buyback|restructuring|bankruptcy/)) return 'corporate';

  return 'macro';
}

// Infer affected assets
function inferAssets(headline, source) {
  const text = `${headline} ${source}`.toUpperCase();
  const symbols = [];

  // Common symbols
  const commonSymbols = [
    'NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META',
    'SPY', 'QQQ', 'DIA', 'TLT', 'GLD', 'USO', 'XLF',
    'EURUSD', 'USDJPY', 'GBPUSD',
    'BTC', 'ETH'
  ];

  for (const sym of commonSymbols) {
    if (text.includes(sym)) {
      symbols.push(sym);
    }
  }

  return symbols.slice(0, 5); // max 5
}

// Use LLM to interpret news as market signal
async function interpretAsSignal(news) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are TREK, a market intelligence engine. Interpret news into market signals.

Output ONLY valid JSON with no markdown formatting:
{
  "market_state": "brief market context (15 words max)",
  "driver": "what is driving this (10 words max)",
  "impact": "expected market impact (20 words max)",
  "action_bias": "bullish|bearish|neutral",
  "risk": "key invalidation risk (15 words max)",
  "confidence": 75
}`
          },
          {
            role: 'user',
            content: `Interpret this financial news as a market signal:\n\nHeadline: ${news.headline}\nSource: ${news.source}\n\nRespond with ONLY the JSON object.`
          }
        ],
        temperature: 0.7
      })
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || '{}';
    
    // Clean up any markdown
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('LLM interpretation error:', error.message);
    return null;
  }
}

// Main handler
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch real news
    const news = await fetchGlobalNews();
    
    if (!news || news.length === 0) {
      return Response.json({ message: 'No news found', catalysts: [] });
    }

    const catalysts = [];

    // Process first 3 news items (to save API calls)
    for (const item of news.slice(0, 3)) {
      const interpretation = await interpretAsSignal({
        headline: item.headline,
        source: item.source
      });

      if (!interpretation) continue;

      const regions = inferRegions(item.headline, item.source);
      const category = inferCategory(item.headline, item.source);
      const relatedAssets = inferAssets(item.headline, item.source);

      const catalyst = {
        headline: item.headline,
        source_url: item.url || '',
        source_name: item.source || 'Unknown',
        market_state: interpretation.market_state || 'Market shifting',
        driver: interpretation.driver || item.headline,
        impact: interpretation.impact || 'Potential volatility expected',
        action_bias: (interpretation.action_bias || 'neutral').toLowerCase(),
        risk: interpretation.risk || 'Unexpected developments',
        stage: 'confirmed_catalyst',
        regions,
        category,
        confidence: interpretation.confidence || 70,
        related_assets: relatedAssets,
        published_at: new Date(item.datetime * 1000).toISOString(),
        interpretation_updated_at: new Date().toISOString()
      };

      catalysts.push(catalyst);
    }

    // Save catalysts to database
    if (catalysts.length > 0) {
      await base44.asServiceRole.entities.Catalyst.bulkCreate(catalysts);
    }

    return Response.json({ 
      success: true,
      catalysts_created: catalysts.length,
      catalysts 
    });
  } catch (error) {
    console.error('newsInterpreter error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});