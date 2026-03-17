import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getIndices, getAllStocks } from '../components/MarketData';
import IndexCards from '../components/dashboard/IndexCards';
import PortfolioSummary from '../components/dashboard/PortfolioSummary';
import TopMovers from '../components/dashboard/TopMovers';
import AISignalCard from '../components/dashboard/AISignalCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';
import CryptoLiveCards from '../components/dashboard/CryptoLiveCards';
import { fetchCryptoData, fetchFearGreed } from '../api/marketData';
import NewsFeed from '../components/dashboard/NewsFeed';

export default function Dashboard() {
  const { t } = useTranslation();
  const [indices, setIndices] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState(null);
  const [fearGreed, setFearGreed] = useState(null);

  useEffect(() => {
    const update = () => {
      setIndices(getIndices());
      setStocks(getAllStocks());
    };
    update();
    const interval = setInterval(update, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      const [c, fg] = await Promise.all([fetchCryptoData(), fetchFearGreed()]);
      if (c) setCrypto(c);
      if (fg) setFearGreed(fg);
    };
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-end justify-between pt-1">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-black text-white/95 tracking-tight">{t('dashboard.title')}</h1>
          </div>
          <p className="text-[11px] text-white/30 font-medium tracking-wide">
            {t('dashboard.subtitle')}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="text-xl font-mono font-bold text-primary/90">{timeStr}</div>
          <div className="text-[10px] font-mono text-white/25 tracking-widest mt-0.5">{dateStr}</div>
        </div>
      </motion.div>

      {/* Crypto + Fear & Greed */}
      <CryptoLiveCards crypto={crypto} fearGreed={fearGreed} />

      {/* Indices */}
      <IndexCards indices={indices} />

      {/* Portfolio Summary */}
      <PortfolioSummary />

      {/* Chart + Signals */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-3">
          <PerformanceChart />
        </div>
        <div className="xl:col-span-2">
          <AISignalCard />
        </div>
      </div>

      {/* Top Movers */}
      <TopMovers stocks={stocks} />

      {/* Live News Feed */}
      <NewsFeed />
    </div>
  );
}