import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

/**
 * OAuthCallback — https://tredio.app/auth/callback
 *
 * CRITICAL: This page runs inside SFSafariViewController on iOS native.
 * window.Capacitor is UNDEFINED here — cannot detect native context.
 *
 * The token arrives as ?access_token=xxx in the URL.
 * app-params.js consumes it on import, so we must read it from localStorage
 * (where app-params saved it) OR from the raw URL before app-params runs.
 *
 * NATIVE flow:
 *   Base44 → https://tredio.app/auth/callback?access_token=xxx
 *   → This page fires: window.location.href = tredio://auth/callback?access_token=xxx
 *   → iOS intercepts tredio://, closes SVC, fires Capacitor appUrlOpen
 *   → useOAuthDeepLink handles the rest
 *
 * WEB flow:
 *   tredio:// is ignored by desktop browsers → falls through to direct login
 */

// ── STEP 0: Fire tredio:// redirect SYNCHRONOUSLY at module parse time ────────
// This runs before React mounts, before app-params strips the URL.
// On native iOS inside SFSafariViewController: iOS intercepts immediately.
// On web: custom scheme is silently ignored.
const _rawSearch = typeof window !== 'undefined' ? window.location.search : '';
const _rawHash = typeof window !== 'undefined' ? window.location.hash : '';
const _urlParams = new URLSearchParams(_rawSearch);
const _hashParams = new URLSearchParams(_rawHash.replace(/^#\??/, ''));

const _moduleToken =
  _urlParams.get('access_token') ||
  _urlParams.get('token') ||
  _hashParams.get('access_token') ||
  _hashParams.get('token');

// Also capture any extra params to forward (state, is_new_user, etc.)
const _extraParams = new URLSearchParams();
for (const [k, v] of _urlParams.entries()) {
  if (k !== 'access_token' && k !== 'token') _extraParams.set(k, v);
}

if (_moduleToken && typeof window !== 'undefined') {
  const schemeUrl = `tredio://auth/callback?access_token=${encodeURIComponent(_moduleToken)}${_extraParams.toString() ? '&' + _extraParams.toString() : ''}`;
  console.log('[OAuthCallback] Module-level tredio:// redirect firing');
  // Primary: window.location — iOS SFSafariViewController intercepts this instantly
  window.location.href = schemeUrl;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [errorMsg, setErrorMsg] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    const handle = async () => {
      // On native iOS: if we got here, SVC was already closed by the module-level redirect.
      // The web fallback handles the rest.

      // Re-read URL (app-params.js may have stripped ?access_token already)
      const params = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#\??/, ''));

      const searchKeys = [...params.keys()];
      const hashKeys = [...hashParams.keys()];

      // Diagnostic snapshot (values redacted for security)
      const diagSnapshot = {
        search: window.location.search.replace(/([?&])(access_token|token|code|id_token)=[^&]*/gi, '$1$2=[REDACTED]'),
        hash: window.location.hash.replace(/([#&])(access_token|token|code|id_token)=[^&]*/gi, '$1$2=[REDACTED]'),
        searchKeys,
        hashKeys,
        moduleToken: !!_moduleToken,
        hasAccessToken: params.has('access_token') || hashParams.has('access_token') || !!_moduleToken,
        hasCode: params.has('code') || hashParams.has('code'),
      };
      console.log('[OAuthCallback] effect diagnostic:', JSON.stringify(diagSnapshot));
      setDebugInfo(diagSnapshot);

      const oauthError = params.get('error') || hashParams.get('error');
      if (oauthError) {
        const desc = params.get('error_description') || oauthError;
        setErrorMsg(`Sign in failed: ${desc}`);
        setStatus('error');
        return;
      }

      // Token: use module-level capture (before app-params strips it) or fallback
      const token =
        _moduleToken ||
        params.get('access_token') ||
        params.get('token') ||
        hashParams.get('access_token') ||
        hashParams.get('token');

      if (!token) {
        setErrorMsg('No authentication token received.');
        setStatus('error');
        return;
      }

      // ── WEB fallback: if still here after 600ms, tredio:// was ignored (web browser)
      // Re-fire the scheme redirect just in case (belt & suspenders for edge cases)
      const schemeUrl = `tredio://auth/callback?access_token=${encodeURIComponent(token)}`;
      window.location.href = schemeUrl;
      await new Promise(r => setTimeout(r, 600));

      // ── Web session handling ──────────────────────────────────────────────
      localStorage.setItem('base44_access_token', token);
      localStorage.setItem('token', token);
      sessionStorage.setItem('base44_access_token', token);
      if (base44.auth.setToken) base44.auth.setToken(token);

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
            width: '100%', background: 'rgba(14,200,220,0.06)',
            border: '1px solid rgba(14,200,220,0.2)', borderRadius: '10px',
            padding: '12px', fontSize: '10px', fontFamily: 'monospace',
            color: 'rgba(255,255,255,0.7)', wordBreak: 'break-all',
          }}>
            <div style={{ color: '#0ec8dc', fontWeight: 'bold', marginBottom: '8px', fontSize: '11px' }}>
              📋 CALLBACK DIAGNOSTIC
            </div>
            <DiagRow label="search" value={debugInfo.search || '(empty)'} />
            <DiagRow label="hash" value={debugInfo.hash || '(empty)'} />
            <DiagRow label="searchKeys" value={debugInfo.searchKeys.join(', ') || '(none)'} />
            <DiagRow label="hashKeys" value={debugInfo.hashKeys.join(', ') || '(none)'} />
            <DiagRow label="moduleToken" value={String(debugInfo.moduleToken)} highlight={debugInfo.moduleToken} />
            <DiagRow label="hasAccessToken" value={String(debugInfo.hasAccessToken)} highlight={debugInfo.hasAccessToken} />
            <DiagRow label="hasCode" value={String(debugInfo.hasCode)} highlight={debugInfo.hasCode} />
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

function DiagRow({ label, value, highlight }) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
      <span style={{ color: 'rgba(14,200,220,0.6)', minWidth: '110px', flexShrink: 0 }}>{label}:</span>
      <span style={{ color: highlight ? '#22c55e' : 'rgba(255,255,255,0.6)' }}>{value}</span>
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