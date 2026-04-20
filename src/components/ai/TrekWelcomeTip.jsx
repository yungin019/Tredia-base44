import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X } from 'lucide-react';

const STORAGE_KEY = 'tredio_trek_welcome_shown';

export default function TrekWelcomeTip() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem(STORAGE_KEY);
    if (!shown) {
      // Delay slightly so the feed loads first
      const timer = setTimeout(() => setVisible(true), 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-24 left-4 right-4 z-50 max-w-sm mx-auto"
        >
          <div className="rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(10,22,52,0.97), rgba(6,14,32,0.97))',
              border: '1px solid rgba(14,200,220,0.2)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 40px rgba(14,200,220,0.06)',
            }}>
            <div className="px-4 pt-4 pb-1 flex items-start gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Zap className="h-4 w-4" style={{ color: '#F59E0B' }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black tracking-[0.18em] uppercase"
                    style={{ color: '#F59E0B' }}>TREK AI</span>
                  <button onClick={dismiss} className="h-6 w-6 flex items-center justify-center rounded-lg hover:bg-white/[0.06]">
                    <X className="h-3.5 w-3.5 text-white/30" />
                  </button>
                </div>
                <p className="text-sm font-semibold text-white/85 leading-relaxed">
                  Welcome. I'm TREK, your AI trading mentor.
                </p>
              </div>
            </div>
            <div className="px-4 pb-4 pl-[52px]">
              <p className="text-xs text-white/45 leading-relaxed mt-1">
                I'll analyze every trade before you make it. Start by searching any stock or crypto using the 🔍 button above.
              </p>
              <button onClick={dismiss}
                className="mt-3 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all"
                style={{ background: 'rgba(14,200,220,0.1)', color: 'rgba(14,200,220,0.8)', border: '1px solid rgba(14,200,220,0.2)' }}>
                Got it — let's trade ⚡
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}