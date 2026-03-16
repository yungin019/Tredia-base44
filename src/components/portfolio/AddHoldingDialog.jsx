import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function AddHoldingDialog({ open, onOpenChange }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ symbol: '', name: '', shares: '', avg_cost: '', current_price: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!form.symbol || !form.shares || !form.avg_cost) {
      toast.error('Please fill symbol, shares, and average cost');
      return;
    }
    setSaving(true);
    await base44.entities.Portfolio.create({
      symbol: form.symbol.toUpperCase(),
      name: form.name,
      shares: parseFloat(form.shares),
      avg_cost: parseFloat(form.avg_cost),
      current_price: form.current_price ? parseFloat(form.current_price) : parseFloat(form.avg_cost),
    });
    queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    toast.success(`${form.symbol.toUpperCase()} added to portfolio`);
    setForm({ symbol: '', name: '', shares: '', avg_cost: '', current_price: '' });
    onOpenChange(false);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border/50 max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Add Holding</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Symbol *</Label>
            <Input value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="AAPL" className="bg-secondary/50 border-border/50 h-9 mt-1 font-mono" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Company Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Apple Inc." className="bg-secondary/50 border-border/50 h-9 mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Shares *</Label>
              <Input type="number" value={form.shares} onChange={(e) => setForm({ ...form, shares: e.target.value })} placeholder="100" className="bg-secondary/50 border-border/50 h-9 mt-1 font-mono" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Avg Cost *</Label>
              <Input type="number" value={form.avg_cost} onChange={(e) => setForm({ ...form, avg_cost: e.target.value })} placeholder="150.00" className="bg-secondary/50 border-border/50 h-9 mt-1 font-mono" />
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Current Price (optional)</Label>
            <Input type="number" value={form.current_price} onChange={(e) => setForm({ ...form, current_price: e.target.value })} placeholder="175.00" className="bg-secondary/50 border-border/50 h-9 mt-1 font-mono" />
          </div>
          <Button onClick={handleSave} disabled={saving} className="w-full h-9 text-sm">
            {saving ? 'Adding...' : 'Add to Portfolio'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}