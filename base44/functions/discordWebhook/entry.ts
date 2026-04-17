import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { ticker, action, confidence, analysis } = await req.json();

    const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
    if (!webhookUrl) return Response.json({ error: 'Webhook not configured' }, { status: 500 });

    const actionEmoji = action === 'BUY' ? '🟢' : action === 'SELL' ? '🔴' : '🟡';
    const appUrl = 'https://tredia-trade-flow.base44.app';

    const embed = {
      title: `⚡ TREK SIGNAL`,
      description: `**$${ticker}** — **${action}** ${actionEmoji}\nConfidence: **${confidence || '—'}%**\n\n${analysis}\n\n🔗 [Open in TREDIO](${appUrl})`,
      color: action === 'BUY' ? 0x00D68F : action === 'SELL' ? 0xEF4444 : 0xF59E0B,
      timestamp: new Date().toISOString(),
      footer: { text: 'TREK AI · TREDIO' },
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'TREK AI', embeds: [embed] }),
    });

    if (!res.ok) {
      const err = await res.text();
      return Response.json({ error: err }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});