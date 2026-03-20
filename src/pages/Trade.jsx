import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import OrderForm from '@/components/broker/OrderForm';
import AccountOverview from '@/components/broker/AccountOverview';
import PositionsTable from '@/components/broker/PositionsTable';
import OrdersHistory from '@/components/broker/OrdersHistory';
import PaperTradeHistory from '@/components/broker/PaperTradeHistory';

export default function Trade() {
  const [isLive, setIsLive] = useState(false);
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const fetchAccount = useCallback(async () => {
    if (!isLive) return;
    setLoadingAccount(true);
    try {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'account' });
      if (res.data?.error) throw new Error(res.data.error);
      setAccount(res.data);
    } catch (e) {
      toast.error('Failed to load account: ' + e.message);
    }
    setLoadingAccount(false);
  }, [isLive]);

  const fetchPositions = useCallback(async () => {
    if (!isLive) return;
    setLoadingPositions(true);
    try {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'positions' });
      if (res.data?.error) throw new Error(res.data.error);
      setPositions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error('Failed to load positions: ' + e.message);
    }
    setLoadingPositions(false);
  }, [isLive]);

  const fetchOrders = useCallback(async () => {
    if (!isLive) return;
    setLoadingOrders(true);
    try {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'orders', status: 'all', limit: 50 });
      if (res.data?.error) throw new Error(res.data.error);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      toast.error('Failed to load orders: ' + e.message);
    }
    setLoadingOrders(false);
  }, [isLive]);

  const refreshAll = useCallback(() => {
    fetchAccount();
    fetchPositions();
    fetchOrders();
  }, [fetchAccount, fetchPositions, fetchOrders]);

  useEffect(() => {
    if (isLive) refreshAll();
    else { setAccount(null); setPositions([]); setOrders([]); }
  }, [isLive]);

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-4">

        {/* Header + Mode Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white/90 tracking-tight">Trade</h1>
            <p className="text-[11px] text-white/30 mt-0.5">
              {isLive ? 'Live brokerage via Alpaca' : 'Paper trading — simulated'}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
            {['Paper', 'Live'].map((mode) => {
              const active = (mode === 'Live') === isLive;
              return (
                <button
                  key={mode}
                  onClick={() => setIsLive(mode === 'Live')}
                  className={`px-4 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all ${
                    active
                      ? mode === 'Live'
                        ? 'bg-chart-3 text-black'
                        : 'bg-primary text-black'
                      : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {mode === 'Live' && active && <span className="inline-block h-1.5 w-1.5 rounded-full bg-black mr-1.5 live-pulse" />}
                  {mode}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live mode: account overview */}
        {isLive && account && (
          <AccountOverview account={account} onRefresh={fetchAccount} loading={loadingAccount} />
        )}

        {/* Loading skeleton for live account */}
        {isLive && !account && loadingAccount && (
          <div className="rounded-xl border border-chart-3/20 bg-chart-3/5 h-24 shimmer" />
        )}

        {/* Order Form */}
        <OrderForm isLive={isLive} onOrderSuccess={refreshAll} />

        {/* Live: Positions + Orders */}
        {isLive && (
          <>
            <PositionsTable positions={positions} onRefresh={fetchPositions} loading={loadingPositions} />
            <OrdersHistory orders={orders} onRefresh={fetchOrders} loading={loadingOrders} />
          </>
        )}

        {/* Paper: Trade History */}
        {!isLive && <PaperTradeHistory />}
      </div>
    </div>
  );
}