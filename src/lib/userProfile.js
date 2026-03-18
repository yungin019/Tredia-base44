/**
 * User profile store — uses localStorage as the backend.
 * Structured to be drop-in replaceable with Supabase later.
 */

const PROFILE_KEY = 'tredia_user_profile';
const OG_KEY = 'tredia_og_registry'; // shared registry stored per-device (simulate global)
const OG_LIMIT = 100;

// ─── Profile helpers ───────────────────────────────────────────────────────

export function getProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveProfile(data) {
  try {
    const existing = getProfile();
    const merged = { ...existing, ...data };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(merged));
    return merged;
  } catch {
    return data;
  }
}

// ─── OG100 Founding Member helpers ─────────────────────────────────────────

function getOGRegistry() {
  try {
    const raw = localStorage.getItem(OG_KEY);
    return raw ? JSON.parse(raw) : { members: [], nextNumber: 1 };
  } catch {
    return { members: [], nextNumber: 1 };
  }
}

function saveOGRegistry(registry) {
  try {
    localStorage.setItem(OG_KEY, JSON.stringify(registry));
  } catch {}
}

/**
 * Try to claim an OG slot for a userId.
 * Returns the OG number (1-100) or null if slots are full or already claimed.
 */
export function claimFoundingMemberSlot(userId) {
  const registry = getOGRegistry();

  // Already a member?
  const existing = registry.members.find(m => m.userId === userId);
  if (existing) return existing.ogNumber;

  // Slots full?
  if (registry.members.length >= OG_LIMIT) return null;

  const ogNumber = registry.nextNumber;
  const joinedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // +2 months

  registry.members.push({ userId, ogNumber, joinedAt, tier: 'elite', tier_expires_at: expiresAt, badge: 'OG100' });
  registry.nextNumber = ogNumber + 1;
  saveOGRegistry(registry);

  // Also persist on profile
  saveProfile({ og_number: ogNumber, og_joined_at: joinedAt, og_tier_expires_at: expiresAt });

  return ogNumber;
}

export function getFoundingMemberInfo(userId) {
  const registry = getOGRegistry();
  const member = registry.members.find(m => m.userId === userId);
  return member || null;
}

export function getFoundingStats() {
  const registry = getOGRegistry();
  const taken = registry.members.length;
  return {
    foundingSpotsTaken: taken,
    foundingSpotsRemaining: Math.max(0, OG_LIMIT - taken),
    isSoldOut: taken >= OG_LIMIT,
  };
}

export function isFoundingMember(userId) {
  return !!getFoundingMemberInfo(userId);
}

// ─── User context builder for TREK AI ──────────────────────────────────────

export function buildUserContext(profile = {}) {
  if (!profile || Object.keys(profile).length === 0) return null;

  const { budget_range, risk_tolerance, goal, experience } = profile;
  if (!budget_range && !risk_tolerance && !goal && !experience) return null;

  const lines = ['User profile:'];
  if (budget_range) lines.push(`- Budget range: ${budget_range}`);
  if (risk_tolerance) lines.push(`- Risk tolerance: ${risk_tolerance}`);
  if (goal) lines.push(`- Goal: ${goal}`);
  if (experience) lines.push(`- Experience: ${experience}`);

  // Tone guidance
  const isNovice = experience === 'Beginner';
  const isLowBudget = budget_range === 'Under €500' || budget_range === '€500–5k';
  const isAdvanced = experience === 'Advanced';
  const isHighBudget = budget_range === '€50k+' || budget_range === '€5k–50k';

  if (isNovice && isLowBudget) {
    lines.push('- Tone: Use simple language, suggest smaller position sizes, add extra risk warnings, keep an educational tone.');
  } else if (isAdvanced && isHighBudget) {
    lines.push('- Tone: Provide deeper analysis, stronger macro context, larger-position framing, strategic institutional-level insight.');
  } else if (isNovice) {
    lines.push('- Tone: Keep language accessible, include risk context, guide step by step.');
  } else if (isAdvanced) {
    lines.push('- Tone: Go deep on technicals, macro, and strategy. Skip the basics.');
  }

  lines.push('Adapt all responses, position sizes, risk framing, and language accordingly.');
  return lines.join('\n');
}