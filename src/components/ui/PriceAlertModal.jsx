import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function PriceAlertModal({ symbol, currentPrice, onClose }) {
  const [targetPrice, setTargetPrice] = useState(currentPrice ? currentPrice.toFixed(2) : '');
  const [direction, setDirection] = useState('above');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!targetPrice || isNaN(parseFloat(targetPrice))) {
      toast.error('Enter a valid price');
      return;
    }
    setSaving(true);
    try {
      const user = await base44.auth.me();
      await base44.entities.PriceAlert.create({
        user_id: user?.email || user?.id,
        symbol,
        target_price: parseFloat(targetPrice),
        direction,
        triggered: false,
      });
      setSaved(true);
      toast.success(`⚡ TREK alert set: ${symbol} ${direction} $${parseFloat(targetPrice).toFixed(2)}`);
      setTimeout(onClose, 1200);
    } catch (e) {
      toast.error('Failed to set alert');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/[0.09] overflow-hidden"
        style={{ background: '#0E0E17' }}
      >
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-sm font-black text-white/90">Set TREK Alert</span>
          </div>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/[0.06]">
            <X className="h-4 w-4 text-white/40" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">Symbol</div>
            <div className="text-2xl font-black font-mono text-white/90">{symbol}</div>
            {currentPrice && (
              <div className="text-[11px] text-white/30 mt-0.5">Current: ${currentPrice.toFixed(2)}</div>
            )}
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">Alert When Price Goes</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'above', label: '↑ Above', color: '#22c55e' },
                { value: 'below', label: '↓ Below', color: '#ef4444' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setDirection(opt.value)}
                  className="py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={direction === opt.value
                    ? { background: opt.color + '18', border: `1.5px solid ${opt.color}50`, color: opt.color }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.35)' }
                  }>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/30 mb-2">Target Price ($)</div>
            <input
              type="number" step="0.01" value={targetPrice}
              onChange={e => setTargetPrice(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 rounded-xl text-xl font-black font-mono text-white/90 placeholder:text-white/15 outline-none focus:border-primary/40"
              style={{ background: 'rgba(6,14,32,0.6)', border: '1px solid rgba(100,220,255,0.1)', boxSizing: 'border-box' }}
            />
          </div>

          <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)' }}>
            <p className="text-[10px] text-white/40 leading-relaxed">
              TREK will notify you when <span className="text-white/70 font-bold">{symbol}</span> goes {direction} <span className="text-white/70 font-bold">${parseFloat(targetPrice || 0).toFixed(2)}</span>. Alert appears in your notification bell.
            </p>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button onClick={handleSave} disabled={saving || saved}
            className="w-full py-3.5 rounded-xl font-black text-sm tracking-wide transition-all disabled:opacity-60"
            style={{ background: saved ? '#22c55e' : 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
            {saved ? <><Check className="inline h-4 w-4 mr-1" /> Alert Set!</> : saving ? 'Setting...' : '⚡ Set TREK Alert'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}