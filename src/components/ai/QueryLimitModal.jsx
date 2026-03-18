import React from 'react';
import { motion } from 'framer-motion';
import { X, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function QueryLimitModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md mx-4 rounded-2xl border border-white/[0.15] bg-gradient-to-br from-[#111118] to-[#0e0e14] p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Lock className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-black text-white/95">Daily Limit Reached</h2>
        </div>

        <p className="text-sm text-white/60 mb-1">You've used your 5 free TREK queries today.</p>
        <p className="text-sm text-white/40 mb-6">Upgrade to PRO or ELITE for unlimited access and premium features.</p>

        <div className="space-y-3">
          <Button
            onClick={() => {
              navigate('/Upgrade');
              onClose();
            }}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10"
          >
            Upgrade Now
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full h-10 border-white/[0.1] hover:bg-white/[0.05] text-white/70"
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-[10px] text-white/25 text-center mt-4">
          Your daily limit resets at midnight UTC
        </p>
      </motion.div>
    </motion.div>
  );
}