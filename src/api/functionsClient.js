/**
 * Direct HTTP function invoker — bypasses SDK auth requirement.
 * Backend functions are public-safe and don't require a platform token.
 */
import { appParams } from '@/lib/app-params';

const BASE44_SERVER_URL = 'https://app.base44.com';
const APP_ID = appParams.appId || import.meta.env.VITE_BASE44_APP_ID;

export async function invokeFunction(name, body = {}) {
  const url = `${BASE44_SERVER_URL}/api/apps/${APP_ID}/functions/${name}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${name} HTTP ${res.status}`);
  return res.json();
}