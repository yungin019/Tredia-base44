import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getStockPrice } from '../components/MarketData';

export default function Trade() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [action, setAction] = useState('buy');
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [preview, setPreview] = useState(null);
  const [executing, setExecuting] = useState(false);

  const { data: trades = [] } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.TradeLog.list('-created_date', 20),
  });

  const tradeMutation = useMutation({
    mutationFn: (data) => base44.entities.TradeLog.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  });

  const handlePreview = () => {
    if (!symbol || !shares) { toast.error('Enter symbol and number of shares'); return; }
    const stockData = getStockPrice(symbol.toUpperCase());
    const price = stockData ? stockData.price : +(Math.random() * 200 + 50).toFixed(2);
    const name = stockData ? stockData.name : symbol.toUpperCase();
    setPreview({ symbol: symbol.toUpperCase(), name, price, shares: parseFloat(shares) });
  };

  const handleExecute = async () => {
    if (!preview) return;
    setExecuting(true);
    await tradeMutation.mutateAsync({
      symbol: preview.symbol,
      name: preview.name,
      action,
      shares: preview.shares,
      price: preview.price,
      total: +(preview.price * preview.shares).toFixed(2),
      status: 'executed',
    });
    toast.success(`${action.toUpperCase()} ${preview.shares} ${preview.symbol} executed at $${preview.price.toFixed(2)}`);
    setSymbol(''); setShares(''); setPreview(null);
    setExecuting(false);
  };

  const statusConfig = {
    executed: { icon: CheckCircle2, color: 'text-chart-3', bg: 'bg-chart-3/8' },
    pending:  { icon: Clock, color: 'text-primary', bg: 'bg-primary/8' },
    cancelled:{ icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/8' },
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-black text-white/95 tracking-tight mb-1">{t('paperTrading.title') || 'Paper Trading'}</h1>
        <p className="text-[11px] text-white/30 font-medium tracking-wide">{t('paperTrading.subtitle') || 'Simulate trades with virtual funds'}</p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Order Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden"
        >
          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="p-5">
            <h3 className="text-sm font-bold text-white/80 mb-4">{t('paperTrading.newOrder') || 'New Order'}</h3>

            {/* Buy / Sell */}
            <div className="grid grid-cols-2 gap-2 mb-5">
              <button
                onClick={() => { setAction('buy'); setPreview(null); }}
                className={`py-3 rounded-xl text-sm font-black tracking-wide transition-all ${
                  action === 'buy'
                    ? 'bg-chart-3 text-black glow-green'
                    : 'bg-white/[0.04] text-white/30 border border-white/[0.07] hover:border-white/10'
                }`}
              >
                {t('paperTrading.buy') || 'BUY'}
              </button>
              <button
                onClick={() => { setAction('sell'); setPreview(null); }}
                className={`py-3 rounded-xl text-sm font-black tracking-wide transition-all ${
                  action === 'sell'
                    ? 'bg-destructive text-white glow-red'
                    : 'bg-white/[0.04] text-white/30 border border-white/[0.07] hover:border-white/10'
                }`}
              >
                {t('paperTrading.sell') || 'SELL'}
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-white/30 font-semibold tracking-[0.1em] uppercase">{t('trek.signal') || 'Symbol'}</Label>
                <Input
                  value={symbol}
                  onChange={(e) => { setSymbol(e.target.value.toUpperCase()); setPreview(null); }}
                  placeholder="AAPL"
                  className="mt-1.5 bg-white/[0.04] border-white/[0.07] h-11 font-mono text-[16px] font-bold text-white/90 placeholder:text-white/15 focus:border-primary/40"
                />
              </div>
              <div>
                <Label className="text-[10px] text-white/30 font-semibold tracking-[0.1em] uppercase">Shares</Label>
                <Input
                  type="number"
                  value={shares}
                  onChange={(e) => { setShares(e.target.value); setPreview(null); }}
                  placeholder="100"
                  className="mt-1.5 bg-white/[0.04] border-white/[0.07] h-11 font-mono text-[16px] font-bold text-white/90 placeholder:text-white/15 focus:border-primary/40"
                />
              </div>
              <Button
                onClick={handlePreview}
                variant="outline"
                className="w-full h-10 bg-transparent border-white/[0.1] text-white/50 hover:bg-white/[0.04] hover:text-white/80 text-[12px] font-semibold mt-1"
              >
                Preview Order
              </Button>
            </div>

            {/* Preview */}
            {preview && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-white/[0.08] bg-white/[0.03] overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                  <span className="text-[10px] text-white/30 font-semibold uppercase tracking-[0.1em]">{t('paperTrading.newOrder') || 'New Order'} Preview</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider ${action === 'buy' ? 'text-chart-3 bg-chart-3/10' : 'text-destructive bg-destructive/10'}`}>
                    {action.toUpperCase()}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Symbol', value: preview.symbol },
                    { label: 'Shares', value: preview.shares },
                    { label: 'Est. Price', value: `$${preview.price.toFixed(2)}` },
                    { label: 'Total Value', value: `$${(preview.price * preview.shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-[9px] text-white/25 uppercase tracking-[0.1em] mb-0.5">{item.label}</div>
                      <div className="text-[13px] font-mono font-bold text-white/85">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="px-4 pb-4">
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10 mb-3">
                    <AlertTriangle className="h-3 w-3 text-primary/50 flex-shrink-0 mt-0.5" />
                    <p className="text-[9px] text-white/30 leading-relaxed">This is a paper trading simulation. No real funds are used.</p>
                  </div>
                  <Button
                    onClick={handleExecute}
                    disabled={executing}
                    className={`w-full h-10 font-black text-[12px] tracking-wide ${
                      action === 'buy'
                        ? 'bg-chart-3 hover:bg-chart-3/90 text-black'
                        : 'bg-destructive hover:bg-destructive/90 text-white'
                    }`}
                  >
                    {executing ? (t('common.loading') || 'Loading...') : `Execute ${action.toUpperCase()} ${t('paperTrading.newOrder') || 'Order'}`}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Trade History */}
        <div className="xl:col-span-3 rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.05]">
            <h3 className="text-sm font-bold text-white/80">{t('paperTrading.orderHistory') || 'Order History'}</h3>
          </div>

          {trades.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="h-10 w-10 text-white/8 mx-auto mb-3" />
              <p className="text-[12px] text-white/20">{t('common.loading')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {['Asset', 'Action', 'Shares', 'Price', 'Total', 'Status'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => {
                    const sc = statusConfig[trade.status] || statusConfig.executed;
                    const StatusIcon = sc.icon;
                    return (
                      <tr key={trade.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0">
                        <td className="px-5 py-3">
                          <div className="font-mono font-black text-[13px] text-white/85">{trade.symbol}</div>
                          <div className="text-[10px] text-white/25">{trade.name}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md ${
                            trade.action === 'buy' ? 'text-chart-3 bg-chart-3/8' : 'text-destructive bg-destructive/8'
                          }`}>
                            {trade.action === 'buy' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                            {trade.action.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-[12px] text-white/60">{trade.shares}</td>
                        <td className="px-5 py-3 font-mono text-[12px] text-white/60">${trade.price?.toFixed(2)}</td>
                        <td className="px-5 py-3 font-mono text-[12px] font-bold text-white/80">${trade.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-5 py-3">
                          <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-md ${sc.bg} ${sc.color}`}>
                            <StatusIcon className="h-3 w-3" />
                            {trade.status}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}