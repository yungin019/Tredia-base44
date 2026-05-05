/**
 * userProfile.js
 *
 * Syncs a Firebase-authenticated user into the Base44 User entity (profile only).
 * This replaces base44.auth.me() as the source of truth for profile data.
 *
 * After Firebase login → call syncUserProfile(firebaseUser)
 * To read profile → call getUserProfile()
 */

import { base44 } from '@/api/base44Client';

const PROFILE_KEY = 'tredio_user_profile';

/**
 * Sync Firebase user into Base44 User entity and local cache.
 * @param {import('firebase/auth').User} firebaseUser
 * @returns {Promise<object>} merged profile
 */
export async function syncUserProfile(firebaseUser) {
  if (!firebaseUser) return null;

  const idToken = await firebaseUser.getIdToken();

  // Persist token so base44 SDK entity calls are authenticated
  if (base44.auth?.setToken) base44.auth.setToken(idToken);
  localStorage.setItem('base44_access_token', idToken);
  localStorage.setItem('auth_token', idToken);

  // Read existing profile from Base44 User entity
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

  // Merge with existing profile fields we want to preserve
  const merged = {
    ...(existing || {}),
    ...profileData,
  };

  // Defaults for new users
  if (!merged.broker_status) merged.broker_status = 'not_connected';
  if (!merged.trading_mode) merged.trading_mode = 'practice';
  if (!merged.subscription_tier) merged.subscription_tier = 'free';
  if (!merged.referral_code) merged.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();

  // Persist to Base44 User entity
  try {
    if (existing?.id) {
      await base44.entities.User.update(existing.id, merged);
    }
  } catch (_) {}

  // Cache locally
  localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));

  return merged;
}

/**
 * Get cached user profile (no network call).
 * @returns {object|null}
 */
export function getCachedProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

/**
 * Update a field in the cached profile and Base44 User entity.
 * @param {object} updates
 */
export async function updateUserProfile(updates) {
  const current = getCachedProfile() || {};
  const merged = { ...current, ...updates };
  localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));

  try {
    const users = await base44.entities.User.filter({ email: current.email });
    const existing = users?.[0];
    if (existing?.id) {
      await base44.entities.User.update(existing.id, updates);
    }
  } catch (_) {}

  return merged;
}

/**
 * Clear cached profile on logout.
 */
export function clearUserProfile() {
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem('base44_access_token');
  localStorage.removeItem('auth_token');
  localStorage.removeItem('token');
}