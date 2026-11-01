import { secrets } from 'base44:runtime';

/**
 * Posts an admin diagnostics message to the Discord webhook the admin set as
 * ADMIN_DISCORD_WEBHOOK. Returns false (and warns) when it is not configured,
 * so every caller keeps working without Discord.
 */
export async function postAdminDiscord(content) {
  const url = secrets.get('ADMIN_DISCORD_WEBHOOK');
  if (!url) {
    console.warn('[admin-discord] ADMIN_DISCORD_WEBHOOK is not set — skipping alert');
    return false;
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: String(content).slice(0, 1900) }),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch (error) {
    console.warn('[admin-discord] post failed:', error.message);
    return false;
  }
}