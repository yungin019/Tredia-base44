import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, symbol } = await req.json();
    const AV_KEY = Deno.env.get('ALPHAVANTAGE_API_KEY');

    if (type === 'rsi') {
      const url = `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${AV_KEY}`;
      const data = await fetch(url).then(r => r.json());
      const analysis = data?.['Technical Analysis: RSI'];
      if (!analysis) return Response.json({ rsi: 55 });
      const latestDate = Object.keys(analysis)[0];
      return Response.json({ rsi: parseFloat(analysis[latestDate]?.RSI ?? 55) });
    }

    if (type === 'quote') {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${AV_KEY}`;
      const data = await fetch(url).then(r => r.json());
      const quote = data?.['Global Quote'];
      if (!quote) return Response.json({ quote: null });
      return Response.json({
        quote: {
          price: parseFloat(quote['05. price']),
          change24h: parseFloat(quote['10. change percent']?.replace('%', '')),
          volume: parseInt(quote['06. volume']),
        }
      });
    }

    return Response.json({ error: 'Unknown type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});