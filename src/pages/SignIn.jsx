import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function SignIn() {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'verify'
  const [verifyCode, setVerifyCode] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'register') {
        await base44.auth.register({ email, password, full_name: name });
        setStep('verify');
      } else {
        await base44.auth.loginViaEmailPassword(email, password);
        // Initialize profile fields for new users who haven't been through onboarding
        try {
          const u = await base44.auth.me();
          if (u && !u.onboarding_completed) {
            const referralCode = 'REF' + Math.random().toString(36).slice(2, 8).toUpperCase();
            await base44.auth.updateMe({
              broker_status: u.broker_status || 'not_connected',
              trading_mode: u.trading_mode || 'practice',
              referral_code: u.referral_code || referralCode,
            });
          }
        } catch {}
        window.location.href = '/Home';
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Correct Base44 SDK method: verifyOtp
      await base44.auth.verifyOtp({ email, otpCode: verifyCode });
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = '/Home';
    } catch (err) {
      setError(err?.message || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await base44.auth.resendOtp(email);
      setError('');
    } catch (err) {
      setError('Could not resend code. Please try again.');
    }
  };

  const handleGoogle = () => {
    base44.auth.loginWithProvider('google', '/Home');
  };

  // Apple Sign-In: only available if configured in the Base44 dashboard.
  // Do not call unless provider is confirmed active.
  const handleApple = () => {
    base44.auth.loginWithProvider('apple', '/Home');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080B12',
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
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', textTransform: 'uppercase' }}>
            AI Trading Intelligence
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: '#111118',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          padding: '28px',
        }}>
          <AnimatePresence mode="wait">

            {/* VERIFY STEP */}
            {step === 'verify' ? (
              <motion.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>📧</div>
                  <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>Check your email</p>
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
                    <div style={{ fontSize: '12px', color: '#ef4444', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading || !verifyCode} style={{
                    padding: '13px', borderRadius: '12px', fontWeight: '800', fontSize: '14px',
                    background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F',
                    border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: (loading || !verifyCode) ? 0.6 : 1,
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
              <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '4px' }}>
                {['login', 'register'].map(m => (
                  <button key={m} onClick={() => { setMode(m); setError(''); }}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: '700',
                      border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                      background: mode === m ? '#F59E0B' : 'transparent',
                      color: mode === m ? '#0A0A0F' : 'rgba(255,255,255,0.4)',
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
                  style={inputStyle}
                />

                {error && (
                  <div style={{ fontSize: '12px', color: '#ef4444', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  padding: '13px', borderRadius: '12px', fontWeight: '800', fontSize: '14px',
                  background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F',
                  border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1, marginTop: '4px',
                  letterSpacing: '0.5px',
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
                <button onClick={handleGoogle} style={socialBtnStyle}>
                  <span>G</span> Continue with Google
                </button>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={handleApple}
                    style={{ ...socialBtnStyle, width: '100%' }}
                  >
                    <span>🍎</span> Continue with Apple
                  </button>
                </div>
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
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.85)', outline: 'none', boxSizing: 'border-box',
};

const socialBtnStyle = {
  width: '100%', padding: '12px', borderRadius: '10px', fontSize: '13px', fontWeight: '600',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
  color: 'rgba(255,255,255,0.7)', cursor: 'pointer', display: 'flex',
  alignItems: 'center', justifyContent: 'center', gap: '8px',
};