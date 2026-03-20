import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import OrderForm from '../components/broker/OrderForm';
import AccountOverview from '../components/broker/AccountOverview';
import PositionsTable from '../components/broker/PositionsTable';
import OrdersHistory from '../components/broker/OrdersHistory';
import PaperTradeHistory from '../components/broker/PaperTradeHistory';

const LIVE_TABS = ['Positions', 'Orders'];

export default function Trade() {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState('paper');
  const [activeTab, setActiveTab] = useState('Positions');
  const isLive = mode === 'live';

  // Paper trades
  const { data: trades = [] } = useQuery({
    queryKey: ['trades'],
    queryFn: () => base44.entities.TradeLog.list('-created_date', 50),
  });

  // Alpaca account
  const { data: alpacaAccount, isFetching: accountLoading, refetch: refetchAccount } = useQuery({
    queryKey: ['alpacaAccount'],
    queryFn: async () => {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'account' });
      return res.data?.data;
    },
    enabled: isLive,
    retry: false,
    refetchInterval: 30000,
  });

  // Alpaca positions
  const { data: positions = [], isFetching: positionsLoading, refetch: refetchPositions } = useQuery({
    queryKey: ['alpacaPositions'],
    queryFn: async () => {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'positions' });
      return res.data?.data || [];
    },
    enabled: isLive,
    retry: false,
    refetchInterval: 15000,
  });

  // Alpaca orders
  const { data: orders = [], isFetching: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['alpacaOrders'],
    queryFn: async () => {
      const res = await base44.functions.invoke('alpacaAccount', { endpoint: 'orders' });
      return res.data?.data || [];
    },
    enabled: isLive,
    retry: false,
    refetchInterval: 10000,
  });

  const handleOrderSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['trades'] });
    queryClient.invalidateQueries({ queryKey: ['alpacaPositions'] });
    queryClient.invalidateQueries({ queryKey: ['alpacaAccount'] });
    queryClient.invalidateQueries({ queryKey: ['alpacaOrders'] });
  };

  const refetchAll = () => {
    refetchAccount();
    refetchPositions();
    refetchOrders();
  };

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-white/95 tracking-tight mb-1">Trade</h1>
          <p className="text-[11px] text-white/30 font-medium tracking-wide">
            {isLive ? 'Live Alpaca broker integration' : 'Simulate trades with virtual funds'}
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

      {/* Account Overview (live only) */}
      {isLive && (
        <AccountOverview
          account={alpacaAccount}
          onRefresh={refetchAll}
          loading={accountLoading}
        />
      )}

      {/* Main layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-5">
        {/* Order Form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="xl:col-span-2">
          <OrderForm isLive={isLive} onOrderSuccess={handleOrderSuccess} />
        </motion.div>

        {/* Right Panel */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="xl:col-span-3 space-y-5">
          {isLive ? (
            <>
              {/* Tab switcher */}
              <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
                {LIVE_TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
                      activeTab === tab ? 'bg-white/[0.08] text-white/85' : 'text-white/30 hover:text-white/55'
                    }`}
                  >
                    {tab}
                    {tab === 'Positions' && positions.length > 0 && (
                      <span className="ml-1.5 text-[9px] bg-chart-3/20 text-chart-3 px-1.5 py-0.5 rounded-full">{positions.length}</span>
                    )}
                    {tab === 'Orders' && orders.length > 0 && (
                      <span className="ml-1.5 text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{orders.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'Positions' && (
                <PositionsTable
                  positions={positions}
                  onRefresh={refetchPositions}
                  loading={positionsLoading}
                />
              )}
              {activeTab === 'Orders' && (
                <OrdersHistory
                  orders={orders}
                  onRefresh={refetchOrders}
                  loading={ordersLoading}
                />
              )}
            </>
          ) : (
            <PaperTradeHistory trades={trades} />
          )}
        </motion.div>
      </div>
    </div>
  );
}