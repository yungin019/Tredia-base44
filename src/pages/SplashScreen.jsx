import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFirebaseAuth } from '@/lib/FirebaseAuthContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { firebaseUser, profile, isLoading, loadingPhase, lastError } = useFirebaseAuth();
  const [elapsed, setElapsed] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // 10-second hard UI timeout — force navigate to /SignIn no matter what
  useEffect(() => {
    const timeout = setTimeout(() => {
      setTimedOut(true);
      navigate('/SignIn', { replace: true });
    }, 10000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  // Navigate once auth is resolved
  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (firebaseUser) {
        navigate(profile?.onboarding_completed ? '/Home' : '/Onboarding', { replace: true });
      } else {
        navigate('/SignIn', { replace: true });
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [isLoading, firebaseUser, profile, navigate]);

  return (
    <div style={{
      background: '#080B12', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px',
      paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }} style={{ textAlign: 'center' }}>
        <img src="/logo-full.svg" alt="TREDIO" style={{ height: '48px', marginBottom: '12px' }} />
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '3px', textTransform: 'uppercase' }}>
          AI Trading Intelligence
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.4 }}
        style={{ width: 32, height: 32, border: '3px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginTop: '8px' }}
      />

      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        style={{
          position: 'fixed', bottom: 'calc(20px + env(safe-area-inset-bottom))', left: '16px', right: '16px',
          background: '#0a0a0a', border: '1px solid #ff0', borderRadius: '8px',
          padding: '10px 12px', fontFamily: 'monospace', fontSize: '11px', color: '#ff0', lineHeight: '1.8',
        }}>
        <div style={{ fontWeight: 'bold', color: '#fff', marginBottom: '4px' }}>🔍 STARTUP DEBUG</div>
        <div>Firebase user: <strong>{firebaseUser === undefined ? 'pending…' : firebaseUser ? 'yes ✓' : 'no ✗'}</strong></div>
        <div>Profile loaded: <strong>{profile ? 'yes ✓' : (isLoading ? 'pending…' : 'no ✗')}</strong></div>
        <div>Loading phase: <strong>{loadingPhase || 'init'}</strong></div>
        <div>isLoading: <strong>{String(isLoading)}</strong></div>
        <div>Elapsed: <strong>{elapsed}s</strong></div>
        {lastError && <div style={{ color: '#f87171', marginTop: '4px' }}>⚠ {lastError}</div>}
        {timedOut && <div style={{ color: '#f87171' }}>⏱ UI timeout — redirecting to /SignIn</div>}
      </motion.div>
    </div>
  );
}
