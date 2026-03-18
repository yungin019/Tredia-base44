import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { TrendingUp, Star, ArrowRight, Check, ChevronRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { claimFoundingMemberSlot } from '@/api/foundingMembers';

const BROKERS = [
  { id: 'alpaca', name: 'Alpaca', desc: 'Commission-free API-first trading for stocks & crypto', recommended: true, color: '#F59E0B' },
  { id: 'ibkr', name: 'IBKR', desc: 'Interactive Brokers — professional-grade global markets', recommended: false, color: '#60A5FA' },
  { id: 'robinhood', name: 'Robinhood', desc: 'Simple commission-free stocks, ETFs, and options', recommended: false, color: '#22C55E' },
  { id: 'coinbase', name: 'Coinbase', desc: 'Leading crypto exchange with 200+ digital assets', recommended: false, color: '#818CF8' },
  { id: 'schwab', name: 'Schwab', desc: 'Full-service brokerage with research & tools', recommended: false, color: '#94A3B8' },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const BUDGET_OPTIONS = ['Under €500', '€500–5k', '€5k–50k', '€50k+'];
const RISK_OPTIONS = ['Conservative', 'Moderate', 'Aggressive'];
const GOAL_OPTIONS = ['Learning', 'Growing wealth', 'Active trading'];
const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'];

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

function TrekIntro({ onEnter }) {
  return (
    <motion.div key="trek" {...fadeUp} transition={{ duration: 0.4 }}>
      <div className="rounded-2xl border border-[#F59E0B]/20 bg-[#111118] p-8 flex flex-col items-center gap-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="h-16 w-16 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 flex items-center justify-center"
          style={{ boxShadow: '0 0 32px rgba(245,158,11,0.15)' }}
        >
          <span className="text-2xl font-black" style={{ color: '#F59E0B' }}>T</span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#F59E0B]/60 mb-2">Meet TREK</p>
          <h2 className="text-xl font-black text-white/90 mb-1">Your Trading Intelligence</h2>
        </motion.div>
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="text-sm text-white/45 leading-relaxed max-w-sm">
          "Hey, I'm TREK — your personal trading intelligence. I analyze markets 24/7 so you always know what's moving and why. Let's make you a better trader."
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onEnter}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm mt-2"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}
        >
          Enter TREDIA <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function Onboarding() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState('choice');
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [connected, setConnected] = useState(false);
  const [saving, setSaving] = useState(false);

  // Profile fields
  const [budgetRange, setBudgetRange] = useState('');
  const [riskTolerance, setRiskTolerance] = useState('');
  const [goal, setGoal] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');

  const handleConnect = (brokerId) => {
    setSelectedBroker(brokerId);
    setConnected(true);
    setTimeout(() => setStep('profile'), 1200);
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const profileData = {
        onboarding_completed: true,
        ...(budgetRange && { budget_range: budgetRange }),
        ...(riskTolerance && { risk_tolerance: riskTolerance }),
        ...(goal && { goal }),
        ...(experienceLevel && { experience_level: experienceLevel }),
      };
      await base44.auth.updateMe(profileData);

      // Try to claim founding member slot
      const user = await base44.auth.me();
      if (user?.id || user?.email) {
        await claimFoundingMemberSlot(user.email || user.id);
      }
    } catch (e) {
      console.error('Profile save error:', e);
    }
    setSaving(false);
    setStep('trek');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden" style={{ backgroundColor: '#0A0A0F' }}>
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute w-96 h-96 rounded-full opacity-[0.05] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }} />

      <div className="relative w-full max-w-xl">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-8">
          <span className="text-2xl font-black" style={{ color: '#F59E0B', letterSpacing: '-0.03em' }}>TREDIA</span>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* STEP 1: Choice */}
          {step === 'choice' && (
            <motion.div key="choice" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="text-center mb-6">
                  <h1 className="text-2xl font-black text-white/90 mb-1">{t('onboarding.title')}</h1>
                  <p className="text-sm text-white/35">Tell us about your trading experience</p>
                </div>
              <div className="grid grid-cols-2 gap-4">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('broker')}
                  className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#111118] cursor-pointer transition-all text-left group" style={{ outline: 'none' }}>
                  <div className="h-12 w-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center group-hover:bg-[#F59E0B]/15 transition-all">
                    <TrendingUp className="h-6 w-6 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="font-bold text-white/90 text-base mb-1">I Already Trade</p>
                    <p className="text-xs text-white/35 leading-relaxed">Connect your existing broker to get started instantly</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#F59E0B]/50 self-end mt-auto" />
                </motion.button>

                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('paper')}
                  className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#111118] cursor-pointer transition-all text-left group" style={{ outline: 'none' }}>
                  <div className="h-12 w-12 rounded-xl bg-[#60A5FA]/10 border border-[#60A5FA]/20 flex items-center justify-center group-hover:bg-[#60A5FA]/15 transition-all">
                    <Star className="h-6 w-6 text-[#60A5FA]" />
                  </div>
                  <div>
                    <p className="font-bold text-white/90 text-base mb-1">New to Trading</p>
                    <p className="text-xs text-white/35 leading-relaxed">Start with guided AI insights and paper trading</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#60A5FA]/50 self-end mt-auto" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2A: Broker */}
          {step === 'broker' && (
            <motion.div key="broker" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-white/90 mb-1">Connect Your Broker</h1>
                <p className="text-sm text-white/35">Choose your brokerage to sync your portfolio</p>
              </div>
              <div className="flex flex-col gap-3">
                {BROKERS.map((broker, i) => (
                  <motion.div key={broker.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                      onClick={() => handleConnect(broker.id)} disabled={connected}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.08] bg-[#111118] hover:bg-white/[0.03] transition-all text-left" style={{ outline: 'none' }}>
                      <div className="h-10 w-10 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: `${broker.color}15`, border: `1px solid ${broker.color}25`, color: broker.color }}>
                        {broker.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-white/85 text-sm">{broker.name}</span>
                          {broker.recommended && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: '#F59E0B20', color: '#F59E0B', border: '1px solid #F59E0B30' }}>
                              ⭐ Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/30 truncate">{broker.desc}</p>
                      </div>
                      {connected && selectedBroker === broker.id ? (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                          className="h-6 w-6 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center flex-shrink-0">
                          <Check className="h-3 w-3 text-[#22C55E]" />
                        </motion.div>
                      ) : (
                        <span className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0" style={{ background: '#F59E0B15', color: '#F59E0B', border: '1px solid #F59E0B25' }}>Connect</span>
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </div>
              <button onClick={() => setStep('choice')} className="mt-4 text-xs text-white/25 hover:text-white/45 transition-colors flex items-center gap-1 mx-auto">← Back</button>
            </motion.div>
          )}

          {/* STEP 2B: Paper Trading */}
          {step === 'paper' && (
            <motion.div key="paper" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-white/90 mb-1">Let's Get You Started</h1>
                <p className="text-sm text-white/35">No real money. No risk. Just learning.</p>
              </div>
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
                className="rounded-2xl border border-[#F59E0B]/20 bg-[#111118] p-6 mb-4"
                style={{ boxShadow: '0 0 40px rgba(245,158,11,0.06)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#F59E0B]/60">Virtual Portfolio</p>
                    <p className="text-xl font-black text-white/90" style={{ fontFamily: 'JetBrains Mono, monospace' }}>$100,000.00</p>
                  </div>
                </div>
                <p className="text-sm text-white/40 leading-relaxed mb-6">Start with $100k in paper trading. Learn with zero risk.</p>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setStep('profile')}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
                  Start Paper Trading <ArrowRight className="h-4 w-4" />
                </motion.button>
              </motion.div>
              <button onClick={() => setStep('choice')} className="text-xs text-white/25 hover:text-white/45 transition-colors flex items-center gap-1 mx-auto">← Back</button>
            </motion.div>
          )}

          {/* STEP 3: AI Personalization Profile */}
          {step === 'profile' && (
            <motion.div key="profile" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-full px-3 py-1 mb-3">
                  <span className="text-[9px] font-black tracking-[0.15em] uppercase text-[#F59E0B]">TREK AI Personalization</span>
                </div>
                <h1 className="text-2xl font-black text-white/90 mb-1">Customize Your Intelligence</h1>
                <p className="text-sm text-white/35">TREK adapts to your level and goals</p>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">Investment Budget</p>
                  <div className="grid grid-cols-2 gap-2">
                    {BUDGET_OPTIONS.map(opt => (
                      <OptionButton key={opt} label={opt} selected={budgetRange === opt} onClick={() => setBudgetRange(opt)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">Risk Tolerance</p>
                  <div className="flex flex-col gap-2">
                    {RISK_OPTIONS.map(opt => (
                      <OptionButton key={opt} label={opt} selected={riskTolerance === opt} onClick={() => setRiskTolerance(opt)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">Your Goal</p>
                  <div className="flex flex-col gap-2">
                    {GOAL_OPTIONS.map(opt => (
                      <OptionButton key={opt} label={opt} selected={goal === opt} onClick={() => setGoal(opt)} />
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">Experience Level</p>
                  <div className="flex flex-col gap-2">
                    {EXPERIENCE_OPTIONS.map(opt => (
                      <OptionButton key={opt} label={opt} selected={experienceLevel === opt} onClick={() => setExperienceLevel(opt)} />
                    ))}
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleProfileSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm mt-6"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving...' : <>Continue <ArrowRight className="h-4 w-4" /></>}
              </motion.button>

              <button onClick={() => setStep('choice')} className="mt-3 text-xs text-white/25 hover:text-white/45 transition-colors flex items-center gap-1 mx-auto">← Back</button>
            </motion.div>
          )}

          {/* STEP 4: TREK Introduction */}
          {step === 'trek' && (
            <TrekIntro onEnter={() => navigate('/Dashboard')} />
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}