import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getAllStocks } from '../components/MarketData';
import StockTable from '../components/markets/StockTable';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SECTORS = ['All', 'Technology', 'Financial', 'Healthcare', 'Energy', 'Consumer Cyclical', 'Consumer Defensive', 'Automotive'];

export default function Markets() {
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');

  useEffect(() => {
    const update = () => setStocks(getAllStocks());
    update();
    const interval = setInterval(update, 8000);
    return () => clearInterval(interval);
  }, []);

  const filtered = stocks.filter(s => {
    const matchSearch = s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase());
    const matchSector = sector === 'All' || s.sector === sector;
    return matchSearch && matchSector;
  });

  const handleAddWatchlist = async (stock) => {
    await base44.entities.Watchlist.create({ symbol: stock.symbol, name: stock.name, sector: stock.sector });
    toast.success(`${stock.symbol} added to watchlist`);
  };

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-black text-white/95 tracking-tight mb-1">Markets</h1>
        <p className="text-[11px] text-white/30 font-medium tracking-wide mb-4">Live prices across equities, ETFs, and indices</p>
      </motion.div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25" />
          <Input
            placeholder="Search symbol or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.04] border-white/[0.07] h-9 text-[12px] text-white/70 placeholder:text-white/20 focus:border-primary/30"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <SlidersHorizontal className="h-3.5 w-3.5 text-white/25 flex-shrink-0 ml-1" />
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={`text-[10px] font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                sector === s
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'bg-white/[0.04] text-white/35 hover:text-white/60 border border-white/[0.06]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <StockTable stocks={filtered} onAddWatchlist={handleAddWatchlist} />
    </div>
  );
}