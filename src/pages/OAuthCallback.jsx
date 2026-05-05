import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';

/**
 * OAuthCallback
 *
 * This page runs at https://tredio.app/auth/callback
 *
 * CRITICAL: When opened inside SFSafariViewController (iOS native), window.Capacitor
 * is UNDEFINED — we cannot detect "native" from within the SVC. Therefore:
 *
 * Strategy: Always try tredio:// redirect first (works on native SVC).
 *           If it fails (web browser won't open custom schemes silently),
 *           fall through to direct web handling.
 *
 * iOS native flow:
 *   Provider → https://tredio.app/auth/callback?access_token=xxx
 *   → This page redirects to: tredio://auth/callback?access_token=xxx
 *   → iOS intercepts tredio://, closes SVC, fires Capacitor appUrlOpen
 *   → useOAuthDeepLink in App.jsx handles the rest
 *
 * Web flow:
 *   Provider → https://tredio.app/auth/callback?access_token=xxx
 *   → tredio:// redirect is ignored by browser (no-op)
 *   → After 500ms timeout, falls through to direct web session handling
 */
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const handle = async () => {
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace('#', '').replace('?', ''));

      // Check for provider error
      const oauthError = params.get('error') || hashParams.get('error');
      if (oauthError) {
        const desc = params.get('error_description') || hashParams.get('error_description') || oauthError;
        setErrorMsg(`Sign in was cancelled or failed: ${desc}`);
        setStatus('error');
        setTimeout(() => navigate('/SignIn', { replace: true }), 3000);
        return;
      }

      // CRITICAL: app-params.js strips ?access_token from the URL via history.replaceState
      // on module import (before this component mounts). Read from appParams.token first,
      // then fall back to raw URL params for any edge cases.
      const token =
        appParams.token ||
        params.get('access_token') ||
        params.get('token') ||
        hashParams.get('access_token') ||
        hashParams.get('token');

      console.log('[OAuthCallback] token source:', appParams.token ? 'appParams' : 'url params', '| has token:', !!token);

      if (!token) {
        setErrorMsg('No authentication token received. Please try again.');
        setStatus('error');
        setTimeout(() => navigate('/SignIn', { replace: true }), 3000);
        return;
      }

      // ── STEP 1: Always attempt tredio:// redirect ─────────────────────────
      // This is the ONLY way to communicate back to the WKWebView from SVC.
      // On native iOS: iOS intercepts this, closes SVC, fires appUrlOpen.
      // On web: browser ignores custom schemes (no-op), we continue below.
      const redirectParams = new URLSearchParams();
      redirectParams.set('access_token', token);

      // Forward any extra params (state, scope, etc.)
      for (const [key, value] of params.entries()) {
        if (key !== 'access_token' && key !== 'token') {
          redirectParams.set(key, value);
        }
      }

      const schemeUrl = `tredio://auth/callback?${redirectParams.toString()}`;
      console.log('[OAuthCallback] Redirecting to custom scheme:', schemeUrl.split('?')[0]);

      // Use both techniques to maximize reliability on iOS SFSafariViewController:
      // 1. iframe src trick (fires synchronously, works even if page is unloading)
      // 2. window.location.href as fallback
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = schemeUrl;
        document.body.appendChild(iframe);
        setTimeout(() => document.body.removeChild(iframe), 500);
      } catch (_) {}
      window.location.href = schemeUrl;

      // ── STEP 2: Web fallback ──────────────────────────────────────────────
      // On iOS native: the page is gone (SVC closed), this code never runs.
      // On web: custom scheme redirect is a no-op, we handle auth here.
      await new Promise(r => setTimeout(r, 800));

      // Persist token
      localStorage.setItem('base44_access_token', token);
      localStorage.setItem('token', token);
      sessionStorage.setItem('base44_access_token', token);

      // Let SDK pick it up
      if (base44.auth.setToken) {
        base44.auth.setToken(token);
      }

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