/**
 * userData — the app's only data entry point for signed-in users.
 *
 * The app signs users in with Firebase, which does not create a Base44
 * session, so the client can never call the entity API directly. Instead the
 * client sends its Firebase ID token here; the token is verified against
 * Google's public keys, and every query is run with the service role but
 * scoped to the uid inside that verified token. A user id sent by a client
 * is ignored everywhere, and update/delete re-check ownership by uid.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { verifyFirebaseToken, tokenFromRequest } from '../../shared/firebaseAuth.ts';

const COLLECTIONS = {
  watchlist: { entity: 'Watchlist', fields: ['symbol', 'name', 'sector', 'alert_price', 'notes'] },
  portfolio: { entity: 'Portfolio', fields: ['symbol', 'name', 'shares', 'avg_cost', 'current_price', 'sector'] },
  tradeLog: { entity: 'TradeLog', fields: ['symbol', 'name', 'action', 'shares', 'price', 'total', 'status'] },
  notificationLog: { entity: 'NotificationLog', fields: ['date', 'count', 'signal_type', 'symbol'] },
};

const PROFILE_FIELDS = [
  'full_name', 'photo_url', 'broker_status', 'trading_mode', 'referral_code',
  'onboarding_completed', 'language', 'budget_range', 'experience_level',
  'risk_tolerance', 'interests', 'trader_level', 'onboarded', 'region',
  'notification_prefs', 'alpaca_connected', 'alpaca_positions',
  'alpaca_token', 'alpaca_refresh_token', 'alpaca_buying_power',
  'alpaca_position_count', 'alpaca_daily_pnl',
];

// Broker tokens stay server-side: never serialised back to the browser.
function publicProfile(record) {
  if (!record) return null;
  const copy = { ...record };
  delete copy.alpaca_token;
  delete copy.alpaca_refresh_token;
  return copy;
}

// Matches the admin gate already used by the Admin screen.
const ADMIN_EMAIL = 'nevry95@hotmail.se';
const OG_LIMIT = 100;

function pick(source, allowed) {
  const out = {};
  if (!source || typeof source !== 'object') return out;
  for (const key of allowed) {
    if (source[key] !== undefined && source[key] !== null) out[key] = source[key];
  }
  return out;
}

function itemsOf(result) {
  if (!result) return [];
  if (Array.isArray(result)) return result;
  return Array.isArray(result.items) ? result.items : [];
}

function safeLimit(value, fallback = 100) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.min(Math.floor(n), 200);
}

function safeSort(value) {
  if (typeof value !== 'string' || !/^-?[a-z_]{1,40}$/i.test(value)) return '-created_date';
  return value;
}

// Only equality filters on known fields; user_id is forced to the verified uid.
function scopedQuery(collectionName, query, uid) {
  const { fields } = COLLECTIONS[collectionName];
  const allowed = new Set([...fields, 'id']);
  const out = { user_id: uid };
  if (query && typeof query === 'object') {
    for (const [key, value] of Object.entries(query)) {
      if (!allowed.has(key)) continue;
      if (value === undefined || value === null) continue;
      if (typeof value === 'object') continue;
      out[key] = value;
    }
  }
  return out;
}

export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action;

    const identity = await verifyFirebaseToken(body.idToken || tokenFromRequest(req));
    if (!identity) return Response.json({ error: 'AUTH_REQUIRED' }, { status: 401 });

    const base44 = createClientFromRequest(req);
    const db = base44.asServiceRole.entities;
    const uid = identity.uid;
    const isAdmin = !!identity.email && identity.email.toLowerCase() === ADMIN_EMAIL;
    const collectionName = body.collection;

    // ── Profile ─────────────────────────────────────────────────────────
    // Every profile call upserts: the first sign-in and every later write must
    // land on a real row, otherwise an update silently changes nothing.
    async function ensureProfile() {
      const rows = itemsOf(await db.UserProfile.filter({ user_id: uid }, { limit: 50 }));
      if (rows.length > 0) {
        // Oldest row wins, deterministically.
        rows.sort((a, b) => String(a.created_date).localeCompare(String(b.created_date)));
        const keep = rows[0];
        // Tidy any pristine duplicates left by earlier concurrent first calls.
        for (const extra of rows.slice(1)) {
          const pristine = extra.onboarding_completed !== true
            && !extra.alpaca_connected
            && extra.trading_mode === 'practice'
            && extra.subscription_tier === 'free';
          if (pristine) await db.UserProfile.delete(extra.id).catch(() => {});
        }
        return keep;
      }
      return db.UserProfile.create({
        user_id: uid,
        email: identity.email || '',
        full_name: identity.name || (identity.email || '').split('@')[0] || 'User',
        photo_url: identity.picture || '',
        broker_status: 'not_connected',
        trading_mode: 'practice',
        subscription_tier: 'free',
        referral_code: 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        onboarding_completed: false,
      });
    }

    if (action === 'profile.get') {
      const profile = await ensureProfile();
      return Response.json({ profile: publicProfile(profile) });
    }

    if (action === 'profile.update') {
      const updates = pick(body.data, PROFILE_FIELDS);
      if (Object.keys(updates).length === 0) return Response.json({ error: 'NOTHING_TO_UPDATE' }, { status: 400 });
      await ensureProfile();
      // Scope by uid in the query itself: this can never touch another user's row.
      await db.UserProfile.updateMany({ user_id: uid }, { $set: updates });
      const profile = itemsOf(await db.UserProfile.filter({ user_id: uid }, { limit: 1 }))[0] || null;
      return Response.json({ profile: publicProfile(profile) });
    }

    // ── Founding member ─────────────────────────────────────────────────
    if (action === 'founding.status') {
      const member = itemsOf(await db.FoundingMember.filter({ user_id: uid }, { limit: 1 }))[0] || null;
      const all = itemsOf(await db.FoundingMember.list('og_number', OG_LIMIT + 1));
      const taken = all.length;
      return Response.json({
        member,
        stats: {
          foundingSpotsTaken: taken,
          foundingSpotsRemaining: Math.max(0, OG_LIMIT - taken),
          isSoldOut: taken >= OG_LIMIT,
        },
      });
    }

    if (action === 'founding.claim') {
      const existing = itemsOf(await db.FoundingMember.filter({ user_id: uid }, { limit: 1 }))[0];
      if (existing) return Response.json({ member: existing });

      const all = itemsOf(await db.FoundingMember.list('og_number', OG_LIMIT + 1));
      if (all.length >= OG_LIMIT) return Response.json({ member: null, soldOut: true });

      const highest = all.reduce((max, row) => Math.max(max, Number(row.og_number) || 0), 0);
      const member = await db.FoundingMember.create({
        user_id: uid,
        og_number: highest + 1,
        joined_at: new Date().toISOString(),
        tier: 'elite',
        tier_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        badge: 'OG100',
      });
      return Response.json({ member });
    }

    // ── Admin (verified email only) ─────────────────────────────────────
    if (action === 'admin.users') {
      if (!isAdmin) return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
      const users = itemsOf(await db.UserProfile.list('-created_date', 200));
      return Response.json({ users });
    }

    if (action === 'admin.setTier') {
      if (!isAdmin) return Response.json({ error: 'FORBIDDEN' }, { status: 403 });
      const userId = body.userId;
      const tier = body.tier;
      if (!userId || !tier) return Response.json({ error: 'userId and tier are required' }, { status: 400 });
      // Accept either the profile's uid or its record id.
      let targetUid = userId;
      const byUid = itemsOf(await db.UserProfile.filter({ user_id: userId }, { limit: 1 }))[0];
      if (!byUid) {
        const byId = itemsOf(await db.UserProfile.filter({ id: userId }, { limit: 1 }))[0];
        if (!byId) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
        targetUid = byId.user_id;
      }
      await db.UserProfile.updateMany({ user_id: targetUid }, { $set: { subscription_tier: tier } });
      return Response.json({ ok: true });
    }

    // ── User-scoped collections ─────────────────────────────────────────
    if (!COLLECTIONS[collectionName]) return Response.json({ error: 'UNKNOWN_COLLECTION' }, { status: 400 });
    const { entity, fields } = COLLECTIONS[collectionName];

    if (action === 'list') {
      const items = itemsOf(await db[entity].filter({ user_id: uid }, {
        sort: safeSort(body.sort),
        limit: safeLimit(body.limit),
      }));
      return Response.json({ items });
    }

    if (action === 'filter') {
      const items = itemsOf(await db[entity].filter(scopedQuery(collectionName, body.query, uid), {
        sort: safeSort(body.sort),
        limit: safeLimit(body.limit),
      }));
      return Response.json({ items });
    }

    if (action === 'create') {
      const data = pick(body.data, fields);
      if (Object.keys(data).length === 0) return Response.json({ error: 'EMPTY_RECORD' }, { status: 400 });
      const record = await db[entity].create({ ...data, user_id: uid });
      return Response.json({ record });
    }

    if (action === 'update' || action === 'delete') {
      const id = body.id;
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
      const owned = itemsOf(await db[entity].filter({ id, user_id: uid }, { limit: 1 }))[0];
      if (!owned) return Response.json({ error: 'NOT_FOUND' }, { status: 404 });

      if (action === 'delete') {
        await db[entity].delete(id);
        return Response.json({ ok: true });
      }
      const updates = pick(body.data, fields);
      if (Object.keys(updates).length === 0) return Response.json({ error: 'NOTHING_TO_UPDATE' }, { status: 400 });
      const record = await db[entity].update(id, updates);
      return Response.json({ record });
    }

    return Response.json({ error: 'UNKNOWN_ACTION' }, { status: 400 });
  } catch (error) {
    console.error('[userData] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}