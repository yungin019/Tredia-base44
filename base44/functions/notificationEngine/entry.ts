import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { event, userRegion, userInterests, userLevel } = body;

    if (!event) {
      return Response.json({ error: 'Missing event' }, { status: 400 });
    }

    // Calculate notification relevance
    const relevance = calculateRelevance(event, userRegion, userInterests, userLevel);

    if (!relevance.shouldNotify) {
      return Response.json({ sent: false, reason: 'Not relevant for this user' });
    }

    // Generate notification message
    const notification = generateNotification(event, relevance, userLevel);

    // Send notification (integrate with push service)
    return Response.json({
      sent: true,
      notification,
      urgency: relevance.urgency,
      priority: relevance.priority,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function calculateRelevance(event, userRegion, userInterests, userLevel) {
  let score = 0;
  let urgency = 'LOW';

  // Event severity
  const severityMap = { CRITICAL: 40, HIGH: 25, MEDIUM: 15, LOW: 5 };
  score += severityMap[event.severity] || 10;

  // Region match
  if (event.impactedRegions?.includes(userRegion)) {
    score += 30;
    urgency = 'HIGH';
  } else if (event.impactedRegions?.includes('all')) {
    score += 15;
    urgency = 'MEDIUM';
  }

  // Interest match
  const interest = userInterests?.find(i => event.affectedAssets?.some(a => matchesAssetType(a, i)));
  if (interest) {
    score += 25;
    if (urgency === 'MEDIUM') urgency = 'HIGH';
  }

  // Beginner friendly filter
  if (userLevel === 'beginner' && score < 40) {
    return { shouldNotify: false, priority: score, urgency };
  }

  return {
    shouldNotify: score > 45,
    priority: score,
    urgency: score > 70 ? 'CRITICAL' : urgency,
  };
}

function generateNotification(event, relevance, userLevel) {
  const simpleMsg = {
    CRITICAL: `⚡ ${event.headline} — Act now`,
    HIGH: `📈 ${event.headline}`,
    MEDIUM: `ℹ️ ${event.headline}`,
  };

  const detailedMsg = {
    CRITICAL: `${event.headline}\n\n${event.summary}\n\nTREK: ${event.recommendation}`,
    HIGH: `${event.headline}\n\nImpact: ${event.affectedAssets?.slice(0, 3).join(', ')}\n\n${event.summary}`,
    MEDIUM: `${event.headline} — ${event.summary}`,
  };

  return {
    title: simpleMsg[relevance.urgency] || event.headline,
    body: detailedMsg[relevance.urgency] || event.summary,
    action: `View ${event.affectedAssets?.[0] || 'Update'}`,
    tag: event.type,
    badge: relevance.urgency === 'CRITICAL' ? '🔴' : '🟡',
  };
}

function matchesAssetType(asset, interest) {
  const typeMap = {
    stocks: /^[A-Z]+$/ || /\.(PA|DE|AS|L|T|HK)$/,
    crypto: /^(BTC|ETH|SOL|XRP|ADA)$/,
    forex: /USD|EUR|GBP|JPY|CHF/,
    commodities: /XAU|XAG|CL|NG/,
  };

  const regex = typeMap[interest];
  return regex ? regex.test(asset) : false;
}