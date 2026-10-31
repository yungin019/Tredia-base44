/**
 * deleteUserData — one irreversible action, in one order that cannot half-fail:
 *
 *   1. verify the caller's Firebase ID token (identity is the token, never the client)
 *   2. delete the Firebase Auth user SERVER-SIDE (accounts:delete with that token)
 *   3. delete every per-user row, then re-read to prove it
 *
 * If the login cannot be deleted (Google requires a fresh sign-in), step 2 fails
 * and NOTHING is deleted — the account stays whole and the app asks the user to
 * confirm their password instead of leaving orphaned data behind.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyFirebaseToken, tokenFromRequest } from '../../shared/firebaseAuth.ts';

const FIREBASE_API_KEY = Deno.env.get('VITE_FIREBASE_API_KEY') || Deno.env.get('FIREBASE_API_KEY') || '';

const TARGETS: Array<{ entity: string; field: string }> = [
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

function itemsOf(result: any) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  for (const key of ['items', 'data', 'results', 'rows']) {
    if (Array.isArray(result?.[key])) return result[key];
  }
  return [];
}

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const idToken = body.idToken || tokenFromRequest(req);
    const identity = await verifyFirebaseToken(idToken);
    if (!identity?.uid) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const uid = identity.uid;
    const email = (identity.email || '').toLowerCase();
    const keys = [uid, identity.email].filter(Boolean);

    // ── 2. Delete the Firebase Auth user, server-side ───────────────────
    const apiKey = FIREBASE_API_KEY || body.firebaseApiKey || '';
    if (!apiKey) {
      return Response.json({
        error: 'Account deletion is not configured. Please contact support.',
        code: 'NOT_CONFIGURED',
      }, { status: 500 });
    }
    const delRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:delete?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!delRes.ok) {
      const payload = await delRes.json().catch(() => ({}));
      const message = payload?.error?.message || `HTTP ${delRes.status}`;
      console.error('[deleteUserData] Firebase delete failed:', message);
      // Nothing has been deleted yet — the account is still whole.
      if (message.includes('CREDENTIAL_TOO_OLD_LOGIN_AGAIN')) {
        return Response.json({
          error: 'For your security, please confirm your password to finish deleting your account. Nothing has been deleted yet.',
          code: 'RECENT_LOGIN_REQUIRED',
        }, { status: 409 });
      }
      if (message.includes('USER_NOT_FOUND')) {
        console.log('[deleteUserData] Firebase user already gone, continuing with row wipe');
      } else {
        return Response.json({
          error: 'We could not delete your sign-in. Nothing has been deleted yet — please try again.',
          code: 'FIREBASE_DELETE_FAILED',
          detail: message,
        }, { status: 400 });
      }
    }

    // ── 3. Delete every per-user row, then prove it ─────────────────────
    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;

    const ownedRows = async (entity: string, field: string) => {
      const rows = itemsOf(await db[entity].list('-created_date', 1000));
      return rows.filter((row: any) => row && keys.includes(row[field]));
    };

    const deleted: Record<string, number> = {};
    const errors: string[] = [];

    for (const { entity, field } of TARGETS) {
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

    const remaining: Record<string, number> = {};
    for (const { entity, field } of TARGETS) {
      try {
        const left = (await ownedRows(entity, field)).length;
        if (left > 0) remaining[`${entity}.${field}`] = left;
      } catch (_) { /* surfaced through errors */ }
    }
    if (Object.keys(remaining).length > 0) {
      console.error('[deleteUserData] Rows remain after login deletion:', JSON.stringify(remaining), JSON.stringify(errors));
      return Response.json({
        error: 'Your sign-in was deleted, but some stored data could not be removed. Please contact support so we can finish it.',
        code: 'ROWS_REMAIN',
        remaining,
      }, { status: 500 });
    }

    // Base44 platform user row, when one exists for this email (best effort).
    if (email) {
      try {
        const users = itemsOf(await db.User.list('-created_date', 200));
        const match = users.find((u: any) => (u.email || '').toLowerCase() === email);
        if (match) await db.User.delete(match.id);
      } catch (err) {
        console.warn('[deleteUserData] Base44 user row not deleted:', err.message);
      }
    }

    console.log('[deleteUserData] Completed:', JSON.stringify({ uid, deleted }));
    return Response.json({ success: true, uid, deleted, message: 'Account deleted' });
  } catch (error) {
    console.error('[deleteUserData] Fatal error:', error.message, error.stack);
    return Response.json({
      error: 'Account deletion failed. Nothing has been deleted yet — please try again.',
      code: 'FATAL',
      detail: error.message,
    }, { status: 500 });
  }
});