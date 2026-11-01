/**
 * adminDiagnostics — every read the /Admin dashboard needs, in one admin-only
 * endpoint.
 *
 * Actions:
 *   overview        → status cards, crash groups, live feed, last daily report
 *   report          → the same digest as one plain-text block for copy/paste
 *   ask             → a question + the 24h digest answered by the cheap model
 *   setGroupStatus  → mark an error group open or fixed
 *
 * Access is enforced here on the server (Firebase admin uid or Base44 admin
 * role). Hiding the page in the UI is a convenience, never the control.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requireAdmin } from '../../shared/adminAuth.ts';
import { buildDigest, digestToReport, digestToText } from '../../shared/adminDigest.ts';

const CHAT_MODEL = 'gemini_3_8_flash';

const ASK_INSTRUCTION = `You are the diagnostics assistant for TREDIO, a trading app.
You get a plain-text snapshot of the last 24 hours and one question from the app's admin.
Answer in plain language, at most 150 words: say what the numbers show, the most likely
cause if something looks broken, and the single most useful next step. Only use figures
present in the snapshot — never invent a number, a file name or a cause you cannot support.`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const admin = await requireAdmin(req, base44);
    if (!admin.ok) {
      return Response.json({ error: 'Forbidden — admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || 'overview';

    if (action === 'setGroupStatus') {
      const id = body.id;
      const status = body.status === 'fixed' ? 'fixed' : 'open';
      if (!id) return Response.json({ error: 'id is required' }, { status: 400 });
      const patch = { status };
      if (status === 'fixed') patch.fixed_at = new Date().toISOString();
      const updated = await base44.asServiceRole.entities.ErrorGroup.update(id, patch);
      return Response.json({ ok: true, group: { id: updated.id, status: updated.status } });
    }

    const digest = await buildDigest(base44);

    if (action === 'ask') {
      const question = String(body.question || '').trim();
      if (!question) return Response.json({ error: 'question is required' }, { status: 400 });
      if (question.length > 600) return Response.json({ error: 'Question is too long' }, { status: 400 });

      const answer = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: CHAT_MODEL,
        prompt: `${ASK_INSTRUCTION}\n\n=== LAST 24 HOURS ===\n${digestToText(digest)}\n\n=== ADMIN QUESTION ===\n${question}`,
      });

      return Response.json({
        answer: typeof answer === 'string' ? answer : String(answer?.response || ''),
        model: CHAT_MODEL,
        generatedAt: new Date().toISOString(),
      });
    }

    if (action === 'report') {
      return Response.json({ report: digestToReport(digest), generatedAt: digest.generatedAt });
    }

    return Response.json({
      digest,
      report: digestToReport(digest),
      admin: { uid: admin.uid, via: admin.via },
    });
  } catch (error) {
    console.error('[adminDiagnostics] failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}