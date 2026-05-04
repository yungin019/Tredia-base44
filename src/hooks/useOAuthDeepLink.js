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

      try {
        const url = new URL(event.url);

        if (url.protocol !== `${CUSTOM_SCHEME}:`) return;
        if (!url.pathname.startsWith('/auth/callback') && !url.pathname.startsWith('/auth/google/callback')) return;

        // Close SFSafariViewController immediately — this must happen first
        await Browser.close().catch(() => {});

        // Dispatch event so SignIn.jsx can clear its loading state regardless of outcome
        window.dispatchEvent(new CustomEvent('oauth_callback_received'));

        const oauthError = url.searchParams.get('error');
        if (oauthError) {
          console.error('[useOAuthDeepLink] OAuth error:', oauthError);
          navigateRef.current('/SignIn', { replace: true });
          return;
        }

        const token =
          url.searchParams.get('access_token') ||
          url.searchParams.get('token');

        if (!token) {
          console.error('[useOAuthDeepLink] No token in tredio:// callback');
          navigateRef.current('/SignIn', { replace: true });
          return;
        }

        console.log('[useOAuthDeepLink] Token received, setting on SDK...');

        // Persist + inject into SDK
        localStorage.setItem('base44_access_token', token);
        localStorage.setItem('token', token);
        sessionStorage.setItem('base44_access_token', token);
        if (base44.auth.setToken) base44.auth.setToken(token);

        await new Promise(r => setTimeout(r, 400));

        // Verify session with retry
        let user = null;
        for (let attempt = 0; attempt < 3; attempt++) {
          try {
            user = await base44.auth.me();
            if (user) break;
          } catch (e) {
            console.warn(`[useOAuthDeepLink] auth.me() attempt ${attempt + 1} failed:`, e.message);
            await new Promise(r => setTimeout(r, 600));
          }
        }

        if (!user) {
          console.error('[useOAuthDeepLink] auth.me() returned null after 3 attempts');
          navigateRef.current('/SignIn', { replace: true });
          return;
        }

        console.log('[useOAuthDeepLink] Session confirmed for:', user.email);

        // Init profile defaults for new OAuth users
        const updates = {};
        if (!user.broker_status) updates.broker_status = 'not_connected';
        if (!user.trading_mode) updates.trading_mode = 'practice';
        if (!user.referral_code) updates.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
        if (!user.subscription_tier) updates.subscription_tier = 'free';
        if (Object.keys(updates).length > 0) {
          await base44.auth.updateMe(updates).catch(() => {});
        }

        if (onLoginSuccessRef.current) await onLoginSuccessRef.current();

        navigateRef.current(user.onboarding_completed === false ? '/Onboarding' : '/Home', { replace: true });

      } catch (err) {
        console.error('[useOAuthDeepLink] Fatal error:', err.message);
        await Browser.close().catch(() => {});
        window.dispatchEvent(new CustomEvent('oauth_callback_received'));
        navigateRef.current('/SignIn', { replace: true });
      }
    };

    CapacitorApp.addListener('appUrlOpen', handleUrl).then(handle => {
      _appUrlOpenListener = handle;
      console.log('[useOAuthDeepLink] appUrlOpen listener registered');
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