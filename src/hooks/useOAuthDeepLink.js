/**
 * useOAuthDeepLink
 *
 * Global OAuth callback handler for Capacitor iOS.
 *
 * Flow:
 *   SignIn.jsx → Browser.open(oauthUrl with redirect_uri=https://tredio.app/auth/callback)
 *   → Provider redirects to https://tredio.app/auth/callback?access_token=xxx
 *   → OAuthCallback.jsx (inside SFSafariViewController) redirects to tredio://auth/callback?access_token=xxx
 *   → iOS sees tredio://, closes SVC, fires Capacitor appUrlOpen
 *   → This hook extracts token, persists session, navigates to Home/Onboarding
 *
 * Must be mounted at root level (inside <Router>) so it is never unmounted
 * while the SFSafariViewController is open.
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Browser } from '@capacitor/browser';

const isNative = () => !!(window.Capacitor?.isNativePlatform?.());
const CUSTOM_SCHEME = 'tredio';

// Stable ref so the listener is never torn down/re-registered on re-renders
let _appUrlOpenListener = null;

export function useOAuthDeepLink(onLoginSuccess) {
  const navigate = useNavigate();

  // Keep a stable ref to the latest callbacks so we never need to re-register
  const onLoginSuccessRef = useRef(onLoginSuccess);
  const navigateRef = useRef(navigate);
  useEffect(() => { onLoginSuccessRef.current = onLoginSuccess; }, [onLoginSuccess]);
  useEffect(() => { navigateRef.current = navigate; }, [navigate]);

  useEffect(() => {
    if (!isNative()) return;

    const CapacitorApp = window.Capacitor?.Plugins?.App;
    if (!CapacitorApp) return;

    // Only register once for the lifetime of the app
    if (_appUrlOpenListener) return;

    const handleUrl = async (event) => {
      console.log('[useOAuthDeepLink] appUrlOpen fired:', event.url?.split('?')[0]);

      // On-screen debug overlay — shows in real app WebView (not SVC)
      const showNativeDebug = (msg, color = '#0ec8dc') => {
        try {
          let el = document.getElementById('__oauth_debug__');
          if (!el) {
            el = document.createElement('div');
            el.id = '__oauth_debug__';
            Object.assign(el.style, {
              position: 'fixed', bottom: '80px', left: '12px', right: '12px', zIndex: '999999',
              background: 'rgba(0,0,0,0.92)', border: '1px solid rgba(14,200,220,0.4)',
              borderRadius: '10px', padding: '10px 12px', fontSize: '10px',
              fontFamily: 'monospace', color: '#0ec8dc', wordBreak: 'break-all',
              maxHeight: '200px', overflowY: 'auto',
            });
            document.body.appendChild(el);
            setTimeout(() => el?.remove(), 20000); // auto-hide after 20s
          }
          const line = document.createElement('div');
          line.style.color = color;
          line.style.marginBottom = '2px';
          line.textContent = `[${new Date().toISOString().slice(11,19)}] ${msg}`;
          el.appendChild(line);
        } catch (_) {}
      };

      try {
        const url = new URL(event.url);
        showNativeDebug(`appUrlOpen: ${event.url.split('?')[0]}`);

        if (url.protocol !== `${CUSTOM_SCHEME}:`) {
          showNativeDebug(`SKIP: wrong protocol ${url.protocol}`, '#f59e0b');
          return;
        }
        if (!url.pathname.startsWith('/auth/callback') && !url.pathname.startsWith('/auth/google/callback')) {
          showNativeDebug(`SKIP: wrong path ${url.pathname}`, '#f59e0b');
          return;
        }

        showNativeDebug('Closing SFSafariViewController…');
        await Browser.close().catch(() => {});
        showNativeDebug('Browser.close() done');

        window.dispatchEvent(new CustomEvent('oauth_callback_received'));

        const oauthError = url.searchParams.get('error');
        if (oauthError) {
          showNativeDebug(`OAuth error: ${oauthError}`, '#ef4444');
          navigateRef.current('/SignIn', { replace: true });
          return;
        }

        const token =
          url.searchParams.get('access_token') ||
          url.searchParams.get('token');

        if (!token) {
          showNativeDebug('NO TOKEN in tredio:// URL', '#ef4444');
          navigateRef.current('/SignIn', { replace: true });
          return;
        }

        showNativeDebug(`Token received (len=${token.length}), calling setToken…`);

        // Persist + inject into SDK
        if (base44.auth.setToken) base44.auth.setToken(token);
        localStorage.setItem('base44_access_token', token);
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
        sessionStorage.setItem('base44_access_token', token);

        await new Promise(r => setTimeout(r, 400));

        // Verify session with retry
        let user = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            user = await base44.auth.me();
            if (user) {
              showNativeDebug(`auth.me() OK: ${user.email}`, '#22c55e');
              break;
            }
          } catch (e) {
            showNativeDebug(`auth.me() attempt ${attempt + 1} FAIL: ${e.message}`, '#ef4444');
            await new Promise(r => setTimeout(r, 600));
          }
        }

        if (!user) {
          showNativeDebug('auth.me() null after 3 attempts → back to SignIn', '#ef4444');
          navigateRef.current('/SignIn', { replace: true });
          return;
        }

        // Init profile defaults for new OAuth users
        const updates = {};
        if (!user.broker_status) updates.broker_status = 'not_connected';
        if (!user.trading_mode) updates.trading_mode = 'practice';
        if (!user.referral_code) updates.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
        if (!user.subscription_tier) updates.subscription_tier = 'free';
        if (Object.keys(updates).length > 0) {
          await base44.auth.updateMe(updates).catch(() => {});
        }

        showNativeDebug(`Navigating → ${user.onboarding_completed === false ? '/Onboarding' : '/Home'}`, '#22c55e');
        if (onLoginSuccessRef.current) await onLoginSuccessRef.current();
        navigateRef.current(user.onboarding_completed === false ? '/Onboarding' : '/Home', { replace: true });

      } catch (err) {
        showNativeDebug(`FATAL: ${err.message}`, '#ef4444');
        await Browser.close().catch(() => {});
        window.dispatchEvent(new CustomEvent('oauth_callback_received'));
        navigateRef.current('/SignIn', { replace: true });
      }
    };

    CapacitorApp.addListener('appUrlOpen', handleUrl).then(handle => {
      _appUrlOpenListener = handle;
      console.log('[useOAuthDeepLink] appUrlOpen listener registered');
      // Confirm registration on-screen for TestFlight debugging
      try {
        const badge = document.createElement('div');
        badge.id = '__deeplink_ready__';
        Object.assign(badge.style, {
          position: 'fixed', top: 'env(safe-area-inset-top, 0px)', right: '8px',
          zIndex: '999998', background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.3)', borderRadius: '6px',
          padding: '2px 6px', fontSize: '9px', color: '#22c55e',
          fontFamily: 'monospace', pointerEvents: 'none',
        });
        badge.textContent = '🔗 deeplink:ready';
        document.body.appendChild(badge);
        setTimeout(() => badge?.remove(), 10000); // hide after 10s
      } catch (_) {}
    });

    // Intentionally no cleanup — listener must persist for entire app lifetime
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * XCODE CONFIGURATION REQUIRED
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Target → Info → URL Types → click +
 *
 *   Identifier:   com.tredio.app
 *   URL Schemes:  tredio
 *   Role:         Editor
 *
 * That's the only Xcode change needed. No Associated Domains. No AASA file.
 *
 * ─── Apple Developer Portal ────────────────────────────────────────────────
 * Services ID (com.tredio.web) → Sign In with Apple → Configure:
 *   Primary App ID:  com.tredio.app
 *   Domains:         tredio.app
 *   Return URLs:     https://tredio.app/auth/callback   ← must be HTTPS (Apple requires it)
 *
 * NOTE: Apple does NOT accept tredio:// as a Return URL for Services IDs.
 * The custom scheme redirect happens inside OAuthCallback.jsx AFTER Apple
 * posts back to the HTTPS URL. This is why the two-step flow is required.
 *
 * ─── Google Cloud Console ──────────────────────────────────────────────────
 * Authorized redirect URIs:
 *   https://tredio.app/auth/callback   ← HTTPS only (Google also rejects custom schemes)
 *
 * Same reasoning: Google redirects to the HTTPS URL, OAuthCallback.jsx
 * then forwards to tredio:// internally.
 *
 * ─── Capacitor Config ──────────────────────────────────────────────────────
 * capacitor.config.json:
 * {
 *   "appId": "com.tredio.app",
 *   "server": { "hostname": "tredio.app", "iosScheme": "https" }
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */