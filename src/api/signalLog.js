/**
 * Silent signal logging — fire-and-forget.
 *
 * Signals are recorded server-side (SignalLog) so the track record is honest and
 * cannot be edited from the client. Nothing here renders or waits: a failure to
 * log must never affect the signal the user is looking at.
 *
 * One send per symbol per generator per hour per session; the server enforces
 * the same rule across users and devices.
 */
import { invokeFunction } from '@/api/functionsClient';

const sent = new Set();

export function logSignals(rows, surface) {
  try {
    const bucket = Math.floor(Date.now() / 3600000);
    const fresh = (Array.isArray(rows) ? rows : []).filter((row) => {
      if (!row?.symbol || !row?.direction || !(Number(row?.price) > 0)) return false;
      const key = `${surface}|${row.symbol}|${row.source}|${bucket}`;
      if (sent.has(key)) return false;
      sent.add(key);
      return true;
    });
    if (fresh.length === 0) return;
    invokeFunction('signalTracker', { action: 'log', surface, signals: fresh }).catch(() => {});
  } catch (_) {
    // Logging is silent by design.
  }
}