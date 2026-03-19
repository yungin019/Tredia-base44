import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { symbols, symbol, mode } = body;

    const FINNHUB_KEY = Deno.env.get('FINNHUB_API_KEY');

    // OHLC chart data for a single symbol using Alpha Vantage (daily)
    if (mode === 'ohlc' && symbol) {
      const AV_KEY = Deno.env.get('ALPHAVANTAGE_API_KEY');
      const res = await fetch(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${AV_KEY}`
      );
      const data = await res.json();
      const series = data['Time Series (Daily)'];
      if (!series) return Response.json({ chartData: [] });
      const chartData = Object.entries(series)
        .slice(0, 30)
        .reverse()
        .map(([date, v]) => ({
          date,
          close: parseFloat(parseFloat(v['4. close']).toFixed(2)),
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