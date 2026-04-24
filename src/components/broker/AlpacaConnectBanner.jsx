import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * Dismissible banner shown at top of dashboard when user is in paper trading mode.
 * Disappears permanently once dismissed (stored in localStorage).
 */
export default function AlpacaConnectBanner() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('alpaca_banner_dismissed');
    if (dismissed) return;

    base44.auth.me().then(user => {
      if (user && !user.alpaca_connected) {
        setVisible(true);
      }
    }).catch(() => {});
  }, []);

  const dismiss = () => {
    localStorage.setItem('alpaca_banner_dismissed', '1');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center gap-3 px-4 py-2.5"
          style={{
            background: 'linear-gradient(90deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06))',
            borderBottom: '1px solid rgba(245,158,11,0.2)',
          }}
        >
          <Zap className="h-3.5 w-3.5 text-[#F59E0B] flex-shrink-0" />
          <p className="flex-1 text-xs text-white/70">
            You're on <span className="text-white/90 font-semibold">paper trading mode.</span> Connect Alpaca to go live.
          </p>
          <button
            onClick={() => navigate('/alpaca-connect')}
            className="text-[11px] font-black text-[#F59E0B] hover:text-[#F59E0B]/80 transition-colors whitespace-nowrap tap-feedback"
          >
            Connect →
          </button>
          <button
            onClick={dismiss}
            className="p-1 rounded hover:bg-white/[0.06] transition-colors tap-feedback flex-shrink-0"
          >
            <X className="h-3.5 w-3.5 text-white/25" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}