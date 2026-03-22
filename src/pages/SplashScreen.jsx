import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/lib/AuthContext';
import { TrendingUp, Sparkles } from 'lucide-react';

const TICKER_ITEMS = [
  { symbol: 'AAPL', change: '+1.2%', up: true },
  { symbol: 'TSLA', change: '-0.8%', up: false },
  { symbol: 'NVDA', change: '+3.4%', up: true },
  { symbol: 'BTC', change: '+2.1%', up: true },
  { symbol: 'SPX', change: '+0.6%', up: true },
  { symbol: 'MSFT', change: '+0.9%', up: true },
  { symbol: 'GOOGL', change: '+1.5%', up: true },
  { symbol: 'ETH', change: '-0.3%', up: false },
];

const repeated = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];

export default function SplashScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (user) {
        navigate('/Home', { replace: true });
      } else {
        navigate('/SignIn', { replace: true });
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate, user, isLoading]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#04070c] via-[#070a11] to-[#04070c]">
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />

      <div className="relative flex flex-col items-center gap-6 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative"
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 40px rgba(16,185,129,0.3)',
                '0 0 60px rgba(16,185,129,0.5)',
                '0 0 40px rgba(16,185,129,0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-20 w-20 rounded-3xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-2xl"
          >
            <TrendingUp className="h-10 w-10 text-white" strokeWidth={2.5} />
          </motion.div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 flex items-center justify-center"
          >
            <Sparkles className="h-3.5 w-3.5 text-white" fill="white" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center gap-3"
        >
          <h1 className="text-6xl font-black tracking-tighter text-gradient-primary">
            TREDIO
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg font-medium text-center text-muted-foreground/80"
          >
            The AI mentor every trader needs
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-4 w-48 h-1 bg-border/30 rounded-full overflow-hidden relative"
        >
          <motion.div
            initial={{ width: '0%', x: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1.8, delay: 1, ease: 'easeInOut' }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-emerald-400 to-primary bg-[length:200%_100%]"
            style={{
              boxShadow: '0 0 20px rgba(16,185,129,0.5)'
            }}
          />
          <motion.div
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 1.8, delay: 1, ease: 'easeInOut' }}
            className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-0 left-0 right-0 h-12 border-t border-border/30 glass-dark overflow-hidden flex items-center"
      >
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />

        <div className="flex items-center gap-0 ticker-animate whitespace-nowrap">
          {repeated.map((item, i) => (
            <span key={i} className="flex items-center gap-2 px-6">
              <span className="text-xs font-bold text-foreground/60 font-mono">{item.symbol}</span>
              <span
                className="text-xs font-bold font-mono"
                style={{ color: item.up ? 'hsl(142, 86%, 28%)' : 'hsl(0, 84%, 60%)' }}
              >
                {item.change}
              </span>
              <span className="text-border text-xs">·</span>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}