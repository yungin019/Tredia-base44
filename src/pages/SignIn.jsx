import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { useTranslation } from 'react-i18next';
import { Browser } from '@capacitor/browser';

const isNative = () => !!(window.Capacitor?.isNativePlatform?.());

// iPad uses fullscreen presentation; iPhone uses popover (bottom sheet)
const getPresStyle = () => {
  const isIPad =
    /iPad/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ||
    (isNative() && window.innerWidth >= 768);
  return isIPad ? 'fullscreen' : 'popover';
};

// ─── OAuth URLs ────────────────────────────────────────────────────────────────
// The Base44 SDK's loginWithProvider() does window.location redirect (web only).
// On native, we must construct the URL ourselves and open it in Browser.open().
//
// SDK source (auth.js) builds:
//   Google: {serverUrl}/api/apps/auth/login?app_id={appId}&from_url=...
//   Apple:  {serverUrl}/api/apps/auth/apple/login?app_id={appId}&from_url=...
// serverUrl defaults to https://base44.app (NOT app.base44.com, NOT tredio.app)
//
// HTTPS callback (Apple and Google both require HTTPS return URLs):
const OAUTH_CALLBACK_URL = 'https://tredio.app/auth/callback';
const BASE44_SERVER = 'https://base44.app';

const getProviderUrl = (provider) => {
  const appId = appParams.appId || '69b8062cb434d7411d225f06';
  // Mirror exactly what loginWithProvider() does internally:
  // Google → /api/apps/auth/login
  // Apple  → /api/apps/auth/apple/login
  const providerPath = provider === 'google' ? '' : `/${provider}`;
  const authPath = `/api/apps/auth${providerPath}/login`;
  return `${BASE44_SERVER}${authPath}?app_id=${appId}&from_url=${encodeURIComponent(OAUTH_CALLBACK_URL)}`;
};

export default function SignIn({ onLoginSuccess }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const accountDeleted = new URLSearchParams(window.location.search).get('deleted') === '1';

  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'verify' | 'forgot'
  const [verifyCode, setVerifyCode] = useState('');
  const [nativeErrorDetail, setNativeErrorDetail] = useState(''); // iOS/iPad only: full technical error
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const startTimeout = (ms = 60000) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError(t('signin.error.timeout', 'Sign in timed out. Please try again.'));
    }, ms);
  };

  const stopTimeout = () => clearTimeout(timeoutRef.current);

  // Initialize profile defaults after login
  const initProfile = async () => {
    try {
      const u = await base44.auth.me();
      if (!u) return false;
      const updates = {};
      if (!u.broker_status) updates.broker_status = 'not_connected';
      if (!u.trading_mode) updates.trading_mode = 'practice';
      if (!u.referral_code) updates.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
      if (!u.subscription_tier) updates.subscription_tier = 'free';
      if (Object.keys(updates).length > 0) await base44.auth.updateMe(updates);
      return u.onboarding_completed === false;
    } catch (e) {
      console.warn('[SignIn] initProfile error:', e.message);
    }
    return false;
  };

  // After email/password auth success: init profile, notify parent, navigate
  const handleAuthSuccess = async () => {
    try {
      const needsOnboarding = await initProfile();
      if (onLoginSuccess) await onLoginSuccess();
      navigate(needsOnboarding ? '/Onboarding' : '/Home', { replace: true });
    } catch (err) {
      console.error('[SignIn] handleAuthSuccess error:', err.message);
      const msg = err?.message || '';
      const isAuthWall = msg.toLowerCase().includes('must be logged in') || msg.toLowerCase().includes('not logged in') || msg.toLowerCase().includes('unauthorized');
      setError(isAuthWall ? t('common.error', 'Something went wrong. Please try again.') : msg || t('common.error', 'Something went wrong'));
    } finally {
      stopTimeout();
      setLoading(false);
    }
  };

  // ─── EMAIL / PASSWORD ──────────────────────────────────────────────────────
  // ─── DEMO ACCOUNT FAST-PATH ───────────────────────────────────────────────
  // trediodemo@outlook.com gets direct login + elite access, no verification.
  const DEMO_EMAIL = 'trediodemo@outlook.com';
  const DEMO_PASS  = 'trediotest2026';
  const [demoDebug, setDemoDebug] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim()) { setError(t('signin.error.nameRequired', 'Please enter your name')); return; }
      if (password.length < 8) { setError(t('signin.error.weakPassword', 'Password must be at least 8 characters')); return; }
      if (password !== confirmPassword) { setError(t('signin.error.passwordMismatch', 'Passwords do not match')); return; }
    }

    setLoading(true);
    startTimeout(30000);

    const isDemo = email.trim().toLowerCase() === DEMO_EMAIL && password === DEMO_PASS;

    try {
      if (mode === 'register' && !isDemo) {
        await base44.auth.register({ email, password });
        stopTimeout();
        setLoading(false);
        setStep('verify');
      } else {
        let result;
        try {
          result = await base44.auth.loginViaEmailPassword(email, password);
        } catch (loginErr) {
          // Show raw error for demo account to help diagnose TestFlight issues
          if (isDemo) {
            setDemoDebug({
              phase: 'loginViaEmailPassword',
              message: loginErr.message,
              code: loginErr.code,
              status: loginErr.status,
              name: loginErr.name,
              raw: String(loginErr),
            });
          }
          throw loginErr;
        }

        const token = result?.access_token || result?.token;

        // For demo: capture result shape
        if (isDemo) {
          setDemoDebug({
            phase: 'loginResult',
            resultKeys: Object.keys(result || {}),
            hasToken: !!token,
            tokenLength: token?.length,
          });
        }

        if (token) {
          localStorage.setItem('base44_access_token', token);
          localStorage.setItem('token', token);
          sessionStorage.setItem('base44_access_token', token);
        }
        // Double-check session before navigating (fixes iPad login loop)
        let verifiedUser = null;
        try {
          verifiedUser = await base44.auth.me();
        } catch (_) {
          await new Promise(r => setTimeout(r, 500));
          verifiedUser = await base44.auth.me();
        }
        if (!verifiedUser) throw new Error('Session could not be verified. Please try again.');

        // For demo account: ensure elite access is configured
        if (isDemo) {
          try {
            await base44.functions.invoke('setupDemoAccount', {});
          } catch (_) {}
        }

        await handleAuthSuccess();
      }
    } catch (err) {
      stopTimeout();
      setLoading(false);
      console.error('[SignIn] Email login error:', JSON.stringify({ message: err.message, code: err.code, status: err.status }));
      // Show raw error for ALL users — helps diagnose TestFlight issues
      const msg = err?.message || '';
      setError(msg || t('signin.error.invalidCredentials', 'Invalid email or password. Please try again.'));
    }
  };

  // ─── EMAIL VERIFY ──────────────────────────────────────────────────────────
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    startTimeout(30000);
    try {
      await base44.auth.verifyOtp({ email, otpCode: verifyCode });
      const verifyResult = await base44.auth.loginViaEmailPassword(email, password);
      const verifyToken = verifyResult?.access_token || verifyResult?.token;
      if (verifyToken) {
        localStorage.setItem('base44_access_token', verifyToken);
        localStorage.setItem('token', verifyToken);
      }
      if (name) {
        await base44.auth.updateMe({ full_name: name }).catch(() => {});
      }
      await handleAuthSuccess();
    } catch (err) {
      stopTimeout();
      setLoading(false);
      console.error('[SignIn] OTP verify error:', err.message);
      const msg = err?.message || '';
      const isAuthWall = msg.toLowerCase().includes('must be logged in') || msg.toLowerCase().includes('not logged in') || msg.toLowerCase().includes('unauthorized');
      setError(isAuthWall ? t('signin.error.invalidCode', 'Invalid verification code.') : msg || t('signin.error.invalidCode', 'Invalid verification code.'));
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try { await base44.auth.resendOtp(email); } catch (_) {}
  };

  // ─── FORGOT PASSWORD ───────────────────────────────────────────────────────
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.requestPasswordReset(forgotEmail);
      setForgotSent(true);
    } catch (err) {
      setError(err?.message || 'Could not send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Native OAuth helpers ──────────────────────────────────────────────────
  // On native iOS, after Browser.open() the SFSafariViewController handles auth.
  // useOAuthDeepLink fires 'oauth_callback_received' when it gets the tredio:// callback.
  // We listen for that event to clear the loading state in SignIn.jsx.
  const openNativeOAuth = async (provider) => {
    setError('');
    setNativeErrorDetail('');
    setLoading(true);

    // Shared handle so both listeners can clean each other up
    let browserFinishedHandle = null;

    // Listen for callback — fires when useOAuthDeepLink receives tredio:// URL
    const onCallback = () => {
      stopTimeout();
      setLoading(false);
      window.removeEventListener('oauth_callback_received', onCallback);
      browserFinishedHandle?.remove?.();
    };
    window.addEventListener('oauth_callback_received', onCallback);

    // Also clear loading if Browser closes without a callback (user cancelled)
    const onBrowserFinished = () => {
      // Give useOAuthDeepLink 1s to fire the oauth_callback_received event first
      setTimeout(() => {
        stopTimeout();
        setLoading(false);
        window.removeEventListener('oauth_callback_received', onCallback);
        browserFinishedHandle?.remove?.();
      }, 1000);
    };
    Browser.addListener('browserFinished', onBrowserFinished)
      .then(h => { browserFinishedHandle = h; })
      .catch(() => {});

    try {
      const oauthUrl = getProviderUrl(provider);
      console.log(`[SignIn:${provider}] Opening SFSafariViewController:`, oauthUrl.split('?')[0]);
      await Browser.open({
        url: oauthUrl,
        presentationStyle: getPresStyle(),
        toolbarColor: '#080B12',
      });
      startTimeout(120000);
    } catch (err) {
      stopTimeout();
      setLoading(false);
      window.removeEventListener('oauth_callback_received', onCallback);
      const detail = `${provider} OAuth: ${err.message} (code=${err.code ?? 'n/a'})`;
      console.error(`[SignIn:${provider}] Error:`, detail);
      setError(`${provider === 'apple' ? 'Apple' : 'Google'} Sign In failed. Please try email instead.`);
      setNativeErrorDetail(detail);
    }
  };

  // ─── GOOGLE SIGN IN ────────────────────────────────────────────────────────
  const handleGoogle = async () => {
    if (isNative()) {
      await openNativeOAuth('google');
    } else {
      base44.auth.loginWithProvider('google', OAUTH_CALLBACK_URL);
    }
  };

  // ─── APPLE SIGN IN ─────────────────────────────────────────────────────────
  const handleApple = async () => {
    if (isNative()) {
      await openNativeOAuth('apple');
    } else {
      base44.auth.loginWithProvider('apple', OAUTH_CALLBACK_URL);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(14, 50, 90, 0.35) 0%, transparent 70%), linear-gradient(180deg, #040d1e 0%, #030810 60%, #020608 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 'calc(24px + env(safe-area-inset-top))',
      paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
      paddingLeft: 'calc(24px + env(safe-area-inset-left))',
      paddingRight: 'calc(24px + env(safe-area-inset-right))',
      overflowY: 'auto',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '420px', margin: '0 auto' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo-icon.svg" alt="TREDIO" style={{ height: '52px', width: '52px', margin: '0 auto 12px' }} />
          <img src="/logo-full.svg" alt="TREDIO" style={{ height: '32px', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '11px', color: 'rgba(100,220,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            {t('signin.subtitle', 'Your AI Trading Studio')}
          </div>
        </div>

        {/* Account deleted banner */}
        {accountDeleted && (
          <div style={{
            background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
            borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
            fontSize: '13px', color: '#22c55e', textAlign: 'center',
          }}>
            ✓ {t('signin.accountDeleted', 'Your account has been permanently deleted.')}
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'rgba(8, 16, 36, 0.55)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(100, 220, 255, 0.09)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(100,220,255,0.06)',
        }}>
          <AnimatePresence mode="wait">

            {/* FORGOT PASSWORD STEP */}
            {step === 'forgot' ? (
              <motion.div key="forgot" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔑</div>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                    Reset your password
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                    {forgotSent ? 'Check your inbox for a reset link.' : "Enter your email and we'll send you a reset link."}
                  </p>
                </div>
                {forgotSent ? (
                  <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: '12px', color: '#22c55e', fontSize: '13px' }}>
                    ✓ Reset link sent to <strong>{forgotEmail}</strong>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      required
                      autoFocus
                      style={inputStyle}
                    />
                    {error && <div style={errorStyle}>{error}</div>}
                    <button type="submit" disabled={loading || !forgotEmail} style={{
                      ...submitBtnStyle,
                      opacity: (loading || !forgotEmail) ? 0.6 : 1,
                      cursor: (loading || !forgotEmail) ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    }}>
                      {loading && <Spinner />}
                      {loading ? 'Sending…' : 'Send Reset Link'}
                    </button>
                  </form>
                )}
                <button
                  onClick={() => { setStep('form'); setError(''); setForgotSent(false); setForgotEmail(''); }}
                  style={{ width: '100%', padding: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', marginTop: '8px' }}
                >
                  ← Back to Sign In
                </button>
              </motion.div>
            ) : step === 'verify' ? (

              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                    {t('signin.verifyTitle', 'Check your email')}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                    {t('signin.verifySubtitle', 'We sent a verification code to')}<br />
                    <span style={{ color: '#F59E0B', fontWeight: '600' }}>{email}</span>
                  </p>
                </div>
                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder={t('signin.verifyCodePlaceholder', 'Enter verification code')}
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value)}
                    required
                    autoFocus
                    style={{ ...inputStyle, textAlign: 'center', fontSize: '18px', letterSpacing: '4px', fontWeight: '700' }}
                  />
                  {error && <div style={errorStyle}>{error}</div>}
                  <button type="submit" disabled={loading || !verifyCode} style={{
                    ...submitBtnStyle,
                    opacity: (loading || !verifyCode) ? 0.6 : 1,
                    cursor: (loading || !verifyCode) ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}>
                    {loading && <Spinner />}
                    {loading ? t('common.loading', 'Loading...') : t('signin.verifyBtn', 'Verify & Sign In')}
                  </button>
                </form>
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => { setStep('form'); setError(''); setVerifyCode(''); }}
                    style={{ flex: 1, padding: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer' }}
                  >
                    ← {t('common.back', 'Back')}
                  </button>
                  <button
                    onClick={handleResendOtp}
                    style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer' }}
                  >
                    {t('signin.resendCode', 'Resend code')}
                  </button>
                </div>
              </motion.div>
            ) : (

            /* MAIN FORM STEP */
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Tab Toggle */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(14,200,220,0.05)', border: '1px solid rgba(14,200,220,0.1)', borderRadius: '12px', padding: '4px' }}>
                {['login', 'register'].map(m => (
                  <button key={m}
                    onClick={() => { setMode(m); setError(''); }}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '9px', fontSize: '13px', fontWeight: '700',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                      background: mode === m ? 'rgba(14,200,220,0.18)' : 'transparent',
                      color: mode === m ? 'rgb(120,230,245)' : 'rgba(255,255,255,0.35)',
                      boxShadow: mode === m ? '0 0 10px rgba(14,200,220,0.15)' : 'none',
                    }}>
                    {m === 'login' ? t('signin.signIn', 'Sign In') : t('signin.register', 'Register')}
                  </button>
                ))}
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mode === 'register' && (
                  <input
                    type="text"
                    placeholder={t('signin.fullName', 'Full Name')}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoComplete="name"
                    style={inputStyle}
                  />
                )}
                <input
                  type="email"
                  placeholder={t('signin.enterEmail', 'Email address')}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder={t('signin.password', 'Password')}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  style={inputStyle}
                />
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setStep('forgot'); setForgotEmail(email); setError(''); }}
                    style={{ background: 'none', border: 'none', color: 'rgba(14,200,220,0.6)', fontSize: '12px', cursor: 'pointer', textAlign: 'right', padding: '0', alignSelf: 'flex-end' }}
                  >
                    Forgot password?
                  </button>
                )}
                {mode === 'register' && (
                  <input
                    type="password"
                    placeholder={t('signin.confirmPassword', 'Confirm password')}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    style={inputStyle}
                  />
                )}

                {error && <div style={errorStyle}>{error}</div>}

                {/* Demo debug panel — visible when demo login fails */}
                {demoDebug && (
                  <div style={{
                    padding: '10px 12px', background: 'rgba(245,158,11,0.07)',
                    border: '1px solid rgba(245,158,11,0.25)', borderRadius: '8px',
                    fontSize: '10px', fontFamily: 'monospace', color: 'rgba(245,158,11,0.9)',
                    wordBreak: 'break-all',
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>🔍 DEMO DEBUG</div>
                    {Object.entries(demoDebug).map(([k, v]) => (
                      <div key={k}><span style={{ color: 'rgba(14,200,220,0.7)' }}>{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...submitBtnStyle,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginTop: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  }}
                >
                  {loading && <Spinner />}
                  {loading
                    ? (mode === 'login' ? t('signin.signingIn', 'Signing in…') : t('signin.creating', 'Creating account…'))
                    : (mode === 'login' ? t('signin.signIn', 'Sign In') : t('signin.createAccount', 'Create Account'))
                  }
                </button>
              </form>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Social Auth Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Google */}
                <button
                  onClick={handleGoogle}
                  disabled={loading}
                  style={{ ...socialBtnStyle, opacity: loading ? 0.6 : 1 }}
                >
                  <GoogleIcon />
                  {t('signin.google', 'Continue with Google')}
                </button>

                {/* Apple — required by App Store guidelines */}
                <button
                  onClick={handleApple}
                  disabled={loading}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '700',
                    background: '#fff', border: '1px solid #fff', color: '#000',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    minHeight: '48px',
                    opacity: loading ? 0.6 : 1,
                  }}
                >
                  <AppleIcon />
                  {t('signin.apple', 'Continue with Apple')}
                </button>
              </div>

              {/* iOS/iPad only: full technical error for App Review diagnostics */}
              {nativeErrorDetail && !loading && (
                <div style={{
                  marginTop: '8px', padding: '10px 12px',
                  background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: '8px', fontSize: '10px', color: 'rgba(239,68,68,0.8)',
                  wordBreak: 'break-all', fontFamily: 'monospace',
                }}>
                  {nativeErrorDetail}
                </div>
              )}

              {/* Cancel loading button — lets user dismiss stuck spinner */}
              {loading && (
                <button
                  type="button"
                  onClick={() => { stopTimeout(); setLoading(false); setError(''); setNativeErrorDetail(''); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', textAlign: 'center', width: '100%', padding: '8px', marginTop: '4px' }}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              )}
            </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '20px' }}>
          {t('signin.terms', 'By continuing, you agree to our Terms of Service & Privacy Policy')}
        </p>
      </motion.div>
    </div>
  );
}

// ─── Small reusable pieces ────────────────────────────────────────────────────

function Spinner() {
  return (
    <span style={{
      display: 'inline-block', width: 16, height: 16,
      border: '2px solid rgba(3,8,16,0.3)',
      borderTopColor: '#030810',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="black">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '10px',
  fontSize: '16px', // 16px prevents iOS Safari auto-zoom
  background: 'rgba(6,14,32,0.6)', border: '1px solid rgba(100,220,255,0.1)',
  color: 'rgba(255,255,255,0.88)', outline: 'none', boxSizing: 'border-box',
  minHeight: '44px',
};

const submitBtnStyle = {
  padding: '13px', borderRadius: '12px', fontWeight: '800', fontSize: '15px',
  background: 'linear-gradient(135deg, #0ec8dc, #0aa8be)', color: '#030810',
  border: 'none', letterSpacing: '0.5px', width: '100%',
  boxShadow: '0 4px 20px rgba(14,200,220,0.3)',
  minHeight: '48px',
};

const socialBtnStyle = {
  width: '100%', padding: '12px', borderRadius: '10px', fontSize: '14px', fontWeight: '600',
  background: 'rgba(100,220,255,0.04)', border: '1px solid rgba(100,220,255,0.1)',
  color: 'rgba(255,255,255,0.65)', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '8px',
  minHeight: '48px',
};

const errorStyle = {
  fontSize: '12px', color: '#ef4444', padding: '8px 12px',
  background: 'rgba(239,68,68,0.1)', borderRadius: '8px',
  border: '1px solid rgba(239,68,68,0.2)',
};