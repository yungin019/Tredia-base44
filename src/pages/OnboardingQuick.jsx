import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, Brain, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const TRADER_LEVELS = [
  { id: 'beginner', label: '🌱 Beginner', description: 'Just starting to trade' },
  { id: 'intermediate', label: '📊 Intermediate', description: '1-3 years experience' },
  { id: 'advanced', label: '🚀 Advanced', description: 'Professional trader' },
];

const INTERESTS = [
  { id: 'stocks', label: '📈 Stocks (US)', emoji: '📈' },
  { id: 'stocks_intl', label: '🌍 Stocks (Intl)', emoji: '🌍' },
  { id: 'crypto', label: '₿ Crypto', emoji: '₿' },
  { id: 'forex', label: '💱 Forex', emoji: '💱' },
  { id: 'commodities', label: '🛢️ Commodities', emoji: '🛢️' },
];

export default function OnboardingQuick() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState(null);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleInterest = (id) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      const user = await base44.auth.me();
      if (user?.id) {
        await base44.auth.updateMe({
          trader_level: level,
          interests: interests,
          onboarded: true,
        });
      }
      navigate('/Portfolio');
    } catch (e) {
      console.error('Onboarding error:', e);
      navigate('/Portfolio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B12] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-black text-foreground">Welcome to TREK</h1>
                <p className="text-sm text-muted-foreground">Let's personalize your intelligence in 30 seconds</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">What's your experience level?</p>
                {TRADER_LEVELS.map((l) => (
                  <motion.button
                    key={l.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setLevel(l.id)}
                    className={`w-full p-4 rounded-2xl border-2 text-left transition-all ${
                      level === l.id
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-primary/50'
                    }`}
                  >
                    <div className="font-bold text-foreground text-lg">{l.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{l.description}</div>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
                disabled={!level}
                className={`w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                  level
                    ? 'bg-gradient-to-r from-primary to-primary/80 cursor-pointer'
                    : 'bg-white/10 cursor-not-allowed opacity-50'
                }`}
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </motion.button>
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-8">
                <h1 className="text-3xl font-black text-foreground">What interests you?</h1>
                <p className="text-sm text-muted-foreground">Select all that apply (we'll filter signals for you)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {INTERESTS.map((interest) => (
                  <motion.button
                    key={interest.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      interests.includes(interest.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-white/10 bg-white/[0.02] hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{interest.emoji}</div>
                    <div className="text-xs font-bold text-foreground">{interest.label}</div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 rounded-2xl font-bold text-foreground border border-white/10 hover:border-primary/50 transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(3)}
                  disabled={interests.length === 0}
                  className={`flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all ${
                    interests.length > 0
                      ? 'bg-gradient-to-r from-primary to-primary/80 cursor-pointer'
                      : 'bg-white/10 cursor-not-allowed opacity-50'
                  }`}
                >
                  Next
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </motion.div>
          )}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2 mb-2">
                <div className="h-16 w-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <Brain className="h-8 w-8 text-[#F59E0B]" />
                </div>
                <h1 className="text-3xl font-black text-foreground">Meet "Tell TREK"</h1>
                <p className="text-sm text-muted-foreground">Your most powerful tool on Portfolio</p>
              </div>

              {/* What it is */}
              <div className="rounded-2xl p-4 space-y-3"
                style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-[13px] font-bold text-white/80">
                  Made a trade on Robinhood, eToro, or anywhere else?
                </p>
                <p className="text-[12px] text-white/50 leading-relaxed">
                  Tap <strong className="text-[#F59E0B]">"Tell TREK What You Did"</strong> on your Portfolio page and TREK will instantly grade your trade, show you entry quality, risk exposure, and what to watch next.
                </p>
              </div>

              {/* Visual example */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-white/25 uppercase tracking-wider">Example</p>
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl p-3 text-center"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
                    <TrendingUp className="h-5 w-5 text-[#22c55e] mx-auto mb-1" />
                    <p className="text-[11px] font-black text-white/70">I BOUGHT NVDA</p>
                    <p className="text-[10px] text-white/35">$500 worth</p>
                  </div>
                  <div className="flex items-center text-white/20 font-black">→</div>
                  <div className="flex-1 rounded-xl p-3 text-center"
                    style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <Sparkles className="h-5 w-5 text-[#F59E0B] mx-auto mb-1" />
                    <p className="text-[11px] font-black text-[#F59E0B]">Grade: B+</p>
                    <p className="text-[10px] text-white/35">Risk & targets</p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-white/30 text-center">
                You'll find this button at the top of your <strong className="text-white/50">Portfolio</strong> page — always there when you need it.
              </p>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 rounded-2xl font-bold text-foreground border border-white/10 hover:border-primary/50 transition-all"
                >
                  Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  disabled={loading}
                  className="flex-1 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}
                >
                  {loading ? 'Setting up...' : <>
                    Go to Portfolio
                    <Zap className="h-5 w-5" />
                  </>}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          <div className={`h-1 w-8 rounded-full transition-all ${step === 1 ? 'bg-primary' : 'bg-white/20'}`} />
          <div className={`h-1 w-8 rounded-full transition-all ${step === 2 ? 'bg-primary' : 'bg-white/20'}`} />
          <div className={`h-1 w-8 rounded-full transition-all ${step === 3 ? 'bg-primary' : 'bg-white/20'}`} />
        </div>
      </motion.div>
    </div>
  );
}