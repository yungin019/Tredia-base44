import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';

// A proper candlestick chart using Canvas — avoids Recharts limitations for OHLC rendering
export default function CandlestickChart({ symbol, timeframe = '1D', initialData = [] }) {
  const [chartType, setChartType] = useState('line');
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef(null);
  const prevKey = useRef(null);

  useEffect(() => {
    const key = `${symbol}:${timeframe}`;
    if (prevKey.current === key && data.length > 0) return;
    prevKey.current = key;

    if (!symbol) return;
    setLoading(true);
    base44.functions.invoke('stockPrices', { symbol, mode: 'ohlc', timeframe })
      .then(res => {
        const cd = res?.data?.chartData;
        if (cd && cd.length > 0) setData(cd);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [symbol, timeframe]);

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return;
    drawChart(canvasRef.current, data, chartType);
  }, [data, chartType]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-end mb-3">
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-0.5 border border-white/[0.06]">
          {['line', 'candles'].map(t => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`px-3 py-1 rounded-md text-[9px] font-bold transition-all ${
                chartType === t ? 'bg-primary/15 text-primary border border-primary/25' : 'text-white/30 hover:text-white/50'
              }`}
            >
              {t === 'line' ? 'Line' : 'Candles'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[200px] relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {!loading && data.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-xs">No chart data</div>
        )}
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ display: loading || data.length === 0 ? 'none' : 'block' }}
        />
      </div>
    </div>
  );
}

function drawChart(canvas, data, type) {
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  const W = rect.width;
  const H = rect.height;

  const PAD = { top: 8, right: 8, bottom: 24, left: 48 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // Price range
  const prices = data.flatMap(d => [d.high ?? d.close, d.low ?? d.close, d.close]);
  const minP = Math.min(...prices) * 0.999;
  const maxP = Math.max(...prices) * 1.001;
  const range = maxP - minP || 1;

  const toY = (p) => PAD.top + chartH - ((p - minP) / range) * chartH;
  const toX = (i) => PAD.left + (i / (data.length - 1 || 1)) * chartW;

  // Background grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let g = 0; g <= 4; g++) {
    const y = PAD.top + (g / 4) * chartH;
    ctx.beginPath(); ctx.moveTo(PAD.left, y); ctx.lineTo(PAD.left + chartW, y); ctx.stroke();
    const price = maxP - (g / 4) * range;
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = `${9 * (window.devicePixelRatio > 1 ? 1 : 1)}px monospace`;
    ctx.textAlign = 'right';
    ctx.fillText('$' + price.toLocaleString(undefined, { maximumFractionDigits: 2 }), PAD.left - 4, y + 3);
  }

  // X axis labels (show ~5 evenly spaced)
  const labelStep = Math.max(1, Math.floor(data.length / 5));
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  for (let i = 0; i < data.length; i += labelStep) {
    const label = String(data[i].date || '').slice(-5);
    ctx.fillText(label, toX(i), H - 4);
  }

  if (type === 'line') {
    // Gradient fill
    const grad = ctx.createLinearGradient(0, PAD.top, 0, PAD.top + chartH);
    grad.addColorStop(0, 'rgba(245,158,11,0.2)');
    grad.addColorStop(1, 'rgba(245,158,11,0)');
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = toX(i), y = toY(d.close);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.lineTo(toX(data.length - 1), PAD.top + chartH);
    ctx.lineTo(toX(0), PAD.top + chartH);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    data.forEach((d, i) => {
      const x = toX(i), y = toY(d.close);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();
  } else {
    // Candlesticks
    const candleW = Math.max(1, Math.min(10, (chartW / data.length) * 0.6));
    data.forEach((d, i) => {
      const x = toX(i);
      const open  = d.open  ?? d.close;
      const high  = d.high  ?? d.close;
      const low   = d.low   ?? d.close;
      const close = d.close;
      const isUp = close >= open;
      const color = isUp ? '#22c55e' : '#ef4444';
      ctx.strokeStyle = color;
      ctx.fillStyle   = color;
      ctx.lineWidth = 1;

      // Wick
      ctx.beginPath();
      ctx.moveTo(x, toY(high));
      ctx.lineTo(x, toY(low));
      ctx.stroke();

      // Body
      const bodyTop    = toY(Math.max(open, close));
      const bodyBottom = toY(Math.min(open, close));
      const bodyH = Math.max(1, bodyBottom - bodyTop);
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    });
  }
}