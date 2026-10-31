/**
 * Function invoker — direct HTTP fetch with auth token attached.
 * Works in all environments: preview, live site (tredio.app), iOS native.
 *
 * Auth token priority:
 *  1. firebase_auth_token (set by FirebaseAuthContext after sign-in)
 *  2. auth_token (alias)
 *  3. base44_access_token (platform preview token)
 */
import { appParams } from '@/lib/app-params';

function getToken() {
  try {
    return (
      localStorage.getItem('firebase_auth_token') ||
      localStorage.getItem('auth_token') ||
      localStorage.getItem('base44_access_token') ||
      null
    );
  } catch (_) { return null; }
}

function getBaseUrl() {
  try {
    const fromStorage = localStorage.getItem('base44_server_url');
    if (fromStorage) return fromStorage.replace(/\/$/, '');
    const urlParam = new URLSearchParams(window.location.search).get('server_url');
    if (urlParam) return urlParam.replace(/\/$/, '');
  } catch (_) {}

  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Only the app's own *.base44.app subdomain (and the builder preview) serve
    // the functions API. A custom domain answers /api/... with a non-function
    // response, and the platform domain refuses function calls outright — both
    // made writes silently do nothing while looking successful.
    if (origin.endsWith('.base44.app')) return origin;
  }

  return 'https://tredio.base44.app';
}

function getAppId() {
  return appParams.appId || import.meta.env.VITE_BASE44_APP_ID;
}

export async function invokeFunction(name, body = {}) {
  const url = `${getBaseUrl()}/api/apps/${getAppId()}/functions/${name}`;
  const token = getToken();

  // On native, firebase_auth_token may not be set yet if called before login completes
  if (!token) {
    console.warn(`[functionsClient] No auth token available when calling ${name} — request may 403`);
  }

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    // Keep the server's own message and code: callers need it to tell the user
    // what actually happened (e.g. a required re-authentication).
    const payload = await res.json().catch(() => ({}));
    const err = new Error(payload?.error || `${name} HTTP ${res.status}`);
    err.status = res.status;
    err.code = payload?.code;
    throw err;
  }
  return res.json();
}