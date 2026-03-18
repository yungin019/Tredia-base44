import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Briefcase, Plus, Trash2, ArrowUpRight, ArrowDownRight, PieChart, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PieChart as RePie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import AddHoldingDialog from '../components/portfolio/AddHoldingDialog';
import TrekGradeCard from '../components/portfolio/TrekGradeCard';
import RiskScoreCard from '../components/portfolio/RiskScoreCard';
import StressTestCard from '../components/portfolio/StressTestCard';
import SectorWarning from '../components/portfolio/SectorWarning';
import PortfolioPerformanceChart from '../components/portfolio/PortfolioPerformanceChart';

const COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#A855F7', '#EF4444', '#06B6D4'];

export default function Portfolio() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.entities.Portfolio.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Portfolio.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  const totalValue = holdings.reduce((sum, h) => sum + (h.current_price || h.avg_cost) * h.shares, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.avg_cost * h.shares, 0);
  const totalPnL = totalValue - totalCost;
  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost * 100) : 0;

  const pieData = holdings.map((h) => ({
    name: h.symbol,
    value: +(((h.current_price || h.avg_cost) * h.shares)).toFixed(2),
  }));

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white/95 tracking-tight mb-1">{t('portfolio.title') || 'Portfolio'}</h1>
           <p className="text-[11px] text-white/30 font-medium tracking-wide">{t('portfolio.subtitle') || 'Your holdings and performance'}</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate('/PaperTrading')}
            size="sm"
            className="h-8 text-[11px] font-bold bg-white/10 hover:bg-white/15 text-white/80"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" /> Paper Trading
          </Button>
          <Button
            onClick={() => setShowAdd(true)}
            size="sm"
            className="h-8 text-[11px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Holding
          </Button>
        </div>
      </motion.div>

      {/* TREK AI Analysis Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TrekGradeCard />
        <RiskScoreCard />
        <StressTestCard />
      </div>

      {/* Sector Warning */}
      <SectorWarning holdings={holdings} />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Value', value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-white/90' },
          {
            label: 'Total P&L',
            value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            color: totalPnL >= 0 ? 'text-chart-3' : 'text-destructive'
          },
          {
            label: 'Return',
            value: `${totalPnLPercent >= 0 ? '+' : ''}${totalPnLPercent.toFixed(2)}%`,
            color: totalPnLPercent >= 0 ? 'text-chart-3' : 'text-destructive'
          },
        ].map((s, i) => (
          <div key={i} className="rounded-xl border border-white/[0.07] bg-[#111118] p-4">
            <div className="text-[10px] text-white/30 font-medium uppercase tracking-[0.1em] mb-2">{s.label}</div>
            <div className={`text-lg font-bold font-mono ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Pie Chart */}
        {holdings.length > 0 && (
          <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-5">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="h-3.5 w-3.5 text-white/30" />
              <span className="text-sm font-bold text-white/80">Allocation</span>
            </div>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePie data={pieData}>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} dataKey="value" strokeWidth={2} stroke="#0A0A0F">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => active && payload?.[0] ? (
                      <div className="glass-dark rounded-lg px-3 py-2 border border-white/[0.08] text-[11px]">
                        <span className="font-mono font-bold text-white/80">{payload[0].name}</span>
                        <span className="text-white/40 ml-2">${payload[0].value.toLocaleString()}</span>
                      </div>
                    ) : null}
                  />
                </RePie>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                  <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="font-mono text-white/50">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className={`rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden ${holdings.length > 0 ? 'xl:col-span-3' : 'xl:col-span-4'}`}>
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <h3 className="text-sm font-bold text-white/80">Holdings ({holdings.length})</h3>
          </div>

          {isLoading ? (
            <div className="p-10 text-center text-white/25 text-[12px]">Loading...</div>
          ) : holdings.length === 0 ? (
           <div className="p-10 text-center">
             <Briefcase className="h-10 w-10 text-white/10 mx-auto mb-3" />
             <p className="text-[12px] text-white/25">{t('portfolio.noHoldings')}</p>
           </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {['Symbol', 'Shares', 'Avg Cost', 'Current', 'Market Value', 'P&L', ''].map((h, i) => (
                      <th key={i} className={`${i === 0 ? 'text-left px-5' : i === 6 ? 'w-10' : 'text-right px-4'} py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const currentPrice = h.current_price || h.avg_cost;
                    const pnl = (currentPrice - h.avg_cost) * h.shares;
                    const pnlPct = ((currentPrice - h.avg_cost) / h.avg_cost * 100);
                    const mktValue = currentPrice * h.shares;
                    return (
                      <tr key={h.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0">
                        <td className="px-5 py-3">
                          <div className="font-mono font-black text-[13px] text-white/85">{h.symbol}</div>
                          <div className="text-[10px] text-white/30">{h.name}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-white/60">{h.shares}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-white/60">${h.avg_cost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-white/85 font-bold">${currentPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-white/60">${mktValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                        <td className={`px-4 py-3 text-right font-mono ${pnl >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                          <div className="text-[12px] font-bold flex items-center justify-end gap-0.5">
                            {pnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            ${Math.abs(pnl).toFixed(2)}
                          </div>
                          <div className="text-[10px]">{pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteMutation.mutate(h.id)} className="p-1 rounded-md text-white/15 hover:text-destructive hover:bg-destructive/8 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Performance Chart */}
      <PortfolioPerformanceChart />

      <AddHoldingDialog open={showAdd} onOpenChange={setShowAdd} />
    </div>
  );
}