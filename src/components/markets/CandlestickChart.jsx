import React, { useState } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CandlestickChart({ data = [], timeframe = '1D' }) {
  const [chartType, setChartType] = useState('line');

  // Transform OHLC data for candlestick rendering
  const chartData = data.map((d, i) => ({
    ...d,
    index: i,
    isUp: d.close >= d.open,
    wickHigh: d.high,
    wickLow: d.low,
    bodyTop: Math.max(d.open, d.close),
    bodyBottom: Math.min(d.open, d.close),
    bodyHeight: Math.abs(d.close - d.open),
  }));

  const CustomCandlestick = (props) => {
    const { x, y, width, height, payload } = props;
    if (!payload) return null;

    const color = payload.isUp ? '#22c55e' : '#ef4444';
    const wickX = x + width / 2;
    const bodyWidth = Math.max(width * 0.6, 2);
    const bodyX = x + (width - bodyWidth) / 2;

    return (
      <g>
        {/* Wick */}
        <line
          x1={wickX}
          y1={y}
          x2={wickX}
          y2={y + height}
          stroke={color}
          strokeWidth={1}
        />
        {/* Body */}
        <rect
          x={bodyX}
          y={y + height * ((payload.high - payload.bodyTop) / (payload.high - payload.low))}
          width={bodyWidth}
          height={height * (payload.bodyHeight / (payload.high - payload.low)) || 1}
          fill={color}
        />
      </g>
    );
  };

  return (
    <div className="w-full">
      {/* Toggle Button */}
      <div className="flex items-center justify-end mb-3">
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.06]">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${
              chartType === 'line'
                ? 'bg-primary/15 text-primary border border-primary/25'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('candles')}
            className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${
              chartType === 'candles'
                ? 'bg-primary/15 text-primary border border-primary/25'
                : 'text-white/30 hover:text-white/50'
            }`}
          >
            Candles
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="index" hide />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 10,
                }}
                labelStyle={{ display: 'none' }}
                formatter={(value) => [`$${value.toLocaleString()}`, '']}
              />
              <Line
                type="monotone"
                dataKey="close"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="index" hide />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#111118',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  fontSize: 10,
                  padding: 8,
                }}
                labelStyle={{ display: 'none' }}
                formatter={(value, name) => {
                  if (name === 'high') return null;
                  return [value, name.toUpperCase()];
                }}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-[#111118] border border-white/10 rounded-lg p-2 text-[10px]">
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                          <span className="text-white/40">O:</span>
                          <span className="text-white/85 font-mono">${data.open.toFixed(2)}</span>
                          <span className="text-white/40">H:</span>
                          <span className="text-white/85 font-mono">${data.high.toFixed(2)}</span>
                          <span className="text-white/40">L:</span>
                          <span className="text-white/85 font-mono">${data.low.toFixed(2)}</span>
                          <span className="text-white/40">C:</span>
                          <span className="text-white/85 font-mono">${data.close.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="high"
                shape={<CustomCandlestick />}
                isAnimationActive={false}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
