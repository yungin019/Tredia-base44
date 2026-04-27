import React from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DATA = [
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

export default function PortfolioPerformanceChart() {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30 mb-4">
        {t('portfolio.vsSnP', 'Portfolio vs S&P 500 (12 Months)')}
      </div>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={DATA} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}`} />
            <Tooltip
              contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 11 }}
              labelStyle={{ color: 'rgba(255,255,255,0.5)' }}
              itemStyle={{ color: 'rgba(255,255,255,0.8)' }}
            />
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 8 }} />
            <Line type="monotone" dataKey="portfolio" name={t('paperTrading.yourPortfolio', 'Your Portfolio')} stroke="#F59E0B" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="sp500" name="S&P 500" stroke="rgba(255,255,255,0.25)" strokeWidth={2} dot={false} strokeDasharray="4 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}