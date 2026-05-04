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

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Browser } from '@capacitor/browser';

const isNative = () => !!(window.Capacitor?.isNativePlatform?.());
const CUSTOM_SCHEME = 'tredio';

export function useOAuthDeepLink(onLoginSuccess) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative()) return; // Web handles auth directly in OAuthCallback

    const CapacitorApp = window.Capacitor?.Plugins?.App;
    if (!CapacitorApp) return;

    let listenerHandle = null;

    const setup = async () => {
      listenerHandle = await CapacitorApp.addListener('appUrlOpen', async (event) => {
        try {
          const url = new URL(event.url);

          // Only handle tredio:// scheme callbacks
          if (url.protocol !== `${CUSTOM_SCHEME}:`) return;

          // Only handle our auth callback path
          if (!url.pathname.startsWith('/auth/callback') && !url.pathname.startsWith('/auth/google/callback')) return;

          // Close SFSafariViewController immediately
          await Browser.close().catch(() => {});

          // Check for provider error forwarded from OAuthCallback
          const oauthError = url.searchParams.get('error');
          if (oauthError) {
            console.error('[useOAuthDeepLink] OAuth error:', oauthError);
            navigate('/SignIn', { replace: true });
            return;
          }

          // Extract token from custom scheme URL
          const token =
            url.searchParams.get('access_token') ||
            url.searchParams.get('token');

          if (!token) {
            console.error('[useOAuthDeepLink] No token in tredio:// callback — cannot restore session');
            navigate('/SignIn', { replace: true });
            return;
          }

          // Persist token — both storage AND SDK instance must be updated
          localStorage.setItem('base44_access_token', token);
          localStorage.setItem('token', token);
          sessionStorage.setItem('base44_access_token', token);

          // Explicitly set token on the SDK instance so auth.me() uses it immediately
          if (base44.auth.setToken) {
            base44.auth.setToken(token);
          }

          // Small delay for SDK to settle
          await new Promise(r => setTimeout(r, 300));

          // Verify session
          let user = null;
          try {
            user = await base44.auth.me();
          } catch {
            await new Promise(r => setTimeout(r, 700));
            user = await base44.auth.me();
          }

          if (!user) {
            console.error('[useOAuthDeepLink] auth.me() returned null after token set');
            navigate('/SignIn', { replace: true });
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

          // Notify App.jsx to re-fetch user state
          if (onLoginSuccess) await onLoginSuccess();

          navigate(user.onboarding_completed === false ? '/Onboarding' : '/Home', { replace: true });

        } catch (err) {
          console.error('[useOAuthDeepLink] Error handling appUrlOpen:', err.message);
          await Browser.close().catch(() => {});
          navigate('/SignIn', { replace: true });
        }
      });
    };

    setup();

    return () => {
      if (listenerHandle) listenerHandle.remove().catch(() => {});
    };
  }, [navigate, onLoginSuccess]);
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