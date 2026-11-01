import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { logSignals, evaluateSignals, signalTrackRecord } from '../../shared/signalLog.ts';
import { requireAdmin, identify } from '../../shared/adminAuth.ts';

/**
 * signalTracker — three actions, one function:
 *
 *   log      app users (Firebase token) or a generator function append signals.
 *   evaluate the scheduled workflow grades signals at 1 day / 1 week / 1 month.
 *   stats    the /Admin track record card reads grouped results.
 *
 * `evaluate` and `stats` are admin only: they read every user's signals.
 * Nothing here can edit or delete a logged signal — grading appends new rows.
 */
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body.action || '').toLowerCase();

    if (action === 'log') {
      const admin = await requireAdmin(req, base44);
      const identity = admin.ok ? admin : await identify(req);
      if (!identity.ok && !identity.uid) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const rows = Array.isArray(body.signals) ? body.signals.slice(0, 60) : [];
      if (rows.length === 0) return Response.json({ error: 'signals is required' }, { status: 400 });
      const result = await logSignals(base44.asServiceRole, rows, String(body.surface || ''));
      return Response.json({ ok: true, ...result });
    }

    if (action === 'evaluate' || action === 'stats') {
      const admin = await requireAdmin(req, base44);
      if (!admin.ok) return Response.json({ error: 'Forbidden' }, { status: 403 });

      if (action === 'evaluate') {
        const result = await evaluateSignals(base44.asServiceRole);
        console.log('[signalTracker] graded', result.graded, 'checkpoint(s)');
        return Response.json({ ok: true, ...result });
      }
      return Response.json(await signalTrackRecord(base44.asServiceRole));
    }

    return Response.json({ error: `Unknown action: ${action || '(none)'}` }, { status: 400 });
  } catch (error) {
    console.error('[signalTracker] failed:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}