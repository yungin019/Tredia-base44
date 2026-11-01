/**
 * adminDailySummary — once a day (scheduled workflow, 07:00 Stockholm) it sends
 * the last 24h of metrics to the cheapest available model and stores a short
 * plain-language report that /Admin displays, plus posts it to Discord.
 *
 * The cheapest tier available on this platform is Gemini Flash; Claude Haiku is
 * not offered by the model integration, so the summary runs on gemini_3_8_flash.
 * An admin can also trigger it on demand with { force: true }.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requireAdmin } from '../../shared/adminAuth.ts';
import { postAdminDiscord } from '../../shared/adminDiscord.ts';
import { buildDigest, digestToText } from '../../shared/adminDigest.ts';
import { estimateCost } from '../../shared/diagLog.ts';

const MODEL = 'gemini_3_8_flash';

const INSTRUCTION = `You write a short daily operations report for the admin of TREDIO, a trading app.
You get 24 hours of diagnostics. Write plain text, no markdown, at most 200 words, in this shape:

WHAT CHANGED: the notable numbers in one or two sentences.
WHAT BROKE: any failing health check, provider error, crash group or auth failures — or "nothing failed".
LIKELY CAUSE: only where the data supports it; otherwise say the data does not show it.
COST: estimated AI cost for the day and month.
UNUSUAL: anything that stands out, or "nothing unusual".

Use only the figures in the snapshot. Never invent numbers, file names or causes.`;

export default async function (req) {
  const base44 = createClientFromRequest(req);
  const admin = await requireAdmin(req, base44);
  if (!admin.ok) return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });

  try {
    const digest = await buildDigest(base44);
    const snapshot = digestToText(digest);

    const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: MODEL,
      prompt: `${INSTRUCTION}\n\n=== LAST 24 HOURS ===\n${snapshot}`,
    });

    const summary = (typeof answer === 'string' ? answer : String(answer?.response || '')).trim();
    if (!summary) throw new Error('Model returned an empty summary');

    const day = new Date().toISOString().slice(0, 10);
    const cost = estimateCost(MODEL, snapshot.length + INSTRUCTION.length, summary.length);

    await base44.asServiceRole.entities.DiagnosticsReport.create({
      date: day,
      summary,
      model: MODEL,
      cost_usd: Number(cost.toFixed(6)),
      stats: JSON.stringify({
        errors24h: digest.totals.errors24h,
        openCrashes: digest.totals.openCrashes,
        aiCostToday: digest.ai.costToday,
        health: digest.health.map((h) => ({ check: h.check, status: h.status })),
        auth: digest.auth,
      }).slice(0, 4000),
      at: new Date().toISOString(),
    });

    await postAdminDiscord(`📊 **TREDIO daily diagnostics (${day})**\n${summary.slice(0, 1500)}`);

    return Response.json({ ok: true, date: day, summary, model: MODEL, cost_usd: Number(cost.toFixed(6)) });
  } catch (error) {
    console.error('[adminDailySummary] failed:', error.message);
    await postAdminDiscord(`⚠️ Daily diagnostics summary failed: ${error.message}`);
    return Response.json({ error: error.message }, { status: 500 });
  }
}