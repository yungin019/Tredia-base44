import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyFirebaseToken, tokenFromRequest } from '../../shared/firebaseAuth.ts';

/**
 * Full account wipe.
 *
 * Identity is the verified Firebase ID token, because every stored row keys off
 * the Firebase uid (see userData). Rows are matched on that uid and on the
 * account email so both current and legacy rows are removed. The Firebase Auth
 * record itself is deleted by the client immediately after this call succeeds
 * (firebase/auth deleteUser), which is what frees the email for a new signup.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const identity = await verifyFirebaseToken(tokenFromRequest(req));
    if (!identity?.uid) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const uid = identity.uid;
    const email = identity.email || '';
    const keys = [uid, email].filter(Boolean);
    console.log(`[deleteUserData] Starting deletion for uid=${uid} email=${email}`);

    const db = base44.asServiceRole.entities;

    // Every entity that stores per-user rows, with its owner field(s).
    const targets: Array<{ entity: string; field: string }> = [
      { entity: 'UserProfile', field: 'user_id' },
      { entity: 'Portfolio', field: 'user_id' },
      { entity: 'TradeLog', field: 'user_id' },
      { entity: 'Watchlist', field: 'user_id' },
      { entity: 'FoundingMember', field: 'user_id' },
      { entity: 'NotificationLog', field: 'user_id' },
      { entity: 'PriceAlert', field: 'user_id' },
      { entity: 'AppNotification', field: 'user_id' },
      { entity: 'CommunityPost', field: 'user_id' },
      { entity: 'PostLike', field: 'user_id' },
      { entity: 'PostComment', field: 'user_id' },
      { entity: 'CopiedTrade', field: 'user_id' },
      { entity: 'UserStat', field: 'user_id' },
      { entity: 'UserFollow', field: 'follower_id' },
      { entity: 'UserFollow', field: 'following_id' },
    ];

    const deleted: Record<string, number> = {};

    for (const { entity, field } of targets) {
      for (const key of keys) {
        try {
          const rows = await db[entity].filter({ [field]: key }, { limit: 200 });
          for (const row of rows?.items || rows || []) {
            await db[entity].delete(row.id);
            const name = `${entity}.${field}`;
            deleted[name] = (deleted[name] || 0) + 1;
          }
        } catch (err) {
          console.warn(`[deleteUserData] ${entity}.${field}=${key} failed:`, err.message);
        }
      }
    }

    console.log('[deleteUserData] Deleted rows:', JSON.stringify(deleted));

    // Base44 platform user row (best effort — the app's login is Firebase).
    if (email) {
      try {
        const users = await db.User.list('-created_date', 200);
        const match = (users?.items || users || []).find((u: any) => (u.email || '').toLowerCase() === email.toLowerCase());
        if (match) await db.User.delete(match.id);
      } catch (err) {
        console.warn('[deleteUserData] Base44 user row not deleted:', err.message);
      }
    }

    return Response.json({ success: true, uid, deleted, message: 'App data deleted' });
  } catch (error) {
    console.error('[deleteUserData] Fatal error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});