import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Real spread of the user's holdings: how many sectors they are exposed to and
 * how much sits in the largest one. Computed live; empty when there are no
 * positions.
 */
export default function RiskScoreCard({ holdings = [] }) {
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
  const largest = sectors[0];

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-6 flex flex-col justify-between">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30 mb-4">
        {t('portfolio.sectorSpread', 'Sector Spread')}
      </div>

      {rows.length === 0 || !largest ? (
        <>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl font-black font-mono text-white/15">—</span>
          </div>
          <span className="text-xs font-semibold text-white/25">
            {t('portfolio.noHoldings', 'Add a position to see your analysis.')}
          </span>
        </>
      ) : (
        <>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-5xl font-black font-mono" style={{ color: '#F59E0B' }}>{largest.pct.toFixed(0)}%</span>
            <span className="text-xs text-white/30 mb-2">{largest.name}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${largest.pct}%`, background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
            />
          </div>
          <span className="text-xs font-semibold text-white/40">
            {sectors.length} {t('portfolio.sectorsLower', 'sectors held')}
          </span>
        </>
      )}
    </div>
  );
}