/**
 * useOAuthDeepLink
 *
 * GLOBAL OAuth callback handler for Capacitor iOS.
 *
 * Architecture:
 * - SignIn.jsx opens SFSafariViewController via @capacitor/browser
 * - The OAuth provider (Google / Apple) redirects to https://tredio.app/auth/callback
 * - iOS intercepts that URL as a Universal Link (requires Associated Domains entitlement)
 * - Capacitor fires the `appUrlOpen` event on the App plugin
 * - This hook (mounted inside Router in App.jsx) catches that event,
 *   extracts the token, closes the SVC, persists the session, and navigates home.
 *
 * This hook must be mounted at the root level (inside <Router>) so it is NEVER
 * unmounted while the app is running — the SignIn component may unmount while
 * the SFSafariViewController is still open.
 *
 * Xcode requirements (see bottom of this file).
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Browser } from '@capacitor/browser';

const isNative = () => !!(window.Capacitor?.isNativePlatform?.());

// Routes we handle as OAuth callbacks
// Handles both Universal Links (https://tredio.app/auth/callback)
// and custom URL scheme (tredio://auth/callback)
const OAUTH_PATHS = ['/auth/callback', '/auth/google/callback', '/auth/apple/callback'];
const CUSTOM_SCHEME = 'tredio';

export function useOAuthDeepLink(onLoginSuccess) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isNative()) return; // Web uses the OAuthCallback page via normal routing

    const CapacitorApp = window.Capacitor?.Plugins?.App;
    if (!CapacitorApp) {
      console.warn('[useOAuthDeepLink] Capacitor App plugin not available');
      return;
    }

    let listenerHandle = null;

    const setup = async () => {
      try {
        listenerHandle = await CapacitorApp.addListener('appUrlOpen', async (event) => {
          console.log('[useOAuthDeepLink] appUrlOpen fired:', event.url);

          try {
            const url = new URL(event.url);

            // Handle both custom scheme (tredio://auth/callback)
            // and Universal Links (https://tredio.app/auth/callback)
            const isCustomScheme = url.protocol === `${CUSTOM_SCHEME}:`;
            const isOAuthCallback =
              isCustomScheme ||
              OAUTH_PATHS.some(p => url.pathname.startsWith(p));

            if (!isOAuthCallback) {
              console.log('[useOAuthDeepLink] Not an OAuth callback, ignoring:', url.pathname);
              return;
            }

            // Check for provider-level error
            const oauthError = url.searchParams.get('error');
            if (oauthError) {
              const desc = url.searchParams.get('error_description') || oauthError;
              console.error('[useOAuthDeepLink] Provider OAuth error:', oauthError, desc);
              await Browser.close().catch(() => {});
              navigate('/SignIn', { replace: true });
              return;
            }

            // Extract token — works for both:
            //   tredio://auth/callback?access_token=xxx
            //   https://tredio.app/auth/callback?access_token=xxx#access_token=xxx
            const hashParams = new URLSearchParams(url.hash.replace('#', ''));
            const token =
              url.searchParams.get('access_token') ||
              url.searchParams.get('token') ||
              hashParams.get('access_token') ||
              hashParams.get('token');

            if (token) {
              console.log('[useOAuthDeepLink] Token found in deep link, persisting...');
              localStorage.setItem('base44_access_token', token);
              localStorage.setItem('token', token);
              sessionStorage.setItem('base44_access_token', token);
            } else {
              console.log('[useOAuthDeepLink] No token in deep link URL — relying on SDK session cookie');
            }

            // Close SFSafariViewController before any async work
            await Browser.close().catch(() => {});

            // Give SDK a moment to pick up the token
            await new Promise(r => setTimeout(r, 300));

            // Verify session
            let user = null;
            try {
              user = await base44.auth.me();
            } catch (e) {
              console.warn('[useOAuthDeepLink] First auth.me() failed, retrying:', e.message);
              await new Promise(r => setTimeout(r, 700));
              user = await base44.auth.me();
            }

            if (!user) {
              console.error('[useOAuthDeepLink] auth.me() returned null after token extract — session not established');
              navigate('/SignIn', { replace: true });
              return;
            }

            console.log('[useOAuthDeepLink] ✓ Authenticated as:', user.email);

            // Init profile defaults for new OAuth users
            const updates = {};
            if (!user.broker_status) updates.broker_status = 'not_connected';
            if (!user.trading_mode) updates.trading_mode = 'practice';
            if (!user.referral_code) updates.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
            if (!user.subscription_tier) updates.subscription_tier = 'free';
            if (Object.keys(updates).length > 0) {
              await base44.auth.updateMe(updates).catch(e =>
                console.warn('[useOAuthDeepLink] Profile init partial error:', e.message)
              );
            }

            // Notify parent (App.jsx) to re-fetch user state
            if (onLoginSuccess) await onLoginSuccess();

            const needsOnboarding = user.onboarding_completed === false;
            navigate(needsOnboarding ? '/Onboarding' : '/Home', { replace: true });

          } catch (err) {
            console.error('[useOAuthDeepLink] Error handling appUrlOpen:', err.message, err.stack);
            await Browser.close().catch(() => {});
            navigate('/SignIn', { replace: true });
          }
        });

        console.log('[useOAuthDeepLink] ✓ appUrlOpen listener registered');
      } catch (err) {
        console.error('[useOAuthDeepLink] Failed to register appUrlOpen listener:', err.message);
      }
    };

    setup();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove().catch(() => {});
        console.log('[useOAuthDeepLink] appUrlOpen listener removed');
      }
    };
  }, [navigate, onLoginSuccess]);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * XCODE CONFIGURATION — CUSTOM URL SCHEME (tredio://)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * No AASA file or Associated Domains required for this approach.
 * The custom URL scheme is registered entirely in Xcode.
 *
 * 1. URL TYPES (required — this is the core config)
 *    Target → Info → URL Types → click +
 *
 *    Field             Value
 *    ─────────────────────────────
 *    Identifier        com.tredio.app
 *    URL Schemes       tredio
 *    Role              Editor
 *
 *    This registers tredio:// with iOS so the OS hands any
 *    tredio://... URL back to your app via appUrlOpen.
 *
 * 2. SIGN IN WITH APPLE
 *    Target → Signing & Capabilities → + Capability → Sign In with Apple
 *
 *    In Apple Developer Portal → Services ID (com.tredio.web):
 *    - Sign In with Apple → Configure:
 *      - Primary App ID: com.tredio.app
 *      - Domains: tredio.app
 *      - Return URLs: tredio://auth/callback
 *                     https://tredio.app/auth/callback   (keep both)
 *
 * 3. GOOGLE OAUTH (Google Cloud Console)
 *    Authorized redirect URIs — add BOTH:
 *      tredio://auth/callback
 *      https://tredio.app/auth/callback
 *
 * 4. NO Associated Domains needed
 *    Remove "applinks:tredio.app" from Signing & Capabilities if present —
 *    the AASA file Base44 serves does not include com.tredio.app so it
 *    would cause a validation failure with no benefit.
 *
 * 5. CAPACITOR.CONFIG
 *    {
 *      "appId": "com.tredio.app",
 *      "server": { "hostname": "tredio.app", "iosScheme": "https" }
 *    }
 *
 * 6. HOW IT WORKS AT RUNTIME
 *    - User taps "Continue with Google/Apple"
 *    - Browser.open() opens SFSafariViewController with OAuth URL
 *      (redirect_uri = tredio://auth/callback)
 *    - Provider redirects to tredio://auth/callback?access_token=xxx
 *    - iOS sees the tredio:// scheme, closes SFSafariViewController,
 *      fires appUrlOpen in Capacitor
 *    - useOAuthDeepLink hook extracts token, persists session, navigates
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */