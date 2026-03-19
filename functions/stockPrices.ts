import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { symbols, symbol, mode } = body;

    const API_KEY = Deno.env.get('TWELVEDATA_API_KEY');

    // OHLC chart data for a single symbol
    if (mode === 'ohlc' && symbol) {
      const res = await fetch(
        `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${API_KEY}`
      );
      const data = await res.json();
      const chartData = (data.values || []).map(v => ({
        date: v.datetime,
        close: parseFloat(v.close),
      })).reverse();
      return Response.json({ chartData });
    }

    // Batch price fetch for multiple symbols
    if (symbols && symbols.length > 0) {
      const joined = symbols.join(',');
      const res = await fetch(
        `https://api.twelvedata.com/price?symbol=${joined}&apikey=${API_KEY}`
      );
      const data = await res.json();

      const results = {};
      if (symbols.length === 1) {
        // Single symbol returns { price: "..." } directly
        results[symbols[0]] = data.price ? parseFloat(data.price) : null;
      } else {
        // Multiple symbols returns { AAPL: { price: "..." }, ... }
        for (const sym of symbols) {
          results[sym] = data[sym]?.price ? parseFloat(data[sym].price) : null;
        }
      }
      return Response.json({ prices: results });
    }

    return Response.json({ error: 'Invalid request. Provide symbols[] or symbol+mode=ohlc' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});