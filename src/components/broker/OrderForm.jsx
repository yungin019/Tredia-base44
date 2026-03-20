import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { getStockPrice } from '../MarketData';
import MobileSelect from '@/components/ui/mobile-select';

const ORDER_TYPES = [
  { value: 'market', label: 'Market' },
  { value: 'limit', label: 'Limit' },
  { value: 'stop', label: 'Stop' },
  { value: 'stop_limit', label: 'Stop Limit' },
];

const TIF_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'gtc', label: 'GTC' },
  { value: 'ioc', label: 'IOC' },
  { value: 'fok', label: 'FOK' },
];

export default function OrderForm({ isLive, onOrderSuccess }) {
  const [action, setAction] = useState('buy');
  const [symbol, setSymbol] = useState('');
  const [qty, setQty] = useState('');
  const [orderType, setOrderType] = useState('market');
  const [tif, setTif] = useState('day');
  const [limitPrice, setLimitPrice] = useState('');
  const [stopPrice, setStopPrice] = useState('');
  const [preview, setPreview] = useState(null);
  const [executing, setExecuting] = useState(false);

  const handlePreview = () => {
    if (!symbol || !qty) { toast.error('Enter symbol and quantity'); return; }
    if (orderType === 'limit' && !limitPrice) { toast.error('Enter limit price'); return; }
    if (orderType === 'stop' && !stopPrice) { toast.error('Enter stop price'); return; }
    if (orderType === 'stop_limit' && (!limitPrice || !stopPrice)) { toast.error('Enter both limit and stop prices'); return; }

    const stockData = getStockPrice(symbol.toUpperCase());
    const marketPrice = stockData ? stockData.price : null;
    setPreview({ symbol: symbol.toUpperCase(), qty: parseFloat(qty), orderType, tif, limitPrice, stopPrice, marketPrice });
  };

  const handleExecute = async () => {
    if (!preview) return;
    setExecuting(true);
    try {
      if (isLive) {
        const res = await base44.functions.invoke('alpacaTrade', {
          action,
          symbol: preview.symbol,
          qty: preview.qty,
          order_type: preview.orderType,
          time_in_force: preview.tif,
          limit_price: preview.limitPrice ? parseFloat(preview.limitPrice) : undefined,
          stop_price: preview.stopPrice ? parseFloat(preview.stopPrice) : undefined,
        });
        if (res.data?.error) throw new Error(res.data.error);
        toast.success(`🚀 ${action.toUpperCase()} ${preview.qty} ${preview.symbol} — ${preview.orderType.toUpperCase()} order submitted`);
      } else {
        const price = preview.limitPrice ? parseFloat(preview.limitPrice) : (preview.marketPrice || +(Math.random() * 200 + 50).toFixed(2));
        await base44.entities.TradeLog.create({
          symbol: preview.symbol,
          name: preview.symbol,
          action,
          shares: preview.qty,
          price,
          total: +(price * preview.qty).toFixed(2),
          status: 'executed',
        });
        toast.success(`${action.toUpperCase()} ${preview.qty} ${preview.symbol} (paper) executed`);
      }
      setSymbol(''); setQty(''); setLimitPrice(''); setStopPrice(''); setPreview(null);
      onOrderSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Order failed');
    }
    setExecuting(false);
  };

  const needsLimit = orderType === 'limit' || orderType === 'stop_limit';
  const needsStop = orderType === 'stop' || orderType === 'stop_limit';

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden" style={isLive ? { borderColor: 'rgba(34,197,94,0.15)' } : {}}>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white/80">New Order</h3>
          {isLive && (
            <span className="flex items-center gap-1 text-[9px] font-black text-chart-3 bg-chart-3/10 border border-chart-3/20 px-2 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
              LIVE
            </span>
          )}
        </div>

        {/* Buy / Sell */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {['buy', 'sell'].map((a) => (
            <button
              key={a}
              onClick={() => { setAction(a); setPreview(null); }}
              className={`py-2.5 rounded-xl text-sm font-black tracking-wide transition-all ${
                action === a
                  ? a === 'buy' ? 'bg-chart-3 text-black' : 'bg-destructive text-white'
                  : 'bg-white/[0.04] text-white/30 border border-white/[0.07] hover:text-white/60'
              }`}
            >
              {a.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {/* Symbol */}
          <div>
            <Label className="text-[10px] text-white/30 font-semibold tracking-[0.1em] uppercase">Symbol</Label>
            <Input
              value={symbol}
              onChange={(e) => { setSymbol(e.target.value.toUpperCase()); setPreview(null); }}
              placeholder="AAPL"
              className="mt-1.5 bg-white/[0.04] border-white/[0.07] h-10 font-mono text-[15px] font-bold text-white/90 placeholder:text-white/15 focus:border-primary/40"
            />
          </div>

          {/* Qty */}
          <div>
            <Label className="text-[10px] text-white/30 font-semibold tracking-[0.1em] uppercase">Quantity</Label>
            <Input
              type="number"
              value={qty}
              onChange={(e) => { setQty(e.target.value); setPreview(null); }}
              placeholder="100"
              className="mt-1.5 bg-white/[0.04] border-white/[0.07] h-10 font-mono text-[15px] font-bold text-white/90 placeholder:text-white/15 focus:border-primary/40"
            />
          </div>

          {/* Order Type + TIF */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-white/30 font-semibold tracking-[0.1em] uppercase">Order Type</Label>
              <MobileSelect
                trigger={
                  <button className="mt-1.5 w-full h-11 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 text-[13px] font-mono font-bold text-white/80 text-left flex items-center justify-between active:bg-white/[0.07] transition-colors">
                    <span>{ORDER_TYPES.find(t => t.value === orderType)?.label}</span>
                    <span className="text-white/30">▼</span>
                  </button>
                }
                options={ORDER_TYPES}
                value={orderType}
                onChange={(val) => { setOrderType(val); setPreview(null); }}
                title="Select Order Type"
              />
            </div>
            <div>
              <Label className="text-[10px] text-white/30 font-semibold tracking-[0.1em] uppercase">Time in Force</Label>
              <MobileSelect
                trigger={
                  <button className="mt-1.5 w-full h-11 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 text-[13px] font-mono font-bold text-white/80 text-left flex items-center justify-between active:bg-white/[0.07] transition-colors">
                    <span>{TIF_OPTIONS.find(t => t.value === tif)?.label}</span>
                    <span className="text-white/30">▼</span>
                  </button>
                }
                options={TIF_OPTIONS}
                value={tif}
                onChange={(val) => { setTif(val); setPreview(null); }}
                title="Select Time in Force"
              />
            </div>
          </div>

          {/* Conditional price fields */}
          {(needsLimit || needsStop) && (
            <div className="grid grid-cols-2 gap-2">
              {needsStop && (
                <div>
                  <Label className="text-[10px] text-white/30 font-semibold tracking-[0.1em] uppercase">Stop Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={stopPrice}
                    onChange={(e) => { setStopPrice(e.target.value); setPreview(null); }}
                    placeholder="0.00"
                    className="mt-1.5 bg-white/[0.04] border-white/[0.07] h-10 font-mono text-[13px] text-white/90 placeholder:text-white/15 focus:border-primary/40"
                  />
                </div>
              )}
              {needsLimit && (
                <div>
                  <Label className="text-[10px] text-white/30 font-semibold tracking-[0.1em] uppercase">Limit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => { setLimitPrice(e.target.value); setPreview(null); }}
                    placeholder="0.00"
                    className="mt-1.5 bg-white/[0.04] border-white/[0.07] h-10 font-mono text-[13px] text-white/90 placeholder:text-white/15 focus:border-primary/40"
                  />
                </div>
              )}
            </div>
          )}

          <Button
            onClick={handlePreview}
            variant="outline"
            className="w-full h-9 bg-transparent border-white/[0.1] text-white/50 hover:bg-white/[0.04] hover:text-white/80 text-[11px] font-semibold"
          >
            Preview Order
          </Button>
        </div>

        {/* Preview */}
        <AnimatePresence>
          {preview && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden"
            >
              <div className="px-4 py-2.5 border-b border-white/[0.06] flex items-center justify-between">
                <span className="text-[9px] text-white/30 font-semibold uppercase tracking-[0.1em]">Order Preview</span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wider ${action === 'buy' ? 'text-chart-3 bg-chart-3/10' : 'text-destructive bg-destructive/10'}`}>
                    {action.toUpperCase()}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded text-primary bg-primary/10">
                    {preview.orderType.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Symbol', value: preview.symbol },
                  { label: 'Qty', value: preview.qty },
                  { label: 'TIF', value: preview.tif.toUpperCase() },
                  ...(preview.limitPrice ? [{ label: 'Limit', value: `$${parseFloat(preview.limitPrice).toFixed(2)}` }] : []),
                  ...(preview.stopPrice ? [{ label: 'Stop', value: `$${parseFloat(preview.stopPrice).toFixed(2)}` }] : []),
                  ...(preview.marketPrice && orderType === 'market' ? [{ label: 'Market Price', value: `$${preview.marketPrice.toFixed(2)}` }] : []),
                ].map((item) => (
                  <div key={item.label}>
                    <div className="text-[9px] text-white/25 uppercase tracking-[0.1em] mb-0.5">{item.label}</div>
                    <div className="text-[12px] font-mono font-bold text-white/85">{item.value}</div>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <div className={`flex items-start gap-2 p-2 rounded-lg mb-3 ${isLive ? 'bg-chart-3/5 border border-chart-3/15' : 'bg-primary/5 border border-primary/10'}`}>
                  {isLive ? <Zap className="h-3 w-3 text-chart-3/60 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-3 w-3 text-primary/50 flex-shrink-0 mt-0.5" />}
                  <p className="text-[9px] text-white/35 leading-relaxed">
                    {isLive ? 'REAL order submitted to Alpaca. Ensure sufficient funds.' : 'Paper trade — no real money involved.'}
                  </p>
                </div>
                <Button
                  onClick={handleExecute}
                  disabled={executing}
                  className={`w-full h-9 font-black text-[11px] tracking-wide ${
                    action === 'buy' ? 'bg-chart-3 hover:bg-chart-3/90 text-black' : 'bg-destructive hover:bg-destructive/90 text-white'
                  }`}
                >
                  {executing ? 'Submitting...' : `${isLive ? '🚀 SUBMIT' : 'EXECUTE'} ${action.toUpperCase()}`}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}