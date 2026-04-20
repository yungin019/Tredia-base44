import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all untriggered price alerts
    const alerts = await base44.asServiceRole.entities.PriceAlert.filter({ triggered: false });
    if (!alerts || alerts.length === 0) {
      return Response.json({ checked: 0, triggered: 0 });
    }

    // Get unique symbols
    const symbols = [...new Set(alerts.map(a => a.symbol))];

    // Fetch current prices via stockPrices function
    let prices = {};
    try {
      const priceRes = await base44.asServiceRole.functions.invoke('stockPrices', { symbols });
      prices = priceRes?.prices || priceRes?.data?.prices || {};
    } catch {
      return Response.json({ error: 'Price fetch failed', checked: 0, triggered: 0 });
    }

    let triggered = 0;
    for (const alert of alerts) {
      const currentPrice = prices[alert.symbol];
      if (!currentPrice) continue;

      const shouldTrigger =
        (alert.direction === 'above' && currentPrice >= alert.target_price) ||
        (alert.direction === 'below' && currentPrice <= alert.target_price);

      if (!shouldTrigger) continue;

      // Mark alert as triggered
      await base44.asServiceRole.entities.PriceAlert.update(alert.id, {
        triggered: true,
        triggered_at: new Date().toISOString(),
      });

      // Create in-app notification
      const direction = alert.direction === 'above' ? 'reached' : 'dropped to';
      await base44.asServiceRole.entities.AppNotification.create({
        user_id: alert.user_id,
        type: 'price_alert',
        title: `⚡ TREK ALERT: ${alert.symbol}`,
        message: `${alert.symbol} ${direction} your target of $${alert.target_price.toFixed(2)}. Current price: $${currentPrice.toFixed(2)}. Want to act on this?`,
        symbol: alert.symbol,
        route: `/Asset/${alert.symbol}`,
        read: false,
        alert_id: alert.id,
      });

      triggered++;
    }

    return Response.json({ checked: alerts.length, triggered });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});