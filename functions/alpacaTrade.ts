import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, symbol, qty, order_type = 'market', time_in_force = 'day', limit_price, stop_price } = body;

    if (!action || !symbol || !qty) {
      return Response.json({ error: 'Missing required fields: action, symbol, qty' }, { status: 400 });
    }

    const baseUrl = Deno.env.get('ALPACA_BASE_URL');
    const apiKey = Deno.env.get('ALPACA_API_KEY');
    const secretKey = Deno.env.get('ALPACA_SECRET_KEY');

    const base = baseUrl.replace(/\/v2\/?$/, '').replace(/\/$/, '');

    const orderPayload = {
      symbol: symbol.toUpperCase(),
      qty: String(qty),
      side: action,
      type: order_type,
      time_in_force,
    };

    if (order_type === 'limit' && limit_price) {
      orderPayload.limit_price = String(limit_price);
    }
    if (order_type === 'stop' && stop_price) {
      orderPayload.stop_price = String(stop_price);
    }
    if (order_type === 'stop_limit' && limit_price && stop_price) {
      orderPayload.limit_price = String(limit_price);
      orderPayload.stop_price = String(stop_price);
    }

    const orderRes = await fetch(`${base}/v2/orders`, {
      method: 'POST',
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    });

    const text = await orderRes.text();
    let order;
    try { order = JSON.parse(text); } catch { return Response.json({ error: `Non-JSON: ${text}` }, { status: 500 }); }

    if (!orderRes.ok) {
      return Response.json({ error: order.message || 'Alpaca order failed', details: order }, { status: orderRes.status });
    }

    return Response.json({ success: true, order });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});