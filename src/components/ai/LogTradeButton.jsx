import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { askTrek } from '@/api/trek';
import { toast } from 'sonner';

const QUICK_PICKS = ['AAPL', 'NVDA', 'BTC', 'ETH', 'TSLA', 'GOLD', 'OIL', 'AMZN', 'MSFT', 'GOOGL'];

export function LogTradeButton() {
  const [isOpen, setIsOpen] = useState(false);
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
      const query = `I just ${action === 'buy' ? 'bought' : 'sold'} ${symbol} for ${amount} ${amountType === 'currency' ? 'SEK' : 'shares'}. Give me your full analysis with grade, targets, risks, and specific guidance.`;

      await askTrek([{ role: 'user', content: query }], {}, null, 'pro');

      toast.success('Trade logged! TREK is analyzing...');
      setIsOpen(false);
      resetForm();
    } catch (error) {
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

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 w-12 h-12 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] shadow-lg flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          boxShadow: '0 4px 20px rgba(245, 158, 11, 0.4)',
          marginBottom: 'env(safe-area-inset-bottom)'
        }}
      >
        <Plus className="w-5 h-5 text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
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
              <div className="p-6 space-y-6" style={{ paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-white">TELL TREK WHAT YOU DID</h2>
                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="icon"
                    className="text-white/60 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <Button
                      onClick={() => {
                        setAction('buy');
                        setStep(2);
                      }}
                      className="h-20 bg-[#00D68F]/10 border-2 border-[#00D68F]/30 hover:bg-[#00D68F]/20 text-white font-bold flex flex-col gap-2"
                    >
                      <TrendingUp className="h-6 w-6 text-[#00D68F]" />
                      I BOUGHT
                    </Button>
                    <Button
                      onClick={() => {
                        setAction('sell');
                        setStep(2);
                      }}
                      className="h-20 bg-[#FF3B3B]/10 border-2 border-[#FF3B3B]/30 hover:bg-[#FF3B3B]/20 text-white font-bold flex flex-col gap-2"
                    >
                      <TrendingDown className="h-6 w-6 text-[#FF3B3B]" />
                      I SOLD
                    </Button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="text-white text-sm font-bold mb-2 block">Asset</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-white/40" />
                        <Input
                          value={symbol}
                          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                          placeholder="Type symbol or company name"
                          className="bg-[#1a1f2e] border-white/10 text-white pl-10 focus:border-[#F59E0B] h-12"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-white/60 text-xs mb-2">Quick picks</p>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_PICKS.map(ticker => (
                          <Button
                            key={ticker}
                            onClick={() => setSymbol(ticker)}
                            variant="outline"
                            size="sm"
                            className={`border-white/20 ${symbol === ticker ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-white' : 'text-white/60 hover:bg-white/5'}`}
                          >
                            {ticker}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-white text-sm font-bold mb-2 block">Amount</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="100"
                          className="bg-[#1a1f2e] border-white/10 text-white focus:border-[#F59E0B] h-12"
                        />
                        <Button
                          onClick={() => setAmountType(amountType === 'currency' ? 'shares' : 'currency')}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-white/5 whitespace-nowrap px-4"
                        >
                          {amountType === 'currency' ? 'SEK' : 'shares'}
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={isAnalyzing || !symbol || !amount}
                      className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold h-12"
                    >
                      {isAnalyzing ? 'ANALYZING...' : 'TELL TREK'}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}