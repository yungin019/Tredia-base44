import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Bell, ChevronRight } from 'lucide-react';

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'NVDA Buy Signal', message: 'Momentum breakout confirmed. Entry $871.', time: '5m ago', type: 'signal', route: '/Asset/NVDA' },
  { id: 2, title: 'Portfolio Alert', message: 'Tech sector now 62% of portfolio.', time: '1h ago', type: 'warning', route: '/Portfolio' },
  { id: 3, title: 'Market Update', message: 'Fed signals possible rate cuts in H2 2025.', time: '3h ago', type: 'news', route: '/AIInsights' },
];

export default function NotificationsPanel({ isOpen, onClose }) {
  const navigate = useNavigate();
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-4 lg:right-6 w-96 max-w-[calc(100vw-32px)] rounded-xl border border-white/[0.08] bg-[#111118] shadow-2xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-white/90">Notifications</h3>
              </div>
              <button onClick={onClose} className="text-white/40 hover:text-white/60 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {MOCK_NOTIFICATIONS.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => {
                    onClose();
                    navigate(notif.route);
                  }}
                  onMouseDown={(e) => {
                    e.currentTarget.style.transform = 'scale(0.98)';
                  }}
                  onMouseUp={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  className="px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.04] transition-all last:border-0 cursor-pointer"
                  style={{ transition: 'transform 0.1s, background-color 0.2s' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="h-2 w-2 rounded-full flex-shrink-0 mt-1"
                      style={{
                        background:
                          notif.type === 'signal'
                            ? '#22c55e'
                            : notif.type === 'warning'
                              ? '#F59E0B'
                              : '#3b82f6',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white/90">{notif.title}</p>
                      <p className="text-xs text-white/50 leading-snug mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-white/30 mt-1 block">{notif.time}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/20 flex-shrink-0 mt-1" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/[0.06] text-center">
              <button
                onClick={() => {
                  onClose();
                  navigate('/Notifications');
                }}
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                View All Notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}