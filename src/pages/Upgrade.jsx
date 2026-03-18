import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Zap, Check, Crown, Users, AlertCircle } from 'lucide-react';
import { getFoundingStats, claimFoundingMemberSlot, getFoundingMemberInfo } from '@/api/foundingMembers';
import { base44 } from '@/api/base44Client';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { getProductId } from '@/lib/revenuecat-config';

const ELITE_FEATURES = [
  'Unlimited TREK AI signals',
  'Super AI — 4-model consensus',
  'Real-time price alerts',
  'Advanced analytics & charts',
  'Priority support 24/7',
];

const FOUNDING_FEATURES = [
  '2 Months Elite — FREE',
  'Then 50% off for life',
  'OG Badge on your profile',
  'Private Discord access',
  'Early access to new features',
];

export default function Upgrade() {
  const { t } = useTranslation();
  const { makePurchase, restorePurchases, purchaseInProgress, purchaseError, isInitialized } = useRevenueCat();
  const [stats, setStats] = useState({ foundingSpotsTaken: 0, foundingSpotsRemaining: 100, isSoldOut: false });
  const [loadingStats, setLoadingStats] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const [joinedNumber, setJoinedNumber] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'annual'
  const [lastPurchaseError, setLastPurchaseError] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [statsData, user] = await Promise.all([getFoundingStats(), base44.auth.me()]);
        setStats(statsData);
        const userId = user?.email || user?.id;
        if (userId) {
          const existing = await getFoundingMemberInfo(userId);
          if (existing) {
            setJoined(true);
            setJoinedNumber(existing.og_number);
          }
        }
      } catch (e) {
        // ignore
      } finally {
        setLoadingStats(false);
      }
    };
    init();
  }, []);

  const handleJoinFounding = async () => {
    setJoining(true);
    try {
      const user = await base44.auth.me();
      const userId = user?.email || user?.id;
      if (!userId) return;
      const member = await claimFoundingMemberSlot(userId);
      if (member) {
        setJoined(true);
        setJoinedNumber(member.og_number);
        // Refresh stats
        const fresh = await getFoundingStats();
        setStats(fresh);
      }
    } catch (e) {
      console.error('Founding member join error:', e);
    } finally {
      setJoining(false);
    }
  };

  const pctFull = stats.foundingSpotsTaken / 100;

  return (
    <div className="p-4 lg:p-6 max-w-2xl mx-auto pb-24 space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-black text-white/95 tracking-tight">{t('upgrade.title')}</h1>
        <p className="text-sm text-white/35 mt-1">Unlock the full power of TREDIA</p>
      </motion.div>

      {/* OG100 FOUNDING MEMBER BLOCK */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-2xl p-[1px] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #FCD34D55, #F59E0B)' }}
      >
        {/* Glow */}
        <div className="absolute inset-0 opacity-20 blur-xl rounded-2xl" style={{ background: 'radial-gradient(circle at 50% 0%, #F59E0B, transparent 70%)' }} />

        <div className="relative rounded-2xl p-6" style={{ background: 'linear-gradient(160deg, #13120a, #0e0e14)' }}>
          {/* Header */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-[#F59E0B]" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[#F59E0B]">Founding Member Offer</span>
              </div>
              <p className="text-[10px] text-white/35 tracking-wider uppercase font-semibold">First 100 users only</p>
            </div>
            <div className="text-[8px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase"
              style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.4)' }}>
              OG100
            </div>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 mb-6">
            {FOUNDING_FEATURES.map((f, i) => (
              <li key={f} className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)' }}>
                  <Check className="h-2.5 w-2.5 text-[#F59E0B]" />
                </div>
                <span className={`text-sm font-semibold ${i === 0 ? 'text-white/90' : 'text-white/55'}`}>{f}</span>
              </li>
            ))}
          </ul>

          {/* Spots counter */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Users className="h-3 w-3 text-white/30" />
                {loadingStats ? (
                  <span className="text-[11px] text-white/30">Loading...</span>
                ) : joined ? (
                  <span className="text-[11px] text-[#F59E0B] font-bold">You are OG #{joinedNumber} · 100 spots claimed</span>
                ) : stats.isSoldOut ? (
                  <span className="text-[11px] text-red-400 font-bold">100 of 100 spots taken — SOLD OUT</span>
                ) : (
                  <span className="text-[11px] text-white/50">
                    <span className="text-white/80 font-bold">{stats.foundingSpotsTaken}</span> of 100 spots taken
                    <span className="text-[#F59E0B] font-bold ml-1">· {stats.foundingSpotsRemaining} remaining</span>
                  </span>
                )}
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: loadingStats ? '0%' : `${pctFull * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #F59E0B, #FCD34D)' }}
              />
            </div>
          </div>

          {/* CTA — suppressed while loading to prevent flicker */}
          {loadingStats ? (
            <div className="h-11 rounded-xl animate-pulse" style={{ background: 'rgba(245,158,11,0.08)' }} />
          ) : joined ? (
            <div className="text-center py-3 rounded-xl font-black text-sm"
              style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e' }}>
              ✓ You're OG #{joinedNumber} — Founding Member
            </div>
          ) : stats.isSoldOut ? (
            <div className="text-center py-3 rounded-xl font-bold text-sm text-white/30"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              All 100 founding spots are taken
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02, opacity: 0.92 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleJoinFounding}
              disabled={joining}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all"
              style={{
                background: joining ? 'rgba(245,158,11,0.4)' : 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                color: '#0A0A0F',
                boxShadow: '0 0 30px rgba(245,158,11,0.2)',
              }}
            >
              {joining ? 'Joining...' : '⚡ JOIN AS FOUNDING MEMBER →'}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Elite Plan */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl border border-white/[0.08] bg-[#111118] p-6">
        <div className="flex items-center gap-2 mb-1">
          <Crown className="h-4 w-4 text-[#F59E0B]" />
          <span className="text-[10px] font-black tracking-[0.18em] uppercase text-[#F59E0B]">Elite Plan</span>
        </div>
        <p className="text-2xl font-black text-white/90 mb-1">$49.99<span className="text-sm font-medium text-white/35">/mo</span></p>
        <p className="text-xs text-white/30 mb-5">Full TREDIA intelligence, zero limits.</p>
        <ul className="space-y-2.5 mb-6">
          {ELITE_FEATURES.map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-white/55">
              <span className="text-[#F59E0B]">⚡</span> {f}
            </li>
          ))}
        </ul>
        <button onClick={() => {
          // TODO: Wire to RevenueCat or Apple In-App Purchases
          // For now, show honest upgrade flow
          const { upgradeTier } = require('@/hooks/useSubscription');
          console.log('Elite purchase flow would trigger here - blocked by RevenueCat setup');
        }}
          className="w-full py-3 rounded-xl font-black text-sm tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50"
          title="Requires RevenueCat SDK integration with Apple In-App Purchases"
          disabled={false}
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
          {t('upgrade.elite')} → <span style={{ fontSize: '10px', opacity: 0.7 }}>RevenueCat</span>
        </button>
      </motion.div>

      {/* Pro Plan */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-xl border border-white/[0.06] bg-[#111118] p-6">
        <span className="text-[10px] font-black tracking-[0.18em] uppercase text-white/40">Pro Plan</span>
        <p className="text-2xl font-black text-white/90 mb-1 mt-1">$19.99<span className="text-sm font-medium text-white/35">/mo</span></p>
        <p className="text-xs text-white/30 mb-5">For serious traders who want more.</p>
        <ul className="space-y-2.5 mb-6">
          {['Unlimited TREK signals', 'Real-time price alerts', 'Advanced charts'].map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-white/55">
              <span className="text-white/30">✓</span> {f}
            </li>
          ))}
        </ul>
        <button onClick={() => {
          // TODO: Wire to RevenueCat or Apple In-App Purchases
          console.log('Pro purchase flow would trigger here - blocked by RevenueCat setup');
        }}
          className="w-full py-3 rounded-xl font-bold text-sm tracking-wide border border-white/[0.1] hover:border-white/20 transition-colors text-white/55 disabled:opacity-50"
          title="Requires RevenueCat SDK integration with Apple In-App Purchases"
          disabled={false}>
          {t('upgrade.pro')} → <span style={{ fontSize: '10px', opacity: 0.7 }}>RevenueCat</span>
        </button>
      </motion.div>
    </div>
  );
}