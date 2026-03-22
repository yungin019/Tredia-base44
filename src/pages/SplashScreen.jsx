import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

export default function SplashScreen() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

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
      setChecked(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: '#080B12' }}>
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      <div className="absolute w-96 h-96 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />

      <div className="relative flex flex-col items-center gap-4 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="h-16 w-16 rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 flex items-center justify-center mb-2"
            style={{ boxShadow: '0 0 32px rgba(245,158,11,0.15)' }}>
            <svg width="32" height="32" viewBox="0 0 22 22" fill="none">
              <polyline points="2,16 7,9 12,13 17,5 20,8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="8" r="1.5" fill="#F59E0B" />
            </svg>
          </div>

          <h1
            className="text-7xl font-black tracking-tight text-center"
            style={{ color: '#F59E0B', letterSpacing: '-0.04em' }}
          >
            TREDIO
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-base font-normal text-center tracking-wide"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            The AI mentor every trader needs
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-4"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#F59E0B' }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}