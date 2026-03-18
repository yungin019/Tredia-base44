/**
 * Smart push notification helpers for TREDIA.
 * shouldSendNotification + formatNotification are the two exports.
 */

const NOTIF_LOG_KEY = 'tredia_notif_log';
const MAX_PER_DAY = 3;

function getTodayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function getNotifLog() {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_LOG_KEY) || '{}');
  } catch {
    return {};
  }
}

function recordNotification(userId) {
  const log = getNotifLog();
  const today = getTodayKey();
  const key = `${userId}_${today}`;
  log[key] = (log[key] || 0) + 1;
  try {
    localStorage.setItem(NOTIF_LOG_KEY, JSON.stringify(log));
  } catch {}
}

function getNotifCountToday(userId) {
  const log = getNotifLog();
  const today = getTodayKey();
  return log[`${userId}_${today}`] || 0;
}

/**
 * Determines if a push notification should be sent.
 * @param {object} signal - { signal: 'BUY'|'SELL'|'HOLD'|'WATCH', confidence: number }
 * @param {object} user   - { id: string }
 * @returns {boolean}
 */
export function shouldSendNotification(signal, user) {
  if (!signal || !user?.id) return false;
  if (!['BUY', 'SELL'].includes(signal.signal)) return false;
  if ((signal.confidence ?? 0) <= 75) return false;
  if (getNotifCountToday(user.id) >= MAX_PER_DAY) return false;
  return true;
}

/**
 * Formats a push notification payload.
 * @param {object} signal - { signal, symbol, confidence, technicalSummary }
 * @param {string} asset  - ticker symbol (e.g. 'BTC')
 * @returns {{ title: string, body: string }}
 */
export function formatNotification(signal, asset) {
  const sym = asset || signal?.symbol || '—';
  const conf = signal?.confidence ?? 0;
  const summary = signal?.technicalSummary || '';

  if (signal?.signal === 'BUY') {
    return {
      title: `⚡ TREK Signal: ${sym}`,
      body: `Probability of upward move: ${conf}%\nKey driver: ${summary.slice(0, 80)}...\nTap to see full analysis →`,
    };
  }

  if (signal?.signal === 'SELL') {
    return {
      title: `⚠️ TREK Alert: ${sym}`,
      body: `Risk detected — confidence: ${conf}%\n${summary.slice(0, 80)}...\nTap to review your position →`,
    };
  }

  return { title: `TREK: ${sym}`, body: summary.slice(0, 120) };
}

/**
 * Sends a browser push notification if permitted.
 */
export async function sendPushNotification(signal, user) {
  if (!shouldSendNotification(signal, user)) return;
  const { title, body } = formatNotification(signal, signal?.symbol);

  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
    recordNotification(user.id);
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      new Notification(title, { body, icon: '/favicon.ico' });
      recordNotification(user.id);
    }
  }
}