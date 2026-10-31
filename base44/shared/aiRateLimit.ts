/**
 * Silent anti-abuse limiter shared by the AI-backed functions.
 *
 * Fair-use ceiling: 20 AI requests per minute per user. Nothing is exposed in
 * the UI beyond a generic "try again shortly" reply; this exists to stop a
 * single account from hammering paid model providers.
 */

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

const hits = new Map<string, number[]>();

export function allowAiRequest(userKey: string | null | undefined): boolean {
  if (!userKey) return false;

  const now = Date.now();
  const recent = (hits.get(userKey) || []).filter((t) => now - t < WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(userKey, recent);
    return false;
  }

  recent.push(now);
  hits.set(userKey, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [key, timestamps] of hits) {
      if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > WINDOW_MS) {
        hits.delete(key);
      }
    }
  }

  return true;
}

export const AI_RATE_LIMIT_REPLY =
  'You are sending requests faster than we can process them. Please wait a minute and try again.';