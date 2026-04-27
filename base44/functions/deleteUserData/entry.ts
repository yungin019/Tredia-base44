import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;
    const userEmail = user.email;

    console.log(`[deleteUserData] Starting deletion for user: ${userEmail} (${userId})`);

    // 1. Fetch all user-owned entity data in parallel (best-effort)
    const fetched = await Promise.allSettled([
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
    fetched.forEach((result, i) => {
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        console.log(`[deleteUserData] ${entityNames[i]}: ${result.value.length} records to delete`);
        result.value.forEach(r => {
          const entity = useServiceRole[i]
            ? base44.asServiceRole.entities[entityNames[i]]
            : base44.entities[entityNames[i]];
          toDelete.push(entity.delete(r.id));
        });
      } else if (result.status === 'rejected') {
        console.warn(`[deleteUserData] ${entityNames[i]} fetch failed:`, result.reason?.message);
      }
    });

    // 2. Delete all entity records (best-effort, don't fail on individual errors)
    const deleteResults = await Promise.allSettled(toDelete);
    const failed = deleteResults.filter(r => r.status === 'rejected').length;
    console.log(`[deleteUserData] Deleted records: ${deleteResults.length - failed} ok, ${failed} failed`);

    // 3. Delete the auth user account via service role (Apple App Store requirement)
    console.log(`[deleteUserData] Deleting user account: ${userId}`);
    try {
      await base44.asServiceRole.entities.User.delete(userId);
      console.log(`[deleteUserData] User account deleted successfully`);
    } catch (authErr) {
      // If the user is the app owner, we cannot delete the auth record but data is already cleaned.
      // For regular users this should never fail.
      console.warn(`[deleteUserData] Auth deletion failed (may be app owner):`, authErr.message);
      if (authErr.message?.includes('owner')) {
        return Response.json({ error: 'Cannot delete the app owner account.' }, { status: 403 });
      }
      throw authErr;
    }

    return Response.json({ success: true, message: 'Account fully deleted' });
  } catch (error) {
    console.error('[deleteUserData] Fatal error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});