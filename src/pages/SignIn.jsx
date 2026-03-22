import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Mail, Apple, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function SignIn() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [mode, setMode] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogle = () => {
    base44.auth.loginWithProvider('google', '/Home');
  };

  const handleApple = () => {
    base44.auth.loginWithProvider('apple', '/Home');
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const result = await base44.auth.register({
          email: email,
          password: password
        });
        window.location.href = '/Home';
      } else {
        const result = await base44.auth.loginViaEmailPassword(
          email,
          password
        );
        window.location.href = '/Home';
      }
    } catch (err) {
      setError(err.message || t('signin.authFailed') || 'Authentication failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

      {/* Glow orb */}
      <div
        className="absolute w-80 h-80 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
      />

      <div className="relative w-full max-w-sm flex flex-col gap-8">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-2"
        >
          <div className="h-12 w-12 rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 flex items-center justify-center mb-1"
            style={{ boxShadow: '0 0 24px rgba(245,158,11,0.12)' }}>
            <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
              <polyline points="2,16 7,9 12,13 17,5 20,8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="8" r="1.5" fill="#F59E0B" />
            </svg>
          </div>
          <span className="text-3xl font-black tracking-tight" style={{ color: '#F59E0B', letterSpacing: '-0.03em' }}>TREDIO</span>
           <p className="text-[11px] text-white/30 tracking-widest uppercase">{t('signin.subtitle') || 'Your AI Trading Studio'}</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.08] bg-[#111118] p-6 flex flex-col gap-4"
          style={{ boxShadow: '0 0 40px rgba(0,0,0,0.4)' }}
        >
          <div className="text-center mb-1">
            <h1 className="text-lg font-black text-white/90">{t('signin.title') || 'Welcome to TREDIO'}</h1>
             <p className="text-xs text-white/30 mt-0.5">{t('signin.subtitle') || 'Access your TREDIO account'}</p>
          </div>

          {/* OAuth buttons */}
          <button
            onClick={handleGoogle}
            className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] transition-all text-sm font-semibold text-white/75"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            {t('signin.google') || 'Continue with Google'}
          </button>

          <button
            onClick={handleApple}
            className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] transition-all text-sm font-semibold text-white/75"
          >
            <Apple className="h-4 w-4 text-white/80" />
            {t('signin.apple') || 'Continue with Apple'}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-white/[0.07]" />
            <span className="text-[10px] text-white/20 font-medium tracking-wider uppercase">{t('signin.or') || 'OR'}</span>
            <div className="flex-1 h-[1px] bg-white/[0.07]" />
          </div>

          {mode !== 'email' ? (
            <button
              onClick={() => setMode('email')}
              className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.04] hover:bg-white/[0.07] transition-all text-sm font-semibold text-white/75"
            >
              <Mail className="h-4 w-4" />
              {t('signin.email') || 'Continue with Email'}
            </button>
          ) : (
            <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
              <input
               type="email"
               placeholder={t('signin.enterEmail') || 'Email'}
               value={email}
               onChange={e => setEmail(e.target.value)}
               required
               className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-[#F59E0B]/40 transition-colors"
              />
              <div className="relative">
                <input
                 type={showPass ? 'text' : 'password'}
                 placeholder={t('signin.password') || 'Password'}
                 value={password}
                 onChange={e => setPassword(e.target.value)}
                 required
                 className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/80 placeholder:text-white/20 outline-none focus:border-[#F59E0B]/40 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {error && <p className="text-xs text-red-400/80">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F', opacity: loading ? 0.7 : 1 }}
              >
                {loading ? (t('common.loading') || 'Loading...') : <><span>{isRegister ? (t('signin.createAccount') || 'Create Account') : (t('signin.signIn') || 'Sign In')}</span><ArrowRight className="h-4 w-4" /></>}
              </button>
              <div className="flex items-center justify-between text-[10px]">
                <button type="button" onClick={() => setMode(null)} className="text-white/25 hover:text-white/45 transition-colors">
                  {t('common.back') || '← Back'}
                </button>
                <button type="button" onClick={() => { setIsRegister(!isRegister); setError(null); }} className="text-primary/70 hover:text-primary transition-colors">
                  {isRegister ? (t('signin.alreadyHaveAccount') || 'Already have an account?') : (t('signin.noAccount') || "Don't have an account?")}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-[10px] text-white/15"
        >
          {t('signin.terms') || 'By signing in, you agree to our Terms of Service & Privacy Policy'}
        </motion.p>
      </div>
    </div>
  );
}
