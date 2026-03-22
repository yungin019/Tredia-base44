import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Zap, TrendingUp, Target, Shield, Scale, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function PreTradeAnalysis({
  isOpen,
  onClose,
  action = 'BUY',
  symbol = 'NVDA',
  price = 875.40,
  isPractice = false,
  onConfirm
}) {
  const [shares, setShares] = useState(10);

  const analysis = {
    grade: 'A-',
    confidence: 82,
    entry: { min: 875, max: 882 },
    target: { price: 945, gain: 8, days: 5 },
    safety: { price: 851, loss: -2.8 },
    rewardRisk: 2.8,
    reasons: [
      'AI datacenter buildout accelerating - Nvidia GPU allocation confirmed with SMCI, Dell',
      'Blackwell chips shipping early (Q4 vs Q1) - implies demand exceeding supply by 3-4x',
      'Institutional accumulation: 15 funds added positions in last 2 weeks totaling $890M'
    ],
    risk: 'Earnings on May 22nd - any guidance miss could trigger 5-8% selloff to $825 support',
    trekSays: 'This is a high-conviction momentum play with clear catalysts. Size appropriately and respect the stop.'
  };

  const totalCost = shares * price;
  const accountSize = 100000;
  const positionPercent = ((totalCost / accountSize) * 100).toFixed(1);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-[#0D1117] rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
          >
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-[#F59E0B]" />
                  <h2 className="text-xl font-black text-white">TREK PRE-TRADE ANALYSIS</h2>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${isPractice ? 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20' : 'bg-[#00D68F]/10 text-[#00D68F] border border-[#00D68F]/20'}`}>
                  {isPractice ? 'PRACTICE' : 'REAL TRADE'}
                </span>
              </div>

              <div>
                <p className="text-2xl font-black text-white mb-1">
                  {action} {symbol} @ ${price.toFixed(2)}
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-[#1a1f2e]">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-black text-white">{analysis.grade}</div>
                  <div className="text-sm text-white/60">GRADE</div>
                </div>
                <div className="flex-1">
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#00D68F] to-[#F59E0B]"
                      style={{ width: `${analysis.confidence}%` }}
                    />
                  </div>
                  <p className="text-xs text-white/60 mt-1">{analysis.confidence}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-[#1a1f2e] border-[#00D68F]/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="h-4 w-4 text-[#00D68F]" />
                    <span className="text-xs font-bold text-white/60">Entry</span>
                  </div>
                  <p className="text-sm font-bold text-white">${analysis.entry.min} — ${analysis.entry.max}</p>
                </Card>

                <Card className="bg-[#1a1f2e] border-[#00D68F]/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-4 w-4 text-[#00D68F]" />
                    <span className="text-xs font-bold text-white/60">Target</span>
                  </div>
                  <p className="text-sm font-bold text-white">${analysis.target.price} +{analysis.target.gain}% {analysis.target.days}d</p>
                </Card>

                <Card className="bg-[#1a1f2e] border-[#FF3B3B]/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="h-4 w-4 text-[#FF3B3B]" />
                    <span className="text-xs font-bold text-white/60">Safety</span>
                  </div>
                  <p className="text-sm font-bold text-white">${analysis.safety.price} {analysis.safety.loss}%</p>
                </Card>

                <Card className="bg-[#1a1f2e] border-[#F59E0B]/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Scale className="h-4 w-4 text-[#F59E0B]" />
                    <span className="text-xs font-bold text-white/60">Reward</span>
                  </div>
                  <p className="text-sm font-bold text-white">{analysis.rewardRisk}x the risk</p>
                </Card>
              </div>

              <div>
                <p className="text-sm font-bold text-white mb-2">WHY TREK LIKES THIS:</p>
                <div className="space-y-2">
                  {analysis.reasons.map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                      <CheckCircle className="h-4 w-4 text-[#00D68F] flex-shrink-0 mt-0.5" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FF3B3B]/10 border border-[#FF3B3B]/20">
                <p className="text-xs font-bold text-white mb-1">⚠️ ONE RISK TO KNOW:</p>
                <p className="text-sm text-white/80">{analysis.risk}</p>
              </div>

              <div className="p-4 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20">
                <p className="text-sm text-white/90">
                  <span className="font-bold text-[#F59E0B]">TREK says: </span>
                  {analysis.trekSays}
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <p className="text-sm font-bold text-white mb-3">How many shares?</p>
                <div className="flex items-center gap-4 mb-3">
                  <Button
                    onClick={() => setShares(Math.max(1, shares - 1))}
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 text-center">
                    <p className="text-2xl font-black text-white">{shares} shares</p>
                  </div>
                  <Button
                    onClick={() => setShares(shares + 1)}
                    variant="outline"
                    size="icon"
                    className="border-white/20 text-white hover:bg-white/5"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-white/60 text-center">
                  Cost: ${totalCost.toLocaleString()} · {positionPercent}% of account
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1 border-white/20 text-white hover:bg-white/5 h-12"
                >
                  CANCEL
                </Button>
                <Button
                  onClick={() => onConfirm && onConfirm({ shares, totalCost })}
                  className="flex-1 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold h-12"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  COMPLETE TRADE
                </Button>
              </div>

              <p className="text-xs text-white/40 text-center">
                TREK provides intelligence. You make the final decision.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
