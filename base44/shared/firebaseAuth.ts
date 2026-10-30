/**
 * Server-side verification of Firebase ID tokens.
 *
 * The app authenticates users with Firebase, which never creates a Base44
 * session — so no backend function may trust a caller-supplied user id.
 * Every user-scoped request carries a Firebase ID token instead, and this
 * module verifies its RS256 signature against Google's public keys for the
 * project before any data is read or written.
 */
import { createRemoteJWKSet, jwtVerify } from 'npm:jose@5';

const PROJECT_ID = 'tredia-479515';
const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';

let jwks = null;

function getJwks() {
  if (!jwks) jwks = createRemoteJWKSet(new URL(JWKS_URL));
  return jwks;
}

/**
 * Verifies a Firebase ID token and returns the verified identity.
 * Returns null for a missing, expired, forged or foreign-project token.
 */
export async function verifyFirebaseToken(idToken) {
  if (!idToken || typeof idToken !== 'string') return null;
  try {
    const { payload } = await jwtVerify(idToken, getJwks(), {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
    });
    if (!payload.sub) return null;
    return {
      uid: String(payload.sub),
      email: typeof payload.email === 'string' ? payload.email : null,
      name: typeof payload.name === 'string' ? payload.name : null,
      picture: typeof payload.picture === 'string' ? payload.picture : null,
    };
  } catch (error) {
    console.error('[firebaseAuth] token verification failed:', error.message);
    return null;
  }
}

/** Reads a bearer token from the request headers, when present. */
export function tokenFromRequest(req) {
  const header = req.headers.get('authorization') || '';
  return header.replace(/^Bearer\s+/i, '').trim();
}