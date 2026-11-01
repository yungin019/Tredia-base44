/**
 * logError — the single write path for crash reports.
 *
 * Deliberately NOT admin-only: every app user's crash has to land in ErrorLog.
 * It is defended instead by (a) verifying the Firebase token when one is sent,
 * (b) a per-user rate limit, and (c) sanitizing + truncating everything before
 * storage, so no tokens, passwords, emails or typed text are ever saved.
 *
 * Grouping: identical message + location share a fingerprint. A new group (or
 * one that comes back after being marked fixed) gets an AI fix prompt written
 * for the Base44 builder and a Discord alert — at most once per hour per group.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { waitUntil } from 'base44:runtime';
import { identify } from '../../shared/adminAuth.ts';
import { fingerprint, sanitize, logDiag, setDiagContext } from '../../shared/diagLog.ts';
import { postAdminDiscord } from '../../shared/adminDiscord.ts';

const FIX_MODEL = 'gemini_3_8_flash';
const MAX_PER_MINUTE = 30;
const ALERT_COOLDOWN_MS = 60 * 60 * 1000;
const CLIENT_METRICS = ['auth_fail', 'purchase_fail'];
const ALLOWED_SOURCES = ['frontend', 'backend', 'manual', 'health', 'ai', 'provider', 'auth', 'purchase'];

const hits = new Map();

function allow(key) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < 60_000);
  if (recent.length >= MAX_PER_MINUTE) {
    hits.set(key, recent);
    return false;
  }
  recent.push(now);
  hits.set(key, recent);
  return true;
}

const FIX_INSTRUCTION = `You write bug reports for an AI app builder. Reply with plain text only, no markdown headers.

Given one grouped app error, write a short fix prompt with exactly these lines:
BROKEN: one sentence describing what the user saw fail.
WHERE: the route or backend function.
LIKELY CAUSE: one or two sentences of the most probable technical cause.
SUGGESTED FIX: two or three concrete steps.
VERIFY: how to confirm it is fixed.
Keep the whole thing under 900 characters. Never invent a file name you were not given; if the location is unknown, say so.`;

function buildFixPromptText(error) {
  return `${FIX_INSTRUCTION}

Error message: ${error.message}
Location (route or function): ${error.location || 'unknown'}
Occurrences: ${error.count}
Affected users: ${error.affectedUsers}
Platform: ${error.device || 'unknown'}
App version: ${error.appVersion || 'unknown'}
Stack (first lines):
${(error.stack || 'no stack trace').slice(0, 900)}`;
}

async function generateFixPrompt(base44, group, error) {
  try {
    const prompt = buildFixPromptText(error);
    const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      model: FIX_MODEL,
    });
    const text = typeof answer === 'string' ? answer.trim() : String(answer?.response || '').trim();
    if (!text) return null;

    await base44.asServiceRole.entities.ErrorGroup.update(group.id, {
      fix_prompt: text.slice(0, 2000),
      fix_prompt_at: new Date().toISOString(),
    });

    await postAdminDiscord(
      `🛠 **New crash group** — ${group.message.slice(0, 120)}\n` +
      `Location: ${group.route || group.function_name || 'unknown'} · users: ${group.affected_users}\n\n` +
      text.slice(0, 1400),
    );

    return text;
  } catch (err) {
    console.warn('[logError] fix prompt failed:', err.message);
    return null;
  }
}

export default async function (req) {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST only' }, { status: 405 });
  }

  setDiagContext(req);

  const body = await req.json().catch(() => ({}));
  const message = sanitize(body.message, 400);
  const metric = typeof body.metric === 'string' ? body.metric : null;
  if (metric && !CLIENT_METRICS.includes(metric)) {
    return Response.json({ error: 'Unsupported metric' }, { status: 400 });
  }
  if (!message && !metric) return Response.json({ error: 'message is required' }, { status: 400 });

  const identity = await identify(req);
  const userKey = identity?.uid || 'anonymous';
  if (!allow(userKey)) {
    return Response.json({ error: 'Too many reports — slow down.' }, { status: 429 });
  }

  const base44 = createClientFromRequest(req);

  // Client-side metrics (failed sign-ins, failed purchases) share this endpoint
  // but may only record those two types — never AI or provider traffic.
  if (metric) {
    await base44.asServiceRole.entities.DiagEvent.create({
      type: metric,
      source: sanitize(body.metric_source, 40) || 'unknown',
      ok: false,
      detail: message || null,
      at: new Date().toISOString(),
    });
    return Response.json({ recorded: true });
  }

  const source = ALLOWED_SOURCES.includes(body.source) ? body.source : 'frontend';
  const severity = ['critical', 'error', 'warning', 'manual', 'info'].includes(body.severity)
    ? body.severity
    : 'error';
  const route = sanitize(body.route, 120) || null;
  const functionName = sanitize(body.function_name, 80) || null;
  const device = sanitize(body.device, 120) || null;
  const appVersion = sanitize(body.app_version, 40) || null;
  const stack = sanitize(body.stack, 3000) || null;
  const note = sanitize(body.note, 500) || null;
  const actions = body.actions ? sanitize(JSON.stringify(body.actions).slice(0, 2000), 2000) : null;
  const network = body.network ? sanitize(JSON.stringify(body.network).slice(0, 2000), 2000) : null;
  const now = new Date().toISOString();
  const fp = fingerprint(message, route || functionName || 'app');

  const existingPage = await base44.asServiceRole.entities.ErrorGroup.filter({ fingerprint: fp }, { limit: 1 });
  const existing = (existingPage?.items || [])[0] || null;

  let group = existing;
  let isNew = false;
  let reopened = false;

  if (!existing) {
    isNew = true;
    group = await base44.asServiceRole.entities.ErrorGroup.create({
      fingerprint: fp,
      title: message.slice(0, 120),
      message,
      route,
      function_name: functionName,
      stack,
      count: 1,
      affected_users: identity?.uid ? 1 : 0,
      user_ids: identity?.uid || '',
      first_seen: now,
      last_seen: now,
      status: 'open',
      reopened_count: 0,
    });
  } else {
    const seenIds = (existing.user_ids || '').split(',').filter(Boolean);
    const uid = identity?.uid;
    const isNewUser = uid && !seenIds.includes(uid);
    const nextIds = isNewUser ? [...seenIds, uid].slice(-40).join(',') : (existing.user_ids || '');

    reopened = existing.status === 'fixed';
    group = await base44.asServiceRole.entities.ErrorGroup.update(existing.id, {
      count: (existing.count || 1) + 1,
      affected_users: (existing.affected_users || 0) + (isNewUser ? 1 : 0),
      user_ids: nextIds,
      last_seen: now,
      stack: existing.stack || stack,
      status: 'open',
      reopened_count: reopened ? (existing.reopened_count || 0) + 1 : (existing.reopened_count || 0),
      fixed_at: reopened ? null : existing.fixed_at,
    });
  }

  const entry = await base44.asServiceRole.entities.ErrorLog.create({
    at: now,
    source,
    kind: ['crash', 'unhandled', 'console', 'network', 'manual', 'warning', 'info'].includes(body.kind)
      ? body.kind
      : 'crash',
    severity,
    message,
    stack,
    route,
    function_name: functionName,
    app_version: appVersion,
    device,
    user_id: identity?.uid || null,
    group_id: group.id,
    note,
    actions,
    network,
  });

  logDiag({ type: 'function_call', source: 'logError', ok: true, detail: `${source}/${severity}` });

  const shouldWritePrompt = !group.fix_prompt && (isNew || (group.affected_users || 0) >= 5);
  const alertRecent = group.alert_sent_at && (Date.now() - new Date(group.alert_sent_at).getTime()) < ALERT_COOLDOWN_MS;

  if (shouldWritePrompt || (reopened && !alertRecent)) {
    const snapshot = {
      message,
      location: route || functionName,
      count: group.count || 1,
      affectedUsers: group.affected_users || 1,
      device,
      appVersion,
      stack,
    };
    waitUntil((async () => {
      if (reopened) {
        await postAdminDiscord(
          `♻️ **Fixed crash came back** — ${message.slice(0, 120)}\n` +
          `Location: ${route || functionName || 'unknown'} · users: ${group.affected_users}`,
        );
        await base44.asServiceRole.entities.ErrorGroup.update(group.id, { alert_sent_at: new Date().toISOString() });
        return;
      }
      const prompt = await generateFixPrompt(base44, group, snapshot);
      if (prompt) {
        await base44.asServiceRole.entities.ErrorGroup.update(group.id, { alert_sent_at: new Date().toISOString() });
      }
    })());
  }

  return Response.json({ saved: true, id: entry.id, group_id: group.id, is_new_group: isNew });
}