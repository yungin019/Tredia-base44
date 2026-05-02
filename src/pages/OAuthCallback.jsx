import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const isNative = () => !!(window.Capacitor?.isNativePlatform?.());

/**
 * OAuthCallback
 *
 * Handles https://tredio.app/auth/callback in the SFSafariViewController (iOS native)
 * and in the browser (web).
 *
 * iOS native flow:
 *   Provider → https://tredio.app/auth/callback?token=xxx
 *   → This page extracts token, then redirects to tredio://auth/callback?token=xxx
 *   → iOS closes SVC, fires Capacitor appUrlOpen
 *   → useOAuthDeepLink in App.jsx handles the rest
 *
 * Web flow:
 *   Provider → https://tredio.app/auth/callback?token=xxx
 *   → This page persists token, calls auth.me(), navigates directly
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handle = async () => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));

      // Check for provider error
      const oauthError = params.get('error') || hashParams.get('error');
      if (oauthError) {
        const desc = params.get('error_description') || hashParams.get('error_description') || oauthError;
        setErrorMsg(`Sign in was cancelled or failed: ${desc}`);
        setStatus('error');
        setTimeout(() => navigate('/SignIn', { replace: true }), 3000);
        return;
      }

      // Extract token from query params or hash fragment
      const token =
        params.get('access_token') ||
        params.get('token') ||
        hashParams.get('access_token') ||
        hashParams.get('token');

      // ── iOS NATIVE: hand off to tredio:// scheme ──────────────────────────
      // The SFSafariViewController runs in an isolated context — cookies/sessions
      // set here are NOT shared with the Capacitor WKWebView.
      // The only reliable channel is the URL itself via the custom scheme.
      if (isNative()) {
        if (!token) {
          setErrorMsg('No authentication token received from provider. Please try again.');
          setStatus('error');
          setTimeout(() => navigate('/SignIn', { replace: true }), 3000);
          return;
        }

        // Build tredio:// URL preserving all params from provider
        const redirectParams = new URLSearchParams();
        redirectParams.set('access_token', token);

        // Preserve any other params the provider may have sent
        for (const [key, value] of params.entries()) {
          if (key !== 'access_token' && key !== 'token') {
            redirectParams.set(key, value);
          }
        }

        const schemeUrl = `tredio://auth/callback?${redirectParams.toString()}`;
        console.log('[OAuthCallback] Native: redirecting to custom scheme');

        // window.location redirect fires appUrlOpen in Capacitor
        window.location.href = schemeUrl;
        return;
      }

      // ── WEB BROWSER: handle directly ─────────────────────────────────────
      if (token) {
        localStorage.setItem('base44_access_token', token);
        localStorage.setItem('token', token);
        sessionStorage.setItem('base44_access_token', token);
      }

      // Small delay for SDK to pick up token
      await new Promise(r => setTimeout(r, 300));

      const user = await base44.auth.me();
      if (!user) {
        setErrorMsg('Session could not be established. Please try signing in again.');
        setStatus('error');
        setTimeout(() => navigate('/SignIn', { replace: true }), 3000);
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

      navigate(user.onboarding_completed === false ? '/Onboarding' : '/Home', { replace: true });
    };

    handle();
  }, [navigate]);

  if (status === 'error') {
    return (
      <div style={containerStyle}>
        <img src="/logo-full.svg" alt="TREDIO" style={{ height: '28px', marginBottom: '24px' }} />
        <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', maxWidth: 300 }}>
          {errorMsg}
        </p>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', marginTop: '12px' }}>
          Redirecting back to sign in…
        </p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <img src="/logo-full.svg" alt="TREDIO" style={{ height: '28px', marginBottom: '24px' }} />
      <div style={spinnerStyle} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '16px' }}>
        Completing sign in…
      </p>
    </div>
  );
}

const containerStyle = {
  minHeight: '100vh',
  background: '#080B12',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '4px',
  padding: '24px',
};

const spinnerStyle = {
  width: 28, height: 28,
  border: '3px solid rgba(245,158,11,0.3)',
  borderTopColor: '#F59E0B',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};