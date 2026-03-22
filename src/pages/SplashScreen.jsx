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
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate, user, isLoading]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: '#080B12' }}>
      <div className="relative flex flex-col items-center gap-4 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-3"
        >
          <h1
            className="text-7xl font-black tracking-tight text-center"
            style={{ color: '#F59E0B' }}
          >
            TREDIO
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg font-normal text-center"
            style={{ color: '#9CA3AF' }}
          >
            The AI mentor every trader needs
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}