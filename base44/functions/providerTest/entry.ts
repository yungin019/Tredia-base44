import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const POLYGON_KEY = Deno.env.get('POLYGON_API_KEY');
    const AV_KEY = Deno.env.get('ALPHAVANTAGE_API_KEY');

    const results = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test Polygon
    if (POLYGON_KEY) {
      try {
        const url = `https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true&apiKey=${POLYGON_KEY}`;
        console.log('[Polygon] Testing AAPL:', url.substring(0, 60) + '...');
        const res = await fetch(url);
        console.log('[Polygon] Status:', res.status);
        const data = await res.json();
        console.log('[Polygon] Response:', JSON.stringify(data).substring(0, 200));
        results.tests.polygon = { status: res.status, response: data };
      } catch (e) {
        console.error('[Polygon] Error:', e.message);
        results.tests.polygon = { error: e.message };
      }
    }

    // Test AlphaVantage
    if (AV_KEY) {
      try {
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${AV_KEY}`;
        console.log('[AV] Testing AAPL');
        const res = await fetch(url);
        console.log('[AV] Status:', res.status);
        const data = await res.json();
        console.log('[AV] Response:', JSON.stringify(data).substring(0, 200));
        results.tests.alphavantage = { status: res.status, response: data };
      } catch (e) {
        console.error('[AV] Error:', e.message);
        results.tests.alphavantage = { error: e.message };
      }
    }

    return Response.json(results);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});