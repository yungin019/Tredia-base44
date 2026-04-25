import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Fetches Alpaca account data on behalf of the authenticated user.
 *
 * For LIVE: uses user's stored alpaca_access_token → api.alpaca.markets
 * For PAPER: uses app-level API keys → ALPACA_BASE_URL (paper-api.alpaca.markets)
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { endpoint = 'account', order_id, is_live = false } = await req.json();

    let baseUrl, headers;

    if (is_live) {
      // ── LIVE: use user's personal OAuth token ─────────────────────────
      const alpacaToken = user.alpaca_access_token;
      if (!alpacaToken) {
        return Response.json({
          error: 'No Alpaca account connected. Please connect your Alpaca account in Settings.',
        }, { status: 403 });
      }
      baseUrl = 'https://api.alpaca.markets';
      headers = {
        'Authorization': `Bearer ${alpacaToken}`,
        'Content-Type': 'application/json',
      };
    } else {
      // ── PAPER: use app-level paper keys ───────────────────────────────
      const envBase = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';
      const apiKey = Deno.env.get('ALPACA_API_KEY');
      const secretKey = Deno.env.get('ALPACA_SECRET_KEY');
      baseUrl = envBase.replace(/\/v2\/?$/, '').replace(/\/$/, '');
      headers = {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
        'Content-Type': 'application/json',
      };
    }

    let url = `${baseUrl}/v2/account`;
    let method = 'GET';

    if (endpoint === 'positions') url = `${baseUrl}/v2/positions`;
    if (endpoint === 'orders') url = `${baseUrl}/v2/orders?status=all&limit=100&direction=desc`;
    if (endpoint === 'open_orders') url = `${baseUrl}/v2/orders?status=open&limit=50`;
    if (endpoint === 'portfolio_history') url = `${baseUrl}/v2/account/portfolio/history?period=1W&timeframe=1D`;
    if (endpoint === 'cancel_order' && order_id) {
      url = `${baseUrl}/v2/orders/${order_id}`;
      method = 'DELETE';
    }

    const res = await fetch(url, { method, headers });

    if (method === 'DELETE') {
      if (res.status === 204) return Response.json({ success: true });
      const t = await res.text();
      return Response.json({ error: t }, { status: res.status });
    }

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