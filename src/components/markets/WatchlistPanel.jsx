import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, Trash2, Bell, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AddWatchlistForm({ onAdd }) {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    onAdd({ symbol: symbol.toUpperCase().trim(), name: name.trim() || symbol.toUpperCase().trim() });
    setSymbol('');
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
      <input
        value={symbol}
        onChange={e => setSymbol(e.target.value)}
        placeholder="Symbol (e.g. AAPL)"
        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/85 placeholder:text-white/25 font-mono uppercase outline-none focus:border-primary/40"
        maxLength={10}
      />
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Name (optional)"
        className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/85 placeholder:text-white/25 outline-none focus:border-primary/40"
      />
      <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-sm transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0A0A0F' }}>
        <Plus className="h-4 w-4" /> Add
      </button>
    </form>
  );
}

export default function WatchlistPanel() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => base44.entities.Watchlist.list(),
  });

  const addMutation = useMutation({
    mutationFn: (data) => base44.entities.Watchlist.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Watchlist.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">⭐</span>
        <h2 className="text-sm font-bold text-white/80">My Watchlist</h2>
        <span className="text-[10px] text-white/25 ml-1">{items.length} assets</span>
      </div>

      <AddWatchlistForm onAdd={(data) => addMutation.mutate(data)} />

      {isLoading && (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-14 rounded-lg shimmer" />)}
        </div>
      )}

      {!isLoading && items.length === 0 && (
        <div className="text-center py-10">
          <p className="text-white/30 text-sm">Your watchlist is empty.</p>
          <p className="text-white/15 text-xs mt-1">Add symbols above to track them.</p>
        </div>
      )}

      <AnimatePresence>
        <div className="space-y-2">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 border border-white/[0.06] bg-white/[0.02] group"
            >
              <div
                className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 cursor-pointer"
                onClick={() => navigate(`/Asset/${item.symbol}`)}
              >
                <span className="text-[10px] font-black text-primary font-mono">{item.symbol.slice(0,2)}</span>
              </div>

              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/Asset/${item.symbol}`)}>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-[13px] text-white/85">{item.symbol}</span>
                  {item.name !== item.symbol && <span className="text-[10px] text-white/30 truncate">{item.name}</span>}
                </div>
                {item.sector && <span className="text-[10px] text-white/25">{item.sector}</span>}
                {item.alert_price && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Bell className="h-2.5 w-2.5 text-primary/50" />
                    <span className="text-[9px] text-primary/60 font-mono">Alert @ ${item.alert_price}</span>
                  </div>
                )}
                {item.notes && <p className="text-[10px] text-white/30 truncate mt-0.5">{item.notes}</p>}
              </div>

              <button
                onClick={() => navigate(`/Asset/${item.symbol}`)}
                className="p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="h-3.5 w-3.5 text-white/30" />
              </button>

              <button
                onClick={() => deleteMutation.mutate(item.id)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive/60 hover:text-destructive" />
              </button>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </motion.div>
  );
}