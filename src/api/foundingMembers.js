/**
 * foundingMembers.js
 * Founding-member status and claims. The user identity is taken from the
 * verified token server-side, so no user id is passed from the client.
 */
import { foundingApi } from '@/api/userData';

/** Claim a founding member slot for the signed-in user. Returns the record or null. */
export async function claimFoundingMemberSlot() {
  try {
    const { member } = await foundingApi.claim();
    return member || null;
  } catch (_) {
    return null;
  }
}

/** The signed-in user's founding member record, or null. */
export async function getFoundingMemberInfo() {
  try {
    const { member } = await foundingApi.status();
    return member || null;
  } catch (_) {
    return null;
  }
}

/** Overall founding-member availability. */
export async function getFoundingStats() {
  const { stats } = await foundingApi.status();
  return stats;
}