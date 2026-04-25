import React, { useState, useEffect } from 'react';
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
import TradeHistory from '../components/portfolio/TradeHistory';
import ContextBanner from '@/components/ai/ContextBanner';
import PullToRefresh from '@/components/ui/PullToRefresh';
import BrokerDisclosureBanner from '@/components/broker/BrokerDisclosureBanner';

const COLORS = ['#F59E0B', '#3B82F6', '#22C55E', '#A855F7', '#EF4444', '#06B6D4'];

export default function Portfolio() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [activeTab, setActiveTab] = useState('holdings');
  const [user, setUser] = useState(null);
  const [alpacaPositions, setAlpacaPositions] = useState([]);
  const [loadingAlpaca, setLoadingAlpaca] = useState(false);

  const [livePrices, setLivePrices] = useState({});

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        if (u?.alpaca_connected && u?.alpaca_positions) {
          try {
            const positions = JSON.parse(u.alpaca_positions);
            setAlpacaPositions(Array.isArray(positions) ? positions : []);
          } catch (err) {
            console.error('Failed to parse Alpaca positions:', err);
          }
        }
      })
      .catch(err => console.error('Failed to load user:', err));
  }, []);

  const { data: holdings = [], isLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: () => base44.entities.Portfolio.list(),
    enabled: !user?.alpaca_connected,
  });

  useEffect(() => {
    if (!Array.isArray(holdings) || holdings.length === 0) return;
    async function loadPrices() {
      try {
        const symbols = (Array.isArray(holdings) ? holdings : []).map(h => h.symbol);
        const res = await base44.functions.invoke('stockPrices', { symbols });
        if (res?.data?.prices) setLivePrices(res.data.prices);
      } catch {
        // keep avg_cost as fallback
      }
    }
    loadPrices();
  }, [holdings.length]);

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Portfolio.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['portfolio'] });
      const previous = queryClient.getQueryData(['portfolio']);
      queryClient.setQueryData(['portfolio'], (old) => (old || []).filter(h => h.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(['portfolio'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  const displayPositions = user?.alpaca_connected ? alpacaPositions : holdings;
  const isAlpacaMode = user?.alpaca_connected && alpacaPositions.length > 0;

  const totalValue = isAlpacaMode
    ? alpacaPositions.reduce((sum, p) => sum + parseFloat(p.market_value || 0), 0)
    : Array.isArray(holdings) ? holdings.reduce((sum, h) => sum + (livePrices[h.symbol] || h.current_price || h.avg_cost) * h.shares, 0) : 0;

  const totalCost = isAlpacaMode
    ? alpacaPositions.reduce((sum, p) => sum + (parseFloat(p.avg_entry_price || 0) * parseFloat(p.qty || 0)), 0)
    : Array.isArray(holdings) ? holdings.reduce((sum, h) => sum + h.avg_cost * h.shares, 0) : 0;

  const totalPnL = isAlpacaMode
    ? alpacaPositions.reduce((sum, p) => sum + parseFloat(p.unrealized_pl || 0), 0)
    : totalValue - totalCost;

  const totalPnLPercent = totalCost > 0 ? (totalPnL / totalCost * 100) : 0;

  const pieData = isAlpacaMode
    ? alpacaPositions.map((p) => ({
        name: p.symbol,
        value: parseFloat(p.market_value || 0),
      }))
    : Array.isArray(holdings) ? holdings.map((h) => ({
        name: h.symbol,
        value: +((livePrices[h.symbol] || h.current_price || h.avg_cost) * h.shares).toFixed(2),
      })) : [];

  return (
    <PullToRefresh onRefresh={async () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    }}>
      <div className="min-h-screen bg-background p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* AI Context Banner */}
      <ContextBanner
        storageKey="portfolio_v1"
        title={t('portfolio.contextTitle', 'Your Portfolio')}
        body={t('portfolio.contextBody', 'TREK analyzes your holdings and surfaces risk signals.')}
        actions={[
          { label: t('portfolio.contextAnalyze', 'Analyze'), onClick: () => {} },
          { label: t('portfolio.contextAddFirst', 'Add First Position'), onClick: () => setShowAdd(true) },
        ]}
        aiQuestion={t('portfolio.contextAI', 'How is my portfolio performing?')}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-white/95 tracking-tight">{t('portfolio.title', 'Portfolio')}</h1>
            {isAlpacaMode && (
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#22c55e]/15 border border-[#22c55e]/40 text-[#22c55e]">
                LIVE
              </span>
            )}
            {!user?.alpaca_connected && (
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#F59E0B]/15 border border-[#F59E0B]/40 text-[#F59E0B]">
                PRACTICE
              </span>
            )}
          </div>
          <p className="text-[11px] text-white/30 font-medium tracking-wide">
            {isAlpacaMode ? 'TREK is monitoring your real positions' : t('portfolio.subtitle', 'Track and analyze your investments')}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!user?.alpaca_connected && (
            <Button
              onClick={() => navigate('/alpaca-connect')}
              size="sm"
              className="h-8 text-[10px] font-bold bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white whitespace-nowrap"
            >
              CONNECT ALPACA
            </Button>
          )}
          <Button
            onClick={() => navigate('/PaperTrading')}
            size="sm"
            className="h-8 text-[10px] font-bold bg-white/10 hover:bg-white/15 text-white/80 whitespace-nowrap"
          >
            <Play className="h-3.5 w-3.5 mr-1.5" /> {t('common.trade', 'Trade')}
          </Button>
          {!isAlpacaMode && (
            <Button
              onClick={() => setShowAdd(true)}
              size="sm"
              className="h-8 text-[10px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> {t('common.add', 'Add')}
            </Button>
          )}
        </div>
      </motion.div>

      {/* Practice mode banner */}
      {!isAlpacaMode && (
        <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 flex-shrink-0">PRACTICE</span>
          <p className="text-[11px] text-white/50 flex-1">This is a simulated portfolio with virtual funds. <button onClick={() => navigate('/alpaca-connect')} className="text-[#F59E0B] font-semibold hover:underline">Connect your broker</button> to trade with real money via Alpaca.</p>
        </div>
      )}

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
          { label: t('portfolio.totalValue', 'Total Value'), value: `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: 'text-white/90' },
          {
            label: t('portfolio.totalPnL', 'Total P&L'),
            value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            color: totalPnL >= 0 ? 'text-chart-3' : 'text-destructive'
          },
          {
            label: t('portfolio.return', 'Return'),
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

      {/* Pie Chart - only show when holdings exist */}
      {Array.isArray(holdings) && holdings.length > 0 && (
        <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-3.5 w-3.5 text-white/30" />
            <span className="text-sm font-bold text-white/80">{t('portfolio.allocation', 'Allocation')}</span>
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
          <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 mt-3">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-[10px]">
                <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="font-mono text-white/50">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs: Holdings / Trade History */}
      <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-white/[0.05]">
          {[
            { id: 'holdings', label: `${t('portfolio.holdings', 'Holdings')} (${holdings.length})` },
            { id: 'history', label: t('portfolio.tradeHistory', 'Trade History') },
            { id: 'performance', label: t('portfolio.performance', 'Performance') },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3.5 text-[12px] font-bold transition-colors relative ${
                activeTab === tab.id ? 'text-white/90' : 'text-white/35 hover:text-white/60'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Holdings Tab */}
        {activeTab === 'holdings' && (
          (isLoading || loadingAlpaca) ? (
            <div className="p-10 text-center text-white/25 text-[12px]">{t('common.loading', 'Loading...')}</div>
          ) : displayPositions.length === 0 ? (
            <div className="p-12 flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 rounded-2xl border border-white/[0.06] bg-white/[0.03] flex items-center justify-center">
                <Briefcase className="h-7 w-7 text-white/20" />
              </div>
              <div>
                <p className="text-sm font-bold text-white/60 mb-1">{t('portfolio.noPositions', 'No positions yet')}</p>
                <p className="text-[11px] text-white/25 max-w-xs">
                  {!user?.alpaca_connected
                    ? t('portfolio.noPositionsDesc', 'Add your first position or connect Alpaca to import real holdings')
                    : 'No positions found in your Alpaca account'}
                </p>
              </div>
              {!user?.alpaca_connected && (
                <div className="flex gap-3 flex-wrap justify-center mt-1">
                  <Button onClick={() => navigate('/alpaca-connect')} size="sm" className="h-9 px-5 text-[11px] font-bold bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white">
                    CONNECT ALPACA
                  </Button>
                  <Button onClick={() => setShowAdd(true)} size="sm" className="h-9 px-5 text-[11px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> {t('portfolio.addFirstPosition', 'Add Position')}
                  </Button>
                  <Button onClick={() => navigate('/PaperTrading')} size="sm" variant="outline" className="h-9 px-5 text-[11px] font-bold border-white/[0.1] bg-white/[0.03] text-white/60 hover:bg-white/[0.06]">
                    <Play className="h-3.5 w-3.5 mr-1.5" /> {t('portfolio.startPaperTrading', 'Start Paper Trading')}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {[t('portfolio.symbol', 'Symbol'), t('portfolio.shares', 'Shares'), t('portfolio.avgCost', 'Avg Cost'), t('portfolio.currentPrice', 'Current Price'), t('portfolio.marketValue', 'Market Value'), t('portfolio.pnl', 'P&L'), isAlpacaMode ? 'TREK' : ''].map((h, i) => (
                      <th key={i} className={`${i === 0 ? 'text-left px-5' : i === 6 ? 'w-10' : 'text-right px-4'} py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isAlpacaMode ? alpacaPositions.map((p) => {
                    const pnl = parseFloat(p.unrealized_pl || 0);
                    const pnlPct = parseFloat(p.unrealized_plpc || 0) * 100;
                    const currentPrice = parseFloat(p.current_price || 0);
                    const avgPrice = parseFloat(p.avg_entry_price || 0);
                    const qty = parseFloat(p.qty || 0);
                    const mktValue = parseFloat(p.market_value || 0);
                    const trekSignal = pnl >= 0 ? 'HOLD' : 'WATCH';

                    return (
                      <tr key={p.asset_id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0" style={{ borderLeft: pnl >= 0 ? '3px solid #22c55e' : '3px solid #ef4444' }}>
                        <td className="px-5 py-3">
                          <div className="font-mono font-black text-[13px] text-white/85">{p.symbol}</div>
                          <div className="text-[10px] text-white/30">{parseFloat(qty).toFixed(2)} shares</div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-white/60">{parseFloat(qty).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-white/60">${avgPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-white/85 font-bold">${currentPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-mono text-[12px] text-white/60">${mktValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
                        <td className={`px-4 py-3 text-right font-mono ${pnl >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                          <div className="text-[12px] font-bold flex items-center justify-end gap-0.5">
                            {pnl >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            <span>${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                          </div>
                          <div className="text-[10px] opacity-70">{pnl >= 0 ? '+' : ''}{pnlPct.toFixed(2)}%</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className={`text-[9px] font-black px-2 py-1 rounded ${pnl >= 0 ? 'bg-chart-3/15 text-chart-3' : 'bg-[#F59E0B]/15 text-[#F59E0B]'}`}>
                            {trekSignal}
                          </div>
                        </td>
                      </tr>
                    );
                  }) : (Array.isArray(holdings) ? holdings : []).map((h) => {
                    const currentPrice = livePrices[h.symbol] || h.current_price || h.avg_cost;
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
          )
        )}

        {/* Trade History Tab */}
        {activeTab === 'history' && <TradeHistory />}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="p-5">
            <PortfolioPerformanceChart />
          </div>
        )}
      </div>

      <AddHoldingDialog open={showAdd} onOpenChange={setShowAdd} />
      </div>
    </PullToRefresh>
  );
}