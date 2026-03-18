import { base44 } from '@/api/base44Client';

const OG_LIMIT = 100;

/**
 * Try to claim a founding member slot for the given user.
 * Returns the FoundingMember record if successful, or null.
 * Race-safety: checks count before inserting; duplicates are caught by user_id check.
 */
export async function claimFoundingMemberSlot(userId) {
  if (!userId) return null;

  // Already a member?
  const existing = await base44.entities.FoundingMember.filter({ user_id: userId });
  if (existing?.length > 0) return existing[0];

  // Check total count
  const all = await base44.entities.FoundingMember.list('og_number', OG_LIMIT + 1);
  if (all.length >= OG_LIMIT) return null;

  // Assign next OG number
  const nextNumber = all.length + 1;
  if (nextNumber > OG_LIMIT) return null;

  const twoMonthsFromNow = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();

  const member = await base44.entities.FoundingMember.create({
    user_id: userId,
    og_number: nextNumber,
    joined_at: new Date().toISOString(),
    tier: 'elite',
    tier_expires_at: twoMonthsFromNow,
    badge: 'OG100',
  });

  return member;
}

/**
 * Get founding member record for a user, or null.
 */
export async function getFoundingMemberInfo(userId) {
  if (!userId) return null;
  const results = await base44.entities.FoundingMember.filter({ user_id: userId });
  return results?.[0] || null;
}

/**
 * Get total founding stats.
 */
export async function getFoundingStats() {
  const all = await base44.entities.FoundingMember.list('og_number', OG_LIMIT + 1);
  const taken = all.length;
  return {
    foundingSpotsTaken: taken,
    foundingSpotsRemaining: Math.max(0, OG_LIMIT - taken),
    isSoldOut: taken >= OG_LIMIT,
  };
}