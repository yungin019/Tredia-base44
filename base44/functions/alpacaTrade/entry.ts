import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Submits a trade order to Alpaca on behalf of the authenticated user.
 *
 * For LIVE trading: uses the user's OAuth access_token stored in their profile.
 *   → Endpoint: https://api.alpaca.markets/v2/orders
 *   → Auth: Authorization: Bearer {user.alpaca_access_token}
 *
 * For PAPER trading: uses app-level API keys (ALPACA_API_KEY / ALPACA_SECRET_KEY).
 *   → Endpoint: ALPACA_BASE_URL (should be https://paper-api.alpaca.markets)
 *   → Auth: APCA-API-KEY-ID / APCA-API-SECRET-KEY headers
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, symbol, qty, order_type = 'market', time_in_force = 'day', limit_price, stop_price, is_live = false } = body;

    if (!action || !symbol || !qty) {
      return Response.json({ error: 'Missing required fields: action, symbol, qty' }, { status: 400 });
    }

    const orderPayload = {
      symbol: symbol.toUpperCase(),
      qty: String(qty),
      side: action,
      type: order_type,
      time_in_force,
    };

    if (order_type === 'limit' && limit_price) orderPayload.limit_price = String(limit_price);
    if (order_type === 'stop' && stop_price) orderPayload.stop_price = String(stop_price);
    if (order_type === 'stop_limit' && limit_price && stop_price) {
      orderPayload.limit_price = String(limit_price);
      orderPayload.stop_price = String(stop_price);
    }

    let orderUrl, headers;

    if (is_live) {
      // ── LIVE TRADING: use user's personal OAuth token ─────────────────
      const alpacaToken = user.alpaca_access_token;
      if (!alpacaToken) {
        return Response.json({
          error: 'No Alpaca account connected. Please connect your Alpaca account in Settings to trade live.',
        }, { status: 403 });
      }
      orderUrl = 'https://api.alpaca.markets/v2/orders';
      headers = {
        'Authorization': `Bearer ${alpacaToken}`,
        'Content-Type': 'application/json',
      };
    } else {
      // ── PAPER TRADING: use app-level paper trading keys ───────────────
      const baseUrl = Deno.env.get('ALPACA_BASE_URL') || 'https://paper-api.alpaca.markets';
      const apiKey = Deno.env.get('ALPACA_API_KEY');
      const secretKey = Deno.env.get('ALPACA_SECRET_KEY');
      if (!apiKey || !secretKey) {
        return Response.json({ error: 'Paper trading API keys not configured' }, { status: 503 });
      }
      const base = baseUrl.replace(/\/v2\/?$/, '').replace(/\/$/, '');
      orderUrl = `${base}/v2/orders`;
      headers = {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
        'Content-Type': 'application/json',
      };
    }

    const orderRes = await fetch(orderUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderPayload),
    });

    const text = await orderRes.text();
    let order;
    try { order = JSON.parse(text); } catch { return Response.json({ error: `Non-JSON response from Alpaca: ${text}` }, { status: 500 }); }

    if (!orderRes.ok) {
      // Return human-readable Alpaca error messages
      const msg = order.message || order.error || 'Order rejected by Alpaca';
      return Response.json({ error: msg, details: order }, { status: orderRes.status });
    }

    return Response.json({ success: true, order });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});