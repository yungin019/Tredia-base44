/**
 * Builds the 24h diagnostics digest shared by the Admin page, the daily AI
 * summary and the "ask about diagnostics" box — one calculation, three readers.
 *
 * Everything here is read-only and uses the service role, so it must only be
 * called after an admin check.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDayIso() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfMonthIso() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

async function safe(promise, fallback) {
  try {
    return await promise;
  } catch (error) {
    console.warn('[digest] query failed:', error.message);
    return fallback;
  }
}

function ageSeconds(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Number.isFinite(diff) && diff >= 0 ? Math.round(diff / 1000) : null;
}

export async function buildDigest(base44) {
  const since24h = new Date(Date.now() - DAY_MS).toISOString();
  const today = startOfDayIso();
  const month = startOfMonthIso();
  const svc = base44.asServiceRole.entities;

  const [
    errors24h,
    events24h,
    aiMonth,
    openGroups,
    healthRows,
    reports,
    totalUsers,
    onboarded,
    newToday,
    new7d,
    activeToday,
    proUsers,
    eliteUsers,
    founding,
    deletedTotal,
  ] = await Promise.all([
    safe(svc.ErrorLog.filter({ created_date: { $gte: since24h } }, { sort: '-created_date', limit: 300 }), { items: [] }),
    safe(svc.DiagEvent.filter({ created_date: { $gte: since24h } }, { sort: '-created_date', limit: 800 }), { items: [] }),
    safe(svc.DiagEvent.filter({ type: 'ai_request', created_date: { $gte: month } }, { sort: '-created_date', limit: 1000 }), { items: [] }),
    safe(svc.ErrorGroup.filter({ status: 'open' }, { sort: '-last_seen', limit: 50 }), { items: [] }),
    safe(svc.HealthCheck.filter({}, { sort: '-at', limit: 80 }), { items: [] }),
    safe(svc.DiagnosticsReport.list({ sort: '-at', limit: 1 }), []),
    safe(svc.UserProfile.count(), 0),
    safe(svc.UserProfile.count({ onboarding_completed: true }), 0),
    safe(svc.UserProfile.count({ created_date: { $gte: today } }), 0),
    safe(svc.UserProfile.count({ created_date: { $gte: new Date(Date.now() - 7 * DAY_MS).toISOString() } }), 0),
    safe(svc.UserProfile.count({ updated_date: { $gte: since24h } }), 0),
    safe(svc.UserProfile.count({ subscription_tier: 'pro' }), 0),
    safe(svc.UserProfile.count({ subscription_tier: 'elite' }), 0),
    safe(svc.FoundingMember.filter({}, { limit: 200 }), { items: [] }),
    safe(svc.DiagEvent.count({ type: 'account_deleted' }), 0),
  ]);

  const errors = errors24h?.items || [];
  const events = events24h?.items || [];
  const aiEvents = aiMonth?.items || [];
  const groups = openGroups?.items || [];
  const health = healthRows?.items || [];
  const latestReport = Array.isArray(reports) ? reports[0] : null;

  // ── Data providers ────────────────────────────────────────────────────────
  const providers = {};
  const providerRow = (name) => {
    if (!providers[name]) {
      providers[name] = {
        name,
        lastOkAt: null,
        lastErrorAt: null,
        lastError: null,
        errors24h: 0,
        rateLimits24h: 0,
        successCount: 0,
        cacheAgeSec: null,
      };
    }
    return providers[name];
  };

  for (const event of events) {
    if (String(event.type).startsWith('provider_') || String(event.type).startsWith('news_')) {
      const row = providerRow(event.source);
      if (event.type === 'provider_ok' || event.type === 'news_ok') {
        row.successCount += 1;
        if (!row.lastOkAt || event.at > row.lastOkAt) row.lastOkAt = event.at;
      } else {
        row.errors24h += 1;
        if (event.type === 'provider_rate_limit') row.rateLimits24h += 1;
        if (!row.lastErrorAt || event.at > row.lastErrorAt) {
          row.lastErrorAt = event.at;
          row.lastError = event.detail || event.type;
        }
      }
    }
  }

  // Health checks give every provider a "last tested" signal even with no traffic.
  const healthByCheck = {};
  for (const row of health) {
    if (!healthByCheck[row.check] && row.check !== 'trek_ai') healthByCheck[row.check] = row;
  }
  const providerHealth = {
    finnhub: healthByCheck.quote_spy || null,
    twelvedata: healthByCheck.quote_btc || null,
    news: healthByCheck.news_feed || null,
  };

  // Always show the two quote providers, even before they have logged traffic —
  // the health check already tested both.
  for (const [name, row] of [['finnhub', providerHealth.finnhub], ['twelvedata', providerHealth.twelvedata]]) {
    if (!providers[name]) {
      providers[name] = {
        name,
        lastOkAt: row && row.ok ? row.at : null,
        lastErrorAt: row && row.ok === false ? row.at : null,
        lastError: row && row.ok === false ? row.detail : null,
        errors24h: 0,
        rateLimits24h: 0,
        successCount: 0,
        cacheAgeSec: row && row.ok ? ageSeconds(row.at) : null,
      };
    }
  }

  const providerList = Object.values(providers).map((row) => ({
    ...row,
    cacheAgeSec: ageSeconds(row.lastOkAt),
    status: row.errors24h > 0 && row.successCount === 0 ? 'red' : (row.rateLimits24h > 0 ? 'yellow' : 'green'),
  }));

  const newsHealth = providerHealth.news;
  providerList.push({
    name: 'news sources',
    lastOkAt: newsHealth?.at || null,
    lastErrorAt: newsHealth && newsHealth.ok === false ? newsHealth.at : null,
    lastError: newsHealth && newsHealth.ok === false ? newsHealth.detail : null,
    errors24h: providerList.filter((p) => p.name.startsWith('news')).reduce((sum, p) => sum + p.errors24h, 0),
    rateLimits24h: 0,
    cacheAgeSec: ageSeconds(newsHealth?.at),
    status: newsHealth ? (newsHealth.ok ? 'green' : 'red') : 'yellow',
    checkedVia: 'health check',
  });

  // ── Backend functions ─────────────────────────────────────────────────────
  const functionMap = {};
  const fnRow = (name) => {
    if (!functionMap[name]) functionMap[name] = { name, calls: 0, errors: 0, lastError: null, lastErrorAt: null };
    return functionMap[name];
  };
  for (const event of events) {
    if (event.type === 'function_call' || event.type === 'function_error') {
      const row = fnRow(event.source);
      row.calls += 1;
      if (event.type === 'function_error') {
        row.errors += 1;
        if (!row.lastErrorAt || event.at > row.lastErrorAt) {
          row.lastErrorAt = event.at;
          row.lastError = event.detail || 'error';
        }
      }
    }
  }
  for (const error of errors) {
    if (error.source === 'backend' && error.function_name) {
      const row = fnRow(error.function_name);
      if (!row.lastErrorAt || error.at > row.lastErrorAt) {
        row.lastErrorAt = error.at;
        row.lastError = error.message;
      }
    }
  }
  const functions = Object.values(functionMap)
    .map((row) => ({ ...row, errorRate: row.calls > 0 ? Math.round((row.errors / row.calls) * 1000) / 10 : 0 }))
    .sort((a, b) => b.calls - a.calls);

  // ── TREK AI ───────────────────────────────────────────────────────────────
  const aiModels = {};
  const aiRow = (model) => {
    if (!aiModels[model]) aiModels[model] = { model, requests: 0, errors: 0, totalMs: 0, costToday: 0, costMonth: 0 };
    return aiModels[model];
  };
  for (const event of events) {
    if (event.type === 'ai_request' || event.type === 'ai_error') {
      const row = aiRow(event.source);
      row.requests += 1;
      if (event.type === 'ai_error') row.errors += 1;
      if (Number.isFinite(event.duration_ms)) row.totalMs += event.duration_ms;
      if (Number.isFinite(event.cost_usd)) row.costToday += event.cost_usd;
    }
  }
  for (const event of aiEvents) {
    const row = aiRow(event.source);
    if (Number.isFinite(event.cost_usd)) row.costMonth += event.cost_usd;
  }
  const aiList = Object.values(aiModels).map((row) => ({
    ...row,
    avgMs: row.requests > 0 ? Math.round(row.totalMs / row.requests) : null,
    costToday: Math.round(row.costToday * 10000) / 10000,
    costMonth: Math.round(row.costMonth * 10000) / 10000,
  }));

  const ai = {
    requestsToday: aiList.reduce((sum, m) => sum + m.requests, 0),
    errorsToday: aiList.reduce((sum, m) => sum + m.errors, 0),
    avgMs: aiList.filter((m) => m.avgMs).length
      ? Math.round(aiList.filter((m) => m.avgMs).reduce((s, m) => s + m.avgMs, 0) / aiList.filter((m) => m.avgMs).length)
      : null,
    costToday: Math.round(aiList.reduce((sum, m) => sum + m.costToday, 0) * 10000) / 10000,
    costMonth: Math.round(aiList.reduce((sum, m) => sum + m.costMonth, 0) * 10000) / 10000,
    models: aiList,
    note: 'Estimated from published per-token prices — InvokeLLM does not return exact usage.',
  };

  // ── Users ─────────────────────────────────────────────────────────────────
  const deleted24h = events.filter((e) => e.type === 'account_deleted').length;
  const users = {
    total: totalUsers,
    newToday,
    new7d,
    activeToday,
    onboardingRate: totalUsers > 0 ? Math.round((onboarded / totalUsers) * 1000) / 10 : null,
    deletions24h: deleted24h,
    deletionsTotal: deletedTotal,
    note: '"Active today" counts profiles touched in the last 24h.',
  };

  // ── Subscriptions ─────────────────────────────────────────────────────────
  const foundingRows = founding?.items || [];
  const subscriptions = {
    pro: proUsers,
    elite: eliteUsers,
    og100: foundingRows.length,
    og100SpotsLeft: Math.max(0, 100 - foundingRows.length),
    trials: null,
    failedPurchases24h: events.filter((e) => e.type === 'purchase_fail').length,
    note: 'Trials are not stored in the app database — check RevenueCat for trial state.',
  };

  // ── Auth ──────────────────────────────────────────────────────────────────
  const auth = { google: 0, apple: 0, email: 0, other: 0, total: 0 };
  for (const event of events) {
    if (event.type !== 'auth_fail') continue;
    const key = ['google', 'apple', 'email'].includes(event.source) ? event.source : 'other';
    auth[key] += 1;
    auth.total += 1;
  }

  // ── Health ────────────────────────────────────────────────────────────────
  const latestByCheck = {};
  for (const row of health) {
    if (!latestByCheck[row.check]) latestByCheck[row.check] = row;
  }

  // ── Live feed (plain text lines, newest first) ─────────────────────────────
  const lines = [];
  for (const error of errors.slice(0, 40)) {
    lines.push({
      at: error.at,
      text: `[${error.at}] ${String(error.severity || 'error').toUpperCase()} ${error.route || error.function_name || 'app'} (${error.source}) — ${error.message}`,
    });
  }
  for (const event of events.slice(0, 80)) {
    if (event.type === 'provider_ok' || event.type === 'function_call') continue;
    lines.push({
      at: event.at,
      text: `[${event.at}] ${String(event.type).toUpperCase().replace(/_/g, ' ')} ${event.source}${event.duration_ms ? ` ${event.duration_ms}ms` : ''}${event.detail ? ` — ${event.detail}` : ''}`,
    });
  }
  for (const row of health.slice(0, 20)) {
    lines.push({
      at: row.at,
      text: `[${row.at}] HEALTH ${row.label || row.check} ${String(row.status).toUpperCase()} ${row.latency_ms}ms — ${row.detail || ''}`,
    });
  }
  const live = lines
    .filter((line) => line.at)
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, 40);

  return {
    generatedAt: new Date().toISOString(),
    windowHours: 24,
    providers: providerList.sort((a, b) => a.name.localeCompare(b.name)),
    functions,
    ai,
    users,
    subscriptions,
    auth,
    health: Object.values(latestByCheck).map((row) => ({
      check: row.check,
      label: row.label,
      ok: row.ok,
      status: row.status,
      latencyMs: row.latency_ms,
      detail: row.detail,
      at: row.at,
    })),
    crashes: groups.map((group) => ({
      id: group.id,
      title: group.title || group.message,
      message: group.message,
      route: group.route,
      functionName: group.function_name,
      count: group.count,
      affectedUsers: group.affected_users,
      firstSeen: group.first_seen,
      lastSeen: group.last_seen,
      status: group.status,
      reopenedCount: group.reopened_count || 0,
      fixPrompt: group.fix_prompt || null,
    })),
    live,
    latestReport: latestReport
      ? { date: latestReport.date, summary: latestReport.summary, at: latestReport.at, model: latestReport.model }
      : null,
    totals: {
      errors24h: errors.length,
      critical24h: errors.filter((e) => e.severity === 'critical').length,
      openCrashes: groups.length,
    },
  };
}

/** Compact text digest — what gets sent to the model and pasted into chat. */
export function digestToText(digest) {
  const lines = [];
  lines.push(`Diagnostics window: last ${digest.windowHours}h (generated ${digest.generatedAt})`);
  lines.push('');
  lines.push('PROVIDERS');
  for (const p of digest.providers) {
    lines.push(`- ${p.name}: status ${p.status}, errors24h ${p.errors24h}, rate limits ${p.rateLimits24h}, last success ${p.lastOkAt || 'none'}, cache age ${p.cacheAgeSec === null ? 'n/a' : `${p.cacheAgeSec}s`}, last error ${p.lastError || 'none'}`);
  }
  lines.push('');
  lines.push('BACKEND FUNCTIONS');
  if (digest.functions.length === 0) lines.push('- no instrumented calls in the window');
  for (const f of digest.functions) {
    lines.push(`- ${f.name}: calls ${f.calls}, errors ${f.errors}, error rate ${f.errorRate}%, last error ${f.lastError || 'none'}`);
  }
  lines.push('');
  lines.push('TREK AI');
  lines.push(`- requests today ${digest.ai.requestsToday}, errors ${digest.ai.errorsToday}, avg ${digest.ai.avgMs === null ? 'n/a' : `${digest.ai.avgMs}ms`}, est cost today $${digest.ai.costToday}, est cost month $${digest.ai.costMonth}`);
  for (const m of digest.ai.models) {
    lines.push(`  · ${m.model}: ${m.requests} req, ${m.errors} err, $${m.costToday} today / $${m.costMonth} month`);
  }
  lines.push('');
  lines.push('USERS');
  lines.push(`- total ${digest.users.total}, new today ${digest.users.newToday}, new 7d ${digest.users.new7d}, active today ${digest.users.activeToday}, onboarding ${digest.users.onboardingRate}%, deletions 24h ${digest.users.deletions24h} (total ${digest.users.deletionsTotal})`);
  lines.push('');
  lines.push('SUBSCRIPTIONS');
  lines.push(`- PRO ${digest.subscriptions.pro}, ELITE ${digest.subscriptions.elite}, OG100 ${digest.subscriptions.og100} (spots left ${digest.subscriptions.og100SpotsLeft}), failed purchases 24h ${digest.subscriptions.failedPurchases24h}`);
  lines.push('');
  lines.push('AUTH FAILURES 24H');
  lines.push(`- google ${digest.auth.google}, apple ${digest.auth.apple}, email ${digest.auth.email}, other ${digest.auth.other}`);
  lines.push('');
  lines.push('HEALTH');
  for (const h of digest.health) {
    lines.push(`- ${h.check}: ${h.status} ${h.ok ? 'ok' : 'FAILING'} ${h.latencyMs}ms — ${h.detail || ''} (${h.at})`);
  }
  lines.push('');
  lines.push('OPEN CRASH GROUPS');
  if (digest.crashes.length === 0) lines.push('- none');
  for (const c of digest.crashes.slice(0, 15)) {
    lines.push(`- ${c.message} | ${c.route || c.functionName || 'unknown'} | ${c.count} hits | ${c.affectedUsers} users | last ${c.lastSeen} | reopened ${c.reopenedCount}`);
  }
  return lines.join('\n');
}

/** Full plain-text report for the "Copy full report" button. */
export function digestToReport(digest) {
  const parts = [digestToText(digest), '', 'LAST 50 LOG LINES'];
  for (const line of digest.live.slice(0, 50)) parts.push(line.text);
  parts.push('', 'FIX PROMPTS FOR OPEN CRASH GROUPS');
  for (const crash of digest.crashes.slice(0, 10)) {
    parts.push(`--- ${crash.title} (${crash.route || crash.functionName || 'unknown'}) ---`);
    parts.push(crash.fixPrompt || '(no fix prompt generated yet)');
  }
  return parts.join('\n');
}