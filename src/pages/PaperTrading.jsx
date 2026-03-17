import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const GRADES = ['A', 'B+', 'B', 'B-', 'C+', 'C'];
const GRADE_EXPLANATIONS = {
  'A': 'Excellent momentum entry - pristine technical setup',
  'B+': 'Strong momentum entry - timing aligns with market trend',
  'B': 'Good entry setup - fundamentals support move',
  'B-': 'Fair entry point - risk/reward acceptable',
  'C+': 'Moderate setup - consider better entry',
  'C': 'Weak entry - unfavorable risk/reward',
};

const MOCK_POSITIONS = [
  { ticker: 'AAPL', shares: 10, avgCost: 185.25, currentPrice: 192.50, grade: 'B+' },
  { ticker: 'NVDA', shares: 5, avgCost: 875.00, currentPrice: 920.30, grade: 'A' },
  { ticker: 'MSFT', shares: 8, avgCost: 425.50, currentPrice: 438.75, grade: 'B' },
];

const CHART_DATA = [
  { month: 'Apr', portfolio: 100, sp500: 100 },
  { month: 'May', portfolio: 103, sp500: 101 },
  { month: 'Jun', portfolio: 101, sp500: 99 },
  { month: 'Jul', portfolio: 106, sp500: 104 },
  { month: 'Aug', portfolio: 108, sp500: 105 },
  { month: 'Sep', portfolio: 105, sp500: 103 },
  { month: 'Oct', portfolio: 110, sp500: 107 },
  { month: 'Nov', portfolio: 114, sp500: 109 },
  { month: 'Dec', portfolio: 112, sp500: 110 },
  { month: 'Jan', portfolio: 118, sp500: 112 },
  { month: 'Feb', portfolio: 116, sp500: 111 },
  { month: 'Mar', portfolio: 121, sp500: 114 },
];

export default function PaperTrading() {
  const { t } = useTranslation();
  const [ticker, setTicker] = useState('');
  const [shares, setShares] = useState('');
  const [action, setAction] = useState('buy');
  const [orderType, setOrderType] = useState('market');
  const [tradeGrade, setTradeGrade] = useState(null);
  const [executedTrades, setExecutedTrades] = useState([]);

  const handleExecuteTrade = () => {
    if (!ticker.trim() || !shares.trim()) return;

    const randomGrade = GRADES[Math.floor(Math.random() * GRADES.length)];
    setTradeGrade({
      grade: randomGrade,
      explanation: GRADE_EXPLANATIONS[randomGrade],
      ticker: ticker.toUpperCase(),
      action,
    });

    setExecutedTrades(prev => [...prev, {
      ticker: ticker.toUpperCase(),
      shares: parseInt(shares),
      action,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    }]);

    setTicker('');
    setShares('');
  };

  const totalPositionValue = MOCK_POSITIONS.reduce((sum, p) => sum + (p.currentPrice * p.shares), 0);
  const totalCostValue = MOCK_POSITIONS.reduce((sum, p) => sum + (p.avgCost * p.shares), 0);
  const totalPnL = totalPositionValue - totalCostValue;
  const totalPnLPercent = totalCostValue > 0 ? (totalPnL / totalCostValue * 100) : 0;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white/95 tracking-tight mb-1">Paper Trading</h1>
          <p className="text-[11px] text-white/40 font-medium tracking-wide">Virtual Portfolio - No Real Money</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">Virtual Balance</div>
          <div className="text-3xl font-black font-mono" style={{ color: '#F59E0B' }}>$100,000.00</div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Trade Entry Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-white/[0.07] bg-[#111118] p-5 xl:col-span-1"
        >
          <h2 className="text-sm font-bold text-white/80 mb-4">Place Trade</h2>

          <div className="space-y-3">
            {/* Ticker Input */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.1em] text-white/40 block mb-1.5">Ticker</label>
              <Input
                placeholder="AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="bg-input border-white/[0.08] text-white placeholder-white/20 h-9 text-sm"
              />
            </div>

            {/* Shares Input */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.1em] text-white/40 block mb-1.5">Shares</label>
              <Input
                type="number"
                placeholder="10"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="bg-input border-white/[0.08] text-white placeholder-white/20 h-9 text-sm"
              />
            </div>

            {/* BUY/SELL Toggle */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.1em] text-white/40 block mb-2">Action</label>
              <div className="flex gap-2">
                {[
                  { label: 'BUY', value: 'buy', color: '#22C55E' },
                  { label: 'SELL', value: 'sell', color: '#EF4444' },
                ].map(({ label, value, color }) => (
                  <button
                    key={value}
                    onClick={() => setAction(value)}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                      action === value
                        ? 'border-2 text-white'
                        : 'border border-white/[0.08] text-white/50'
                    }`}
                    style={action === value ? { borderColor: color, color } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Market/Limit Toggle */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.1em] text-white/40 block mb-2">Order Type</label>
              <div className="flex gap-2">
                {[
                  { label: 'Market', value: 'market' },
                  { label: 'Limit', value: 'limit' },
                ].map(({ label, value }) => (
                  <button
                    key={value}
                    onClick={() => setOrderType(value)}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${
                      orderType === value
                        ? 'border-2 text-white'
                        : 'border border-white/[0.08] text-white/50'
                    }`}
                    style={orderType === value ? { borderColor: '#F59E0B' } : {}}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Execute Button */}
            <Button
              onClick={handleExecuteTrade}
              className="w-full mt-4 h-10 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              EXECUTE TRADE
            </Button>
          </div>

          {/* TREK Grade Display */}
          <AnimatePresence>
            {tradeGrade && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-4 pt-4 border-t border-white/[0.05] text-center"
              >
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 mb-2">TREK Grade</div>
                <div className="text-4xl font-black mb-2" style={{ color: '#F59E0B' }}>{tradeGrade.grade}</div>
                <p className="text-xs text-white/40">{tradeGrade.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right Column */}
        <div className="xl:col-span-2 space-y-5">
          {/* Open Positions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-white/80">Open Positions ({MOCK_POSITIONS.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {['Ticker', 'Shares', 'Avg Cost', 'Current', 'P&L ($)', 'P&L (%)', 'TREK Grade'].map((h, i) => (
                      <th key={i} className={`${i === 0 ? 'text-left px-5' : 'text-right px-4'} py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_POSITIONS.map((p) => {
                    const pnl = (p.currentPrice - p.avgCost) * p.shares;
                    const pnlPct = ((p.currentPrice - p.avgCost) / p.avgCost) * 100;
                    return (
                      <tr key={p.ticker} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-white/85">{p.ticker}</td>
                        <td className="px-4 py-3 text-right font-mono text-white/60">{p.shares}</td>
                        <td className="px-4 py-3 text-right font-mono text-white/60">${p.avgCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-white/85">${p.currentPrice.toFixed(2)}</td>
                        <td className={`px-4 py-3 text-right font-mono font-bold ${pnl >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                          <div className="flex items-center justify-end gap-0.5">
                            {pnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            ${Math.abs(pnl).toFixed(2)}
                          </div>
                        </td>
                        <td className={`px-4 py-3 text-right font-mono text-xs font-bold ${pnlPct >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                          {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-xs" style={{ color: '#F59E0B' }}>{p.grade}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Performance vs S&P 500 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
          >
            <h3 className="text-sm font-bold text-white/80 mb-4">Your Performance vs S&P 500</h3>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-3" />
                <div>
                  <div className="text-[10px] text-white/40">Your Return</div>
                  <div className="text-lg font-bold text-chart-3">+12.4%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white/30" />
                <div>
                  <div className="text-[10px] text-white/40">S&P 500</div>
                  <div className="text-lg font-bold text-white/50">+8.2%</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART_DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 6, fontSize: 10 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Line type="monotone" dataKey="portfolio" name="Your Portfolio" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="sp500" name="S&P 500" stroke="rgba(255,255,255,0.25)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      {/* P&L Summary */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, color: totalPnL >= 0 ? 'text-chart-3' : 'text-destructive' },
          { label: 'Win Rate', value: '73.2%', color: 'text-white/60' },
          { label: 'Best Trade', value: '+$2,482.50', color: 'text-chart-3' },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-white/[0.07] bg-[#111118] p-4">
            <div className="text-[10px] text-white/30 font-medium uppercase tracking-[0.1em] mb-2">{s.label}</div>
            <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}