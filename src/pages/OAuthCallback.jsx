import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Browser } from '@capacitor/browser';

// Handles the redirect back from Google/Apple OAuth (web flow).
// On native, the deep-link is handled by SignIn's appUrlOpen listener instead.
// This page is only hit on web or if the in-app browser redirects to it.
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handle = async () => {
      try {
        // Close any open in-app browser sheet (no-op if already closed)
        await Browser.close().catch(() => {});

        // Extract token from URL params or hash
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const token =
          params.get('access_token') || params.get('token') ||
          hashParams.get('access_token') || hashParams.get('token');

        if (token) {
          localStorage.setItem('base44_access_token', token);
        }

        // Fetch user — SDK picks up the token from localStorage
        const user = await base44.auth.me();
        if (!user) {
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

        const needsOnboarding = user.onboarding_completed === false;
        navigate(needsOnboarding ? '/Onboarding' : '/Home', { replace: true });
      } catch (err) {
        setError('Sign in failed. Please try again.');
        setTimeout(() => navigate('/SignIn', { replace: true }), 2500);
      }
    };

    handle();
  }, [navigate]);

  if (error) {
    return (
      <div style={containerStyle}>
        <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '8px' }}>Redirecting…</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <img src="/logo-full.svg" alt="TREDIO" style={{ height: '32px', marginBottom: '20px' }} />
      <div style={spinnerStyle} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const containerStyle = {
  minHeight: '100vh', background: '#080B12',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexDirection: 'column', gap: '8px',
};

const spinnerStyle = {
  width: 28, height: 28,
  border: '3px solid #F59E0B',
  borderTopColor: 'transparent',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};