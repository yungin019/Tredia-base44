import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const TABS = ['1D', '1W', '1M', 'All'];

function buildChartData(trades, tab) {
  if (!trades || trades.length === 0) {
    // Show flat demo line
    const now = Date.now();
    return Array.from({ length: 12 }, (_, i) => ({
      label: `T-${11 - i}`,
      value: 200000,
    }));
  }

  const sorted = [...trades].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
  let startMs;
  const now = Date.now();
  if (tab === '1D') startMs = now - 86400000;
  else if (tab === '1W') startMs = now - 7 * 86400000;
  else if (tab === '1M') startMs = now - 30 * 86400000;
  else startMs = 0;

  const filtered = sorted.filter(t => new Date(t.created_date).getTime() >= startMs);
  if (filtered.length === 0) return [];

  let cumValue = 200000;
  return filtered.map(trade => {
    const pnl = trade.action === 'buy'
      ? -(trade.shares * trade.price)
      : (trade.shares * trade.price);
    cumValue += pnl;
    return {
      label: new Date(trade.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.max(0, cumValue),
    };
  });
}

export default function PortfolioPerformanceChart() {
  const [activeTab, setActiveTab] = useState('1M');

  const { data: trades = [] } = useQuery({
    queryKey: ['trade_logs'],
    queryFn: () => base44.entities.TradeLog.list('-created_date', 100),
  });

  const chartData = useMemo(() => buildChartData(trades, activeTab), [trades, activeTab]);

  const startValue = chartData[0]?.value || 200000;
  const endValue = chartData[chartData.length - 1]?.value || 200000;
  const pnlDollar = endValue - startValue;
  const pnlPct = startValue > 0 ? ((pnlDollar / startValue) * 100) : 0;
  const isUp = pnlDollar >= 0;
  const lineColor = isUp ? '#22c55e' : '#ef4444';

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30 mb-1">Portfolio Performance</p>
          <div className="text-2xl font-black font-mono" style={{ color: lineColor }}>
            {isUp ? '+' : ''}${Math.abs(pnlDollar).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-[11px] font-bold ${isUp ? 'text-chart-3' : 'text-destructive'}`}>
            {isUp ? '+' : ''}{pnlPct.toFixed(2)}% in this period
          </div>
        </div>

        {/* Timeframe tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.06]">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition-all ${
                activeTab === tab ? 'bg-primary/15 text-primary border border-primary/25' : 'text-white/30 hover:text-white/50'
              }`}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        {chartData.length < 2 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-[12px] text-white/25">No trade history for this period</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false}
                tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
                labelStyle={{ color: 'rgba(255,255,255,0.4)' }}
                formatter={(v) => [`$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 'Portfolio']}
                itemStyle={{ color: lineColor }}
              />
              <ReferenceLine y={startValue} stroke="rgba(255,255,255,0.1)" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="value" stroke={lineColor} strokeWidth={2.5} dot={false}
                activeDot={{ r: 4, fill: lineColor, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/[0.05]">
        <div className="text-center">
          <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1">Starting Value</p>
          <p className="text-[12px] font-mono font-bold text-white/60">${startValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1">Current Value</p>
          <p className="text-[12px] font-mono font-bold text-white/90">${endValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1">P&L</p>
          <p className={`text-[12px] font-mono font-bold ${isUp ? 'text-chart-3' : 'text-destructive'}`}>
            {isUp ? '+' : ''}${pnlDollar.toFixed(0)}
          </p>
        </div>
      </div>
    </div>
  );
}