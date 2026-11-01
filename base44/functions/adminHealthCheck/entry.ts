/**
 * adminHealthCheck — runs every 10 minutes from the scheduled workflow.
 *
 * Checks five things end to end: a SPY quote (Finnhub), a BTC quote
 * (TwelveData), the news feed (Finnhub news + one rotating publisher feed),
 * Firebase auth (Google's JWKS endpoint that the token verification depends on)
 * and one minimal AI call.
 *
 * Each run writes one HealthCheck row per subsystem. An alert goes to Discord
 * only when a check fails twice in a row, at most once per hour per check; a
 * "recovered" message is sent when a failing check passes again.
 *
 * Admin-only: callable by a Firebase admin token, or by the workflow (Base44
 * admin role). Anyone else gets 403.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requireAdmin } from '../../shared/adminAuth.ts';
import { postAdminDiscord } from '../../shared/adminDiscord.ts';
import { sanitize } from '../../shared/diagLog.ts';

const JWKS_URL = 'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com';
const AI_MODEL = 'gemini_3_8_flash';
const SLOW_MS = 2500;
const ALERT_COOLDOWN_MS = 60 * 60 * 1000;
const RETENTION_DAYS = 30;
const RSS_ROTATION = [
  'https://feeds.a.dj.com/rss/RSSMarketsMain.xml',
  'https://www.cnbc.com/id/100003114/device/rss/rss.html',
  'https://feeds.bbci.co.uk/news/business/rss.xml',
  'https://www.marketwatch.com/rss/topstories',
];

async function timed(fn) {
  const started = Date.now();
  try {
    const value = await fn();
    return { ok: true, ms: Date.now() - started, value };
  } catch (error) {
    return { ok: false, ms: Date.now() - started, error: error.message };
  }
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await requireAdmin(req, base44);
    if (!admin.ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const finnhubKey = Deno.env.get('FINNHUB_API_KEY');
    const twelveKey = Deno.env.get('TWELVEDATA_API_KEY');
    const feedUrl = RSS_ROTATION[Math.floor(Date.now() / (10 * 60 * 1000)) % RSS_ROTATION.length];

    const [spy, btc, news, jwks, ai] = await Promise.all([
      timed(async () => {
        if (!finnhubKey) throw new Error('FINNHUB_API_KEY not set');
        const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=SPY&token=${finnhubKey}`, { signal: AbortSignal.timeout(8000) });
        if (res.status === 429) throw new Error('Finnhub rate limit (429)');
        if (!res.ok) throw new Error(`Finnhub HTTP ${res.status}`);
        const data = await res.json();
        if (!(Number(data?.c) > 0)) throw new Error('Finnhub returned no SPY price');
        return `SPY $${Number(data.c).toFixed(2)}`;
      }),
      timed(async () => {
        if (!twelveKey) throw new Error('TWELVEDATA_API_KEY not set');
        const res = await fetch(`https://api.twelvedata.com/quote?symbol=BTC/USD&apikey=${twelveKey}`, { signal: AbortSignal.timeout(10000) });
        const data = await res.json().catch(() => ({}));
        if (res.status === 429 || data?.code === 429) throw new Error('TwelveData rate limit (429)');
        if (!(Number(data?.close) > 0)) throw new Error(`TwelveData: ${data?.message || 'no BTC price'}`);
        return `BTC $${Number(data.close).toFixed(0)}`;
      }),
      timed(async () => {
        if (!finnhubKey) throw new Error('FINNHUB_API_KEY not set');
        const res = await fetch(`https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`Finnhub news HTTP ${res.status}`);
        const items = await res.json();
        if (!Array.isArray(items) || items.length === 0) throw new Error('Finnhub news returned no articles');

        const rss = await fetch(feedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TREDIO/1.0)' },
          signal: AbortSignal.timeout(8000),
        }).catch(() => null);
        if (!rss || !rss.ok) throw new Error(`Publisher feed HTTP ${rss?.status || 'unreachable'}`);

        return `${items.length} wire articles + feed reachable`;
      }),
      timed(async () => {
        const res = await fetch(JWKS_URL, { signal: AbortSignal.timeout(8000) });
        if (!res.ok) throw new Error(`Google JWKS HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data?.keys) || data.keys.length === 0) throw new Error('Google JWKS returned no keys');
        return 'token keys reachable';
      }),
      timed(async () => {
        const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: 'Reply with exactly: ok',
          model: AI_MODEL,
        });
        const text = typeof answer === 'string' ? answer.trim() : '';
        if (!text) throw new Error('AI returned an empty reply');
        return text.slice(0, 40);
      }),
    ]);

    const checks = [
      { check: 'quote_spy', label: 'SPY quote (Finnhub)', result: spy },
      { check: 'quote_btc', label: 'BTC quote (TwelveData)', result: btc },
      { check: 'news_feed', label: 'News feed', result: news },
      { check: 'firebase_auth', label: 'Firebase auth', result: jwks },
      { check: 'trek_ai', label: 'TREK AI (model reachable)', result: ai },
    ];

    const now = new Date().toISOString();
    const outcomes = [];

    for (const item of checks) {
      const { result } = item;
      const previousPage = await base44.asServiceRole.entities.HealthCheck.filter(
        { check: item.check },
        { sort: '-at', limit: 8 },
      );
      const previous = (previousPage?.items || [])[0] || null;
      const recentAlerts = (previousPage?.items || [])
        .map((row) => row.alert_sent_at)
        .filter(Boolean)
        .sort()
        .pop();
      const alertRecent = recentAlerts && (Date.now() - new Date(recentAlerts).getTime()) < ALERT_COOLDOWN_MS;

      const status = result.ok ? (result.ms > SLOW_MS ? 'yellow' : 'green') : 'red';
      const detail = result.ok ? String(result.value || 'ok') : sanitize(result.error, 200);

      const row = await base44.asServiceRole.entities.HealthCheck.create({
        check: item.check,
        label: item.label,
        ok: result.ok,
        status,
        latency_ms: result.ms,
        detail,
        at: now,
      });

      let alerted = false;

      if (!result.ok && previous && previous.ok === false) {
        if (!alertRecent) {
          const sent = await postAdminDiscord(
            `🔴 **TREK health check failing — ${item.label}**\n` +
            `${detail}\nFailing for at least 2 checks (last ok: ${previous.last_ok || 'unknown'}).`,
          );
          if (sent) {
            await base44.asServiceRole.entities.HealthCheck.update(row.id, { alert_sent_at: now });
            alerted = true;
          }
        }
      } else if (result.ok && previous && previous.ok === false) {
        const sent = await postAdminDiscord(
          `🟢 **Recovered — ${item.label}**\n${detail} (${result.ms} ms)`,
        );
        if (sent) {
          await base44.asServiceRole.entities.HealthCheck.update(row.id, { alert_sent_at: now });
          alerted = true;
        }
      }

      outcomes.push({ check: item.check, ok: result.ok, status, latency_ms: result.ms, detail, alerted });
    }

    // Retention: ErrorLog and metrics keep 30 days; health rows are far more
    // numerous (5 per run), so they keep 7.
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const healthCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    let pruned = { errors: 0, events: 0, checks: 0 };
    try {
      const [errors, events, checksPruned] = await Promise.all([
        base44.asServiceRole.entities.ErrorLog.deleteMany({ created_date: { $lt: cutoff } }),
        base44.asServiceRole.entities.DiagEvent.deleteMany({ created_date: { $lt: cutoff } }),
        base44.asServiceRole.entities.HealthCheck.deleteMany({ created_date: { $lt: healthCutoff } }),
      ]);
      pruned = { errors: errors?.deleted ?? 0, events: events?.deleted ?? 0, checks: checksPruned?.deleted ?? 0 };
    } catch (error) {
      console.warn('[health] retention prune failed:', error.message);
    }

    return Response.json({ ok: outcomes.every((o) => o.ok), at: now, checks: outcomes, pruned });
  } catch (error) {
    console.error('[adminHealthCheck] failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}