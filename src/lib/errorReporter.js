/**
 * Frontend crash + action recorder.
 *
 * Captures unhandled errors, console errors, failed network calls and the last
 * 10 user actions (route changes and clicks — never typed text), then sends them
 * to the logError backend function, which sanitizes and groups them.
 *
 * Everything here is best-effort: a reporting failure must never surface to the
 * user or break the screen it is watching.
 */
import { invokeFunction } from '@/api/functionsClient';

const MAX_ACTIONS = 10;
const MAX_NETWORK = 10;
const MAX_CONSOLE = 10;

const actions = [];
const consoleErrors = [];
const networkFails = [];
let installed = false;

export const APP_VERSION = import.meta.env?.VITE_APP_VERSION || 'web';

function pushCapped(list, item, max) {
  list.push(item);
  if (list.length > max) list.shift();
}

function describeElement(el) {
  if (!el || !el.tagName) return '';
  const text = (el.getAttribute?.('aria-label') || el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const id = el.id ? `#${el.id}` : '';
  return `${el.tagName.toLowerCase()}${id}${text ? ` "${text}"` : ''}`;
}

function deviceSummary() {
  const ua = navigator.userAgent || '';
  const platform = (typeof window !== 'undefined' && window.Capacitor?.getPlatform?.())
    || (/iPhone|iPad|iPod/.test(ua) ? 'ios' : /Android/.test(ua) ? 'android' : 'web');
  return `${platform} · ${ua.slice(0, 110)}`;
}

export function recordAction(type, detail) {
  pushCapped(
    actions,
    { t: new Date().toISOString().slice(11, 19), type, detail: String(detail || '').slice(0, 120) },
    MAX_ACTIONS,
  );
}

export function recordRoute() {
  recordAction('route', `${window.location.pathname}${window.location.search.slice(0, 40)}`);
}

async function send(payload) {
  try {
    await invokeFunction('logError', payload);
    return true;
  } catch (error) {
    console.warn('[diag] report failed:', error.message);
    return false;
  }
}

export async function sendError({ message, stack, kind = 'crash', severity = 'error', note = null }) {
  return send({
    source: kind === 'manual' ? 'manual' : 'frontend',
    kind,
    severity,
    message: String(message || 'Unknown error').slice(0, 400),
    stack: stack ? String(stack).slice(0, 3000) : null,
    route: `${window.location.pathname}${window.location.search.slice(0, 60)}`,
    app_version: APP_VERSION,
    device: deviceSummary(),
    note,
    actions,
    network: networkFails.slice(-8),
    console: consoleErrors.slice(-5),
  });
}

/** Failed sign-in, counted per provider (google / apple / email). */
export function reportAuthFailure(provider, error) {
  return send({
    metric: 'auth_fail',
    metric_source: provider,
    message: String(error?.code || error?.message || 'sign-in failed').slice(0, 200),
  });
}

/** Failed or restored purchase — counted in the Subscriptions card. */
export function reportPurchaseFailure(error, stage = 'purchase') {
  return send({
    metric: 'purchase_fail',
    metric_source: `revenuecat-${stage}`,
    message: String(error?.code || error?.message || 'purchase failed').slice(0, 200),
  });
}

export function installErrorReporter() {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  recordRoute();

  const originalPush = window.history.pushState;
  window.history.pushState = function patchedPushState(...args) {
    const result = originalPush.apply(this, args);
    setTimeout(recordRoute, 0);
    return result;
  };
  window.addEventListener('popstate', recordRoute);

  // Clicks only — never input values or typed text.
  window.addEventListener('click', (event) => {
    recordAction('click', describeElement(event.target));
  }, true);

  const originalConsoleError = console.error;
  console.error = function patchedConsoleError(...args) {
    try {
      pushCapped(
        consoleErrors,
        args.map((a) => (typeof a === 'string' ? a : (a?.message || String(a)))).join(' ').slice(0, 300),
        MAX_CONSOLE,
      );
    } catch (_) { /* ignore */ }
    originalConsoleError.apply(console, args);
  };

  const originalFetch = window.fetch;
  window.fetch = async function patchedFetch(...args) {
    try {
      const response = await originalFetch.apply(this, args);
      if (response && response.status >= 400) {
        pushCapped(networkFails, { url: String(args[0]).slice(0, 140), status: response.status }, MAX_NETWORK);
      }
      return response;
    } catch (error) {
      pushCapped(networkFails, { url: String(args[0]).slice(0, 140), status: 'network' }, MAX_NETWORK);
      throw error;
    }
  };

  window.addEventListener('error', (event) => {
    if (!event?.message && !event?.error) return;
    sendError({
      message: event.message || event.error?.message,
      stack: event.error?.stack,
      kind: 'unhandled',
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    sendError({
      message: reason?.message || String(reason || 'Unhandled promise rejection'),
      stack: reason?.stack,
      kind: 'unhandled',
    });
  });
}