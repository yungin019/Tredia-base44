import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Bell, ChevronRight, CheckCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NotificationsPanel({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    loadNotifications();
  }, [isOpen]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (!user) return;
      const notifs = await base44.entities.AppNotification.filter(
        { user_id: user.email || user.id },
        '-created_date',
        20
      );
      setNotifications(notifs || []);
    } catch { /* silent */ }
    setLoading(false);
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      base44.entities.AppNotification.update(n.id, { read: true }).catch(() => {});
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeColor = (type) => {
    if (type === 'price_alert') return '#F59E0B';
    if (type === 'trek_signal') return '#22c55e';
    if (type === 'community_like' || type === 'community_copy') return '#8b5cf6';
    if (type === 'new_follower') return '#3b82f6';
    return '#0ec8dc';
  };

  const formatTime = (date) => {
    if (!date) return '';
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 z-40" />
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 right-4 lg:right-6 w-96 max-w-[calc(100vw-32px)] rounded-xl border border-white/[0.08] bg-[#111118] shadow-2xl z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-white/90">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="h-5 min-w-5 px-1 rounded-full text-[10px] font-black flex items-center justify-center"
                    style={{ background: '#F59E0B', color: '#000' }}>
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[10px] text-white/30 hover:text-primary flex items-center gap-1 transition-colors">
                    <CheckCheck className="h-3 w-3" /> All read
                  </button>
                )}
                <button onClick={onClose} className="text-white/40 hover:text-white/60 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-white/10 mt-2 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-white/[0.06] rounded w-3/4" />
                        <div className="h-2.5 bg-white/[0.04] rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-8 w-8 text-white/10 mx-auto mb-3" />
                  <p className="text-[12px] text-white/30">No notifications yet</p>
                  <p className="text-[10px] text-white/20 mt-1">Set a price alert to get started</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div key={notif.id}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    onClick={() => { onClose(); navigate(notif.route || '/Notifications'); base44.entities.AppNotification.update(notif.id, { read: true }).catch(() => {}); }}
                    className="px-4 py-3 border-b border-white/[0.04] hover:bg-white/[0.04] transition-all last:border-0 cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-2 w-2 rounded-full flex-shrink-0 mt-1.5" style={{ background: notif.read ? 'rgba(255,255,255,0.1)' : typeColor(notif.type) }} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${notif.read ? 'text-white/50' : 'text-white/90'}`}>{notif.title}</p>
                        <p className="text-xs text-white/40 leading-snug mt-0.5 line-clamp-2">{notif.message}</p>
                        <span className="text-[10px] text-white/25 mt-1 block">{formatTime(notif.created_date)}</span>
                      </div>
                      <ChevronRight className="h-4 w-4 text-white/20 flex-shrink-0 mt-1" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="px-4 py-3 border-t border-white/[0.06] text-center">
              <button onClick={() => { onClose(); navigate('/Notifications'); }}
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