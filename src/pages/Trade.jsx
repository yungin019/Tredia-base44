import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getCurrentUser } from '@/api/userData';
import { toast } from 'sonner';
import OrderForm from '@/components/broker/OrderForm';
import AccountOverview from '@/components/broker/AccountOverview';
import PositionsTable from '@/components/broker/PositionsTable';
import OrdersHistory from '@/components/broker/OrdersHistory';
import PaperTradeHistory from '@/components/broker/PaperTradeHistory';
import PaperPortfolioPanel from '@/components/paper/PaperPortfolioPanel';

const readParam = (key, fallback = '') => {
  try {
    return new URLSearchParams(window.location.search).get(key) || fallback;
  } catch (_) {
    return fallback;
  }
};

export default function Trade() {
  const [mode, setMode] = useState(() => (readParam('tab') === 'live' ? 'live' : 'paper'));
  const [confirmLive, setConfirmLive] = useState(false);
  const [alpacaConnected, setAlpacaConnected] = useState(null);
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const isLive = mode === 'live';
  const initialSymbol = readParam('symbol').toUpperCase();

  useEffect(() => {
    getCurrentUser().then(u => {
      const connected = u?.alpaca_connected === true && !!u?.alpaca_access_token;
      setAlpacaConnected(connected);
      // Live was asked for but the broker isn't linked — stay on paper.
      if (!connected && mode === 'live') setMode('paper');
    }).catch(() => setAlpacaConnected(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAccount = useCallback(async () => {
    if (!isLive) return;
    setLoadingAccount(true);
    try {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'account', is_live: true });
      if (res.data?.error) throw new Error(res.data.error);
      setAccount(res.data?.data || res.data);
    } catch (e) {
      toast.error('Failed to load account: ' + e.message);
    }
    setLoadingAccount(false);
  }, [isLive]);

  const fetchPositions = useCallback(async () => {
    if (!isLive) return;
    setLoadingPositions(true);
    try {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'positions', is_live: true });
      if (res.data?.error) throw new Error(res.data.error);
      const d = res.data?.data ?? res.data;
      setPositions(Array.isArray(d) ? d : []);
    } catch (e) {
      toast.error('Failed to load positions: ' + e.message);
    }
    setLoadingPositions(false);
  }, [isLive]);

  const fetchOrders = useCallback(async () => {
    if (!isLive) return;
    setLoadingOrders(true);
    try {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'orders', is_live: true });
      if (res.data?.error) throw new Error(res.data.error);
      const d = res.data?.data ?? res.data;
      setOrders(Array.isArray(d) ? d : []);
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
    else {
      setAccount(null);
      setPositions([]);
      setOrders([]);
    }
  }, [isLive]);

  const requestMode = (next) => {
    if (next === mode) return;
    if (next === 'live') {
      if (!alpacaConnected) {
        toast.error('Connect your Alpaca account in Settings → Broker to enable live trading');
        return;
      }
      setConfirmLive(true);
      return;
    }
    setConfirmLive(false);
    setMode('paper');
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-xl font-black text-white/90 tracking-tight">Trade</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {isLive ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
                  <p className="text-[11px] text-chart-3 font-semibold">Live trading via Alpaca</p>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
                  <p className="text-[11px] text-white/30">Paper trading — simulated, no real money</p>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
              {[{ id: 'paper', label: 'Paper' }, { id: 'live', label: 'Live' }].map(m => {
                const active = mode === m.id;
                const disabled = m.id === 'live' && alpacaConnected === false;
                return (
                  <button
                    key={m.id}
                    onClick={() => requestMode(m.id)}
                    className={'px-4 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all ' + (active ? (m.id === 'live' ? 'bg-chart-3 text-black' : 'bg-primary text-black') : disabled ? 'text-white/15 cursor-not-allowed' : 'text-white/30 hover:text-white/60')}
                  >
                    {m.id === 'live' && active && <span className="inline-block h-1.5 w-1.5 rounded-full bg-black mr-1.5 live-pulse" />}
                    {m.label}
                  </button>
                );
              })}
            </div>
            {alpacaConnected === false && (
              <span className="text-[9px] text-white/20">Connect Alpaca in Settings to go live</span>
            )}
          </div>
        </div>

        {confirmLive && (
          <div className="rounded-xl border border-chart-3/25 bg-chart-3/[0.06] p-4">
            <p className="text-[12px] font-bold text-white/85">Live orders use real money in your Alpaca account.</p>
            <p className="text-[11px] text-white/40 mt-1">
              Orders are sent to Alpaca and fill at market prices. You can switch back to paper trading at any time.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setConfirmLive(false)}
                className="px-4 py-2 rounded-lg text-[11px] font-black border border-white/[0.1] text-white/50 hover:text-white/80 transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={() => { setMode('live'); setConfirmLive(false); }}
                className="px-4 py-2 rounded-lg text-[11px] font-black bg-chart-3 text-black hover:opacity-90 transition-opacity"
              >
                ENABLE LIVE TRADING
              </button>
            </div>
          </div>
        )}

        {isLive && account && (
          <AccountOverview account={account} onRefresh={fetchAccount} loading={loadingAccount} />
        )}

        {isLive && !account && loadingAccount && (
          <div className="rounded-xl border border-chart-3/20 bg-chart-3/5 h-24 shimmer" />
        )}

        <OrderForm isLive={isLive} initialSymbol={initialSymbol} onOrderSuccess={refreshAll} />

        {isLive ? (
          <>
            <PositionsTable positions={positions} onRefresh={fetchPositions} loading={loadingPositions} />
            <OrdersHistory orders={orders} onRefresh={fetchOrders} loading={loadingOrders} />
          </>
        ) : (
          <>
            <PaperPortfolioPanel />
            <PaperTradeHistory />
          </>
        )}
      </div>
    </div>
  );
}