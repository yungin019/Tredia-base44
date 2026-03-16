import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getIndices, getAllStocks } from '../components/MarketData';
import IndexCards from '../components/dashboard/IndexCards';
import PortfolioSummary from '../components/dashboard/PortfolioSummary';
import TopMovers from '../components/dashboard/TopMovers';
import AISignalCard from '../components/dashboard/AISignalCard';
import PerformanceChart from '../components/dashboard/PerformanceChart';

export default function Dashboard() {
  const [indices, setIndices] = useState([]);
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const update = () => {
      setIndices(getIndices());
      setStocks(getAllStocks());
    };
    update();
    const interval = setInterval(update, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="sm:ml-16 p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-xl font-bold">Market Overview</h1>
          <span className="text-[10px] font-mono text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-4">Real-time market intelligence powered by AI</p>
      </motion.div>

      <IndexCards indices={indices} />
      <PortfolioSummary />
      <PerformanceChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopMovers stocks={stocks} />
        <AISignalCard />
      </div>
    </div>
  );
}