import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { endpoint = 'account' } = await req.json();

    const baseUrl = Deno.env.get('ALPACA_BASE_URL');
    const apiKey = Deno.env.get('ALPACA_API_KEY');
    const secretKey = Deno.env.get('ALPACA_SECRET_KEY');

    const headers = {
      'APCA-API-KEY-ID': apiKey,
      'APCA-API-SECRET-KEY': secretKey,
    };

    // Strip trailing slash and /v2 suffix if already included in base URL
    const base = baseUrl.replace(/\/v2\/?$/, '').replace(/\/$/, '');
    let url = `${base}/v2/account`;
    if (endpoint === 'positions') url = `${base}/v2/positions`;
    if (endpoint === 'orders') url = `${base}/v2/orders?status=all&limit=50`;

    const res = await fetch(url, { headers });
    const text = await res.text();

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return Response.json({ error: `Non-JSON response: ${text}`, url, status: res.status }, { status: 500 });
    }

    if (!res.ok) {
      return Response.json({ error: data.message || 'Alpaca request failed', details: data }, { status: res.status });
    }

    return Response.json({ success: true, data });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});