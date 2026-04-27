import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useTranslation } from 'react-i18next';
import { fetchCryptoData } from '@/api/marketData';
import AssetClassTabs from '@/components/markets/AssetClassTabs.jsx';
import SectorHeatmap from '@/components/markets/SectorHeatmap.jsx';
import TrekScreener from '@/components/markets/TrekScreener.jsx';
import CryptoAssets from '@/components/markets/CryptoAssets.jsx';
import CommoditiesTab from '@/components/markets/CommoditiesTab.jsx';
import CoreAssetDisplay from '@/components/markets/CoreAssetDisplay.jsx';
import TrekSignalsPreview from '@/components/markets/TrekSignalsPreview.jsx';
import TickerTape from '@/components/dashboard/TickerTape';
import IndexCardsSection from '@/components/markets/IndexCardsSection';
import WatchlistPanel from '@/components/markets/WatchlistPanel.jsx';
import PullToRefresh from '@/components/ui/PullToRefresh';
import DiscoverySection, { POPULAR_STOCKS, POPULAR_CRYPTO, MAJOR_ETFS, COMMODITIES_SNAPSHOT } from '@/components/markets/DiscoverySection.jsx';
import SPYSection from '@/components/markets/SPYSection.jsx';

export default function Markets() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stocks');
  const [cryptoData, setCryptoData] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchCryptoData();
      if (data) setCryptoData(data);
    };
    load();
  }, []);



  return (
    <PullToRefresh onRefresh={async () => {
      const data = await fetchCryptoData();
      if (data) setCryptoData(data);
    }}>
      <div className="min-h-screen p-5 space-y-6 max-w-[1600px] mx-auto app-bg">
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <h1 className="text-2xl font-black text-white/95 tracking-tight mb-1 truncate">{t('markets.title', 'Markets')}</h1>
          <p className="text-[11px] text-white/30 font-medium tracking-wide">{t('markets.subtitle', 'Core assets + search 200+ universe')}</p>
        </div>
      </motion.div>

      {/* S&P 500 Core Section — renders only if live data exists */}
      <SPYSection />

      {/* Index Cards */}
      <IndexCardsSection />

      {/* Ticker Tape */}
      <TickerTape />

      {/* Asset Class Tabs */}
      <AssetClassTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Stocks Tab */}
      {activeTab === 'stocks' && (
        <>
          {/* TREK Signals Section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <TrekSignalsPreview />
          </motion.div>

          {/* Core Assets — Live section */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: 'rgb(14,200,220)' }} />
              <h2 className="text-sm font-bold text-white/85">{t('markets.coreAssets', 'Core Assets')}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full ml-1" style={{ background: 'rgba(14,200,220,0.1)', color: 'rgb(100,220,240)', border: '1px solid rgba(14,200,220,0.2)' }}>
                LIVE
              </span>
              <span className="text-[10px] text-white/25 ml-auto">{t('markets.refreshes60s', 'Refreshes every 60s')}</span>
            </div>
            <CoreAssetDisplay />
          </motion.div>

          {/* Discovery Sections — metadata only, no backend calls */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            {/* Explore header */}
            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/[0.05]">
              <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
              <h2 className="text-sm font-bold text-white/50">{t('markets.exploreMore', 'Explore More Assets')}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-white/30 border border-white/[0.08] ml-1">
                DISCOVER
              </span>
              <span className="text-[10px] text-white/20 ml-auto">{t('markets.tapForQuote', 'Tap any card for live quote')}</span>
            </div>

            <div className="space-y-6">
              <DiscoverySection title={t('markets.popularStocks', 'Popular Stocks')} items={POPULAR_STOCKS} />
              <DiscoverySection title={t('markets.popularCrypto', 'Popular Crypto')} items={POPULAR_CRYPTO} />
              <DiscoverySection title={t('markets.majorETFs', 'Major ETFs')} items={MAJOR_ETFS} />
              <DiscoverySection title={t('markets.commoditiesSnapshot', 'Commodities Snapshot')} items={COMMODITIES_SNAPSHOT} />
            </div>
          </motion.div>

          {/* Sector Heatmap */}
          <SectorHeatmap />


        </>
      )}

      {/* Watchlist Tab */}
      {activeTab === 'watchlist' && <WatchlistPanel />}

      {/* Crypto Tab */}
      {activeTab === 'crypto' && <CryptoAssets cryptoData={cryptoData} />}

      {/* Forex Tab */}
      {activeTab === 'forex' && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl p-8 text-center" style={{ background: 'rgba(8,16,36,0.55)', border: '1px solid rgba(100,220,255,0.09)' }}>
          <p className="text-white/30 text-sm">{t('markets.forexComingSoon', 'Forex coming soon')}</p>
          <p className="text-white/15 text-xs mt-2">{t('markets.forexAPIs', 'Connecting live Forex APIs')}</p>
        </motion.div>
      )}

      {/* Commodities Tab */}
      {activeTab === 'commodities' && <CommoditiesTab />}
      </div>
    </PullToRefresh>
  );
}