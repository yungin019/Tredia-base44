/**
 * userData — client for the verified user-data function.
 *
 * Every call carries the Firebase ID token; the server verifies it and scopes
 * the query to that uid. No user id is ever sent from the client.
 */
import { invokeFunction } from '@/api/functionsClient';
import { auth } from '@/lib/firebase';
import { getNativeSession } from '@/lib/nativeSession';

export async function getIdToken() {
  try {
    if (auth?.currentUser?.getIdToken) {
      const token = await auth.currentUser.getIdToken();
      if (token) return token;
    }
  } catch (_) {}
  const session = getNativeSession();
  if (session?.idToken) return session.idToken;
  try { return localStorage.getItem('firebase_auth_token') || null; } catch (_) { return null; }
}

async function call(action, payload = {}) {
  const idToken = await getIdToken();
  if (!idToken) throw new Error('AUTH_REQUIRED');
  // Direct fetch with the Firebase token: the Base44 SDK session does not exist
  // for Firebase users, so its invoke would never reach the function live.
  const data = await invokeFunction('userData', { action, idToken, ...payload });
  if (data.error) {
    const error = new Error(data.error);
    error.code = data.error;
    throw error;
  }
  return data;
}

const collection = (name) => ({
  async list(sortOrLimit, maybeLimit) {
    let sort;
    let limit;
    if (typeof sortOrLimit === 'number') limit = sortOrLimit;
    else if (typeof sortOrLimit === 'string') { sort = sortOrLimit; limit = maybeLimit; }
    const { items } = await call('list', { collection: name, sort, limit });
    return items || [];
  },
  async filter(query = {}, options = {}) {
    const { items } = await call('filter', {
      collection: name, query, sort: options.sort, limit: options.limit,
    });
    return items || [];
  },
  async create(data) {
    const { record } = await call('create', { collection: name, data });
    return record;
  },
  async update(id, data) {
    const { record } = await call('update', { collection: name, id, data });
    return record;
  },
  async delete(id) {
    return call('delete', { collection: name, id });
  },
});

export const db = {
  watchlist: collection('watchlist'),
  portfolio: collection('portfolio'),
  tradeLog: collection('tradeLog'),
  notificationLog: collection('notificationLog'),
  notifications: collection('notifications'),
};

export const profileApi = {
  async get() {
    const { profile } = await call('profile.get');
    return profile;
  },
  async update(data) {
    const { profile } = await call('profile.update', { data });
    return profile;
  },
};

export const foundingApi = {
  status: () => call('founding.status'),
  claim: () => call('founding.claim'),
};

export const adminApi = {
  async users() {
    const { users } = await call('admin.users');
    return users || [];
  },
  setTier: (userId, tier) => call('admin.setTier', { userId, tier }),
};

let cachedUser = null;
let inFlight = null;

/**
 * The signed-in user, in the shape the app's screens already expect.
 * Single-flight: every component mounting at once shares one request, so the
 * profile row is never created several times in parallel.
 */
export async function getCurrentUser(force = false) {
  if (cachedUser && !force) return cachedUser;
  if (inFlight && !force) return inFlight;
  inFlight = (async () => {
    try {
      const profile = await profileApi.get();
      if (!profile) return null;
      cachedUser = { ...profile, id: profile.user_id, uid: profile.user_id };
      return cachedUser;
    } catch (_) {
      return null;
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

export function clearUserCache() {
  cachedUser = null;
  inFlight = null;
}