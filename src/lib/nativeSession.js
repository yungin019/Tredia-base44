/**
 * nativeSession.js
 *
 * On native iOS/Android, the @capacitor-firebase/authentication plugin
 * completes the Firebase OAuth flow natively, but the Firebase JS SDK's
 * onAuthStateChanged() never fires because the JS context has no session.
 *
 * This module provides a lightweight localStorage-backed session so the
 * auth context can recognise a native-authenticated user without relying
 * on onAuthStateChanged().
 */

const KEY = 'tredio_native_session';

/**
 * Persist the native user result after a successful native sign-in.
 *
 * @param {object} userData  - plain user object from plugin result or auth.currentUser
 * @param {string} idToken   - idToken from plugin credential (optional)
 */
export function setNativeSession(userData, idToken = null) {
  const session = {
    email: userData.email || null,
    uid: userData.uid || null,
    displayName: userData.displayName || null,
    photoURL: userData.photoURL || null,
    idToken,
    ts: Date.now(),
  };
  localStorage.setItem(KEY, JSON.stringify(session));
}

/**
 * Returns the stored native session, or null if none / expired (>24h).
 */
export function getNativeSession() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() - session.ts > 24 * 60 * 60 * 1000) {
      clearNativeSession();
      return null;
    }
    return session;
  } catch (_) {
    return null;
  }
}

/**
 * Clear the native session (call on logout).
 */
export function clearNativeSession() {
  localStorage.removeItem(KEY);
}
