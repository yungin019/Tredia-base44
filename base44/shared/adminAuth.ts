/**
 * Server-side admin gate for this app.
 *
 * TREDIO authenticates with Firebase, which never creates a Base44 session, so
 * `base44.auth.me()` alone is not enough to identify the caller. A request
 * therefore counts as admin only when one of these is true, checked on the
 * server for every call:
 *
 *   1. the bearer token is a valid Firebase ID token whose uid is an admin uid
 *      (signature verified against Google's JWKS — see shared/firebaseAuth.ts)
 *   2. the call runs as a Base44 user with role "admin" (the workflow scheduler
 *      and the dashboard invoke functions this way)
 *
 * Nothing here trusts a caller-supplied id, email or role.
 */
import { verifyFirebaseToken, tokenFromRequest } from './firebaseAuth.ts';

export const ADMIN_UIDS = ['khjB1e1K4wWaRpRabUndgU8b1T82'];

export async function requireAdmin(req, base44) {
  const identity = await verifyFirebaseToken(tokenFromRequest(req)).catch(() => null);

  if (identity && ADMIN_UIDS.includes(identity.uid)) {
    return { ok: true, uid: identity.uid, via: 'firebase-uid' };
  }

  try {
    const me = await base44.auth.me();
    if (me && me.role === 'admin') {
      return { ok: true, uid: identity?.uid || me.id, via: 'base44-admin' };
    }
  } catch (_) {
    // No Base44 session — that is the normal case for app users.
  }

  return { ok: false, uid: identity?.uid || null, via: 'denied' };
}

/** Optional identity for endpoints any signed-in user may call. */
export async function identify(req) {
  return verifyFirebaseToken(tokenFromRequest(req)).catch(() => null);
}