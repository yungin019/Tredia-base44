import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

// Apple Sign-In requires explicit opt-in in Base44 Dashboard → Settings → Authentication → Apple.
// Set this to true only after you have enabled it there.
const APPLE_SIGNIN_ENABLED = true;

export default function SignIn() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [verifyCode, setVerifyCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!name.trim()) { setError('Please enter your full name.'); return; }
      if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        // SDK register() accepts: email, password, referral_code
        // full_name is NOT accepted by register() — must be set after login via updateMe()
        await base44.auth.register({ email, password });
        setStep('verify');
      } else {
        await base44.auth.loginViaEmailPassword(email, password);
        await initProfile();
        window.location.href = '/Home';
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // After login, initialize profile fields if first time
  const initProfile = async () => {
    try {
      const u = await base44.auth.me();
      if (!u) return;
      const updates = {};
      if (!u.broker_status) updates.broker_status = 'not_connected';
      if (!u.trading_mode) updates.trading_mode = 'practice';
      if (!u.referral_code) updates.referral_code = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
      if (Object.keys(updates).length > 0) await base44.auth.updateMe(updates);
    } catch { /* non-fatal */ }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await base44.auth.verifyOtp({ email, otpCode: verifyCode });
      // Login after successful verification
      await base44.auth.loginViaEmailPassword(email, password);
      // Now set full_name and init profile (register() doesn't accept full_name)
      try {
        const updates = {
          full_name: name || undefined,
          broker_status: 'not_connected',
          trading_mode: 'practice',
          referral_code: 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        };
        // Remove undefined keys
        Object.keys(updates).forEach(k => updates[k] === undefined && delete updates[k]);
        await base44.auth.updateMe(updates);
      } catch { /* non-fatal */ }
      window.location.href = '/Home';
    } catch (err) {
      setError(err?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await base44.auth.resendOtp(email);
    } catch (err) {
      setError('Could not resend code. Please try again.');
    }
  };

  // Google: loginWithProvider redirects to Google OAuth.
  // Base44 handles the callback internally at /auth/callback.
  // Requires: Dashboard → Settings → Authentication → Google → Enabled
  const handleGoogle = () => {
    base44.auth.loginWithProvider('google', '/Home');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(14, 50, 90, 0.35) 0%, transparent 70%), linear-gradient(180deg, #040d1e 0%, #030810 60%, #020608 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '380px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <img src="/logo-icon.svg" alt="TREDIO" style={{ height: '52px', width: '52px', margin: '0 auto 12px' }} />
          <img src="/logo-full.svg" alt="TREDIO" style={{ height: '32px', margin: '0 auto 6px' }} />
          <div style={{ fontSize: '11px', color: 'rgba(100,220,255,0.35)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            AI Trading Intelligence
          </div>
        </div>

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

            {/* VERIFY STEP */}
            {step === 'verify' ? (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                    Check your email
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>
                    We sent a verification code to<br />
                    <span style={{ color: '#F59E0B', fontWeight: '600' }}>{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <input
                    type="text"
                    placeholder="Enter verification code"
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value)}
                    required
                    autoFocus
                    style={{ ...inputStyle, textAlign: 'center', fontSize: '18px', letterSpacing: '4px', fontWeight: '700' }}
                  />

                  {error && (
                    <div style={errorStyle}>{error}</div>
                  )}

                  <button type="submit" disabled={loading || !verifyCode} style={{
                    ...submitBtnStyle,
                    opacity: (loading || !verifyCode) ? 0.6 : 1,
                    cursor: (loading || !verifyCode) ? 'not-allowed' : 'pointer',
                  }}>
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>
                </form>

                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => { setStep('form'); setError(''); setVerifyCode(''); }}
                    style={{ flex: 1, padding: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer' }}
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleResendOtp}
                    style={{ flex: 1, padding: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', cursor: 'pointer' }}
                  >
                    Resend code
                  </button>
                </div>
              </motion.div>
            ) : (

            /* FORM STEP */
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Tab Toggle */}
              <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(14,200,220,0.05)', border: '1px solid rgba(14,200,220,0.1)', borderRadius: '12px', padding: '4px' }}>
                {['login', 'register'].map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(''); setConfirmPassword(''); }}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '9px', fontSize: '13px', fontWeight: '700',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                      background: mode === m ? 'rgba(14,200,220,0.18)' : 'transparent',
                      color: mode === m ? 'rgb(120,230,245)' : 'rgba(255,255,255,0.35)',
                      boxShadow: mode === m ? '0 0 10px rgba(14,200,220,0.15)' : 'none',
                    }}>
                    {m === 'login' ? 'Sign In' : 'Register'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {mode === 'register' && (
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    style={inputStyle}
                  />
                )}
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={inputStyle}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  style={inputStyle}
                />
                {mode === 'register' && (
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    style={inputStyle}
                  />
                )}

                {error && <div style={errorStyle}>{error}</div>}

                <button type="submit" disabled={loading} style={{
                  ...submitBtnStyle,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: '4px',
                }}>
                  {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              </form>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '20px 0' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Google: handled by Base44 OAuth redirect. Requires Google enabled in Dashboard → Auth */}
                <button onClick={handleGoogle} style={socialBtnStyle}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Apple: disabled until enabled in Dashboard → Settings → Authentication → Apple */}
                {APPLE_SIGNIN_ENABLED ? (
                  <button
                    onClick={() => base44.auth.loginWithProvider('apple', '/Home')}
                    style={socialBtnStyle}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Continue with Apple
                  </button>
                ) : (
                  <div style={{
                    width: '100%', padding: '11px 12px', borderRadius: '10px', fontSize: '13px',
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', gap: '8px', cursor: 'default',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ opacity: 0.3 }}>
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Apple Sign-In — Coming Soon
                  </div>
                )}
              </div>
            </motion.div>
            )}

          </AnimatePresence>
        </div>

        <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '20px' }}>
          By continuing, you agree to our Terms of Service & Privacy Policy
        </p>
      </motion.div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
  background: 'rgba(6,14,32,0.6)', border: '1px solid rgba(100,220,255,0.1)',
  color: 'rgba(255,255,255,0.88)', outline: 'none', boxSizing: 'border-box',
};

const submitBtnStyle = {
  padding: '13px', borderRadius: '12px', fontWeight: '800', fontSize: '14px',
  background: 'linear-gradient(135deg, #0ec8dc, #0aa8be)', color: '#030810',
  border: 'none', letterSpacing: '0.5px', width: '100%',
  boxShadow: '0 4px 20px rgba(14,200,220,0.3)',
};

const socialBtnStyle = {
  width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
  background: 'rgba(100,220,255,0.04)', border: '1px solid rgba(100,220,255,0.1)',
  color: 'rgba(255,255,255,0.65)', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '8px',
};

const errorStyle = {
  fontSize: '12px', color: '#ef4444', padding: '8px 12px',
  background: 'rgba(239,68,68,0.1)', borderRadius: '8px',
  border: '1px solid rgba(239,68,68,0.2)',
};