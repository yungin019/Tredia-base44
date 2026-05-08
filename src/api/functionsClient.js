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
    if (origin && !origin.includes('localhost') && !origin.includes('base44.com') && !origin.includes('capacitor')) {
      return origin;
    }
  }

  return 'https://app.base44.com';
}

function getAppId() {
  return appParams.appId || import.meta.env.VITE_BASE44_APP_ID;
}

export async function invokeFunction(name, body = {}) {
  const url = `${getBaseUrl()}/api/apps/${getAppId()}/functions/${name}`;
  const token = getToken();

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${name} HTTP ${res.status}`);
  return res.json();
}
