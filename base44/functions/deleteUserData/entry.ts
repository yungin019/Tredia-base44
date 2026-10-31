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
 *
 * The wipe is verified before returning: if anything still belongs to the
 * account the call fails, so the client never deletes the login while the data
 * is still there.
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
    const errors: string[] = [];

    // Server-side delete by owner key, then a list + in-memory pass, then a
    // verification read.
    const ownedRows = async (entity: string, field: string) => {
      const page = await db[entity].list('-created_date', 1000);
      const rows = page?.items || page || [];
      return rows.filter((row: any) => row && keys.includes(row[field]));
    };

    for (const { entity, field } of targets) {
      const name = `${entity}.${field}`;
      for (const key of keys) {
        try {
          await db[entity].deleteMany({ [field]: key });
        } catch (err) {
          errors.push(`${name}: ${err.message}`);
        }
      }
      try {
        for (const row of await ownedRows(entity, field)) {
          await db[entity].delete(row.id);
          deleted[name] = (deleted[name] || 0) + 1;
        }
      } catch (err) {
        errors.push(`${name} (sweep): ${err.message}`);
      }
    }

    // Verification: anything still owned by this account blocks the wipe.
    const remaining: Record<string, number> = {};
    for (const { entity, field } of targets) {
      try {
        const left = (await ownedRows(entity, field)).length;
        if (left > 0) remaining[`${entity}.${field}`] = left;
      } catch (_) { /* surfaced through errors */ }
    }
    if (Object.keys(remaining).length > 0) {
      console.error('[deleteUserData] Rows remain:', JSON.stringify(remaining), JSON.stringify(errors));
      return Response.json({
        error: 'Your data could not be fully deleted. Nothing was removed from your login yet — please try again.',
        remaining,
        errors,
      }, { status: 500 });
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

    return Response.json({ success: true, uid, deleted, errors, message: 'App data deleted' });
  } catch (error) {
    console.error('[deleteUserData] Fatal error:', error.message, error.stack);
    return Response.json({ error: error.message }, { status: 500 });
  }
});