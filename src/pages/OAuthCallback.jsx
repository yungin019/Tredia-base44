import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

// This page handles the OAuth redirect for WEB flows only.
// On iOS native, the appUrlOpen listener in App.jsx intercepts the Universal Link
// before this page is ever rendered in the SFSafariViewController — so this page
// acts as a safety net for web browsers and any edge cases.
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // 'processing' | 'error'
  const [errorDetail, setErrorDetail] = useState('');

  useEffect(() => {
    const handle = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));

        // Check for OAuth error from provider
        const oauthError = params.get('error') || hashParams.get('error');
        if (oauthError) {
          const desc = params.get('error_description') || hashParams.get('error_description') || oauthError;
          console.error('[OAuthCallback] Provider returned error:', oauthError, desc);
          setErrorDetail(`Provider error: ${desc}`);
          setStatus('error');
          setTimeout(() => navigate('/SignIn', { replace: true }), 3000);
          return;
        }

        // Extract token from URL params or hash fragment
        const token =
          params.get('access_token') || params.get('token') ||
          hashParams.get('access_token') || hashParams.get('token');

        if (token) {
          console.log('[OAuthCallback] Token found in URL, persisting...');
          localStorage.setItem('base44_access_token', token);
          localStorage.setItem('token', token);
        } else {
          console.log('[OAuthCallback] No token in URL — SDK may have session cookie already');
        }

        // Give SDK a moment to pick up the token
        await new Promise(r => setTimeout(r, 300));

        const user = await base44.auth.me();
        if (!user) {
          console.error('[OAuthCallback] base44.auth.me() returned null after OAuth callback');
          setErrorDetail('Session not established. Please try signing in again.');
          setStatus('error');
          setTimeout(() => navigate('/SignIn', { replace: true }), 3000);
          return;
        }

        console.log('[OAuthCallback] User authenticated:', user.email);

        // Init profile defaults for new OAuth users
        const updates = {};
        if (!user.broker_status) updates.broker_status = 'not_connected';
        if (!user.trading_mode) updates.trading_mode = 'practice';
        if (!user.referral_code) updates.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
        if (!user.subscription_tier) updates.subscription_tier = 'free';
        if (Object.keys(updates).length > 0) {
          await base44.auth.updateMe(updates).catch(e => console.warn('[OAuthCallback] Profile init partial error:', e.message));
        }

        const needsOnboarding = user.onboarding_completed === false;
        navigate(needsOnboarding ? '/Onboarding' : '/Home', { replace: true });
      } catch (err) {
        console.error('[OAuthCallback] Unhandled error:', err.message, err.stack);
        setErrorDetail(err.message || 'Unknown error during sign-in');
        setStatus('error');
        setTimeout(() => navigate('/SignIn', { replace: true }), 3000);
      }
    };

    handle();
  }, [navigate]);

  if (status === 'error') {
    return (
      <div style={containerStyle}>
        <img src="/logo-full.svg" alt="TREDIO" style={{ height: '28px', marginBottom: '24px' }} />
        <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center', maxWidth: 300 }}>
          Sign in failed
        </p>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', textAlign: 'center', maxWidth: 300, marginTop: '6px' }}>
          {errorDetail}
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