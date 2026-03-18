import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// --- Provider fetchers ---

async function fetchFromAlphaVantage(symbol) {
  try {
    const key = Deno.env.get('ALPHAVANTAGE_API_KEY');
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${key}`;
    const data = await fetch(url).then(r => r.json());
    const q = data?.['Global Quote'];
    if (!q || !q['05. price']) return null;
    return {
      price: parseFloat(q['05. price']),
      change24h: parseFloat(q['10. change percent']?.replace('%', '') ?? 0),
      volume: parseInt(q['06. volume'] ?? 0),
      source: 'alphavantage',
    };
  } catch {
    return null;
  }
}

async function fetchFromFinnhub(symbol) {
  try {
    const key = Deno.env.get('FINNHUB_API_KEY');
    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${key}`;
    const data = await fetch(url).then(r => r.json());
    if (!data?.c) return null;
    const change24h = data.pc > 0 ? ((data.c - data.pc) / data.pc) * 100 : 0;
    return {
      price: parseFloat(data.c),
      change24h: parseFloat(change24h.toFixed(2)),
      volume: null, // Finnhub basic quote doesn't include volume
      source: 'finnhub',
    };
  } catch {
    return null;
  }
}

async function fetchFromPolygon(symbol) {
  try {
    const key = Deno.env.get('POLYGON_API_KEY');
    const url = `https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}?apiKey=${key}`;
    const data = await fetch(url).then(r => r.json());
    const ticker = data?.ticker;
    if (!ticker?.day?.c) return null;
    return {
      price: parseFloat(ticker.day.c),
      change24h: parseFloat((ticker.todaysChangePerc ?? 0).toFixed(2)),
      volume: parseInt(ticker.day.v ?? 0),
      source: 'polygon',
    };
  } catch {
    return null;
  }
}

async function fetchFromTwelveData(symbol) {
  try {
    const key = Deno.env.get('TWELVEDATA_API_KEY');
    const url = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${key}`;
    const data = await fetch(url).then(r => r.json());
    if (!data?.close || data?.status === 'error') return null;
    return {
      price: parseFloat(data.close),
      change24h: parseFloat(data.percent_change ?? 0),
      volume: parseInt(data.volume ?? 0),
      source: 'twelvedata',
    };
  } catch {
    return null;
  }
}

async function fetchRSIFromAlphaVantage(symbol) {
  try {
    const key = Deno.env.get('ALPHAVANTAGE_API_KEY');
    const url = `https://www.alphavantage.co/query?function=RSI&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${key}`;
    const data = await fetch(url).then(r => r.json());
    const analysis = data?.['Technical Analysis: RSI'];
    if (!analysis) return null;
    const latestDate = Object.keys(analysis)[0];
    return parseFloat(analysis[latestDate]?.RSI ?? 55);
  } catch {
    return null;
  }
}

async function fetchRSIFromTwelveData(symbol) {
  try {
    const key = Deno.env.get('TWELVEDATA_API_KEY');
    const url = `https://api.twelvedata.com/rsi?symbol=${symbol}&interval=1day&time_period=14&apikey=${key}`;
    const data = await fetch(url).then(r => r.json());
    if (!data?.values?.[0]?.rsi || data?.status === 'error') return null;
    return parseFloat(data.values[0].rsi);
  } catch {
    return null;
  }
}

// --- Aggregation logic ---

function averagePrice(results) {
  const valid = results.filter(r => r !== null && r.price > 0);
  if (valid.length === 0) return null;
  const avg = valid.reduce((sum, r) => sum + r.price, 0) / valid.length;
  const avgChange = valid.reduce((sum, r) => sum + (r.change24h ?? 0), 0) / valid.length;
  const avgVolume = valid.find(r => r.volume > 0)?.volume ?? 0;
  const sources = valid.map(r => r.source);
  return {
    price: parseFloat(avg.toFixed(4)),
    change24h: parseFloat(avgChange.toFixed(2)),
    volume: avgVolume,
    source: sources.join('+'),
    providerCount: valid.length,
  };
}

// --- Main handler ---

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { symbol, type } = await req.json();
    if (!symbol) return Response.json({ error: 'symbol required' }, { status: 400 });

    if (type === 'rsi') {
      const [rsi1, rsi2] = await Promise.all([
        fetchRSIFromAlphaVantage(symbol),
        fetchRSIFromTwelveData(symbol),
      ]);
      const rsiValues = [rsi1, rsi2].filter(v => v !== null);
      const rsi = rsiValues.length > 0
        ? parseFloat((rsiValues.reduce((s, v) => s + v, 0) / rsiValues.length).toFixed(1))
        : 55;
      return Response.json({ rsi, sources: rsiValues.length });
    }

    // Default: aggregate quote from all providers
    const [avData, finnhubData, polygonData, twelveData] = await Promise.all([
      fetchFromAlphaVantage(symbol),
      fetchFromFinnhub(symbol),
      fetchFromPolygon(symbol),
      fetchFromTwelveData(symbol),
    ]);

    const aggregated = averagePrice([avData, finnhubData, polygonData, twelveData]);

    if (!aggregated) {
      return Response.json({ quote: null, error: 'All providers failed' }, { status: 200 });
    }

    return Response.json({ quote: aggregated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});