import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { generateMiniChart } from '../MarketData';

export default function MiniSparkline({ positive = true }) {
  const data = React.useMemo(() => generateMiniChart(20), []);

  return (
    <div className="h-8 w-20">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={positive ? 'hsl(142, 70%, 45%)' : 'hsl(0, 72%, 55%)'}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}