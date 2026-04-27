import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

// Handles the redirect back from Google/Apple OAuth.
// Base44 lands the user here with ?access_token=... after a successful OAuth flow.
export default function OAuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handle = async () => {
      try {
        // Base44 may embed the token in the URL params or hash
        const params = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
        const token = params.get('access_token') || params.get('token') ||
                      hashParams.get('access_token') || hashParams.get('token');

        if (token) {
          localStorage.setItem('base44_access_token', token);
        }

        // Fetch the user — if token is already stored by Base44 SDK this will work even without explicit token
        const user = await base44.auth.me();
        if (!user) {
          navigate('/SignIn', { replace: true });
          return;
        }

        // Initialize profile defaults for new OAuth users
        const updates = {};
        if (!user.broker_status) updates.broker_status = 'not_connected';
        if (!user.trading_mode) updates.trading_mode = 'practice';
        if (!user.referral_code) updates.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
        if (!user.subscription_tier) updates.subscription_tier = 'free';
        if (Object.keys(updates).length > 0) {
          await base44.auth.updateMe(updates).catch(() => {});
        }

        // New users (onboarding_completed === false) → Onboarding
        // Existing users (true or undefined) → Home
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
      <div style={{
        minHeight: '100vh', background: '#080B12',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '12px',
      }}>
        <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Redirecting to sign in...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080B12',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '16px',
    }}>
      <img src="/logo-full.svg" alt="TREDIO" style={{ height: '32px' }} />
      <div style={{
        width: 28, height: 28,
        border: '3px solid #F59E0B',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}