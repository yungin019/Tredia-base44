import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Sector exposure of the real holdings. Replaces the old fixed -42% / -28% /
 * -19% scenario numbers, which were not computed from anything.
 */
export default function StressTestCard({ holdings = [] }) {
  const { t } = useTranslation();
  const rows = holdings.filter(h => h && h.symbol);
  const total = rows.reduce((sum, h) => sum + (Number(h.shares) || 0) * (Number(h.current_price) || Number(h.avg_cost) || 0), 0);

  const bySector = {};
  rows.forEach(h => {
    const value = (Number(h.shares) || 0) * (Number(h.current_price) || Number(h.avg_cost) || 0);
    const key = h.sector || 'Unclassified';
    bySector[key] = (bySector[key] || 0) + value;
  });
  const sectors = Object.entries(bySector)
    .map(([name, value]) => ({ name, pct: total > 0 ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-5">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30 mb-4">
        {t('portfolio.sectorExposure', 'Sector Exposure')}
      </div>

      {sectors.length === 0 ? (
        <p className="text-xs text-white/25 py-4">{t('portfolio.noHoldings', 'Add a position to see your analysis.')}</p>
      ) : (
        <div className="space-y-3">
          {sectors.slice(0, 5).map(({ name, pct }) => (
            <div key={name} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-sm text-white/60">{name}</span>
              <span className="text-sm font-black font-mono text-white/80">{pct.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}