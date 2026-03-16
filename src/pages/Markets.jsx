import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
    <div className="sm:ml-16 p-4 sm:p-6 space-y-4 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-xl font-bold mb-1">Markets</h1>
        <p className="text-xs text-muted-foreground mb-4">Track all major markets in real-time</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by symbol or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary/50 border-border/50 h-9 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={`text-xs px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                sector === s ? 'bg-primary/10 text-primary' : 'bg-secondary/50 text-muted-foreground hover:text-foreground'
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