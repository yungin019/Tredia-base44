import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function SectorWarning({ holdings }) {
  if (!Array.isArray(holdings) || holdings.length === 0) return null;

  const sectorTotals = {};
  let total = 0;
  (Array.isArray(holdings) ? holdings : []).forEach(h => {
    const val = (h.current_price || h.avg_cost) * h.shares;
    const sector = h.sector || 'Technology';
    sectorTotals[sector] = (sectorTotals[sector] || 0) + val;
    total += val;
  });

  const overconcentrated = Object.entries(sectorTotals).find(([, v]) => total > 0 && (v / total) > 0.60);

  if (!overconcentrated) return null;

  const [sector, val] = overconcentrated;
  const pct = Math.round((val / total) * 100);

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex items-start gap-3">
      <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-amber-300">
        <span className="font-bold">{sector} sector is {pct}% of your portfolio.</span>{' '}
        Consider diversification to reduce concentration risk.
      </p>
    </div>
  );
}