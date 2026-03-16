import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { generateChartData } from '../MarketData';

const PERIODS = ['1D', '1W', '1M', '3M', '1Y'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dark rounded-lg px-3 py-2.5 border border-white/[0.08]">
        <p className="text-[10px] text-white/40 font-mono mb-1">{label}</p>
        <p className="text-sm font-mono font-bold text-primary">${payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

export default function PerformanceChart() {
  const [period, setPeriod] = useState('1M');
  const data = useMemo(() => generateChartData(30), []);
  const isPositive = data[data.length - 1]?.value >= data[0]?.value;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/[0.05]">
        <div>
          <h3 className="text-sm font-semibold text-white/90">Portfolio Performance</h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-[11px] font-mono text-chart-3">+17.4%</span>
            <span className="text-[10px] text-white/25">all time return</span>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`text-[10px] font-mono px-2.5 py-1 rounded-md transition-all ${
                period === p
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'text-white/35 hover:text-white/60'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="px-2 py-4 h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
            <defs>
              <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono' }}
              interval="preserveStartEnd"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)', fontFamily: 'JetBrains Mono' }}
              width={38}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(245,158,11,0.2)', strokeWidth: 1 }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#F59E0B"
              strokeWidth={1.5}
              fill="url(#perfGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}