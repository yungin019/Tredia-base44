import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, ShieldAlert, Target, Zap, CheckCircle2, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { base44 } from '@/api/base44Client';

// ── Static data store per symbol ─────────────────────────────────────────────
const ASSET_DATA = {
  NVDA: { name: 'NVIDIA Corp', price: 871.20, change: 5.1, signal: 'BUY', confidence: 92, sector: 'Technology',
    entry: '871', target: '942', stop: '848', risk: '-2.6%', reward: '+8.2%',
    whyNow: 'RSI broke 60 after 3 weeks of consolidation. Volume 2.4× avg. Institutional accumulation pattern confirmed on 4H chart.',
    conviction: 'HIGH', color: '#22c55e',
    chart: [870,874,869,878,882,876,884,891,886,880,887,895,871,875,882,890],
  },
  TSLA: { name: 'Tesla Inc.', price: 175.30, change: -2.4, signal: 'SELL', confidence: 74, sector: 'Automotive',
    entry: '175', target: '148', stop: '186', risk: '+6.3%', reward: '-15.4%',
    whyNow: 'Volume drying up. Bearish divergence on daily. Break below $165 opens path to $145 support.',
    conviction: 'MEDIUM', color: '#ef4444',
    chart: [182,179,177,180,178,174,176,173,177,175,172,175,178,173,176,175],
  },
  META: { name: 'Meta Platforms', price: 520.15, change: -1.2, signal: 'AVOID', confidence: 71, sector: 'Technology',
    entry: null, target: null, stop: null, risk: '-8%', reward: null,
    whyNow: 'Bearish divergence on daily RSI. Weak relative strength vs sector peers. Await cleaner setup.',
    conviction: 'MEDIUM', color: '#ef4444',
    chart: [535,528,532,525,521,524,519,523,518,522,520,517,521,519,520,520],
  },
  JPM: { name: 'JPMorgan Chase', price: 201.50, change: 1.5, signal: 'WATCH', confidence: 81, sector: 'Finance',
    entry: '200', target: '216', stop: '193', risk: '-3.5%', reward: '+7.2%',
    whyNow: 'Sector rotation into financials. Rate cut expectations boosting bank margins. Accumulation at $195–202 range.',
    conviction: 'MEDIUM', color: '#F59E0B',
    chart: [195,197,198,200,199,201,203,200,202,204,201,203,205,202,201,202],
  },
  BTC: { name: 'Bitcoin', price: 67420, change: 4.8, signal: 'BUY', confidence: 87, sector: 'Crypto',
    entry: '67000', target: '78500', stop: '61200', risk: '-8.6%', reward: '+16.8%',
    whyNow: 'Spot ETF inflows at record levels. On-chain data shows whale accumulation. Halving cycle momentum.',
    conviction: 'HIGH', color: '#22c55e',
    chart: [64200,65100,63800,66000,65400,67100,66200,68100,67300,66800,67900,68400,67100,67600,68000,67420],
  },
};

const DEFAULT_ASSET = {
  name: 'Unknown Asset', price: 100.00, change: 0, signal: 'HOLD', confidence: 50, sector: 'Unknown',
  entry: null, target: null, stop: null, risk: '—', reward: '—',
  whyNow: 'No TREK analysis available for this asset yet.',
  conviction: 'LOW', color: '#6b7280',
  chart: [100,101,100,102,101,103,102,101,100,101,102,100,101,100,101,100],
};

function TradeModal({ asset, action, onClose }) {
  const [amount, setAmount] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const isBuy = action === 'BUY';
  const color = isBuy ? '#22c55e' : '#ef4444';

  const shares = amount ? (parseFloat(amount) / asset.price).toFixed(4) : '—';

  const handleConfirm = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    const sharesNum = parseFloat((parseFloat(amount) / asset.price).toFixed(4));
    base44.entities.TradeLog.create({
      symbol: asset.symbol,
      name: asset.name || asset.symbol,
      action: isBuy ? 'buy' : 'sell',
      shares: sharesNum,
      price: asset.price,
      total: parseFloat(amount),
      status: 'executed',
    }).catch(() => {});
    setConfirmed(true);
  };

  if (confirmed) {
    return (
      <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.3 }}
          className="w-full max-w-sm rounded-2xl p-8 text-center"
          style={{ background: '#111118', border: `1px solid ${color}30` }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.15, type: 'spring', bounce: 0.4 }}
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: `${color}20`, border: `2px solid ${color}40` }}>
            <CheckCircle2 className="h-8 w-8" style={{ color }} />
          </motion.div>
          <p className="text-[11px] font-black uppercase tracking-[0.15em] mb-1" style={{ color }}>Paper Trade Executed</p>
          <p className="text-[22px] font-black text-white/95 mb-1">{action} {asset.symbol}</p>
          <p className="text-[13px] text-white/50 mb-2">{shares} shares @ ${asset.price.toLocaleString()}</p>
          <p className="text-[11px] text-white/30 mb-6">Added to your paper portfolio</p>
          <button onClick={onClose} className="w-full py-3 rounded-xl font-bold text-sm text-white/60 border border-white/[0.1] hover:border-white/20 transition-colors">
            Done
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#111118', border: `1px solid ${color}25` }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.15em] mb-0.5" style={{ color }}>
              {isBuy ? '🟢' : '🔴'} {action} {asset.symbol}
            </p>
            <p className="text-[12px] text-white/40">Paper Trading · No real money</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
            <X className="h-4 w-4 text-white/30" />
          </button>
        </div>

        <div className="rounded-xl p-3 mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex justify-between text-[11px] mb-1">
            <span className="text-white/40">Current Price</span>
            <span className="font-mono font-bold text-white/85">${asset.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-white/40">Shares</span>
            <span className="font-mono font-bold text-white/85">{shares}</span>
          </div>
        </div>

        <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30 block mb-1.5">Amount (USD)</label>
        <input
          type="number"
          placeholder="e.g. 1000"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-sm font-mono text-white/90 mb-4 outline-none"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          autoFocus
        />

        <button
          onClick={handleConfirm}
          disabled={!amount || parseFloat(amount) <= 0}
          className="w-full py-3.5 rounded-xl font-black text-sm transition-all hover:opacity-90 disabled:opacity-30"
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)`, color: '#0A0A0F' }}>
          Confirm {action}
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function AssetDetail() {
  const navigate = useNavigate();
  const symbol = window.location.pathname.split('/Asset/')[1] || 'NVDA';
  const staticAsset = { ...(ASSET_DATA[symbol] || DEFAULT_ASSET), symbol };

  const [tradeAction, setTradeAction] = useState(null);
  const [showPlan, setShowPlan] = useState(false);
  const [livePrice, setLivePrice] = useState(null);
  const [liveChart, setLiveChart] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function loadAsset() {
      setLoadingData(true);
      try {
        const [priceRes, ohlcRes] = await Promise.all([
          base44.functions.invoke('stockPrices', { symbols: [symbol] }),
          base44.functions.invoke('stockPrices', { symbol, mode: 'ohlc' }),
        ]);
        const price = priceRes?.data?.prices?.[symbol];
        if (price) setLivePrice(price);
        const chartData = ohlcRes?.data?.chartData;
        if (chartData && chartData.length > 0) setLiveChart(chartData);
      } catch {
        // fall back to static data
      } finally {
        setLoadingData(false);
      }
    }
    loadAsset();
  }, [symbol]);

  const asset = {
    ...staticAsset,
    price: livePrice || staticAsset.price,
  };
  const chartData = liveChart
    ? liveChart.map((v, i) => ({ t: i, v: v.close }))
    : staticAsset.chart.map((v, i) => ({ t: i, v }));
  const isUp = asset.change >= 0;
  const cvColor = asset.conviction === 'HIGH' ? '#22c55e' : asset.conviction === 'MEDIUM' ? '#F59E0B' : '#6b7280';

  return (
    <div className="p-4 lg:p-6 max-w-[700px] mx-auto pb-24">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors mb-5 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-black font-mono text-white/95">{asset.symbol}</h1>
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
                style={{ color: asset.color, background: `${asset.color}15`, border: `1px solid ${asset.color}30` }}>
                {asset.signal}
              </span>
            </div>
            <p className="text-[12px] text-white/40">{asset.name} · {asset.sector}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black font-mono text-white/95">${asset.price.toLocaleString()}</div>
            <div className={`flex items-center justify-end gap-1 text-[13px] font-bold font-mono ${isUp ? 'text-chart-3' : 'text-destructive'}`}>
              {isUp ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
              {isUp ? '+' : ''}{asset.change}%
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.07 }}
        className="rounded-xl border border-white/[0.07] bg-[#111118] p-4 mb-4">
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fontSize: 9, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 10 }}
                labelStyle={{ display: 'none' }}
                formatter={v => [`$${v.toLocaleString()}`, '']}
              />
              <Line type="monotone" dataKey="v" stroke={asset.color} strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* TREK Signal */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-xl p-4 mb-4"
        style={{ background: `${asset.color}08`, border: `1px solid ${asset.color}25`, borderLeft: `4px solid ${asset.color}` }}>
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.12em]">TREK Analysis</span>
          <span className="ml-auto text-[10px] font-black" style={{ color: cvColor }}>
            {asset.confidence}% confidence · {asset.conviction}
          </span>
        </div>
        <p className="text-[12px] text-white/70 leading-relaxed mb-3">{asset.whyNow}</p>

        <button onClick={() => setShowPlan(v => !v)}
          className="text-[10px] font-bold flex items-center gap-1 transition-colors"
          style={{ color: asset.color, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <Target className="h-3 w-3" />
          {showPlan ? 'Hide Trade Plan' : 'View Trade Plan'}
        </button>

        <AnimatePresence>
          {showPlan && asset.entry && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
              <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-white/[0.06]">
                {[
                  { label: 'Entry', value: `$${asset.entry}`, color: 'rgba(255,255,255,0.8)' },
                  { label: 'Target', value: `$${asset.target}`, color: '#22c55e' },
                  { label: 'Stop', value: `$${asset.stop}`, color: '#ef4444' },
                  { label: 'R:R', value: asset.reward, color: asset.color },
                ].map(item => (
                  <div key={item.label} className="text-center rounded-lg py-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <p className="text-[8px] text-white/25 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-[13px] font-mono font-black" style={{ color: item.color }}>{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <ShieldAlert className="h-3 w-3 text-destructive flex-shrink-0" />
                <span className="text-[10px] text-white/35">Max downside: <span className="text-destructive font-bold">{asset.risk}</span> if stop is hit</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* BUY / SELL buttons */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="grid grid-cols-2 gap-3 mb-4">
        <button onClick={() => setTradeAction('BUY')}
          className="py-4 rounded-2xl font-black text-sm tracking-wider transition-all hover:scale-[1.02] tap-feedback"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#0A0A0F', boxShadow: '0 4px 20px rgba(34,197,94,0.2)' }}>
          🟢 BUY
        </button>
        <button onClick={() => setTradeAction('SELL')}
          className="py-4 rounded-2xl font-black text-sm tracking-wider transition-all hover:scale-[1.02] tap-feedback"
          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', boxShadow: '0 4px 20px rgba(239,68,68,0.2)' }}>
          🔴 SELL
        </button>
      </motion.div>

      <p className="text-[10px] text-white/20 text-center mb-6">Paper trading only — no real money involved</p>

      {/* Key stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3">
        {[
          { label: 'Signal', value: asset.signal, color: asset.color },
          { label: 'Confidence', value: `${asset.confidence}%`, color: 'rgba(255,255,255,0.7)' },
          { label: 'Conviction', value: asset.conviction, color: cvColor },
        ].map((s, i) => (
          <div key={i} className="rounded-xl p-3 text-center" style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-[13px] font-black font-mono" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Trade Modal */}
      <AnimatePresence>
        {tradeAction && (
          <TradeModal asset={asset} action={tradeAction} onClose={() => setTradeAction(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}