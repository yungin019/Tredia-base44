import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, symbol, qty, order_type = 'market', time_in_force = 'gtc' } = await req.json();

    if (!action || !symbol || !qty) {
      return Response.json({ error: 'Missing required fields: action, symbol, qty' }, { status: 400 });
    }

    const baseUrl = Deno.env.get('ALPACA_BASE_URL');
    const apiKey = Deno.env.get('ALPACA_API_KEY');
    const secretKey = Deno.env.get('ALPACA_SECRET_KEY');

    // Submit order to Alpaca
    const base = baseUrl.replace(/\/v2\/?$/, '').replace(/\/$/, '');
    const orderRes = await fetch(`${base}/v2/orders`, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        symbol: symbol.toUpperCase(),
        qty: String(qty),
        side: action, // 'buy' or 'sell'
        type: order_type,
        time_in_force,
      }),
    });

    const order = await orderRes.json();

    if (!orderRes.ok) {
      return Response.json({ error: order.message || 'Alpaca order failed', details: order }, { status: orderRes.status });
    }

    return Response.json({ success: true, order });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});