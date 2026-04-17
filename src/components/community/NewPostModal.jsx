import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function NewPostModal({ user, onClose, onPosted }) {
  const [ticker, setTicker] = useState('');
  const [action, setAction] = useState('BUY');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!ticker || !analysis.trim()) return;
    setLoading(true);
    try {
      await base44.functions.invoke('communityPost', { ticker: ticker.toUpperCase(), action, analysis });
      onPosted();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    { value: 'BUY', icon: TrendingUp, color: '#0ec8dc' },
    { value: 'SELL', icon: TrendingDown, color: '#ef4444' },
    { value: 'HOLD', icon: Minus, color: '#F59E0B' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 60 }}
        className="w-full max-w-lg rounded-2xl p-6 space-y-4"
        style={{ background: 'rgba(10,22,52,0.97)', border: '1px solid rgba(14,200,220,0.2)' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-black text-white">Post Trade Idea</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Ticker */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-1.5">Ticker</label>
          <input
            type="text"
            value={ticker}
            onChange={e => setTicker(e.target.value.toUpperCase())}
            placeholder="NVDA, BTC, SPY..."
            maxLength={10}
            className="w-full rounded-xl px-4 py-3 text-sm font-mono font-bold text-white uppercase outline-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {/* Action */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-1.5">Action</label>
          <div className="flex gap-2">
            {actions.map(({ value, icon: ActionIcon2, color }) => (
              <button
                key={value}
                onClick={() => setAction(value)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black transition-all"
                style={action === value
                  ? { background: `${color}20`, color, border: `1px solid ${color}50` }
                  : { background: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <ActionIcon2 className="h-3.5 w-3.5" />
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* Analysis */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-1.5">Analysis</label>
          <textarea
            value={analysis}
            onChange={e => setAnalysis(e.target.value)}
            placeholder="Why are you making this trade? Be specific — TREK will grade it."
            rows={4}
            maxLength={500}
            className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none resize-none leading-relaxed"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <p className="text-[10px] text-white/20 mt-1 text-right">{analysis.length}/500</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !ticker || !analysis.trim()}
          className="w-full py-3.5 rounded-xl font-black text-sm transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, rgba(14,200,220,0.9), rgba(8,160,185,0.9))', color: '#040d1e' }}
        >
          {loading ? 'Posting & TREK grading...' : '⚡ Post Trade Idea'}
        </button>
        <p className="text-[10px] text-center text-white/25">TREK will grade your analysis A–F</p>
      </motion.div>
    </div>
  );
}