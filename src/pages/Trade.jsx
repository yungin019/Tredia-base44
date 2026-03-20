import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowLeftRight, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle, AlertTriangle, Zap, Wallet, TrendingUp } from 'lucide-react';
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
  const [mode, setMode] = useState('paper'); // 'paper' | 'live'
  const [action, setAction] = useState('buy');
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [preview, setPreview] = useState(null);
  const [executing, setExecuting] = useState(false);

  // Paper trade log
  const { data: trades = [] } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.TradeLog.list('-created_date', 20),
  });

  // Alpaca account info
  const { data: alpacaAccount } = useQuery({
    queryKey: ['alpacaAccount'],
    queryFn: async () => {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'account' });
      return res.data?.data;
    },
    enabled: mode === 'live',
    retry: false,
  });

  // Alpaca positions
  const { data: alpacaPositions = [] } = useQuery({
    queryKey: ['alpacaPositions'],
    queryFn: async () => {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'positions' });
      return res.data?.data || [];
    },
    enabled: mode === 'live',
    retry: false,
  });

  const tradeMutation = useMutation({
    mutationFn: (data) => base44.entities.TradeLog.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trades'] }),
  });

  const handlePreview = () => {
    if (!symbol || !shares) { toast.error('Enter symbol and shares'); return; }
    const stockData = getStockPrice(symbol.toUpperCase());
    const price = stockData ? stockData.price : +(Math.random() * 200 + 50).toFixed(2);
    const name = stockData ? stockData.name : symbol.toUpperCase();
    setPreview({ symbol: symbol.toUpperCase(), name, price, shares: parseFloat(shares) });
  };

  const handleExecute = async () => {
    if (!preview) return;
    setExecuting(true);
    try {
      if (mode === 'live') {
        // Submit real order to Alpaca
        const res = await base44.functions.invoke('alpacaTrade', {
          action,
          symbol: preview.symbol,
          qty: preview.shares,
          order_type: 'market',
          time_in_force: 'gtc',
        });
        if (res.data?.error) throw new Error(res.data.error);
        toast.success(`🚀 LIVE ORDER: ${action.toUpperCase()} ${preview.shares} ${preview.symbol} submitted to Alpaca`);
        queryClient.invalidateQueries({ queryKey: ['alpacaPositions'] });
        queryClient.invalidateQueries({ queryKey: ['alpacaAccount'] });
      } else {
        // Paper trade
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
      }
      setSymbol(''); setShares(''); setPreview(null);
    } catch (err) {
      toast.error(err.message || 'Order failed');
    }
    setExecuting(false);
  };

  const statusConfig = {
    executed: { icon: CheckCircle2, color: 'text-chart-3', bg: 'bg-chart-3/8' },
    pending:  { icon: Clock, color: 'text-primary', bg: 'bg-primary/8' },
    cancelled:{ icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/8' },
  };

  const isLive = mode === 'live';

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white/95 tracking-tight mb-1">Trade</h1>
          <p className="text-[11px] text-white/30 font-medium tracking-wide">
            {isLive ? 'Live Alpaca orders' : 'Simulate trades with virtual funds'}
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-white/[0.04] border border-white/[0.08] rounded-xl p-1">
          <button
            onClick={() => setMode('paper')}
            className={`px-4 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all ${
              !isLive ? 'bg-primary text-black' : 'text-white/30 hover:text-white/60'
            }`}
          >
            PAPER
          </button>
          <button
            onClick={() => setMode('live')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all ${
              isLive ? 'bg-chart-3 text-black' : 'text-white/30 hover:text-white/60'
            }`}
          >
            <Zap className="h-3 w-3" />
            LIVE
          </button>
        </div>
      </motion.div>

      {/* Alpaca Account Bar */}
      {isLive && alpacaAccount && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-chart-3/20 bg-chart-3/5 p-4 flex flex-wrap items-center gap-6"
        >
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-chart-3" />
            <div>
              <div className="text-[9px] text-white/30 uppercase tracking-[0.1em]">Buying Power</div>
              <div className="text-[14px] font-mono font-black text-white/90">${parseFloat(alpacaAccount.buying_power || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-[0.1em]">Portfolio Value</div>
            <div className="text-[14px] font-mono font-black text-white/90">${parseFloat(alpacaAccount.portfolio_value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-[0.1em]">Cash</div>
            <div className="text-[14px] font-mono font-black text-white/90">${parseFloat(alpacaAccount.cash || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-[0.1em]">Status</div>
            <div className={`text-[12px] font-bold capitalize ${alpacaAccount.status === 'ACTIVE' ? 'text-chart-3' : 'text-primary'}`}>{alpacaAccount.status}</div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Order Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="xl:col-span-2 rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden"
          style={isLive ? { borderColor: 'rgba(34,197,94,0.15)' } : {}}
        >
          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white/80">New Order</h3>
              {isLive && (
                <span className="flex items-center gap-1 text-[9px] font-black text-chart-3 bg-chart-3/10 border border-chart-3/20 px-2 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
                  LIVE ALPACA
                </span>
              )}
            </div>

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
                BUY
              </button>
              <button
                onClick={() => { setAction('sell'); setPreview(null); }}
                className={`py-3 rounded-xl text-sm font-black tracking-wide transition-all ${
                  action === 'sell'
                    ? 'bg-destructive text-white glow-red'
                    : 'bg-white/[0.04] text-white/30 border border-white/[0.07] hover:border-white/10'
                }`}
              >
                SELL
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-[10px] text-white/30 font-semibold tracking-[0.1em] uppercase">Symbol</Label>
                <Input
                  value={symbol}
                  onChange={(e) => { setSymbol(e.target.value.toUpperCase()); setPreview(null); }}
                  placeholder="AAPL"
                  className="mt-1.5 bg-white/[0.04] border-white/[0.07] h-11 font-mono text-[16px] font-bold text-white/90 placeholder:text-white/15 focus:border-primary/40"
                />
              </div>
              <div>
                <Label className="text-[10px] text-white/30 font-semibold tracking-[0.1em] uppercase">Shares / Qty</Label>
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
                  <span className="text-[10px] text-white/30 font-semibold uppercase tracking-[0.1em]">Order Preview</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wider ${action === 'buy' ? 'text-chart-3 bg-chart-3/10' : 'text-destructive bg-destructive/10'}`}>
                    {action.toUpperCase()}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  {[
                    { label: 'Symbol', value: preview.symbol },
                    { label: 'Shares', value: preview.shares },
                    { label: isLive ? 'Type' : 'Est. Price', value: isLive ? 'Market Order' : `$${preview.price.toFixed(2)}` },
                    { label: isLive ? 'TIF' : 'Est. Total', value: isLive ? 'GTC' : `$${(preview.price * preview.shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="text-[9px] text-white/25 uppercase tracking-[0.1em] mb-0.5">{item.label}</div>
                      <div className="text-[13px] font-mono font-bold text-white/85">{item.value}</div>
                    </div>
                  ))}
                </div>

                <div className="px-4 pb-4">
                  {isLive ? (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-chart-3/5 border border-chart-3/15 mb-3">
                      <Zap className="h-3 w-3 text-chart-3/60 flex-shrink-0 mt-0.5" />
                      <p className="text-[9px] text-white/40 leading-relaxed">This is a REAL order that will be submitted to Alpaca. Make sure you have sufficient funds.</p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-primary/5 border border-primary/10 mb-3">
                      <AlertTriangle className="h-3 w-3 text-primary/50 flex-shrink-0 mt-0.5" />
                      <p className="text-[9px] text-white/30 leading-relaxed">Paper trade simulation only. No real money involved.</p>
                    </div>
                  )}
                  <Button
                    onClick={handleExecute}
                    disabled={executing}
                    className={`w-full h-10 font-black text-[12px] tracking-wide ${
                      action === 'buy'
                        ? 'bg-chart-3 hover:bg-chart-3/90 text-black'
                        : 'bg-destructive hover:bg-destructive/90 text-white'
                    }`}
                  >
                    {executing ? 'Submitting...' : `${isLive ? '🚀 SUBMIT' : 'EXECUTE'} ${action.toUpperCase()}`}
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Right Panel */}
        <div className="xl:col-span-3 space-y-5">
          {/* Alpaca Positions */}
          {isLive && alpacaPositions.length > 0 && (
            <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.05] flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-chart-3" />
                <h3 className="text-sm font-bold text-white/80">Open Positions</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      {['Symbol', 'Qty', 'Avg Entry', 'Current', 'P&L', 'P&L %'].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {alpacaPositions.map((pos) => {
                      const pl = parseFloat(pos.unrealized_pl || 0);
                      const plPct = parseFloat(pos.unrealized_plpc || 0) * 100;
                      const isPos = pl >= 0;
                      return (
                        <tr key={pos.symbol} className="border-b border-white/[0.04] hover:bg-white/[0.02] last:border-0">
                          <td className="px-4 py-3">
                            <div className="font-mono font-black text-[13px] text-white/85">{pos.symbol}</div>
                          </td>
                          <td className="px-4 py-3 font-mono text-[12px] text-white/60">{pos.qty}</td>
                          <td className="px-4 py-3 font-mono text-[12px] text-white/60">${parseFloat(pos.avg_entry_price).toFixed(2)}</td>
                          <td className="px-4 py-3 font-mono text-[12px] text-white/60">${parseFloat(pos.current_price).toFixed(2)}</td>
                          <td className={`px-4 py-3 font-mono text-[12px] font-bold ${isPos ? 'text-chart-3' : 'text-destructive'}`}>
                            {isPos ? '+' : ''}${pl.toFixed(2)}
                          </td>
                          <td className={`px-4 py-3 font-mono text-[12px] font-bold ${isPos ? 'text-chart-3' : 'text-destructive'}`}>
                            {isPos ? '+' : ''}{plPct.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trade History (paper) or no-positions message */}
          {!isLive && (
            <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.05]">
                <h3 className="text-sm font-bold text-white/80">Paper Order History</h3>
              </div>

              {trades.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="h-10 w-10 text-white/8 mx-auto mb-3" />
                  <p className="text-[12px] text-white/20">No paper trades yet</p>
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
          )}

          {isLive && alpacaPositions.length === 0 && (
            <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-12 text-center">
              <TrendingUp className="h-10 w-10 text-white/8 mx-auto mb-3" />
              <p className="text-[12px] text-white/20">No open positions in your Alpaca account</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}