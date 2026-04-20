import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bell, TrendingUp, AlertTriangle, Users, Heart, Copy, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const TYPE_CONFIG = {
  price_alert:     { icon: Bell,         color: '#F59E0B', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)' },
  trek_signal:     { icon: TrendingUp,   color: '#22c55e', bg: 'rgba(34,197,94,0.1)',   border: 'rgba(34,197,94,0.2)' },
  community_like:  { icon: Heart,        color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)',  border: 'rgba(139,92,246,0.2)' },
  community_copy:  { icon: Copy,         color: '#0ec8dc', bg: 'rgba(14,200,220,0.1)',  border: 'rgba(14,200,220,0.2)' },
  new_follower:    { icon: Users,        color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',  border: 'rgba(59,130,246,0.2)' },
  market_update:   { icon: TrendingUp,   color: '#0ec8dc', bg: 'rgba(14,200,220,0.1)', border: 'rgba(14,200,220,0.2)' },
};

const formatTime = (date) => {
  if (!date) return '';
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await base44.auth.me();
      if (!user) { setLoading(false); return; }
      const notifs = await base44.entities.AppNotification.filter(
        { user_id: user.email || user.id },
        '-created_date',
        50
      );
      setNotifications(notifs || []);
    } catch {
      setError('TREK is having trouble connecting. Pull down to refresh.');
    }
    setLoading(false);
  };

  useEffect(() => { loadNotifications(); }, []);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    for (const n of unread) {
      base44.entities.AppNotification.update(n.id, { read: true }).catch(() => {});
    }
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleTap = (notif) => {
    if (!notif.read) {
      base44.entities.AppNotification.update(notif.id, { read: true }).catch(() => {});
      setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
    }
    if (notif.route) navigate(notif.route);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen" style={{ background: '#040810' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/[0.06]"
        style={{ background: 'rgba(4,8,16,0.95)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center">
            <ChevronLeft className="h-5 w-5 text-white/60" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black text-white/95">Notifications</h1>
              {unreadCount > 0 && (
                <span className="h-5 min-w-5 px-1.5 rounded-full text-[10px] font-black flex items-center justify-center"
                  style={{ background: '#F59E0B', color: '#000' }}>
                  {unreadCount}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/30 mt-0.5">{notifications.length} notifications</p>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: 'rgba(14,200,220,0.08)', color: 'rgba(14,200,220,0.8)', border: '1px solid rgba(14,200,220,0.15)' }}>
                Mark all read
              </button>
            )}
            <button onClick={loadNotifications} className="h-9 w-9 flex items-center justify-center rounded-lg border border-white/[0.08]">
              <RefreshCw className="h-4 w-4 text-white/40" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-2 pb-24">
        {loading ? (
          <div className="space-y-2 pt-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="rounded-xl border border-white/[0.06] p-4 animate-pulse"
                style={{ background: 'rgba(17,17,24,0.6)' }}>
                <div className="flex gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/[0.05] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-white/[0.07] rounded w-2/3" />
                    <div className="h-3 bg-white/[0.04] rounded w-full" />
                    <div className="h-2.5 bg-white/[0.03] rounded w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 space-y-4">
            <Bell className="h-12 w-12 text-white/10 mx-auto" />
            <p className="text-[13px] text-white/40">{error}</p>
            <button onClick={loadNotifications}
              className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'rgba(14,200,220,0.1)', color: 'rgba(14,200,220,0.8)', border: '1px solid rgba(14,200,220,0.2)' }}>
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 space-y-3">
            <div className="h-16 w-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center mx-auto">
              <Bell className="h-8 w-8 text-white/15" />
            </div>
            <p className="text-sm font-bold text-white/40">No notifications yet</p>
            <p className="text-[11px] text-white/25 max-w-xs mx-auto">Set a price alert or post in community to get started.</p>
            <div className="flex gap-3 justify-center pt-2">
              <button onClick={() => navigate('/Markets')}
                className="px-4 py-2 rounded-xl text-[11px] font-bold transition-all"
                style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                Set Price Alert
              </button>
              <button onClick={() => navigate('/Community')}
                className="px-4 py-2 rounded-xl text-[11px] font-bold transition-all"
                style={{ background: 'rgba(14,200,220,0.08)', color: 'rgba(14,200,220,0.8)', border: '1px solid rgba(14,200,220,0.15)' }}>
                Community
              </button>
            </div>
          </div>
        ) : (
          notifications.map((notif, index) => {
            const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.market_update;
            const Icon = cfg.icon;
            return (
              <motion.div key={notif.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleTap(notif)}
                className="rounded-xl border cursor-pointer transition-all hover:border-white/10"
                style={{
                  background: notif.read ? 'rgba(17,17,24,0.5)' : 'rgba(17,17,24,0.85)',
                  borderColor: notif.read ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                  borderLeft: notif.read ? undefined : `3px solid ${cfg.color}`,
                }}>
                <div className="flex items-start gap-3 p-4">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                    <Icon className="h-5 w-5" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${notif.read ? 'text-white/50' : 'text-white/90'}`}>{notif.title}</p>
                    <p className="text-xs text-white/45 leading-relaxed mt-0.5">{notif.message}</p>
                    <span className="text-[10px] text-white/25 mt-1.5 block">{formatTime(notif.created_date)}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-white/20 flex-shrink-0 mt-1" />
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}