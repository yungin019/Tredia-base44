import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const STATUS_CONFIG = {
  executed:  { icon: CheckCircle2, color: 'text-chart-3',     bg: 'bg-chart-3/8' },
  pending:   { icon: Clock,        color: 'text-primary',     bg: 'bg-primary/8' },
  cancelled: { icon: XCircle,      color: 'text-destructive', bg: 'bg-destructive/8' },
};

export default function PaperTradeHistory() {
  const { t } = useTranslation();
  const { data: trades = [] } = useQuery({
    queryKey: ['tradelog'],
    queryFn: () => base44.entities.TradeLog.list('-created_date', 50),
  });

  const safePrice = (v) => (v == null || isNaN(v)) ? '—' : `$${Number(v).toFixed(2)}`;
  const safeTotal = (v) => (v == null || isNaN(v)) ? '—' : `$${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const HEADERS = [
    t('trade.asset', 'Asset'),
    t('trade.action', 'Action'),
    t('trade.shares', 'Shares'),
    t('trade.price', 'Price'),
    t('trade.total', 'Total'),
    t('common.status', 'Status'),
  ];

  const STATUS_LABELS = {
    executed: t('trade.statusExecuted', 'Executed'),
    pending: t('trade.statusPending', 'Pending'),
    cancelled: t('trade.statusCancelled', 'Cancelled'),
  };

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden">
      <div className="px-5 py-3.5 border-b border-white/[0.05] flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold text-white/80">{t('paperTrading.orderHistory', 'Paper Order History')}</h3>
        <span className="text-[10px] text-white/25 bg-white/[0.04] px-2 py-0.5 rounded-full">{(Array.isArray(trades) ? trades : []).length}</span>
      </div>

      {(!Array.isArray(trades) || trades.length === 0) ? (
        <div className="p-12 text-center">
          <Clock className="h-10 w-10 text-white/8 mx-auto mb-3" />
          <p className="text-[12px] text-white/20">{t('empty.orderHistory', 'No trades yet')}</p>
          <p className="text-[10px] text-white/15 mt-1">{t('empty.orderHistoryCta', 'Make your first paper trade above')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.05]">
                {HEADERS.map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[9px] font-semibold tracking-[0.1em] text-white/25 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(trades) ? trades : []).map((trade) => {
                const sc = STATUS_CONFIG[trade.status] || STATUS_CONFIG.executed;
                const Icon = sc.icon;
                return (
                  <tr key={trade.id} className="border-b border-white/[0.04] hover:bg-white/[0.015] last:border-0 transition-colors">
                    <td className="px-5 py-3">
                      <div className="font-mono font-black text-[13px] text-white/90">{trade.symbol || '—'}</div>
                      <div className="text-[9px] text-white/25">{trade.name || ''}</div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-md ${trade.action === 'buy' ? 'text-chart-3 bg-chart-3/8' : 'text-destructive bg-destructive/8'}`}>
                        {trade.action === 'buy' ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {trade.action?.toUpperCase() || '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-mono text-[12px] text-white/65">{trade.shares ?? '—'}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-white/65">{safePrice(trade.price)}</td>
                    <td className="px-5 py-3 font-mono text-[12px] font-bold text-white/85">{safeTotal(trade.total)}</td>
                    <td className="px-5 py-3">
                      <div className={`inline-flex items-center gap-1.5 text-[9px] font-semibold px-2 py-1 rounded-md ${sc.bg} ${sc.color}`}>
                        <Icon className="h-2.5 w-2.5" />
                        {STATUS_LABELS[trade.status] || trade.status || '—'}
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
  );
}