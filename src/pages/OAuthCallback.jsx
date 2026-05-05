import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

/**
 * OAuthCallback — https://tredio.app/auth/callback
 *
 * CRITICAL: This page runs inside SFSafariViewController on iOS native.
 * window.Capacitor is UNDEFINED here — we CANNOT detect native vs web.
 *
 * RULE: Always fire tredio:// redirect when we have a token.
 * On native: iOS intercepts tredio://, closes SVC, fires appUrlOpen → useOAuthDeepLink handles login.
 * On web: tredio:// is ignored after ~600ms → fall through to direct web login.
 *
 * NEVER render /Home or /Onboarding from this page on native.
 * The dashboard must open inside the real app WebView, not the SVC.
 */

// ── Read token at module parse time (before app-params.js can strip the URL) ──
const _rawSearch = typeof window !== 'undefined' ? window.location.search : '';
const _rawHash   = typeof window !== 'undefined' ? window.location.hash : '';
const _urlParams  = new URLSearchParams(_rawSearch);
const _hashParams = new URLSearchParams(_rawHash.replace(/^#\??/, ''));

// app-params.js may have already stripped ?access_token and saved to localStorage
const _storedToken = typeof window !== 'undefined'
  ? (localStorage.getItem('base44_access_token') || sessionStorage.getItem('base44_access_token'))
  : null;

const _moduleToken =
  _urlParams.get('access_token') ||
  _urlParams.get('token') ||
  _hashParams.get('access_token') ||
  _hashParams.get('token') ||
  (_storedToken && !_storedToken.includes('undefined') ? _storedToken : null);

// ── Always fire tredio:// immediately when token is available ──────────────────
// On native iOS: SFSafariViewController intercepts this, closes itself, fires appUrlOpen.
// On web: silently ignored, we fall through to web login below.
if (_moduleToken && typeof window !== 'undefined') {
  const schemeUrl = `tredio://auth/callback?access_token=${encodeURIComponent(_moduleToken)}`;
  console.log('[OAuthCallback] Firing tredio:// redirect');
  window.location.href = schemeUrl;
}

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [errorMsg, setErrorMsg] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const handle = async () => {
      const params     = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#\??/, ''));

      // Diagnostic (values redacted)
      const storedForDiag = localStorage.getItem('base44_access_token') || sessionStorage.getItem('base44_access_token');
      const diag = {
        search:           window.location.search.replace(/([?&])(access_token|token)=[^&]*/gi, '$1$2=[REDACTED]'),
        hash:             window.location.hash.replace(/([#&])(access_token|token)=[^&]*/gi, '$1$2=[REDACTED]'),
        searchKeys:       [...params.keys()],
        hashKeys:         [...hashParams.keys()],
        moduleToken:      !!_moduleToken,
        storedToken:      storedForDiag ? `[SET:${storedForDiag.length}]` : '(empty)',
      };
      console.log('[OAuthCallback] diagnostic:', JSON.stringify(diag));
      setDebugInfo(diag);

      const oauthError = params.get('error') || hashParams.get('error');
      if (oauthError) {
        setErrorMsg(`Sign in failed: ${params.get('error_description') || oauthError}`);
        setStatus('error');
        return;
      }

      const storedToken = localStorage.getItem('base44_access_token') || sessionStorage.getItem('base44_access_token');
      const validStored = storedToken && !storedToken.includes('undefined') ? storedToken : null;

      const token =
        _moduleToken ||
        params.get('access_token') ||
        params.get('token') ||
        hashParams.get('access_token') ||
        hashParams.get('token') ||
        validStored;

      if (!token) {
        setErrorMsg('No authentication token received. Please try again.');
        setStatus('error');
        return;
      }

      // Re-fire tredio:// in case module-level ran before React hydrated
      // On native: if iOS hasn't intercepted yet, this gives another chance.
      // On web: ignored → we continue below after 700ms.
      window.location.href = `tredio://auth/callback?access_token=${encodeURIComponent(token)}`;
      await new Promise(r => setTimeout(r, 700));

      // ── WEB-ONLY fallback (native would have exited via tredio:// above) ──────
      if (base44.auth.setToken) base44.auth.setToken(token);
      localStorage.setItem('base44_access_token', token);
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token);
      sessionStorage.setItem('base44_access_token', token);

      await new Promise(r => setTimeout(r, 300));

      const user = await base44.auth.me();
      if (!user) {
        setErrorMsg('Session could not be established. Please try again.');
        setStatus('error');
        return;
      }

      // Init profile defaults for new OAuth users
      const updates = {};
      if (!user.broker_status) updates.broker_status = 'not_connected';
      if (!user.trading_mode) updates.trading_mode = 'practice';
      if (!user.referral_code) updates.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
      if (!user.subscription_tier) updates.subscription_tier = 'free';
      if (Object.keys(updates).length > 0) await base44.auth.updateMe(updates).catch(() => {});

      navigate(user.onboarding_completed === false ? '/Onboarding' : '/Home', { replace: true });
    };

    handle();
  }, [navigate]);

  if (status === 'error') {
    return (
      <div style={{ ...containerStyle, alignItems: 'flex-start', overflowY: 'auto' }}>
        <img src="/logo-full.svg" alt="TREDIO" style={{ height: '24px', marginBottom: '16px', alignSelf: 'center' }} />
        <p style={{ color: '#ef4444', fontSize: '13px', textAlign: 'center', width: '100%', marginBottom: '16px' }}>
          {errorMsg}
        </p>
        {debugInfo && (
          <div style={{
            width: '100%', background: 'rgba(14,200,220,0.06)', border: '1px solid rgba(14,200,220,0.2)',
            borderRadius: '10px', padding: '12px', fontSize: '10px', fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all',
          }}>
            <div style={{ color: '#0ec8dc', fontWeight: 'bold', marginBottom: '8px' }}>📋 CALLBACK DIAGNOSTIC</div>
            {Object.entries(debugInfo).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: '6px', marginBottom: '3px' }}>
                <span style={{ color: 'rgba(14,200,220,0.6)', minWidth: '110px', flexShrink: 0 }}>{k}:</span>
                <span style={{ color: v === true || (typeof v === 'string' && v.startsWith('[SET')) ? '#22c55e' : 'rgba(255,255,255,0.6)' }}>
                  {Array.isArray(v) ? v.join(', ') || '(none)' : String(v)}
                </span>
              </div>
            ))}
          </div>
        )}
        <button
          onClick={() => navigate('/SignIn', { replace: true })}
          style={{
            marginTop: '16px', alignSelf: 'center', padding: '10px 24px',
            background: 'rgba(14,200,220,0.15)', border: '1px solid rgba(14,200,220,0.3)',
            borderRadius: '8px', color: '#0ec8dc', fontSize: '13px', cursor: 'pointer',
          }}
        >
          Back to Sign In
        </button>
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
  minHeight: '100vh', background: '#080B12',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  flexDirection: 'column', gap: '4px', padding: '24px',
};

const spinnerStyle = {
  width: 28, height: 28,
  border: '3px solid rgba(245,158,11,0.3)', borderTopColor: '#F59E0B',
  borderRadius: '50%', animation: 'spin 0.8s linear infinite',
};