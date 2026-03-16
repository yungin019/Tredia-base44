import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftRight, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getStockPrice } from '../components/MarketData';

export default function Trade() {
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
    if (!symbol || !shares) {
      toast.error('Enter symbol and shares');
      return;
    }
    const stockData = getStockPrice(symbol.toUpperCase());
    if (!stockData) {
      setPreview({ symbol: symbol.toUpperCase(), name: symbol.toUpperCase(), price: (Math.random() * 200 + 50).toFixed(2) * 1, shares: parseFloat(shares) });
    } else {
      setPreview({ symbol: stockData.symbol, name: stockData.name, price: stockData.price, shares: parseFloat(shares) });
    }
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
      total: preview.price * preview.shares,
      status: 'executed',
    });
    toast.success(`${action.toUpperCase()} ${preview.shares} ${preview.symbol} @ $${preview.price.toFixed(2)}`);
    setSymbol('');
    setShares('');
    setPreview(null);
    setExecuting(false);
  };

  const statusIcons = {
    executed: <CheckCircle2 className="h-3.5 w-3.5 text-primary" />,
    pending: <Clock className="h-3.5 w-3.5 text-chart-4" />,
    cancelled: <XCircle className="h-3.5 w-3.5 text-destructive" />,
  };

  return (
    <div className="sm:ml-16 p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center gap-2 mb-1">
          <ArrowLeftRight className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Trade</h1>
        </div>
        <p className="text-xs text-muted-foreground">Execute trades quickly and efficiently</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/50 bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">New Order</h3>

          {/* Buy/Sell Toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setAction('buy')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                action === 'buy' ? 'bg-primary text-primary-foreground glow-green' : 'bg-secondary text-muted-foreground'
              }`}
            >
              BUY
            </button>
            <button
              onClick={() => setAction('sell')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                action === 'sell' ? 'bg-destructive text-destructive-foreground glow-red' : 'bg-secondary text-muted-foreground'
              }`}
            >
              SELL
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Symbol</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="AAPL"
                className="bg-secondary/50 border-border/50 h-10 mt-1 font-mono text-lg"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Shares</Label>
              <Input
                type="number"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                placeholder="100"
                className="bg-secondary/50 border-border/50 h-10 mt-1 font-mono text-lg"
              />
            </div>
            <Button onClick={handlePreview} variant="outline" className="w-full h-10">
              Preview Order
            </Button>
          </div>

          {/* Order Preview */}
          {preview && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 rounded-lg border border-border/50 bg-secondary/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground">Order Preview</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${action === 'buy' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                  {action.toUpperCase()}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-xs text-muted-foreground">Symbol</span><div className="font-mono font-bold">{preview.symbol}</div></div>
                <div><span className="text-xs text-muted-foreground">Shares</span><div className="font-mono font-bold">{preview.shares}</div></div>
                <div><span className="text-xs text-muted-foreground">Price</span><div className="font-mono font-bold">${preview.price.toFixed(2)}</div></div>
                <div><span className="text-xs text-muted-foreground">Total</span><div className="font-mono font-bold">${(preview.price * preview.shares).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div></div>
              </div>
              <Button
                onClick={handleExecute}
                disabled={executing}
                className={`w-full mt-4 h-10 font-semibold ${action === 'buy' ? 'bg-primary hover:bg-primary/90' : 'bg-destructive hover:bg-destructive/90'}`}
              >
                {executing ? 'Executing...' : `Execute ${action.toUpperCase()} Order`}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Trade History */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50">
            <h3 className="text-sm font-semibold">Recent Trades</h3>
          </div>
          {trades.length === 0 ? (
            <div className="p-8 text-center">
              <Clock className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No trades yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30 max-h-[500px] overflow-y-auto">
              {trades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between px-4 py-3 hover:bg-secondary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${trade.action === 'buy' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
                      {trade.action === 'buy' ? <ArrowUpRight className="h-4 w-4 text-primary" /> : <ArrowDownRight className="h-4 w-4 text-destructive" />}
                    </div>
                    <div>
                      <div className="text-sm font-mono font-semibold">{trade.symbol}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {trade.shares} shares @ ${trade.price?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono font-medium">${trade.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                    <div className="flex items-center gap-1 justify-end">
                      {statusIcons[trade.status]}
                      <span className="text-[10px] text-muted-foreground capitalize">{trade.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}