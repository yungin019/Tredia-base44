import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;
    const userEmail = user.email;

    // 1. Delete all user-owned entity data in parallel
    const settled = await Promise.allSettled([
      base44.entities.Portfolio.filter({}),
      base44.entities.TradeLog.filter({}),
      base44.entities.Watchlist.filter({}),
      base44.asServiceRole.entities.FoundingMember.filter({ user_id: userEmail }),
      base44.asServiceRole.entities.NotificationLog.filter({ user_id: userEmail }),
      base44.asServiceRole.entities.PriceAlert.filter({ user_id: userEmail }),
      base44.asServiceRole.entities.AppNotification.filter({ user_id: userEmail }),
      base44.asServiceRole.entities.CommunityPost.filter({ user_id: userEmail }),
      base44.asServiceRole.entities.PostLike.filter({ user_id: userEmail }),
      base44.asServiceRole.entities.PostComment.filter({ user_id: userEmail }),
      base44.asServiceRole.entities.UserFollow.filter({ follower_id: userEmail }),
      base44.asServiceRole.entities.UserFollow.filter({ following_id: userEmail }),
      base44.asServiceRole.entities.CopiedTrade.filter({ user_id: userEmail }),
      base44.asServiceRole.entities.UserStat.filter({ user_id: userEmail }),
    ]);

    const entityNames = [
      'Portfolio', 'TradeLog', 'Watchlist', 'FoundingMember',
      'NotificationLog', 'PriceAlert', 'AppNotification', 'CommunityPost',
      'PostLike', 'PostComment', 'UserFollow', 'UserFollow',
      'CopiedTrade', 'UserStat',
    ];
    const useServiceRole = [
      false, false, false, true, true, true, true, true,
      true, true, true, true, true, true,
    ];

    const toDelete = [];
    settled.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        result.value.forEach(r => {
          const entity = useServiceRole[i]
            ? base44.asServiceRole.entities[entityNames[i]]
            : base44.entities[entityNames[i]];
          toDelete.push(entity.delete(r.id));
        });
      }
    });

    // 2. Delete all entity records
    await Promise.allSettled(toDelete);

    // 3. CRITICAL: Delete the auth user record (Apple App Store requirement)
    // This allows the user to re-register with the same email immediately after deletion
    await base44.asServiceRole.entities.User.delete(userId);

    return Response.json({ success: true, message: 'Account fully deleted' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});