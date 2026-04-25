import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check, Brain, Zap, TrendingUp, Shield, Crown, Link2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { claimFoundingMemberSlot, getFoundingStats } from '@/api/foundingMembers';

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

function OptionButton({ label, selected, onClick, color = '#F59E0B' }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-semibold transition-all text-left"
      style={{
        background: selected ? `${color}12` : 'rgba(255,255,255,0.02)',
        borderColor: selected ? `${color}60` : 'rgba(255,255,255,0.08)',
        color: selected ? color : 'rgba(255,255,255,0.65)',
        outline: 'none',
      }}
    >
      {label}
      {selected && <Check className="h-4 w-4 flex-shrink-0" style={{ color }} />}
    </motion.button>
  );
}

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [ogStats, setOgStats] = useState(null);
  const [ogNumber, setOgNumber] = useState(null);

  // Profile fields
  const [budget, setBudget] = useState('');
  const [risk, setRisk] = useState('');
  const [horizon, setHorizon] = useState('');
  const [interests, setInterests] = useState('');

  // Translated option arrays — defined inside component so t() is accessible
  const BUDGET_OPTIONS = [
    t('onboarding.budget.under500', 'Under $500'),
    t('onboarding.budget.500to5k', '$500 – $5K'),
    t('onboarding.budget.5kto50k', '$5K – $50K'),
    t('onboarding.budget.50kplus', '$50K+'),
  ];
  const RISK_OPTIONS = [
    t('onboarding.risk.conservative', 'Conservative'),
    t('onboarding.risk.moderate', 'Moderate'),
    t('onboarding.risk.aggressive', 'Aggressive'),
  ];
  const HORIZON_OPTIONS = [
    t('onboarding.horizon.days', 'Days (swing trading)'),
    t('onboarding.horizon.months', 'Months (position trading)'),
    t('onboarding.horizon.years', 'Years (investing)'),
  ];
  const INTERESTS_OPTIONS = [
    t('onboarding.interests.stocks', 'Stocks'),
    t('onboarding.interests.crypto', 'Crypto'),
    t('onboarding.interests.commodities', 'Commodities'),
    t('onboarding.interests.all', 'All markets'),
  ];

  const TREK_SYSTEMS = [
    { icon: Brain, labelKey: 'onboarding.trek.system1', fallback: 'AI Signal Engine', color: '#60A5FA' },
    { icon: Zap, labelKey: 'onboarding.trek.system2', fallback: 'Real-Time Alerts', color: '#F59E0B' },
    { icon: TrendingUp, labelKey: 'onboarding.trek.system3', fallback: 'Market Catalysts', color: '#22C55E' },
    { icon: Shield, labelKey: 'onboarding.trek.system4', fallback: 'Risk Scanner', color: '#EF4444' },
  ];

  useEffect(() => {
    getFoundingStats().then(stats => setOgStats(stats)).catch(() => {});
  }, []);

  const handleOGClaim = async () => {
    try {
      const user = await base44.auth.me();
      if (user?.id || user?.email) {
        const member = await claimFoundingMemberSlot(user.email || user.id);
        if (member) {
          setOgNumber(member.og_number);
          setStep(2);
        }
      }
    } catch (e) {
      console.error('OG claim error:', e);
      setStep(2);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        onboarding_completed: true,
        ...(budget && { budget_range: budget }),
        ...(risk && { risk_tolerance: risk }),
        ...(horizon && { time_horizon: horizon }),
        ...(interests && { interests }),
      };
      await base44.auth.updateMe(profileData);
    } catch (e) {
      console.error('Profile save error:', e);
    }
    setSaving(false);
    setStep(3.5);
  };

  const handleAlpacaConnect = () => {
    navigate('/alpaca-connect');
  };

  const OG_FEATURES = [
    t('onboarding.og.feature1', 'Lifetime Elite access — free forever'),
    t('onboarding.og.feature2', 'OG badge on your profile'),
    t('onboarding.og.feature3', 'Priority support & early features'),
    t('onboarding.og.feature4', 'Exclusive founding member community'),
  ];

  const BROKER_FEATURES = [
    t('onboarding.broker.feature1', 'Execute trades directly from TREK signals'),
    t('onboarding.broker.feature2', 'Real-time portfolio sync'),
    t('onboarding.broker.feature3', 'Commission-free US stocks & crypto'),
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden" style={{ backgroundColor: '#0A0A0F' }}>
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute w-96 h-96 rounded-full opacity-[0.05] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />

      <div className="relative w-full max-w-xl">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl font-black" style={{ color: '#F59E0B', letterSpacing: '-0.03em' }}>TREDIO</span>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* STEP 1: OG Counter Offer */}
          {step === 1 && (
            <motion.div key="og" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="rounded-2xl border border-[#F59E0B]/25 bg-[#111118] p-8" style={{ boxShadow: '0 0 40px rgba(245,158,11,0.08)' }}>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-full px-3 py-1 mb-3">
                    <Crown className="h-3 w-3 text-[#F59E0B]" />
                    <span className="text-[9px] font-black tracking-[0.15em] uppercase text-[#F59E0B]">{t('onboarding.og.badge', 'Founding Member')}</span>
                  </div>
                  <h1 className="text-2xl font-black text-white/90 mb-2">{t('onboarding.og.title', 'Be one of 100 OG Members')}</h1>
                  <p className="text-sm text-white/50 mb-1">
                    &#x1F534; LIVE &mdash; {ogStats?.foundingSpotsRemaining || 100} {t('onboarding.og.spotsLeft', 'spots left')}
                  </p>
                </div>

                <ul className="space-y-3 mb-6">
                  {OG_FEATURES.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                        <Check className="h-3 w-3 text-[#F59E0B]" />
                      </div>
                      <span className="text-sm text-white/70">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleOGClaim}
                    disabled={ogStats?.isSoldOut}
                    className="py-3 rounded-xl font-black text-sm tracking-wide transition-all"
                    style={{
                      background: ogStats?.isSoldOut ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #F59E0B, #D97706)',
                      color: ogStats?.isSoldOut ? 'rgba(255,255,255,0.3)' : '#0A0A0F',
                      opacity: ogStats?.isSoldOut ? 0.5 : 1
                    }}>
                    {ogStats?.isSoldOut ? t('onboarding.og.soldOut', 'Sold Out') : t('onboarding.og.claimBtn', 'Claim My Spot — Free')}
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    className="py-3 rounded-xl font-bold text-sm border border-white/[0.1] hover:border-white/20 transition-colors text-white/60">
                    {t('onboarding.og.skipBtn', 'Skip for now')}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: What is TREK */}
          {step === 2 && (
            <motion.div key="ai" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="rounded-2xl border border-white/[0.08] bg-[#111118] p-8 text-center">
                <div className="inline-flex items-center gap-2 bg-[#F59E0B]/10 border border-[#F59E0B]/25 rounded-full px-3 py-1 mb-3">
                  <Zap className="h-3 w-3 text-[#F59E0B]" />
                  <span className="text-[9px] font-black tracking-[0.15em] uppercase text-[#F59E0B]">{t('onboarding.trek.badge', 'Meet TREK AI')}</span>
                </div>
                <h1 className="text-2xl font-black text-white/90 mb-2">{t('onboarding.trek.title', 'Your AI Trading Intelligence')}</h1>
                <p className="text-sm text-white/45 mb-2 leading-relaxed">
                  {t('onboarding.trek.desc', 'TREK reads the market 24/7 and tells you exactly what to watch, when to act, and why it matters.')}
                </p>
                <p className="text-xs text-white/30 mb-6">{t('onboarding.trek.noJargon', 'No jargon. No noise. Just signals.')}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  {TREK_SYSTEMS.map((sys, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="flex flex-col items-center gap-3 p-4 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{ background: `${sys.color}15`, border: `1px solid ${sys.color}30` }}>
                        <sys.icon className="h-6 w-6" style={{ color: sys.color }} />
                      </div>
                      <span className="text-xs font-semibold text-white/60">{t(sys.labelKey, sys.fallback)}</span>
                    </motion.div>
                  ))}
                </div>

                <button
                  onClick={() => setStep(3)}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
                  {t('onboarding.trek.continueBtn', 'Continue')} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Profile Questions */}
          {step === 3 && (
            <motion.div key="profile" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="rounded-2xl border border-white/[0.08] bg-[#111118] p-6">
                <div className="text-center mb-6">
                  <h1 className="text-xl font-black text-white/90 mb-1">{t('onboarding.profile.title', 'Tell us about yourself')}</h1>
                  <p className="text-sm text-white/35">{t('onboarding.profile.subtitle', 'TREK personalizes your signals based on this')}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">{t('onboarding.profile.budgetLabel', 'Trading budget')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {BUDGET_OPTIONS.map(opt => (
                        <OptionButton key={opt} label={opt} selected={budget === opt} onClick={() => setBudget(opt)} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">{t('onboarding.profile.riskLabel', 'Risk tolerance')}</p>
                    <div className="flex flex-col gap-2">
                      {RISK_OPTIONS.map(opt => (
                        <OptionButton key={opt} label={opt} selected={risk === opt} onClick={() => setRisk(opt)} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">{t('onboarding.profile.horizonLabel', 'Time horizon')}</p>
                    <div className="flex flex-col gap-2">
                      {HORIZON_OPTIONS.map(opt => (
                        <OptionButton key={opt} label={opt} selected={horizon === opt} onClick={() => setHorizon(opt)} />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">{t('onboarding.profile.interestsLabel', 'Interests')}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {INTERESTS_OPTIONS.map(opt => (
                        <OptionButton key={opt} label={opt} selected={interests === opt} onClick={() => setInterests(opt)} />
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleProfileSave}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm mt-6"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F', opacity: saving ? 0.7 : 1 }}>
                  {saving ? t('common.loading', 'Loading...') : <><span>{t('onboarding.profile.continueBtn', 'Continue')}</span> <ArrowRight className="h-4 w-4" /></>}
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3.5: Activate Live Trading */}
          {step === 3.5 && (
            <motion.div key="broker" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="rounded-2xl border border-white/[0.08] bg-[#111118] p-8">
                <div className="text-center mb-6">
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(255,199,0,0.1)', border: '1px solid rgba(255,199,0,0.25)' }}>
                    <Link2 className="h-7 w-7" style={{ color: '#FFC700' }} />
                  </div>
                  <h1 className="text-2xl font-black text-white/90 mb-2">{t('onboarding.broker.title', 'Activate Live Trading')}</h1>
                  <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest">{t('onboarding.broker.subtitle', 'Optional — skip anytime')}</p>
                </div>

                <p className="text-sm text-white/50 mb-5 leading-relaxed text-center">
                  {t('onboarding.broker.desc', 'Connect your Alpaca brokerage account to execute TREK signals with one tap.')}
                </p>

                <ul className="space-y-3 mb-6">
                  {BROKER_FEATURES.map((f) => (
                    <li key={f} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
                        <Check className="h-3 w-3 text-[#22c55e]" />
                      </div>
                      <span className="text-sm text-white/70">{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleAlpacaConnect}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-black text-sm tracking-wide"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
                    {t('onboarding.broker.connectBtn', 'Connect Alpaca')} <ArrowRight className="h-4 w-4" />
                  </motion.button>

                  <button
                    onClick={() => setStep(4)}
                    className="w-full py-3 rounded-xl font-bold text-sm border border-white/[0.08] hover:border-white/15 transition-colors text-white/40">
                    {t('onboarding.broker.skipBtn', 'Skip — I\'ll do this later')}
                  </button>
                </div>

                <p className="text-[9px] text-white/20 text-center mt-4 leading-relaxed">
                  {t('onboarding.broker.legal', 'Brokerage services by Alpaca Securities LLC, member FINRA/SIPC.')}
                </p>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Launch CTA */}
          {step === 4 && (
            <motion.div key="account" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="rounded-2xl border border-white/[0.08] bg-[#111118] p-8 text-center">
                <div className="h-16 w-16 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-[#F59E0B]" />
                </div>
                <h1 className="text-2xl font-black text-white/90 mb-2">{t('onboarding.ready.title', "You're all set!")}</h1>
                <p className="text-sm text-white/40 mb-2">{t('onboarding.ready.subtitle', 'TREK is ready to guide your trading.')}</p>
                <p className="text-xs text-white/25 mb-8">{t('onboarding.ready.note', 'You can always adjust your preferences in Settings.')}</p>

                <button
                  onClick={async () => {
                    // Ensure onboarding_completed is set before navigating
                    try { await base44.auth.updateMe({ onboarding_completed: true }); } catch {}
                    window.location.href = '/Home';
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
                  {t('onboarding.ready.enterBtn', 'Enter TREDIO')} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 5: OG Welcome (if claimed) */}
          {step === 5 && ogNumber && (
            <motion.div key="welcome" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="rounded-2xl border border-[#F59E0B]/25 bg-[#111118] p-8 text-center">
                <div className="inline-flex items-center gap-2 bg-[#F59E0B]/15 border border-[#F59E0B]/30 rounded-full px-4 py-2 mb-4">
                  <Crown className="h-5 w-5 text-[#F59E0B]" />
                  <span className="text-sm font-black text-[#F59E0B]">OG #{ogNumber}</span>
                </div>
                <h1 className="text-2xl font-black text-white/90 mb-2">{t('onboarding.welcome.title', 'Welcome to the inner circle')}</h1>
                <p className="text-sm text-white/50 mb-8">{t('onboarding.welcome.referral', 'Share your link and earn rewards when friends join.')}</p>

                <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-xs font-mono text-white/60 mb-2">https://tredio.app/join?ref=OG{ogNumber}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`https://tredio.app/join?ref=OG${ogNumber}`);
                    }}
                    className="text-xs font-bold text-[#F59E0B] hover:text-[#F59E0B]/80 transition-colors">
                    {t('onboarding.welcome.copyLink', 'Copy link')}
                  </button>
                </div>

                <button
                  onClick={async () => {
                    try { await base44.auth.updateMe({ onboarding_completed: true }); } catch {}
                    window.location.href = '/Home';
                  }}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
                  {t('onboarding.ready.enterBtn', 'Enter TREDIO')} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}