import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, X, Search, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { askTrek } from '@/api/trek';
import { toast } from 'sonner';

const QUICK_PICKS = ['AAPL', 'NVDA', 'BTC', 'ETH', 'TSLA', 'GOLD', 'OIL', 'AMZN', 'MSFT', 'GOOGL'];

// Inline banner shown in the Portfolio page
export function TellTrekBanner({ onOpen }) {
  return (
    <motion.button
      onClick={onOpen}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-2xl p-4 flex items-center gap-4 transition-all"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.05) 100%)',
        border: '1px solid rgba(245,158,11,0.3)',
        boxShadow: '0 0 24px rgba(245,158,11,0.06)',
      }}
    >
      <div className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
        <Brain className="h-5 w-5 text-[#F59E0B]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[13px] font-black text-white/90">Tell TREK What You Did</span>
          <Sparkles className="h-3 w-3 text-[#F59E0B]" />
        </div>
        <p className="text-[11px] text-white/45 leading-snug">
          Just made a trade outside the app? Tell TREK and get instant AI analysis, grade &amp; risk feedback.
        </p>
      </div>
      <ChevronRight className="h-4 w-4 text-[#F59E0B]/60 flex-shrink-0" />
    </motion.button>
  );
}

// The modal/sheet logic, open via parent
export function LogTradeModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [action, setAction] = useState(null);
  const [symbol, setSymbol] = useState('');
  const [amount, setAmount] = useState('');
  const [amountType, setAmountType] = useState('currency');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = async () => {
    if (!symbol || !amount) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsAnalyzing(true);
    try {
      const query = `I just ${action === 'buy' ? 'bought' : 'sold'} ${symbol} for ${amount} ${amountType === 'currency' ? 'USD' : 'shares'}. Give me your full analysis with grade, targets, risks, and specific guidance.`;
      await askTrek([{ role: 'user', content: query }], {}, null, 'pro');
      toast.success('TREK is analyzing your trade — check AI Insights!');
      onClose();
      resetForm();
    } catch {
      toast.error('Failed to log trade');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setAction(null);
    setSymbol('');
    setAmount('');
    setAmountType('currency');
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0D1117] rounded-t-3xl z-50 overflow-y-auto"
            style={{ maxHeight: '75dvh' }}
          >
            <div className="p-6 space-y-5" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-white">TELL TREK WHAT YOU DID</h2>
                  <p className="text-[11px] text-white/35 mt-0.5">Get instant AI grading &amp; analysis</p>
                </div>
                <button onClick={handleClose} className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.06] transition-all">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Step 1: Buy or Sell */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  <button
                    onClick={() => { setAction('buy'); setStep(2); }}
                    className="h-24 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-[15px] transition-all"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.35)' }}
                  >
                    <TrendingUp className="h-7 w-7 text-[#22c55e]" />
                    <span className="text-white">I BOUGHT</span>
                  </button>
                  <button
                    onClick={() => { setAction('sell'); setStep(2); }}
                    className="h-24 rounded-2xl flex flex-col items-center justify-center gap-2 font-black text-[15px] transition-all"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.35)' }}
                  >
                    <TrendingDown className="h-7 w-7 text-[#ef4444]" />
                    <span className="text-white">I SOLD</span>
                  </button>
                </motion.div>
              )}

              {/* Step 2: Asset + Amount */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  {/* Action pill */}
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black px-3 py-1 rounded-full"
                      style={{
                        background: action === 'buy' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: action === 'buy' ? '#22c55e' : '#ef4444',
                        border: `1px solid ${action === 'buy' ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>
                      {action === 'buy' ? '▲ BOUGHT' : '▼ SOLD'}
                    </span>
                    <button onClick={() => setStep(1)} className="text-[11px] text-white/30 hover:text-white/60">change</button>
                  </div>

                  {/* Asset */}
                  <div>
                    <label className="text-white/70 text-[11px] font-bold mb-2 block uppercase tracking-wider">Asset</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 h-4 w-4 text-white/30" />
                      <Input
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                        placeholder="e.g. AAPL, BTC, NVDA"
                        className="bg-white/[0.05] border-white/[0.08] text-white pl-10 focus:border-[#F59E0B] h-12"
                        style={{ fontSize: '16px' }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {QUICK_PICKS.map(ticker => (
                        <button
                          key={ticker}
                          onClick={() => setSymbol(ticker)}
                          className="text-[11px] px-2.5 py-1 rounded-lg font-mono font-bold transition-all"
                          style={{
                            background: symbol === ticker ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${symbol === ticker ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.08)'}`,
                            color: symbol === ticker ? '#F59E0B' : 'rgba(255,255,255,0.5)',
                          }}>
                          {ticker}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-white/70 text-[11px] font-bold mb-2 block uppercase tracking-wider">Amount</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="500"
                        className="bg-white/[0.05] border-white/[0.08] text-white focus:border-[#F59E0B] h-12"
                        style={{ fontSize: '16px' }}
                      />
                      <button
                        onClick={() => setAmountType(amountType === 'currency' ? 'shares' : 'currency')}
                        className="px-4 h-12 rounded-xl font-bold text-[12px] transition-all flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                      >
                        {amountType === 'currency' ? 'USD' : 'Shares'}
                      </button>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={isAnalyzing || !symbol || !amount}
                    className="w-full h-13 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                    style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F', height: '52px' }}
                  >
                    <Brain className="h-5 w-5" />
                    {isAnalyzing ? 'TREK IS ANALYZING...' : 'GRADE MY TRADE'}
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}