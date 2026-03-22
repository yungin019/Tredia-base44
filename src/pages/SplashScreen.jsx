import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          navigate('/Home', { replace: true });
        } else {
          navigate('/SignIn', { replace: true });
        }
      } catch {
        navigate('/SignIn', { replace: true });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{
      background: '#080B12',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ textAlign: 'center' }}
      >
        <div style={{
          fontSize: '42px',
          fontWeight: '900',
          color: '#F59E0B',
          letterSpacing: '8px',
          marginBottom: '8px',
        }}>
          TREDIO_LOGO_PLACEHOLDER
        </div>
        <div style={{
          fontSize: '12px',
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: '3px',
          textTransform: 'uppercase',
        }}>
          AI Trading Intelligence
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={{
          width: 32,
          height: 32,
          border: '3px solid #F59E0B',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginTop: '24px',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}