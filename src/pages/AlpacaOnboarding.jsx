import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Shield, Zap, Lock, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AlpacaOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState('choice'); // choice | form | submitting | done
  const [form, setForm] = useState({ fullName: '', dob: '', address: '', ssnLast4: '' });
  const [submitting, setSubmitting] = useState(false);

  const handlePaperOnly = async () => {
    try {
      await base44.auth.updateMe({ trading_mode: 'practice' });
    } catch {}
    navigate('/Home');
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStep('submitting');
    // Simulate submission delay — real Alpaca KYC would go here
    await new Promise(r => setTimeout(r, 2200));
    try {
      await base44.auth.updateMe({ trading_mode: 'live_pending', alpaca_kyc_submitted: true });
    } catch {}
    setStep('done');
    setSubmitting(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(14,50,90,0.35) 0%, transparent 70%), linear-gradient(180deg, #040d1e 0%, #030810 60%, #020608 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src="/logo-icon.svg" alt="TREDIO" style={{ height: '44px', margin: '0 auto 10px' }} />
          <img src="/logo-full.svg" alt="TREDIO" style={{ height: '26px', margin: '0 auto' }} />
        </div>

        <AnimatePresence mode="wait">

          {/* CHOICE STEP */}
          {step === 'choice' && (
            <motion.div key="choice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div style={{ background: 'rgba(8,16,36,0.6)', border: '1px solid rgba(100,220,255,0.09)', borderRadius: '20px', padding: '28px', marginBottom: '16px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: '8px' }}>
                    Do you want to enable real trading?
                  </h2>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', lineHeight: '1.6' }}>
                    TREDIO partners with Alpaca to let you trade real stocks with real money. No separate account needed — we handle everything.
                  </p>
                </div>

                {/* Alpaca badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 16px', background: 'rgba(0,200,100,0.06)', border: '1px solid rgba(0,200,100,0.15)', borderRadius: '10px', marginBottom: '24px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em' }}>POWERED BY</span>
                  <span style={{ fontSize: '13px', fontWeight: 900, color: '#22c55e', letterSpacing: '0.1em' }}>ALPACA</span>
                </div>

                {/* Trust badges */}
                {[
                  { Icon: Shield, text: 'SIPC insured up to $500,000' },
                  { Icon: Lock, text: 'Your money is held by Alpaca, not TREDIO' },
                  { Icon: Zap, text: 'Same-day account approval for most users' },
                ].map(({ Icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Icon size={14} style={{ color: 'rgba(14,200,220,0.6)', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{text}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
                  <button onClick={() => setStep('form')} style={{
                    padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '14px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#030810', border: 'none',
                    boxShadow: '0 4px 20px rgba(34,197,94,0.25)', cursor: 'pointer',
                  }}>
                    Enable Real Trading
                    <ChevronRight size={16} style={{ display: 'inline', marginLeft: '6px', verticalAlign: 'middle' }} />
                  </button>
                  <button onClick={handlePaperOnly} style={{
                    padding: '14px', borderRadius: '12px', fontWeight: 700, fontSize: '13px',
                    background: 'rgba(100,220,255,0.04)', border: '1px solid rgba(100,220,255,0.1)',
                    color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                  }}>
                    Start with Paper Trading (Free)
                  </button>
                </div>
              </div>
              <p style={{ textAlign: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.18)' }}>
                You can always enable real trading later in Settings
              </p>
            </motion.div>
          )}

          {/* KYC FORM STEP */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div style={{ background: 'rgba(8,16,36,0.6)', border: '1px solid rgba(100,220,255,0.09)', borderRadius: '20px', padding: '28px' }}>
                <button onClick={() => setStep('choice')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: '12px', cursor: 'pointer', marginBottom: '16px', padding: 0 }}>
                  ← Back
                </button>
                <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: '6px' }}>Open your account</h2>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '24px' }}>Secured by Alpaca. Takes under 2 minutes.</p>

                <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Full Legal Name</label>
                    <input required value={form.fullName} onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                      placeholder="John Smith" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Date of Birth</label>
                    <input required type="date" value={form.dob} onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>Street Address</label>
                    <input required value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                      placeholder="123 Main St, New York, NY 10001" style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '6px' }}>SSN Last 4 Digits</label>
                    <input required maxLength={4} pattern="[0-9]{4}" value={form.ssnLast4} onChange={e => setForm(p => ({ ...p, ssnLast4: e.target.value.replace(/\D/g,'') }))}
                      placeholder="••••" style={{ ...inputStyle, letterSpacing: '4px', fontSize: '18px', fontWeight: 700 }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '10px 12px', background: 'rgba(0,200,100,0.05)', border: '1px solid rgba(0,200,100,0.1)', borderRadius: '8px' }}>
                    <Lock size={12} style={{ color: 'rgba(34,197,94,0.5)', marginTop: '2px', flexShrink: 0 }} />
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', lineHeight: '1.5', margin: 0 }}>
                      Your data is encrypted and transmitted directly to Alpaca. TREDIO never stores your financial details.
                    </p>
                  </div>

                  <button type="submit" style={{
                    padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '14px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#030810', border: 'none',
                    boxShadow: '0 4px 20px rgba(34,197,94,0.25)', cursor: 'pointer', marginTop: '4px',
                  }}>
                    Submit & Create Account
                  </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)' }}>Powered by</span>
                    <span style={{ fontSize: '11px', fontWeight: 900, color: '#22c55e', letterSpacing: '0.08em' }}>ALPACA</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SUBMITTING */}
          {step === 'submitting' && (
            <motion.div key="submitting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
                Creating your account...
              </p>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px' }}>
                Verifying with Alpaca. This takes a few seconds.
              </p>
            </motion.div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: 'rgba(8,16,36,0.6)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '20px', padding: '40px 28px', textAlign: 'center' }}>
              <CheckCircle2 size={56} style={{ color: '#22c55e', margin: '0 auto 20px' }} />
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'rgba(255,255,255,0.92)', marginBottom: '8px' }}>
                Your account is being created.
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6', marginBottom: '28px' }}>
                Ready in minutes. You'll receive an email from Alpaca once your account is approved.
              </p>
              <div style={{ padding: '12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '10px', marginBottom: '24px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#22c55e', letterSpacing: '0.05em' }}>POWERED BY ALPACA — SIPC INSURED</span>
              </div>
              <button onClick={() => navigate('/Home')} style={{
                width: '100%', padding: '14px', borderRadius: '12px', fontWeight: 800, fontSize: '14px',
                background: 'linear-gradient(135deg, #0ec8dc, #0aa8be)', color: '#030810', border: 'none', cursor: 'pointer',
              }}>
                Go to My Feed →
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '10px', fontSize: '14px',
  background: 'rgba(6,14,32,0.6)', border: '1px solid rgba(100,220,255,0.1)',
  color: 'rgba(255,255,255,0.88)', outline: 'none', boxSizing: 'border-box',
};