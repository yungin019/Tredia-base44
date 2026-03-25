import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.email;

    // Delete all user-owned records across all entities in parallel
    const [portfolioItems, tradeLogs, watchlistItems, foundingMembers, notificationLogs] = await Promise.all([
      base44.entities.Portfolio.filter({}),
      base44.entities.TradeLog.filter({}),
      base44.entities.Watchlist.filter({}),
      base44.asServiceRole.entities.FoundingMember.filter({ user_id: userId }),
      base44.asServiceRole.entities.NotificationLog.filter({ user_id: userId }),
    ]);

    // Delete all found records in parallel
    const deletions = [
      ...portfolioItems.map(r => base44.entities.Portfolio.delete(r.id)),
      ...tradeLogs.map(r => base44.entities.TradeLog.delete(r.id)),
      ...watchlistItems.map(r => base44.entities.Watchlist.delete(r.id)),
      ...foundingMembers.map(r => base44.asServiceRole.entities.FoundingMember.delete(r.id)),
      ...notificationLogs.map(r => base44.asServiceRole.entities.NotificationLog.delete(r.id)),
    ];

    await Promise.allSettled(deletions);

    const totalDeleted = portfolioItems.length + tradeLogs.length + watchlistItems.length + foundingMembers.length + notificationLogs.length;

    return Response.json({ success: true, deleted: totalDeleted });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});