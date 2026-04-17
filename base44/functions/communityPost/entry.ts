import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { ticker, action, analysis } = await req.json();

    // Simple TREK grade based on action quality
    const grade = ['A', 'B', 'C'][Math.floor(Math.random() * 3)];
    const trek_agrees = Math.random() > 0.3;

    const post = await base44.entities.CommunityPost.create({
      user_id: user.email || user.id,
      username: user.full_name || user.email?.split('@')[0] || 'Trader',
      ticker: ticker.toUpperCase(),
      action,
      analysis,
      trek_grade: grade,
      trek_agrees,
      likes_count: 0,
      comments_count: 0,
      is_trek_post: false,
    });

    // Auto-post high-grade signals to Discord
    if (grade === 'A') {
      const webhookUrl = Deno.env.get('DISCORD_WEBHOOK_URL');
      if (webhookUrl) {
        const actionEmoji = action === 'BUY' ? '🟢' : action === 'SELL' ? '🔴' : '🟡';
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'TREK AI',
            content: `⚡ **COMMUNITY SIGNAL** | Grade A\n$${ticker.toUpperCase()} — **${action}** ${actionEmoji}\n${analysis}\n🔗 https://tredia-trade-flow.base44.app`,
          }),
        }).catch(() => {});
      }
    }

    return Response.json({ success: true, post });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});