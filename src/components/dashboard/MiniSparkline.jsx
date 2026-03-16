import React, { useMemo } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { generateMiniChart } from '../MarketData';

export default function MiniSparkline({ positive = true }) {
  const data = useMemo(() => generateMiniChart(20), []);

  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={positive ? 'rgba(34,197,94,0.8)' : 'rgba(239,68,68,0.8)'}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}