import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Activity, TrendingUp } from 'lucide-react';

const ACTIONS = [
  {
    icon: Sparkles,
    label: 'Ask TREK',
    sub: 'AI analysis',
    path: '/AIInsights',
    gold: true,
  },
  {
    icon: Activity,
    label: 'Paper Trade',
    sub: 'Risk-free',
    path: '/PaperTrading',
    gold: false,
  },
  {
    icon: TrendingUp,
    label: 'View Signals',
    sub: 'Live alerts',
    path: '/AIInsights',
    gold: false,
  },
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-3">
      {ACTIONS.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all hover:-translate-y-0.5 active:scale-95"
            style={{
              background: action.gold ? 'rgba(245,158,11,0.08)' : '#111118',
              borderColor: action.gold ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="h-9 w-9 rounded-xl flex items-center justify-center"
              style={{
                background: action.gold ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                border: action.gold ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Icon
                className="h-4 w-4"
                style={{ color: action.gold ? '#F59E0B' : 'rgba(255,255,255,0.5)' }}
              />
            </div>
            <div>
              <div
                className="text-[11px] font-bold text-center"
                style={{ color: action.gold ? '#F59E0B' : 'rgba(255,255,255,0.75)' }}
              >
                {action.label}
              </div>
              <div className="text-[9px] text-white/25 text-center">{action.sub}</div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}