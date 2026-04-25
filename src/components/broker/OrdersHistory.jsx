import React from 'react';
import { Clock, CheckCircle2, XCircle, AlertCircle, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const STATUS_CONFIG = {
  filled:       { icon: CheckCircle2, color: 'text-chart-3',     bg: 'bg-chart-3/10' },
  partially_filled: { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10' },
  new:          { icon: Clock,         color: 'text-primary',     bg: 'bg-primary/10' },
  pending_new:  { icon: Clock,         color: 'text-primary',     bg: 'bg-primary/10' },
  accepted:     { icon: Clock,         color: 'text-primary',     bg: 'bg-primary/10' },
  open:         { icon: Clock,         color: 'text-primary',     bg: 'bg-primary/10' },
  canceled:     { icon: XCircle,       color: 'text-white/30',    bg: 'bg-white/5' },
  expired:      { icon: XCircle,       color: 'text-white/30',    bg: 'bg-white/5' },
  rejected:     { icon: AlertCircle,   color: 'text-destructive', bg: 'bg-destructive/10' },
};

const cancellable = ['new', 'pending_new', 'accepted', 'open', 'partially_filled'];

export default function OrdersHistory({ orders, onRefresh, loading }) {
  const handleCancel = async (orderId) => {
    try {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'cancel_order', order_id: orderId, is_live: true });
      if (res.data?.success) {
        toast.success('Order cancelled');
        onRefresh?.();
      } else {
        toast.error(res.data?.error || 'Cancel failed');
      }
    } catch (e) {
      toast.error(e.message);
    }
  };

  const fmt = (v, d = 2) => v != null ? parseFloat(v).toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d }) : '—';

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-white/80">Order History</h3>
          <span className="text-[10px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">{(Array.isArray(orders) ? orders : []).length}</span>
        </div>
        <button onClick={onRefresh} disabled={loading} className="text-white/20 hover:text-white/50 transition-colors">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {(!Array.isArray(orders) || orders.length === 0) ? (
        <div className="p-12 text-center">
          <Clock className="h-10 w-10 text-white/8 mx-auto mb-3" />
          <p className="text-[12px] text-white/20">No orders yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {['Symbol', 'Side', 'Type', 'Qty', 'Filled', 'Limit', 'Stop', 'TIF', 'Status', 'Time', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[9px] font-semibold tracking-[0.1em] text-white/25 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(orders) ? orders : []).map((o) => {
                const sc = STATUS_CONFIG[o.status] || STATUS_CONFIG.new;
                const Icon = sc.icon;
                const canCancel = cancellable.includes(o.status);
                const createdAt = o.created_at ? new Date(o.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
                return (
                  <tr key={o.id} className="border-b border-white/[0.04] hover:bg-white/[0.015] last:border-0 transition-colors">
                    <td className="px-4 py-3 font-mono font-black text-[13px] text-white/90">{o.symbol}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${o.side === 'buy' ? 'text-chart-3 bg-chart-3/10' : 'text-destructive bg-destructive/10'}`}>
                        {o.side?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[10px] font-mono text-white/50">{o.type?.replace('_', ' ').toUpperCase()}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-white/65">{o.qty}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-white/65">{o.filled_qty || '0'}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-white/50">{o.limit_price ? `$${fmt(o.limit_price)}` : '—'}</td>
                    <td className="px-4 py-3 font-mono text-[12px] text-white/50">{o.stop_price ? `$${fmt(o.stop_price)}` : '—'}</td>
                    <td className="px-4 py-3 text-[10px] font-mono text-white/40">{o.time_in_force?.toUpperCase()}</td>
                    <td className="px-4 py-3">
                      <div className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${sc.bg} ${sc.color}`}>
                        <Icon className="h-2.5 w-2.5" />
                        {o.status?.replace('_', ' ')}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[10px] text-white/30 whitespace-nowrap">{createdAt}</td>
                    <td className="px-4 py-3">
                      {canCancel && (
                        <button
                          onClick={() => handleCancel(o.id)}
                          className="text-white/20 hover:text-destructive/80 transition-colors"
                          title="Cancel order"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}