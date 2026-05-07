/**
 * userProfile.js
 * Syncs a Firebase-authenticated user into the Base44 User entity.
 * NEVER throws — always returns a profile object.
 */
import { base44 } from '@/api/base44Client';

const PROFILE_KEY = 'tredio_user_profile';

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
    try {
      idToken = await Promise.race([
        firebaseUser.getIdToken(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('getIdToken timeout')), 3000)),
      ]);
    } catch (_) {}
  }

  if (idToken) {
    if (base44.auth?.setToken) base44.auth.setToken(idToken);
    localStorage.setItem('base44_access_token', idToken);
    localStorage.setItem('auth_token', idToken);
  }

  let existing = null;
  try {
    const email = firebaseUser.email;
    if (email) {
      existing = await Promise.race([
        base44.entities.User.filter({ email }).then(u => u?.[0] || null),
        new Promise((_, reject) => setTimeout(() => reject(new Error('User filter timeout')), 4000)),
      ]);
    }
  } catch (_) {}

  const profileData = {
    email: firebaseUser.email,
    uid: firebaseUser.uid,
    full_name: firebaseUser.displayName || existing?.full_name || '',
    photo_url: firebaseUser.photoURL || existing?.photo_url || '',
  };

  const merged = { ...(existing || {}), ...profileData };
  if (!merged.broker_status) merged.broker_status = 'not_connected';
  if (!merged.trading_mode) merged.trading_mode = 'practice';
  if (!merged.subscription_tier) merged.subscription_tier = 'free';
  if (!merged.referral_code) merged.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
  // Treat undefined as false — do NOT overwrite an existing true value from cache
  if (merged.onboarding_completed === undefined || merged.onboarding_completed === null) {
    const cached = getCachedProfile();
    merged.onboarding_completed = cached?.onboarding_completed === true ? true : false;
  }

  try {
    if (existing?.id) {
      await Promise.race([
        base44.entities.User.update(existing.id, merged),
        new Promise((_, reject) => setTimeout(() => reject(new Error('User update timeout')), 4000)),
      ]);
    }
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
  localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
  try {
    const users = await base44.entities.User.filter({ email: current.email });
    const existing = users?.[0];
    if (existing?.id) await base44.entities.User.update(existing.id, updates);
  } catch (_) {}
  return merged;
}

export function clearUserProfile() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem('base44_access_token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
}
