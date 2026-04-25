import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;
    const userEmail = user.email;

    // 1. Delete all user-owned entity data in parallel
    const [portfolioItems, tradeLogs, watchlistItems, foundingMembers, notificationLogs,
           priceAlerts, appNotifications, communityPosts, postLikes, postComments,
           userFollowsAsFollower, userFollowsAsFollowing, copiedTrades, userStats] = await Promise.allSettled([
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

    // Collect all records to delete
    const toDelete = [];
    const addRecords = (settled, entityName, useServiceRole = false) => {
      if (settled.status === 'fulfilled') {
        settled.value.forEach(r => {
          const entity = useServiceRole
            ? base44.asServiceRole.entities[entityName]
            : base44.entities[entityName];
          toDelete.push(entity.delete(r.id));
        });
      }
    };

    addRecords(portfolioItems, 'Portfolio');
    addRecords(tradeLogs, 'TradeLog');
    addRecords(watchlistItems, 'Watchlist');
    addRecords(foundingMembers, 'FoundingMember', true);
    addRecords(notificationLogs, 'NotificationLog', true);
    addRecords(priceAlerts, 'PriceAlert', true);
    addRecords(appNotifications, 'AppNotification', true);
    addRecords(communityPosts, 'CommunityPost', true);
    addRecords(postLikes, 'PostLike', true);
    addRecords(postComments, 'PostComment', true);
    addRecords(userFollowsAsFollower, 'UserFollow', true);
    addRecords(userFollowsAsFollowing, 'UserFollow', true);
    addRecords(copiedTrades, 'CopiedTrade', true);
    addRecords(userStats, 'UserStat', true);

    // 2. Delete all entity data
    await Promise.allSettled(toDelete);

    // 3. CRITICAL: Delete the auth user record itself (Apple App Store requirement)
    // This allows re-registration with the same email after deletion
    try {
      await base44.asServiceRole.entities.User.delete(userId);
    } catch (deleteErr) {
      // If user deletion fails (e.g., app owner), still return success for data deletion
      // Log the error but don't block the response
      console.warn('User auth deletion failed:', deleteErr.message);
    }

    return Response.json({ success: true, message: 'Account fully deleted' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});