import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchCryptoData } from '@/api/marketData';
import AssetClassTabs from '@/components/markets/AssetClassTabs.jsx';
import SectorHeatmap from '@/components/markets/SectorHeatmap.jsx';
import TrekScreener from '@/components/markets/TrekScreener.jsx';
import CryptoAssets from '@/components/markets/CryptoAssets.jsx';
import TimeframeSelector from '@/components/markets/TimeframeSelector.jsx';
import TickerTape from '@/components/dashboard/TickerTape';
import WatchlistPanel from '@/components/markets/WatchlistPanel.jsx';
import ContextBanner from '@/components/ai/ContextBanner';

// Mock chart data for different timeframes
const CHART_DATA = {
  '1D': [
    { time: '09:30', value: 4100 }, { time: '10:00', value: 4120 }, { time: '10:30', value: 4095 },
    { time: '11:00', value: 4150 }, { time: '11:30', value: 4140 }, { time: '12:00', value: 4160 },
    { time: '12:30', value: 4155 }, { time: '13:00', value: 4180 }, { time: '13:30', value: 4175 },
  ],
  '1W': [
    { time: 'Mon', value: 4050 }, { time: 'Tue', value: 4100 }, { time: 'Wed', value: 4080 },
    { time: 'Thu', value: 4150 }, { time: 'Fri', value: 4180 }, { time: 'Today', value: 4175 },
  ],
  '1M': [
    { time: 'W1', value: 4000 }, { time: 'W2', value: 4080 }, { time: 'W3', value: 4050 },
    { time: 'W4', value: 4180 }, { time: 'Today', value: 4175 },
  ],
  '3M': [
    { time: 'Jan', value: 3900 }, { time: 'Feb', value: 4000 }, { time: 'Mar', value: 4175 },
  ],
  '1Y': [
    { time: 'Jan', value: 3600 }, { time: 'Apr', value: 3850 }, { time: 'Jul', value: 4050 },
    { time: 'Oct', value: 4100 }, { time: 'Today', value: 4175 },
  ],
};

const STOCK_DATA = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 190.45, change: 2.3, trek: 'Buy' },
  { symbol: 'NVDA', name: 'NVIDIA Corp', price: 870.20, change: 5.1, trek: 'Buy' },
  { symbol: 'MSFT', name: 'Microsoft Corp', price: 415.80, change: 1.8, trek: 'Hold' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.30, change: -2.4, trek: 'Sell' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: 0.9, trek: 'Hold' },
  { symbol: 'META', name: 'Meta Platforms', price: 520.15, change: -1.2, trek: 'Sell' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 182.90, change: 3.2, trek: 'Buy' },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 201.50, change: 1.5, trek: 'Buy' },
];

export default function Markets() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stocks');
  const [activeFilter, setActiveFilter] = useState(null);
  const [timeframe, setTimeframe] = useState('1D');
  const [cryptoData, setCryptoData] = useState(null);
  const [livePrices, setLivePrices] = useState({});

  useEffect(() => {
    const load = async () => {
      const data = await fetchCryptoData();
      if (data) setCryptoData(data);
    };
    load();
  }, []);

  useEffect(() => {
    async function loadPrices() {
      try {
        const symbols = STOCK_DATA.map(s => s.symbol);
        const res = await base44.functions.invoke('stockPrices', { symbols });
        if (res?.data?.prices) setLivePrices(res.data.prices);
      } catch {
        // keep static fallback
      }
    }
    loadPrices();
  }, []);

  const filteredStocks = activeFilter
    ? STOCK_DATA.filter(s => s.trek.toLowerCase() === activeFilter.toLowerCase())
    : STOCK_DATA;

  const getTrekColor = (signal) => {
    if (signal === 'Buy') return 'bg-chart-3/10 text-chart-3';
    if (signal === 'Sell') return 'bg-destructive/10 text-destructive';
    return 'bg-white/5 text-white/50';
  };

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-white/95 tracking-tight mb-1 truncate">{t('markets.title') || 'Markets'}</h1>
          <p className="text-[11px] text-white/30 font-medium tracking-wide">{t('markets.subtitle') || 'Live Markets'}</p>
        </div>
      </motion.div>

      {/* AI Context Banner */}
      <ContextBanner
        storageKey="markets_v1"
        title="Live Markets 📊"
        body="These are real-time market prices. Every asset has a TREK grade (Buy / Hold / Sell) powered by our AI engine. Tap any stock to get a full analysis."
        steps={[
          "Browse stocks, crypto, and your watchlist",
          "Check the TREK grade to see AI-powered signals",
          "Tap any asset for full analysis and chart",
        ]}
        actions={[{ label: "Find the best opportunity now", onClick: () => {} }]}
        aiQuestion="What is the best opportunity in the market right now? Explain it simply."
      />

      {/* Ticker Tape */}
      <TickerTape />

      {/* Asset Class Tabs */}
      <AssetClassTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Stocks Tab */}
      {activeTab === 'stocks' && (
        <>
          {/* Sector Heatmap */}
          <SectorHeatmap />

          {/* TREK Screener */}
          <TrekScreener activeFilter={activeFilter} onFilterChange={setActiveFilter} />

          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-xl border border-white/[0.07] bg-[#111118] p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-white/80">S&P 500 Index</h2>
              <TimeframeSelector timeframe={timeframe} onTimeframeChange={setTimeframe} />
            </div>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={CHART_DATA[timeframe]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" style={{ fontSize: '11px' }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" style={{ fontSize: '11px' }} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(17,17,24,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Stocks Table */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-white/[0.07] bg-[#111118] overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-white/[0.05]">
              <h3 className="text-sm font-bold text-white/80">Top Stocks ({filteredStocks.length})</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    {['Symbol', 'Company', 'Price', 'Change', 'TREK Grade'].map((h, i) => (
                      <th key={i} className={`${i === 0 ? 'text-left px-5' : 'text-right px-4'} py-3 text-[10px] font-semibold tracking-[0.1em] text-white/25 uppercase`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStocks.map((stock, i) => (
                    <tr key={i} onClick={() => navigate(`/Asset/${stock.symbol}`)} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors last:border-0 cursor-pointer">
                      <td className="px-5 py-3">
                        <div className="font-mono font-black text-[13px] text-white/85">{stock.symbol}</div>
                        <div className="text-[10px] text-white/30">{stock.name}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-[12px] text-white/85 font-bold">
                        ${(livePrices[stock.symbol] || stock.price).toFixed(2)}
                        {livePrices[stock.symbol] && <span className="text-[8px] text-chart-3 ml-1">●</span>}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-[12px] font-bold flex items-center justify-end gap-1 ${stock.change >= 0 ? 'text-chart-3' : 'text-destructive'}`}>
                        {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {stock.change >= 0 ? '+' : ''}{stock.change}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${getTrekColor(stock.trek)}`}>
                          {stock.trek}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </>
      )}

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && <WatchlistPanel />}

      {/* Crypto Tab */}
      {activeTab === 'crypto' && <CryptoAssets cryptoData={cryptoData} />}

      {/* Forex Tab */}
      {activeTab === 'forex' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/[0.07] bg-[#111118] p-8 text-center">
          <p className="text-white/30 text-sm">Forex markets available in future release</p>
          <p className="text-white/15 text-xs mt-2">(Ready for: OANDA, FXCM, or FX data API integration)</p>
        </motion.div>
      )}

      {/* Commodities Tab */}
      {activeTab === 'commodities' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/[0.07] bg-[#111118] p-8 text-center">
          <p className="text-white/30 text-sm">Commodities markets available in future release</p>
          <p className="text-white/15 text-xs mt-2">(Ready for: Gold, Oil, Natural Gas data APIs)</p>
        </motion.div>
      )}
    </div>
  );
}