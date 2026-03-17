import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Star, ArrowRight, Check, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BROKERS = [
  {
    id: 'alpaca',
    name: 'Alpaca',
    desc: 'Commission-free API-first trading for stocks & crypto',
    recommended: true,
    color: '#F59E0B',
  },
  {
    id: 'ibkr',
    name: 'IBKR',
    desc: 'Interactive Brokers — professional-grade global markets',
    recommended: false,
    color: '#60A5FA',
  },
  {
    id: 'robinhood',
    name: 'Robinhood',
    desc: 'Simple commission-free stocks, ETFs, and options',
    recommended: false,
    color: '#22C55E',
  },
  {
    id: 'coinbase',
    name: 'Coinbase',
    desc: 'Leading crypto exchange with 200+ digital assets',
    recommended: false,
    color: '#818CF8',
  },
  {
    id: 'schwab',
    name: 'Schwab',
    desc: 'Full-service brokerage with research & tools',
    recommended: false,
    color: '#94A3B8',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState('choice'); // 'choice' | 'broker' | 'learn'
  const [selectedBroker, setSelectedBroker] = useState(null);
  const [connected, setConnected] = useState(false);

  const handleConnect = (brokerId) => {
    setSelectedBroker(brokerId);
    setConnected(true);
    setTimeout(() => navigate('/Dashboard'), 1400);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden"
      style={{ backgroundColor: '#0A0A0F' }}
    >
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div
        className="absolute w-96 h-96 rounded-full opacity-[0.05] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #F59E0B, transparent)' }}
      />

      <div className="relative w-full max-w-xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-8"
        >
          <span className="text-2xl font-black" style={{ color: '#F59E0B', letterSpacing: '-0.03em' }}>TREDIA</span>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* STEP 1: Choice */}
          {step === 'choice' && (
            <motion.div key="choice" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-white/90 mb-1">Welcome to Tredia</h1>
                <p className="text-sm text-white/35">Tell us about your trading experience</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Already Trade */}
                <motion.button
                  whileHover={{ scale: 1.02, borderColor: 'rgba(245,158,11,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('broker')}
                  className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#111118] cursor-pointer transition-all text-left group"
                  style={{ outline: 'none' }}
                >
                  <div className="h-12 w-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center group-hover:bg-[#F59E0B]/15 transition-all">
                    <TrendingUp className="h-6 w-6 text-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="font-bold text-white/90 text-base mb-1">I Already Trade</p>
                    <p className="text-xs text-white/35 leading-relaxed">Connect your existing broker to get started instantly</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#F59E0B]/50 self-end mt-auto" />
                </motion.button>

                {/* New to Trading */}
                <motion.button
                  whileHover={{ scale: 1.02, borderColor: 'rgba(245,158,11,0.4)' }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('learn')}
                  className="flex flex-col items-center gap-4 p-6 rounded-2xl border border-white/10 bg-[#111118] cursor-pointer transition-all text-left group"
                  style={{ outline: 'none' }}
                >
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

          {/* STEP 2A: Broker Selection */}
          {step === 'broker' && (
            <motion.div key="broker" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-white/90 mb-1">Connect Your Broker</h1>
                <p className="text-sm text-white/35">Choose your brokerage to sync your portfolio</p>
              </div>

              <div className="flex flex-col gap-3">
                {BROKERS.map((broker, i) => (
                  <motion.div
                    key={broker.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.01, borderColor: `${broker.color}33` }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleConnect(broker.id)}
                      disabled={connected}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/[0.08] bg-[#111118] hover:bg-white/[0.03] transition-all text-left"
                      style={{ outline: 'none' }}
                    >
                      {/* Broker icon */}
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0"
                        style={{ background: `${broker.color}15`, border: `1px solid ${broker.color}25`, color: broker.color }}
                      >
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
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="h-6 w-6 rounded-full bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center flex-shrink-0"
                        >
                          <Check className="h-3 w-3 text-[#22C55E]" />
                        </motion.div>
                      ) : (
                        <span
                          className="text-xs font-bold px-3 py-1.5 rounded-lg flex-shrink-0"
                          style={{ background: '#F59E0B15', color: '#F59E0B', border: '1px solid #F59E0B25' }}
                        >
                          Connect
                        </span>
                      )}
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setStep('choice')}
                className="mt-4 text-xs text-white/25 hover:text-white/45 transition-colors flex items-center gap-1 mx-auto"
              >
                ← Back
              </button>
            </motion.div>
          )}

          {/* STEP 2B: New to Trading */}
          {step === 'learn' && (
            <motion.div key="learn" {...fadeUp} transition={{ duration: 0.4 }}>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-black text-white/90 mb-1">Let's Get You Started</h1>
                <p className="text-sm text-white/35">Tredia will guide you every step of the way</p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-[#111118] p-6 flex flex-col gap-4">
                {[
                  { icon: '📊', title: 'AI Market Signals', desc: 'Get professional-grade trade signals powered by AI' },
                  { icon: '🛡️', title: 'Paper Trading Mode', desc: 'Practice risk-free with virtual $100,000' },
                  { icon: '📰', title: 'Market Intelligence', desc: 'Curated news and macro analysis delivered daily' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-sm font-bold text-white/80">{item.title}</p>
                      <p className="text-xs text-white/30 mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/Dashboard')}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-sm mt-2"
                  style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}
                >
                  Start Exploring <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>

              <button
                onClick={() => setStep('choice')}
                className="mt-4 text-xs text-white/25 hover:text-white/45 transition-colors flex items-center gap-1 mx-auto"
              >
                ← Back
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}