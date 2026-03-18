import { base44 } from '@/api/base44Client';

const MAX_PER_DAY = 3;

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns true if a push notification should be sent for this signal+user.
 */
export async function shouldSendNotification(signal, user) {
  if (!signal || !user?.id) return false;
  if (!['BUY', 'SELL'].includes(signal?.signal)) return false;
  if ((signal?.confidence ?? 0) <= 75) return false;

  const today = todayString();
  const logs = await base44.entities.NotificationLog.filter({ user_id: user.id, date: today });
  const count = logs?.[0]?.count ?? 0;
  return count < MAX_PER_DAY;
}

/**
 * Increment the notification count for today.
 */
export async function recordNotificationSent(user) {
  if (!user?.id) return;
  const today = todayString();
  const logs = await base44.entities.NotificationLog.filter({ user_id: user.id, date: today });

  if (logs?.length > 0) {
    await base44.entities.NotificationLog.update(logs[0].id, {
      count: (logs[0].count ?? 0) + 1,
    });
  } else {
    await base44.entities.NotificationLog.create({
      user_id: user.id,
      date: today,
      count: 1,
    });
  }
}

/**
 * Format a push notification payload.
 */
export function formatNotification(signal, asset) {
  const sym = asset || signal?.symbol || '—';
  const conf = signal?.confidence ?? 0;
  const summary = (signal?.technicalSummary || '').slice(0, 80);

  if (signal?.signal === 'BUY') {
    return {
      title: `⚡ TREK Signal: ${sym}`,
      body: `Probability of upward move: ${conf}%\nKey driver: ${summary}...\nTap to see full analysis →`,
    };
  }
  if (signal?.signal === 'SELL') {
    return {
      title: `⚠️ TREK Alert: ${sym}`,
      body: `Risk detected — confidence: ${conf}%\n${summary}...\nTap to review your position →`,
    };
  }
  return { title: `TREK: ${sym}`, body: summary };
}

/**
 * Send a browser push notification if conditions are met.
 */
export async function sendPushNotification(signal, user) {
  const canSend = await shouldSendNotification(signal, user);
  if (!canSend) return;

  const { title, body } = formatNotification(signal, signal?.symbol);

  const dispatch = () => {
    new Notification(title, { body, icon: '/favicon.ico' });
    recordNotificationSent(user);
  };

  if (!('Notification' in window)) return;
  if (Notification.permission === 'granted') {
    dispatch();
  } else if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') dispatch();
  }
}