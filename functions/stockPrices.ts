import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { symbols, symbol, mode } = body;

    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');

    // OHLC chart data for a single symbol (last 30 days)
    if (mode === 'ohlc' && symbol) {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 30 * 24 * 60 * 60;
      const res = await fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${symbol}&resolution=D&from=${from}&to=${to}&token=${FINNHUB_KEY}`
      );
      const data = await res.json();
      if (!data.c || data.s === 'no_data') return Response.json({ chartData: [] });
      const chartData = data.c.map((close, i) => ({
        date: new Date(data.t[i] * 1000).toISOString().split('T')[0],
        close: parseFloat(close.toFixed(2)),
      }));
      return Response.json({ chartData });
    }

    // Batch price fetch for multiple symbols using Finnhub quote
    if (symbols && symbols.length > 0) {
      const results = {};
      await Promise.all(symbols.map(async (sym) => {
        try {
          const res = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${sym}&token=${FINNHUB_KEY}`
          );
          const data = await res.json();
          // c = current price
          results[sym] = data.c > 0 ? parseFloat(data.c.toFixed(2)) : null;
        } catch {
          results[sym] = null;
        }
      }));
      return Response.json({ prices: results });
    }

    return Response.json({ error: 'Invalid request. Provide symbols[] or symbol+mode=ohlc' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});