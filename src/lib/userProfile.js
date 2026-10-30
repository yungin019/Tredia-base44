/**
 * userProfile.js
 * Profile persistence for Firebase-authenticated users.
 *
 * Reads and writes go through the verified userData function, which scopes
 * them to the signed-in uid. NEVER throws — always returns a profile object.
 */
import { profileApi, clearUserCache } from '@/api/userData';

const PROFILE_KEY = 'tredio_user_profile';
const ONBOARDED_KEY = 'tredio_onboarded';

function isLocallyOnboarded() {
  try { return localStorage.getItem(ONBOARDED_KEY) === '1'; } catch (_) { return false; }
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ]);
}

export function buildMinimalProfile(firebaseUser) {
  return {
    email: firebaseUser.email,
    uid: firebaseUser.uid,
    full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    photo_url: firebaseUser.photoURL || '',
    broker_status: 'not_connected',
    trading_mode: 'practice',
    subscription_tier: 'free',
    referral_code: 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase(),
    _fallback: true,
  };
}

export async function syncUserProfile(firebaseUser, overrideIdToken = null) {
  if (!firebaseUser) return null;

  let idToken = overrideIdToken || null;
  if (!idToken && typeof firebaseUser.getIdToken === 'function') {
    try { idToken = await withTimeout(firebaseUser.getIdToken(), 3000); } catch (_) {}
  }
  if (idToken) {
    // Token only for the verified data function — never handed to the Base44 SDK.
    localStorage.setItem('firebase_auth_token', idToken);
    localStorage.setItem('auth_token', idToken);
  }

  let existing = null;
  try { existing = await withTimeout(profileApi.get(), 5000); } catch (_) {}

  const merged = {
    ...(existing || {}),
    email: firebaseUser.email,
    uid: firebaseUser.uid,
    full_name: firebaseUser.displayName || existing?.full_name || '',
    photo_url: firebaseUser.photoURL || existing?.photo_url || '',
  };
  if (!merged.broker_status) merged.broker_status = 'not_connected';
  if (!merged.trading_mode) merged.trading_mode = 'practice';
  if (!merged.subscription_tier) merged.subscription_tier = 'free';
  if (!merged.referral_code) merged.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
  // Onboarding completion is sticky: a read straight after a write is not always
  // consistent, so a stale server value must never bounce a finished user back
  // into onboarding. The update below re-persists the true value.
  const cachedOnboarded = getCachedProfile()?.onboarding_completed === true || isLocallyOnboarded();
  if (merged.onboarding_completed !== true && cachedOnboarded) merged.onboarding_completed = true;
  if (merged.onboarding_completed === undefined || merged.onboarding_completed === null) merged.onboarding_completed = false;
  if (merged.onboarding_completed === true) {
    try { localStorage.setItem(ONBOARDED_KEY, '1'); } catch (_) {}
  }

  try {
    const saved = await withTimeout(profileApi.update({
      full_name: merged.full_name,
      photo_url: merged.photo_url,
      onboarding_completed: merged.onboarding_completed === true,
    }), 5000);
    if (saved) Object.assign(merged, saved);
  } catch (_) {}

  localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  return merged;
}

export function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) { return null; }
}

export async function updateUserProfile(updates) {
  const current = getCachedProfile() || {};
  const merged = { ...current, ...updates };
  if (merged.onboarding_completed === undefined) merged.onboarding_completed = false;
  if (merged.onboarding_completed === true) {
    try { localStorage.setItem(ONBOARDED_KEY, '1'); } catch (_) {}
  }
  localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  try { await profileApi.update(updates); } catch (_) {}
  return merged;
}

export function clearUserProfile() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem(ONBOARDED_KEY);
  localStorage.removeItem('firebase_auth_token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
  clearUserCache();
  // NOTE: Do NOT remove base44_access_token — it may be the platform preview token
  // injected via URL by app-params.js. The Base44 SDK manages it internally.
}