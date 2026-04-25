import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import OrderForm from '@/components/broker/OrderForm';
import AccountOverview from '@/components/broker/AccountOverview';
import PositionsTable from '@/components/broker/PositionsTable';
import OrdersHistory from '@/components/broker/OrdersHistory';
import PaperTradeHistory from '@/components/broker/PaperTradeHistory';

const TREK_GRADES = ['A', 'B+', 'B', 'C'];
const TREK_QUOTES = [
  "Markets reward patience and punish panic. — TREK",
  "The best trade is the one you understand. — TREK",
  "Risk management is the foundation of every great trade. — TREK",
  "Entry quality determines exit freedom. — TREK",
  "Never risk more than you can afford to learn from. — TREK",
];

function TrekPreTradeModal({ orderData, analysis, loading, onExecute, onCancel }) {
  const grade = analysis?.grade || TREK_GRADES[Math.floor(Math.random() * TREK_GRADES.length)];
  const entryQuality = analysis?.entryQuality || 'Moderate — wait for confirmation';
  const targetPrice = analysis?.targetPrice || (orderData?.marketPrice ? (orderData.marketPrice * 1.12).toFixed(2) : '—');
  const stopLoss = analysis?.stopLoss || (orderData?.marketPrice ? (orderData.marketPrice * 0.95).toFixed(2) : '—');
  const riskReward = analysis?.riskReward || '2.4 : 1';
  const quote = analysis?.quote || TREK_QUOTES[Math.floor(Math.random() * TREK_QUOTES.length)];
  const totalCost = orderData?.marketPrice
    ? (orderData.marketPrice * orderData.qty).toFixed(2)
    : orderData?.limitPrice
    ? (parseFloat(orderData.limitPrice) * orderData.qty).toFixed(2)
    : '—';

  const gradeColor = {
    'A': '#22c55e',
    'B+': '#86efac',
    'B': '#F59E0B',
    'C': '#ef4444',
  }[grade] || '#F59E0B';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        className="w-full max-w-sm rounded-2xl border border-white/[0.09] overflow-hidden"
        style={{ background: '#0E0E17' }}
      >
        <div className="px-5 pt-5 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">TREK Pre-Trade Analysis</span>
            {loading ? (
              <span className="text-[9px] text-white/30 animate-pulse">Analyzing...</span>
            ) : (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full border" style={{ color: gradeColor, borderColor: gradeColor + '44', background: gradeColor + '14' }}>
                {grade}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white/95 font-mono">{orderData?.symbol}</span>
            <span className="text-sm text-white/40">{orderData?.qty} shares</span>
            <span className="ml-auto text-lg font-black font-mono" style={{ color: '#F59E0B' }}>
              {totalCost !== '—' ? '$' + totalCost : '—'}
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="h-8 rounded-lg bg-white/[0.04] shimmer" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="text-[9px] text-white/30 uppercase tracking-[0.1em] mb-1">Entry Quality</div>
                  <div className="text-[11px] font-bold text-white/80 leading-tight">{entryQuality}</div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="text-[9px] text-white/30 uppercase tracking-[0.1em] mb-1">Risk / Reward</div>
                  <div className="text-[13px] font-black text-white/90 font-mono">{riskReward}</div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="text-[9px] text-white/30 uppercase tracking-[0.1em] mb-1">Target Price</div>
                  <div className="text-[13px] font-black font-mono" style={{ color: '#22c55e' }}>${targetPrice}</div>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="text-[9px] text-white/30 uppercase tracking-[0.1em] mb-1">Stop Loss</div>
                  <div className="text-[13px] font-black font-mono" style={{ color: '#ef4444' }}>${stopLoss}</div>
                </div>
              </div>
              <div className="rounded-xl p-3 mt-1" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
                <p className="text-[10px] italic text-white/50 leading-relaxed text-center">"{quote}"</p>
              </div>
            </>
          )}
        </div>

        <div className="px-5 pb-5 grid grid-cols-2 gap-2">
          <button
            onClick={onCancel}
            className="py-3 rounded-xl font-black text-[11px] tracking-wide border border-white/[0.1] text-white/50 hover:border-white/20 hover:text-white/70 transition-colors"
          >
            CANCEL
          </button>
          <button
            onClick={onExecute}
            disabled={loading}
            className="py-3 rounded-xl font-black text-[11px] tracking-wide transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#0A0A0F' }}
          >
            {loading ? 'ANALYZING...' : 'EXECUTE TRADE'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Trade() {
  const [isLive, setIsLive] = useState(false);
  const [alpacaConnected, setAlpacaConnected] = useState(false);
  const [account, setAccount] = useState(null);
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  const [trekModal, setTrekModal] = useState(null);
  const [trekAnalysis, setTrekAnalysis] = useState(null);
  const [trekLoading, setTrekLoading] = useState(false);

  // Check if user has Alpaca connected
  useEffect(() => {
    base44.auth.me().then(u => {
      const connected = u?.alpaca_connected === true && !!u?.alpaca_access_token;
      setAlpacaConnected(connected);
      // Auto-switch to live if connected
      if (connected) setIsLive(true);
    }).catch(() => {});
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

  const handleBeforeExecute = useCallback(async (orderData, executeCallback) => {
    setTrekAnalysis(null);
    setTrekLoading(true);
    setTrekModal({ orderData, executeCallback });
    try {
      const res = await base44.functions.invoke('trekChat', {
        message: 'Pre-trade analysis for ' + orderData.qty + ' shares of ' + orderData.symbol + ' at ' + (orderData.marketPrice ? '$' + orderData.marketPrice : 'market price') + '. Provide grade (A/B+/B/C), entry quality, target price, stop loss, risk/reward ratio, and a brief motivational quote.',
        symbol: orderData.symbol,
        shares: orderData.qty,
        price: orderData.marketPrice || orderData.limitPrice,
      });
      if (res?.data && !res.data.error) {
        setTrekAnalysis(res.data);
      }
    } catch (e) {
      // Analysis failed gracefully
    }
    setTrekLoading(false);
  }, []);

  const handleTrekExecute = useCallback(async () => {
    if (!trekModal) return;
    const { executeCallback } = trekModal;
    setTrekModal(null);
    setTrekAnalysis(null);
    await executeCallback();
  }, [trekModal]);

  const handleTrekCancel = useCallback(() => {
    setTrekModal(null);
    setTrekAnalysis(null);
    setTrekLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <AnimatePresence>
        {trekModal && (
          <TrekPreTradeModal
            orderData={trekModal.orderData}
            analysis={trekAnalysis}
            loading={trekLoading}
            onExecute={handleTrekExecute}
            onCancel={handleTrekCancel}
          />
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-white/90 tracking-tight">Trade</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {isLive ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-chart-3 live-pulse" />
                  <p className="text-[11px] text-chart-3 font-semibold">Live Trading via Alpaca</p>
                </>
              ) : (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
                  <p className="text-[11px] text-white/30">Paper Trading — simulated, no real money</p>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] rounded-xl p-1">
              {['Paper', 'Live'].map((mode) => {
                const active = (mode === 'Live') === isLive;
                const disabled = mode === 'Live' && !alpacaConnected;
                return (
                  <button
                    key={mode}
                    onClick={() => {
                      if (disabled) {
                        toast.error('Connect your Alpaca account in Settings → Broker to enable live trading');
                        return;
                      }
                      setIsLive(mode === 'Live');
                    }}
                    className={'px-4 py-1.5 rounded-lg text-[11px] font-black tracking-wide transition-all ' + (active ? (mode === 'Live' ? 'bg-chart-3 text-black' : 'bg-primary text-black') : disabled ? 'text-white/15 cursor-not-allowed' : 'text-white/30 hover:text-white/60')}
                  >
                    {mode === 'Live' && active && <span className="inline-block h-1.5 w-1.5 rounded-full bg-black mr-1.5 live-pulse" />}
                    {mode}
                  </button>
                );
              })}
            </div>
            {!alpacaConnected && (
              <span className="text-[9px] text-white/20">Connect Alpaca in Settings to go live</span>
            )}
          </div>
        </div>

        {isLive && account && (
          <AccountOverview account={account} onRefresh={fetchAccount} loading={loadingAccount} />
        )}

        {isLive && !account && loadingAccount && (
          <div className="rounded-xl border border-chart-3/20 bg-chart-3/5 h-24 shimmer" />
        )}

        <OrderForm isLive={isLive} onOrderSuccess={refreshAll} onBeforeExecute={handleBeforeExecute} />

        {isLive && (
          <>
            <PositionsTable positions={positions} onRefresh={fetchPositions} loading={loadingPositions} />
            <OrdersHistory orders={orders} onRefresh={fetchOrders} loading={loadingOrders} />
          </>
        )}

        {!isLive && <PaperTradeHistory />}

      </div>
    </div>
  );
}