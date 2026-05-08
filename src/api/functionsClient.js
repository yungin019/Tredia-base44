/**
 * Direct HTTP function invoker — bypasses SDK auth requirement.
 * Routes to the correct server based on environment:
 * - Preview: uses base44_server_url from localStorage (injected by platform)
 * - Live site (tredio.app): uses current origin (same domain)
 * - Native / fallback: uses app.base44.com
 */
import { appParams } from '@/lib/app-params';

function getBaseUrl() {
  // 1. Platform preview injects server_url into localStorage
  try {
    const fromStorage = localStorage.getItem('base44_server_url');
    if (fromStorage) return fromStorage.replace(/\/$/, '');

    const urlParam = new URLSearchParams(window.location.search).get('server_url');
    if (urlParam) return urlParam.replace(/\/$/, '');
  } catch (_) {}

  // 2. On the live site (e.g. tredio.app), use the same origin so
  //    requests go through the same host that serves the app.
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    // Not a local dev server and not the base44 platform directly
    if (origin && !origin.includes('localhost') && !origin.includes('base44.com')) {
      return origin;
    }
  }

  // 3. Fallback for native / unknown
  return 'https://app.base44.com';
}

function getAppId() {
  return appParams.appId || import.meta.env.VITE_BASE44_APP_ID;
}

export async function invokeFunction(name, body = {}) {
  const url = `${getBaseUrl()}/api/apps/${getAppId()}/functions/${name}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${name} HTTP ${res.status}`);
  return res.json();
}