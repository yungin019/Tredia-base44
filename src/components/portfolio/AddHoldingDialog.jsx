import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AddHoldingDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ symbol: '', name: '', shares: '', avg_cost: '', current_price: '' });

  const addMutation = useMutation({
    mutationFn: (newHolding) => base44.entities.Portfolio.create(newHolding),
    onMutate: async (newHolding) => {
      await queryClient.cancelQueries({ queryKey: ['portfolio'] });
      const previous = queryClient.getQueryData(['portfolio']);
      const optimistic = { ...newHolding, id: `temp-${Date.now()}` };
      queryClient.setQueryData(['portfolio'], (old) => [...(old || []), optimistic]);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['portfolio'], context.previous);
      toast.error('Failed to add holding');
    },
    onSuccess: (_, vars) => {
      toast.success(`${vars.symbol} added to portfolio`);
      setForm({ symbol: '', name: '', shares: '', avg_cost: '', current_price: '' });
      onOpenChange(false);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  });

  const handleSave = () => {
    if (!form.symbol || !form.shares || !form.avg_cost) {
      toast.error('Symbol, shares, and average cost are required');
      return;
    }
    addMutation.mutate({
      symbol: form.symbol.toUpperCase(),
      name: form.name || form.symbol.toUpperCase(),
      shares: parseFloat(form.shares),
      avg_cost: parseFloat(form.avg_cost),
      current_price: form.current_price ? parseFloat(form.current_price) : parseFloat(form.avg_cost),
    });
  };

  const inputClass = "mt-1.5 bg-white/[0.04] border-white/[0.07] h-9 text-[12px] text-white/80 placeholder:text-white/20 focus:border-primary/40 font-mono";
  const labelClass = "text-[10px] text-white/30 font-semibold tracking-[0.08em] uppercase";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#111118] border-white/[0.08] max-w-sm">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent rounded-t-xl" />
        <DialogHeader>
          <DialogTitle className="text-[15px] font-bold text-white/90">Add Position</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-1">
          <div>
            <Label className={labelClass}>Ticker Symbol *</Label>
            <Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="AAPL" className={inputClass} />
          </div>
          <div>
            <Label className={labelClass}>Company Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Apple Inc." className={`${inputClass} font-inter`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className={labelClass}>Shares *</Label>
              <Input type="number" value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} placeholder="100" className={inputClass} />
            </div>
            <div>
              <Label className={labelClass}>Avg Cost *</Label>
              <Input type="number" value={form.avg_cost} onChange={(e) => setForm({ ...form, avg_cost: e.target.value })} placeholder="150.00" className={inputClass} />
            </div>
          </div>
          <div>
            <Label className={labelClass}>Current Price (optional)</Label>
            <Input type="number" value={form.current_price} onChange={(e) => setForm({ ...form, current_price: e.target.value })} placeholder="175.00" className={inputClass} />
          </div>
          <Button
            onClick={handleSave}
            disabled={addMutation.isPending}
            className="w-full h-9 text-[12px] font-bold bg-primary hover:bg-primary/90 text-primary-foreground mt-1"
          >
            {addMutation.isPending ? 'Adding...' : 'Add to Portfolio'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}