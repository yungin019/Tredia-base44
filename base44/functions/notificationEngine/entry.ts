import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// ── STRICT: max 10 words, must include cause + direction ─────────────────────
function buildTitle(signal) {
  const bias = signal.action_bias === 'bullish' ? '↑' : signal.action_bias === 'bearish' ? '↓' : '→';
  const assets = (signal.related_assets || []).slice(0, 2).join(', ');
  const category = signal.category || 'Market';
  // e.g. "↑ Fed pause — QQQ, TLT breakout confirmed"
  if (assets) {
    return `${bias} ${category}: ${assets} — ${signal.driver?.split('.')[0]?.slice(0, 40) || 'signal active'}`;
  }
  return `${bias} ${category} — ${signal.driver?.split('.')[0]?.slice(0, 50) || 'signal active'}`;
}

function buildBody(signal) {
  const parts = [];
  if (signal.impact) parts.push(signal.impact.slice(0, 80));
  if (signal.risk) parts.push(`Risk: ${signal.risk.slice(0, 60)}`);
  return parts.join('\n') || signal.market_state?.slice(0, 100) || '';
}

// ── RELEVANCE SCORING ─────────────────────────────────────────────────────────
function scoreRelevance(signal, userRegion, userInterests) {
  let score = 0;

  // Confidence is the base score
  score += (signal.confidence || 50);

  // Region match
  const regions = signal.regions || [];
  if (regions.includes(userRegion)) score += 30;
  else if (regions.includes('Global')) score += 15;
  else return { score: 0, shouldNotify: false };

  // Interest match — does any related asset match user's watchlist?
  const assets = signal.related_assets || [];
  if (userInterests?.length && assets.some(a => userInterests.includes(a))) {
    score += 25;
  }

  // Category boost for high-impact events
  const highImpact = ['central_bank', 'economic_data', 'earnings'];
  if (highImpact.includes(signal.category)) score += 10;

  return { score, shouldNotify: score >= 60 };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { signalId, userRegion = 'US', userInterests = [] } = body;

    // Fetch the actual signal from DB
    let signal;
    if (signalId) {
      const results = await base44.entities.Catalyst.filter({ id: signalId });
      signal = results?.[0];
    } else {
      // Fetch latest high-confidence signal for this region
      const all = await base44.entities.Catalyst.list('-published_at', 20);
      signal = all.find(s => {
        const { shouldNotify } = scoreRelevance(s, userRegion, userInterests);
        return shouldNotify;
      });
    }

    if (!signal) {
      return Response.json({ sent: false, reason: 'No qualifying signal found' });
    }

    const { score, shouldNotify } = scoreRelevance(signal, userRegion, userInterests);

    if (!shouldNotify) {
      return Response.json({ sent: false, reason: `Score ${score} below threshold`, score });
    }

    const notification = {
      title: buildTitle(signal),
      body: buildBody(signal),
      action: signal.related_assets?.[0] ? `View ${signal.related_assets[0]}` : 'View Signal',
      tag: signal.category || 'market',
      urgency: score >= 110 ? 'CRITICAL' : score >= 85 ? 'HIGH' : 'MEDIUM',
      signal_id: signal.id,
      assets: signal.related_assets || [],
      action_bias: signal.action_bias,
      confidence: signal.confidence,
    };

    return Response.json({ sent: true, notification, score });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});