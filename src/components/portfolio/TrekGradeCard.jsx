import React from 'react';
import { useTranslation } from 'react-i18next';

function weight(holding, total) {
  const value = (Number(holding.shares) || 0) * (Number(holding.current_price) || Number(holding.avg_cost) || 0);
  return total > 0 ? (value / total) * 100 : 0;
}

/**
 * Concentration view. Every number is derived from the positions the user
 * actually holds — no invented letter grade, nothing at all when empty.
 */
export default function TrekGradeCard({ holdings = [] }) {
  const { t } = useTranslation();
  const rows = holdings.filter(h => h && h.symbol);
  const total = rows.reduce((sum, h) => sum + (Number(h.shares) || 0) * (Number(h.current_price) || Number(h.avg_cost) || 0), 0);
  const top = rows.length > 0
    ? rows.reduce((best, h) => (weight(h, total) > weight(best, total) ? h : best), rows[0])
    : null;
  const topWeight = top ? weight(top, total) : 0;

  return (
    <div className="rounded-xl border border-white/[0.07] bg-[#111118] p-6 flex flex-col items-center justify-center text-center">
      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-white/30 mb-3">
        {t('portfolio.concentration', 'Position Concentration')}
      </div>

      {rows.length === 0 ? (
        <>
          <div className="text-4xl font-black leading-none mb-3 text-white/15">—</div>
          <p className="text-xs text-white/30 max-w-[220px] leading-relaxed">
            {t('portfolio.noHoldings', 'Add a position to see your analysis.')}
          </p>
        </>
      ) : (
        <>
          <div className="text-6xl font-black leading-none mb-3 font-mono" style={{ color: '#F59E0B' }}>
            {topWeight.toFixed(0)}%
          </div>
          <p className="text-xs text-white/40 max-w-[220px] leading-relaxed">
            {t('portfolio.concentrationDesc', 'Largest position: {{symbol}}', { symbol: top.symbol })} ·{' '}
            {rows.length} {t('portfolio.positionsLower', 'positions')}
          </p>
        </>
      )}
    </div>
  );
}