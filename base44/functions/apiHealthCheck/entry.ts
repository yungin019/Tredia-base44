import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const FINNHUB_KEY     = Deno.env.get('FINNHUB_API_KEY');
    const POLYGON_KEY     = Deno.env.get('POLYGON_API_KEY');
    const TWELVEDATA_KEY  = Deno.env.get('TWELVEDATA_API_KEY');
    const AV_KEY          = Deno.env.get('ALPHAVANTAGE_API_KEY');

    const timeout = (url, ms = 6000) => {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
    };

    const [finnhub, polygon, twelvedata, alphavantage] = await Promise.all([

      // ── Finnhub: AAPL quote ─────────────────────────────────────────
      (async () => {
        const secretName = 'FINNHUB_API_KEY';
        const endpoint = 'https://finnhub.io/api/v1/quote?symbol=AAPL';
        if (!FINNHUB_KEY) return { secretName, endpoint, status: 'MISSING_SECRET', pass: false };
        try {
          const res = await timeout(`${endpoint}&token=${FINNHUB_KEY}`);
          const data = await res.json();
          const hasData = typeof data.c === 'number' && data.c > 0;
          const errorMsg = data.error || null;
          return {
            secretName,
            endpoint,
            httpStatus: res.status,
            pass: hasData,
            price: hasData ? data.c : undefined,
            error: errorMsg,
            rawKeys: Object.keys(data),
          };
        } catch (e) {
          return { secretName, endpoint, pass: false, error: e.message };
        }
      })(),

      // ── Polygon: AAPL previous close ───────────────────────────────
      (async () => {
        const secretName = 'POLYGON_API_KEY';
        const endpoint = 'https://api.polygon.io/v2/aggs/ticker/AAPL/prev?adjusted=true';
        if (!POLYGON_KEY) return { secretName, endpoint, status: 'MISSING_SECRET', pass: false };
        try {
          const res = await timeout(`${endpoint}&apiKey=${POLYGON_KEY}`);
          const data = await res.json();
          const close = data?.results?.[0]?.c;
          const hasData = typeof close === 'number' && close > 0;
          return {
            secretName,
            endpoint,
            httpStatus: res.status,
            pass: hasData,
            price: hasData ? close : undefined,
            polygonStatus: data.status,
            error: data.error || data.message || null,
            resultCount: data.resultsCount,
          };
        } catch (e) {
          return { secretName, endpoint, pass: false, error: e.message };
        }
      })(),

      // ── Twelve Data: EUR/USD quote ──────────────────────────────────
      (async () => {
        const secretName = 'TWELVEDATA_API_KEY';
        const endpoint = 'https://api.twelvedata.com/price?symbol=EUR/USD';
        if (!TWELVEDATA_KEY) return { secretName, endpoint, status: 'MISSING_SECRET', pass: false };
        try {
          const res = await timeout(`${endpoint}&apikey=${TWELVEDATA_KEY}`);
          const data = await res.json();
          const price = parseFloat(data.price);
          const hasData = !isNaN(price) && price > 0;
          return {
            secretName,
            endpoint,
            httpStatus: res.status,
            pass: hasData,
            price: hasData ? price : undefined,
            error: data.message || data.code ? `code=${data.code} msg=${data.message}` : null,
            rawKeys: Object.keys(data),
          };
        } catch (e) {
          return { secretName, endpoint, pass: false, error: e.message };
        }
      })(),

      // ── Alpha Vantage: AAPL TIME_SERIES_DAILY (compact) ────────────
      (async () => {
        const secretName = 'ALPHAVANTAGE_API_KEY';
        const endpoint = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AAPL&outputsize=compact';
        if (!AV_KEY) return { secretName, endpoint, status: 'MISSING_SECRET', pass: false };
        try {
          const res = await timeout(`${endpoint}&apikey=${AV_KEY}`);
          const data = await res.json();
          const tsKey = Object.keys(data).find(k => k.startsWith('Time Series'));
          const hasData = !!tsKey && Object.keys(data[tsKey] || {}).length > 0;
          const latestDate = hasData ? Object.keys(data[tsKey])[0] : null;
          const latestClose = hasData ? parseFloat(data[tsKey][latestDate]?.['4. close']) : null;
          const rateLimitMsg = data['Information'] || data['Note'] || null;
          return {
            secretName,
            endpoint,
            httpStatus: res.status,
            pass: hasData,
            latestDate,
            price: latestClose || undefined,
            error: rateLimitMsg || data['Error Message'] || null,
            rawKeys: Object.keys(data),
          };
        } catch (e) {
          return { secretName, endpoint, pass: false, error: e.message };
        }
      })(),

    ]);

    return Response.json({
      testedAt: new Date().toISOString(),
      results: { finnhub, polygon, twelvedata, alphavantage },
      summary: {
        FINNHUB_API_KEY:    finnhub.pass    ? '✅ PASS' : '❌ FAIL',
        POLYGON_API_KEY:    polygon.pass    ? '✅ PASS' : '❌ FAIL',
        TWELVEDATA_API_KEY: twelvedata.pass ? '✅ PASS' : '❌ FAIL',
        ALPHAVANTAGE_API_KEY: alphavantage.pass ? '✅ PASS' : '❌ FAIL',
      },
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});