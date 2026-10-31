import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, TrendingUp, AlertTriangle, Newspaper, Bell, Target, Calendar } from 'lucide-react';
import { db } from '@/api/userData';

// AppNotification.type → icon + colour. Anything unknown falls back to the bell.
const TYPE_STYLE = {
  price_alert: { icon: Target, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  trek_signal: { icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  community_like: { icon: TrendingUp, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
  community_copy: { icon: TrendingUp, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
  new_follower: { icon: Bell, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)' },
  market_update: { icon: Newspaper, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
};

const FALLBACK_STYLE = { icon: AlertTriangle, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' };

function relativeTime(value) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (!Number.isFinite(then)) return '';
  const mins = Math.floor((Date.now() - then) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    db.notifications
      .list('-created_date', 100)
      .then(rows => { if (!cancelled) setItems(Array.isArray(rows) ? rows : []); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-[#0A0A0F]/95 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="h-9 w-9 rounded-lg border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-white/60" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-black text-white/95 tracking-tight">
              {t('notifications.title', 'Notifications')}
            </h1>
            <p className="text-[10px] text-white/30 mt-0.5">
              {loading
                ? t('common.loading', 'Loading…')
                : `${items.length} ${t('notifications.count', 'notifications')}`}
            </p>
          </div>
          <Bell className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-2">
        {loading && (
          <div className="space-y-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-[#111118] h-[74px] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="rounded-xl border border-white/[0.06] bg-[#111118] p-12 text-center">
            <Bell className="h-10 w-10 text-white/10 mx-auto mb-3" />
            <p className="text-[13px] font-bold text-white/45">{t('notifications.empty', 'No notifications yet')}</p>
            <p className="text-[11px] text-white/25 mt-1">
              {t('notifications.emptyHint', 'Price alerts and TREK signals will appear here.')}
            </p>
          </div>
        )}

        {!loading && items.map((notif, index) => {
          const style = TYPE_STYLE[notif.type] || FALLBACK_STYLE;
          const Icon = style.icon;
          const route = notif.route || (notif.symbol ? `/Asset/${notif.symbol}` : null);
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index, 8) * 0.03 }}
              onClick={() => route && navigate(route)}
              className={`rounded-xl border border-white/[0.06] bg-[#111118] p-4 transition-colors ${route ? 'hover:bg-[#16161D] cursor-pointer' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: style.bg, border: `1px solid ${style.border}` }}
                >
                  <Icon className="h-5 w-5" style={{ color: style.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/90">{notif.title}</p>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">{notif.message}</p>
                  <span className="text-[10px] text-white/30 mt-2 block font-medium">
                    {relativeTime(notif.created_date)}
                  </span>
                </div>
                {route && <Calendar className="h-4 w-4 text-white/15 flex-shrink-0 mt-1" />}
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="h-20" />
    </div>
  );
}