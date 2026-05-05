import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFirebaseAuth } from '@/lib/FirebaseAuthContext';

export default function SplashScreen() {
  const navigate = useNavigate();
  const { firebaseUser, profile, isLoading } = useFirebaseAuth();

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      if (firebaseUser) {
        navigate(profile?.onboarding_completed ? '/Home' : '/Onboarding', { replace: true });
      } else {
        navigate('/SignIn', { replace: true });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoading, firebaseUser, profile, navigate]);

  return (
    <div style={{
      background: '#080B12', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px',
    }}>
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
        style={{ width: 32, height: 32, border: '3px solid #F59E0B', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginTop: '24px' }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}