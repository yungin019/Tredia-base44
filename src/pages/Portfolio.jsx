import React from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Briefcase, Plus, Trash2, ArrowUpRight, ArrowDownRight, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PieChart as RePie, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import AddHoldingDialog from '../components/portfolio/AddHoldingDialog';

const COLORS = ['hsl(142, 70%, 45%)', 'hsl(210, 100%, 55%)', 'hsl(280, 70%, 60%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 55%)', 'hsl(180, 60%, 45%)'];

export default function Portfolio() {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = React.useState(false);

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
    value: (h.current_price || h.avg_cost) * h.shares,
  }));

  return (
    <div className="sm:ml-16 p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Portfolio</h1>
            </div>
            <p className="text-xs text-muted-foreground">Track and manage your holdings</p>
          </div>
          <Button onClick={() => setShowAdd(true)} size="sm" className="h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Holding
          </Button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <span className="text-xs text-muted-foreground">Total Value</span>
          <div className="text-lg font-bold font-mono mt-1">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <span className="text-xs text-muted-foreground">Total P&L</span>
          <div className={`text-lg font-bold font-mono mt-1 ${totalPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-xl border border-border/50 bg-card p-4">
          <span className="text-xs text-muted-foreground">Return</span>
          <div className={`text-lg font-bold font-mono mt-1 flex items-center gap-1 ${totalPnLPercent >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {totalPnLPercent >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            {totalPnLPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Allocation Chart */}
        {holdings.length > 0 && (
          <div className="rounded-xl border border-border/50 bg-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <PieChart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Allocation</span>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePie data={pieData}>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={2} stroke="hsl(220, 18%, 7%)">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => active && payload?.[0] ? (
                      <div className="glass rounded-lg px-3 py-2 border border-border/50 text-xs">
                        <span className="font-mono font-bold">{payload[0].name}</span>
                        <span className="ml-2">${payload[0].value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    ) : null}
                  />
                </RePie>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                  <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="font-mono">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Holdings Table */}
        <div className={`rounded-xl border border-border/50 bg-card overflow-hidden ${holdings.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="px-4 py-3 border-b border-border/50">
            <h3 className="text-sm font-semibold">Holdings</h3>
          </div>
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
          ) : holdings.length === 0 ? (
            <div className="p-8 text-center">
              <Briefcase className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No holdings yet. Add your first position.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30 text-muted-foreground text-xs">
                    <th className="text-left px-4 py-2 font-medium">Symbol</th>
                    <th className="text-right px-4 py-2 font-medium">Shares</th>
                    <th className="text-right px-4 py-2 font-medium">Avg Cost</th>
                    <th className="text-right px-4 py-2 font-medium">Current</th>
                    <th className="text-right px-4 py-2 font-medium">P&L</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {holdings.map((h) => {
                    const currentPrice = h.current_price || h.avg_cost;
                    const pnl = (currentPrice - h.avg_cost) * h.shares;
                    const pnlPercent = ((currentPrice - h.avg_cost) / h.avg_cost * 100);
                    return (
                      <tr key={h.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono font-semibold">{h.symbol}</div>
                          <div className="text-[10px] text-muted-foreground">{h.name}</div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono">{h.shares}</td>
                        <td className="px-4 py-3 text-right font-mono">${h.avg_cost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono">${currentPrice.toFixed(2)}</td>
                        <td className={`px-4 py-3 text-right font-mono ${pnl >= 0 ? 'text-primary' : 'text-destructive'}`}>
                          <div>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</div>
                          <div className="text-[10px]">{pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%</div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => deleteMutation.mutate(h.id)} className="text-muted-foreground hover:text-destructive transition-colors">
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

      <AddHoldingDialog open={showAdd} onOpenChange={setShowAdd} />
    </div>
  );
}