import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ContextBanner from '@/components/ai/ContextBanner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Zap, Trophy, Target, ShieldCheck, Star, ChevronUp } from 'lucide-react';

const GRADES = ['A', 'B+', 'B', 'B-', 'C+', 'C'];
const getGradeExplanations = (t) => ({
  'A': t('paperTrading.gradeA'),
  'B+': t('paperTrading.gradeB_plus'),
  'B': t('paperTrading.gradeB'),
  'B-': t('paperTrading.gradeB_minus'),
  'C+': t('paperTrading.gradeC_plus'),
  'C': t('paperTrading.gradeC'),
});

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
    const GRADE_EXPLANATIONS = getGradeExplanations(t);
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

  const TRADER_LEVELS = [
    { level: 1, name: t('paperTrading.rookieLevel'), minWin: 0, color: '#6b7280' },
    { level: 2, name: t('paperTrading.analystLevel'), minWin: 50, color: '#60a5fa' },
    { level: 3, name: t('paperTrading.traderLevel'), minWin: 60, color: '#22c55e' },
    { level: 4, name: t('paperTrading.proTraderLevel'), minWin: 70, color: '#F59E0B' },
    { level: 5, name: t('paperTrading.eliteTraderLevel'), minWin: 80, color: '#a78bfa' },
  ];
  const winRateNum = 73.2;
  const traderLevel = TRADER_LEVELS.slice().reverse().find(l => winRateNum >= l.minWin) || TRADER_LEVELS[0];
  const nextLevel = TRADER_LEVELS.find(l => l.minWin > winRateNum);
  const levelProgress = nextLevel ? ((winRateNum - traderLevel.minWin) / (nextLevel.minWin - traderLevel.minWin)) * 100 : 100;

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">

      {/* AI Context Banner */}
      <ContextBanner
        storageKey="paper_trading_v1"
        title={t('paperTrading.title')}
        body={t('paperTrading.guidance')}
        steps={[
          t('paperTrading.symbol'),
          t('paperTrading.shares'),
          t('paperTrading.preview'),
          t('trek.signals'),
        ]}
        actions={[{ label: t('paperTrading.confirm'), onClick: () => {} }]}
        aiQuestion={t('trek.contextAI')}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-white/95 tracking-tight mb-1">{t('paperTrading.title')}</h1>
          <p className="text-[11px] text-white/40 font-medium tracking-wide">{t('paperTrading.balance')}</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-1">{t('paperTrading.balance')}</div>
          <div className="text-3xl font-black font-mono" style={{ color: '#F59E0B' }}>$200,000.00</div>
        </div>
      </motion.div>

      {/* TRADER LEVEL + GAMIFICATION */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.03 }}
        style={{
          background: 'linear-gradient(135deg, #0f0f1a, #111118)',
          border: `1px solid ${traderLevel.color}40`,
          borderRadius: 16,
          padding: '16px 20px',
          boxShadow: `0 0 30px ${traderLevel.color}10`,
        }}
      >
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Level badge */}
          <div className="flex items-center gap-4">
            <div style={{ width: 52, height: 52, borderRadius: 14, background: `${traderLevel.color}15`, border: `2px solid ${traderLevel.color}40`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Star style={{ width: 18, height: 18, color: traderLevel.color }} />
              <span style={{ fontSize: 9, fontWeight: 900, color: traderLevel.color, letterSpacing: '0.06em' }}>LVL {traderLevel.level}</span>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: 'rgba(255,255,255,0.92)', marginBottom: 2 }}>{traderLevel.name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>
                {nextLevel ? t('paperTrading.winRateToReach', { value: (nextLevel.minWin - winRateNum).toFixed(1), level: nextLevel.name }) : t('paperTrading.maxLevelReached')}
              </div>
              {/* Progress bar */}
              <div style={{ width: 160, height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${levelProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ height: '100%', background: traderLevel.color, borderRadius: 99 }}
                />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6">
            {[
              { icon: Trophy, label: t('paperTrading.winRate'), value: `${winRateNum}%`, color: '#22c55e' },
              { icon: Target, label: t('paperTrading.bestTrade'), value: '+$2,482', color: '#F59E0B' },
              { icon: ShieldCheck, label: t('paperTrading.trades'), value: '23', color: '#60a5fa' },
              { icon: ChevronUp, label: t('paperTrading.streak'), value: '4W 🔥', color: '#a78bfa' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <s.icon className="h-3.5 w-3.5 mx-auto mb-1" style={{ color: s.color }} />
                <div className="text-[14px] font-black font-mono" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[8px] text-white/30 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
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
          <h2 className="text-sm font-bold text-white/80 mb-4">{t('paperTrading.preview')}</h2>

           <div className="space-y-3">
             {/* Ticker Input */}
             <div>
               <label className="text-[10px] uppercase tracking-[0.1em] text-white/40 block mb-1.5">{t('paperTrading.symbol')}</label>
              <Input
                placeholder="AAPL"
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                className="bg-input border-white/[0.08] text-white placeholder-white/20 h-9 text-sm"
              />
            </div>

            {/* Shares Input */}
            <div>
              <label className="text-[10px] uppercase tracking-[0.1em] text-white/40 block mb-1.5">{t('paperTrading.shares')}</label>
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
              <label className="text-[10px] uppercase tracking-[0.1em] text-white/40 block mb-2">{t('portfolio.action')}</label>
              <div className="flex gap-2">
                {[
                  { label: t('asset.buy'), value: 'buy', color: '#22C55E' },
                  { label: t('asset.sell'), value: 'sell', color: '#EF4444' },
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
               <label className="text-[10px] uppercase tracking-[0.1em] text-white/40 block mb-2">{t('paperTrading.orderType')}</label>
              <div className="flex gap-2">
                {[
                    { label: t('paperTrading.market'), value: 'market' },
                    { label: t('paperTrading.limit'), value: 'limit' },
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
              {t('portfolio.action')}
            </Button>
          </div>

          {/* TREK Grade Display */}
          <AnimatePresence>
            {tradeGrade && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-4 pt-4 border-t border-white/[0.05]"
                style={{ background: 'rgba(245,158,11,0.05)', borderRadius: 10, padding: '12px 14px' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30">{t('trek.wow')}</div>
                  <Zap className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-5xl font-black font-mono" style={{ color: ['A'].includes(tradeGrade.grade) ? '#22c55e' : tradeGrade.grade.startsWith('B') ? '#F59E0B' : '#ef4444' }}>{tradeGrade.grade}</div>
                  <div>
                    <p className="text-xs text-white/55 leading-relaxed">{tradeGrade.explanation}</p>
                    <p className="text-[10px] text-primary/60 mt-1 font-semibold">+XP added to your Trader Level</p>
                  </div>
                </div>
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
               <h3 className="text-sm font-bold text-white/80">{t('portfolio.holdings')} ({MOCK_POSITIONS.length})</h3>
             </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {[t('markets.symbol'), t('paperTrading.shares'), t('portfolio.avgCost'), t('portfolio.currentPrice'), t('paperTrading.pnlDollars'), t('paperTrading.pnlPercent'), t('trek.grade')].map((h, i) => (
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
            <h3 className="text-sm font-bold text-white/80 mb-4">{t('paperTrading.performance')}</h3>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-3" />
                <div>
                  <div className="text-[10px] text-white/40">{t('paperTrading.yourReturn')}</div>
                  <div className="text-lg font-bold text-chart-3">+12.4%</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-white/30" />
                <div>
                  <div className="text-[10px] text-white/40">{t('paperTrading.sp500')}</div>
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
                  <Line type="monotone" dataKey="portfolio" name={t('paperTrading.yourPortfolio')} stroke="#F59E0B" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="sp500" name={t('paperTrading.sp500')} stroke="rgba(255,255,255,0.25)" strokeWidth={2} dot={false} />
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
          { label: t('paperTrading.totalPnL'), value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, sub: t('paperTrading.vsStart'), color: totalPnL >= 0 ? '#22c55e' : '#ef4444', icon: TrendingUp },
          { label: t('paperTrading.winRate'), value: '73.2%', sub: t('paperTrading.vsAvg'), color: '#F59E0B', icon: Target },
          { label: t('paperTrading.bestTrade'), value: '+$2,482.50', sub: t('paperTrading.bestTradeInfo'), color: '#22c55e', icon: Trophy },
        ].map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-white/[0.07] bg-[#111118] p-4 cursor-default"
            style={{ borderColor: `${s.color}25` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="h-3 w-3" style={{ color: s.color }} />
              <div className="text-[10px] text-white/30 font-medium uppercase tracking-[0.1em]">{s.label}</div>
            </div>
            <div className="text-xl font-black font-mono mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[9px] text-white/20">{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}