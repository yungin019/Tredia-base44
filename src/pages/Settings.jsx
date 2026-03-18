import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Globe, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { getFoundingMemberInfo } from '@/api/foundingMembers';
import FoundingMemberBadge from '@/components/settings/FoundingMemberBadge';
import { useSubscription } from '@/hooks/useSubscription';

function SectionHeader({ title }) {
  return (
    <h2 className="text-[11px] font-black uppercase tracking-[0.18em] mb-3" style={{ color: '#F59E0B' }}>
      {title}
    </h2>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? '#F59E0B' : 'rgba(255,255,255,0.08)' }}
    >
      <span
        className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  );
}

const PRO_FEATURES = [
  'Unlimited TREK signals',
  'Real-time price alerts',
  'Advanced analytics & charts',
  'Priority support',
];

export default function Settings() {
  const navigate = useNavigate();
  const { tier } = useSubscription();
  const [user, setUser] = useState(null);
  const [foundingMember, setFoundingMember] = useState(null);
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    trekSignals: true,
    newsAlerts: true,
    earningsCalendar: false,
  });

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        const userId = u?.email || u?.id;
        if (userId) {
          getFoundingMemberInfo(userId)
            .then(setFoundingMember)
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const toggle = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto space-y-6">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="text-2xl font-black text-white/95 tracking-tight">
        Settings
      </motion.h1>

      {/* FOUNDING MEMBER BADGE */}
      {foundingMember && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <FoundingMemberBadge ogNumber={foundingMember.og_number} />
        </motion.div>
      )}

      {/* PROFILE */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-xl border border-white/[0.06] bg-[#111118] p-5 space-y-4">
        <SectionHeader title="Profile" />
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
            <User className="h-9 w-9 text-white/25" />
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <label className="text-[10px] font-semibold text-white/30 uppercase tracking-wider block mb-1">Name</label>
              <div className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/85">
                {user?.full_name || '—'}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-white/30 uppercase tracking-wider block mb-1">Email</label>
              <div className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-sm text-white/85">
                {user?.email || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Profile Summary */}
        {(user?.budget_range || user?.experience_level) && (
          <div className="pt-3 border-t border-white/[0.05]">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/25 mb-2">AI Personalization</p>
            <div className="flex flex-wrap gap-2">
              {user.budget_range && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                  style={{ background: 'rgba(245,158,11,0.08)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}>
                  {user.budget_range}
                </span>
              )}
              {user.risk_tolerance && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {user.risk_tolerance}
                </span>
              )}
              {user.goal && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {user.goal}
                </span>
              )}
              {user.experience_level && (
                <span className="text-[10px] px-2 py-1 rounded-lg font-semibold"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {user.experience_level}
                </span>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* CONNECTED BROKERS */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-white/[0.06] bg-[#111118] p-5">
        <SectionHeader title="Connected Brokers" />
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="h-12 w-12 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
            <Briefcase className="h-6 w-6 text-white/20" />
          </div>
          <p className="text-sm text-gray-400">No brokers connected</p>
          <button onClick={() => navigate('/Onboarding')}
            className="px-6 py-2.5 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
            Add Broker
          </button>
        </div>
      </motion.div>

      {/* NOTIFICATIONS */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-xl border border-white/[0.06] bg-[#111118] p-5 space-y-3">
        <SectionHeader title="Notifications" />
        {[
          { key: 'priceAlerts', label: 'Price Alerts', desc: 'Get notified when assets hit your target price' },
          { key: 'trekSignals', label: 'TREK Signals', desc: 'AI-generated trading signals and opportunities' },
          { key: 'newsAlerts', label: 'News Alerts', desc: 'Breaking market news affecting your holdings' },
          { key: 'earningsCalendar', label: 'Earnings Calendar', desc: 'Upcoming earnings reports for watched stocks' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between gap-4 py-2 border-b border-white/[0.04] last:border-0">
            <div>
              <p className="text-sm font-semibold text-white/80">{label}</p>
              <p className="text-[11px] text-white/30 mt-0.5">{desc}</p>
            </div>
            <Toggle checked={notifications[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </motion.div>

      {/* ACCOUNT TIER */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-xl border border-white/[0.06] bg-[#111118] p-5 space-y-4">
        <SectionHeader title="Account Tier" />
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase ${
            tier === 'elite' ? 'bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B]' :
            tier === 'pro' ? 'bg-blue-500/15 border border-blue-500/40 text-blue-400' :
            'bg-white/[0.06] border border-white/[0.1] text-white/40'
          }`}>
            {tier.toUpperCase()}
          </span>
          <span className="text-xs text-white/25">Current plan</span>
        </div>
        <ul className="space-y-2 mb-4">
          {PRO_FEATURES.map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-white/50">
              <span style={{ color: '#F59E0B' }}>⚡</span>{f}
            </li>
          ))}
        </ul>
        <button
          onClick={() => navigate('/Upgrade')}
          className="w-full py-3 rounded-xl font-black text-sm tracking-wide transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#0A0A0F' }}>
          ⚡ Upgrade to PRO
        </button>
      </motion.div>

      {/* LANGUAGE */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="rounded-xl border border-white/[0.06] bg-[#111118] p-5">
        <SectionHeader title="Language" />
        <div className="flex items-center gap-3">
          <Globe className="h-5 w-5 text-white/25" />
          <span className="text-sm text-white/55">Auto-detected: <span className="text-white/80 font-semibold">English</span></span>
        </div>
      </motion.div>

      {/* VERSION */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center pb-4">
        <span className="text-xs text-gray-400 font-mono">TREDIA v1.0.0</span>
      </motion.div>
    </div>
  );
}