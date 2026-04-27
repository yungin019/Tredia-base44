import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, TrendingUp, AlertTriangle, Newspaper, Bell, Target, Calendar } from 'lucide-react';

const ALL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'NVDA Buy Signal',
    message: 'Momentum breakout confirmed. Entry $871. Strong volume support.',
    time: '5m ago',
    type: 'signal',
    route: '/Asset/NVDA',
    icon: TrendingUp,
  },
  {
    id: 2,
    title: 'Portfolio Alert',
    message: 'Tech sector now 62% of portfolio. Consider rebalancing.',
    time: '1h ago',
    type: 'warning',
    route: '/Portfolio',
    icon: AlertTriangle,
  },
  {
    id: 3,
    title: 'Market Update',
    message: 'Fed signals possible rate cuts in H2 2025. Markets rally.',
    time: '3h ago',
    type: 'news',
    route: '/AIInsights',
    icon: Newspaper,
  },
  {
    id: 4,
    title: 'TSLA Sell Signal',
    message: 'Resistance at $245. Consider taking profits on recent gains.',
    time: '5h ago',
    type: 'signal',
    route: '/Asset/TSLA',
    icon: Target,
  },
  {
    id: 5,
    title: 'Earnings Alert',
    message: 'AAPL reports earnings tomorrow after market close.',
    time: '8h ago',
    type: 'calendar',
    route: '/Asset/AAPL',
    icon: Calendar,
  },
  {
    id: 6,
    title: 'Price Alert: BTC',
    message: 'Bitcoin crossed $67,000. Up 8.2% in 24 hours.',
    time: '12h ago',
    type: 'signal',
    route: '/Asset/BTC-USD',
    icon: TrendingUp,
  },
  {
    id: 7,
    title: 'Risk Warning',
    message: 'Portfolio volatility increased to 18.4%. Above your risk threshold.',
    time: '1d ago',
    type: 'warning',
    route: '/Portfolio',
    icon: AlertTriangle,
  },
];

export default function Notifications() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
              {ALL_NOTIFICATIONS.length} {t('notifications.count', 'notifications')}
            </p>
          </div>
          <Bell className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-2">
        {ALL_NOTIFICATIONS.map((notif, index) => {
          const Icon = notif.icon;
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => navigate(notif.route)}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              className="rounded-xl border border-white/[0.06] bg-[#111118] p-4 hover:bg-[#16161D] cursor-pointer transition-all"
              style={{ transition: 'transform 0.1s, background-color 0.2s' }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      notif.type === 'signal'
                        ? 'rgba(34,197,94,0.1)'
                        : notif.type === 'warning'
                          ? 'rgba(245,158,11,0.1)'
                          : notif.type === 'calendar'
                            ? 'rgba(99,102,241,0.1)'
                            : 'rgba(59,130,246,0.1)',
                    border: `1px solid ${
                      notif.type === 'signal'
                        ? 'rgba(34,197,94,0.2)'
                        : notif.type === 'warning'
                          ? 'rgba(245,158,11,0.2)'
                          : notif.type === 'calendar'
                            ? 'rgba(99,102,241,0.2)'
                            : 'rgba(59,130,246,0.2)'
                    }`,
                  }}
                >
                  <Icon
                    className="h-5 w-5"
                    style={{
                      color:
                        notif.type === 'signal'
                          ? '#22c55e'
                          : notif.type === 'warning'
                            ? '#F59E0B'
                            : notif.type === 'calendar'
                              ? '#6366f1'
                              : '#3b82f6',
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white/90">{notif.title}</p>
                  <p className="text-xs text-white/50 leading-relaxed mt-1">{notif.message}</p>
                  <span className="text-[10px] text-white/30 mt-2 block font-medium">{notif.time}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-white/20 flex-shrink-0 mt-1" />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="h-20" />
    </div>
  );
}