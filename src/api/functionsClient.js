/**
 * Direct HTTP function invoker — bypasses SDK auth requirement.
 * Dynamically resolves the correct server URL for preview, live, and native environments.
 */
import { appParams } from '@/lib/app-params';

function getBaseUrl() {
  // In preview/staging the platform injects server_url as a query param and stores it in localStorage
  const fromStorage = localStorage.getItem('base44_server_url');
  if (fromStorage) return fromStorage.replace(/\/$/, '');
  // Also check URL params directly (first load before storage is set)
  try {
    const urlParam = new URLSearchParams(window.location.search).get('server_url');
    if (urlParam) return urlParam.replace(/\/$/, '');
  } catch (_) {}
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