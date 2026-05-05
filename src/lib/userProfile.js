/**
 * userProfile.js
 * Syncs a Firebase-authenticated user into the Base44 User entity.
 * After Firebase login call syncUserProfile(firebaseUser).
 */
import { base44 } from '@/api/base44Client';

const PROFILE_KEY = 'tredio_user_profile';

export async function syncUserProfile(firebaseUser) {
  if (!firebaseUser) return null;
  const idToken = await firebaseUser.getIdToken();
  if (base44.auth?.setToken) base44.auth.setToken(idToken);
  localStorage.setItem('base44_access_token', idToken);
  localStorage.setItem('auth_token', idToken);

  let existing = null;
  try {
    const users = await base44.entities.User.filter({ email: firebaseUser.email });
    existing = users?.[0] || null;
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

  try {
    if (existing?.id) await base44.entities.User.update(existing.id, merged);
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
