import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TICKER_ITEMS = [
  { symbol: 'AAPL', change: '+1.2%', up: true },
  { symbol: 'TSLA', change: '-0.8%', up: false },
  { symbol: 'NVDA', change: '+3.4%', up: true },
  { symbol: 'BTC', change: '+2.1%', up: true },
  { symbol: 'SPX', change: '+0.6%', up: true },
];

const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

export default function SplashScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/Home', { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid-bg opacity-40" />

      {/* Glow orb behind logo */}
      <div
        className="absolute w-64 h-64 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
      />

      <div className="relative flex flex-col items-center gap-4">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2"
        >
          {/* Icon mark */}
          <motion.div
            initial={{ opacity: 0, rotate: -15 }}
            animate={{ opacity: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="h-10 w-10 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 flex items-center justify-center"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <polyline points="2,16 7,9 12,13 17,5 20,8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="20" cy="8" r="1.5" fill="#F59E0B" />
            </svg>
          </motion.div>

          {/* TREDIA wordmark */}
          <motion.span
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-4xl font-black tracking-tight"
            style={{ color: '#F59E0B', fontFamily: 'Inter, sans-serif', letterSpacing: '-0.03em' }}
          >
            TREDIA
          </motion.span>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="text-sm font-medium tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '0.2em' }}
        >
  {t('splash.tagline') || 'The Edge Every Trader Needs'}
        </motion.p>

        {/* Loading bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 w-32 h-[2px] bg-white/[0.06] rounded-full overflow-hidden"
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.5, delay: 0.9, ease: 'linear' }}
            className="h-full rounded-full"
            style={{ background: '#F59E0B' }}
          />
        </motion.div>
      </div>

      {/* Live market ticker at bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="absolute bottom-0 left-0 right-0 h-8 border-t border-white/[0.06] bg-white/[0.02] overflow-hidden flex items-center"
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0A0A0F] to-transparent z-10" />
        {/* Right fade */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0A0A0F] to-transparent z-10" />

        <div className="flex items-center gap-0 ticker-animate whitespace-nowrap">
          {repeated.map((item, i) => (
            <span key={i} className="flex items-center gap-1.5 px-5">
              <span className="text-[10px] font-bold text-white/60 font-mono">{item.symbol}</span>
              <span
                className="text-[10px] font-bold font-mono"
                style={{ color: item.up ? '#22C55E' : '#EF4444' }}
              >
                {item.change}
              </span>
              <span className="text-white/10 text-[10px]">·</span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}